import { getAddress, type Address, type Hex } from "viem";
import jpeg from "jpeg-js";
import decodeWebp, { init as initWebp } from "@jsquash/webp/decode.js";

export const MAX_LAUNCH_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_LAUNCH_IMAGE_DIMENSION = 4096;
export const MAX_LAUNCH_IMAGE_PIXELS = 16_777_216;
export type LaunchImageMimeType = "image/png" | "image/jpeg" | "image/webp";
let nodeWebpDecoderInitialization: Promise<void> | undefined;

export interface LaunchImageAuthorization {
  chainId: number;
  subject: Address;
  creator: Address;
  imageSha256: Hex;
  imageMimeType: LaunchImageMimeType;
  imageBytes: number;
  issuedAt: number;
  expiresAt: number;
}

export interface PrepareLaunchImageAuthorizationInput {
  chainId: number;
  subject: string;
  creator: string;
  image: Blob | Uint8Array | ArrayBuffer;
  /** Defaults to the current Unix time. Override only for deterministic tests. */
  issuedAt?: number;
  /** Defaults to five minutes and may not exceed ten minutes. */
  lifetimeSeconds?: number;
}

export const launchImageAuthorizationTypes = {
  LaunchImageAuthorization: [
    { name: "subject", type: "address" },
    { name: "creator", type: "address" },
    { name: "imageSha256", type: "bytes32" },
    { name: "imageMimeType", type: "string" },
    { name: "imageBytes", type: "uint32" },
    { name: "issuedAt", type: "uint64" },
    { name: "expiresAt", type: "uint64" },
  ],
} as const;

export function launchImageAuthorizationTypedData(auth: LaunchImageAuthorization) {
  return {
    domain: {
      name: "Sinjoh Launch Metadata",
      version: "1",
      chainId: auth.chainId,
    },
    types: launchImageAuthorizationTypes,
    primaryType: "LaunchImageAuthorization" as const,
    message: {
      subject: auth.subject,
      creator: auth.creator,
      imageSha256: auth.imageSha256,
      imageMimeType: auth.imageMimeType,
      imageBytes: auth.imageBytes,
      issuedAt: BigInt(auth.issuedAt),
      expiresAt: BigInt(auth.expiresAt),
    },
  } as const;
}

export async function launchImageBytes(image: Blob | Uint8Array | ArrayBuffer) {
  if (image instanceof Uint8Array) return new Uint8Array(image);
  if (image instanceof ArrayBuffer) return new Uint8Array(image.slice(0));
  return new Uint8Array(await image.arrayBuffer());
}

function ascii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function uint16be(bytes: Uint8Array, offset: number) {
  return (bytes[offset]! << 8) + bytes[offset + 1]!;
}

function uint32be(bytes: Uint8Array, offset: number) {
  return ((bytes[offset]! << 24) >>> 0)
    + (bytes[offset + 1]! << 16)
    + (bytes[offset + 2]! << 8)
    + bytes[offset + 3]!;
}

function uint32le(bytes: Uint8Array, offset: number) {
  return bytes[offset]! + (bytes[offset + 1]! << 8) + (bytes[offset + 2]! << 16)
    + ((bytes[offset + 3]! << 24) >>> 0);
}

function crc32(bytes: Uint8Array, start: number, end: number) {
  let crc = 0xffffffff;
  for (let index = start; index < end; index += 1) {
    crc ^= bytes[index]!;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function inspectLaunchImage(bytes: Uint8Array): {
  mimeType: LaunchImageMimeType;
  width: number;
  height: number;
} {
  let image: { mimeType: LaunchImageMimeType; width: number; height: number } | null = null;
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 24 && pngSignature.every((value, index) => bytes[index] === value)) {
    if (ascii(bytes, 12, 4) !== "IHDR") throw new Error("PNG artwork has no IHDR header.");
    if (uint32be(bytes, 8) !== 13) throw new Error("PNG artwork has an invalid IHDR length.");
    let offset = 8;
    let hasImageData = false;
    let hasEnd = false;
    while (offset + 12 <= bytes.length) {
      const length = uint32be(bytes, offset);
      const end = offset + 12 + length;
      if (!Number.isSafeInteger(end) || end > bytes.length) throw new Error("PNG artwork is truncated.");
      const kind = ascii(bytes, offset + 4, 4);
      const expectedCrc = uint32be(bytes, offset + 8 + length);
      if (crc32(bytes, offset + 4, offset + 8 + length) !== expectedCrc) {
        throw new Error(`PNG artwork has an invalid ${kind} checksum.`);
      }
      if (kind === "IDAT" && length > 0) hasImageData = true;
      if (kind === "IEND") {
        if (length !== 0 || end !== bytes.length) throw new Error("PNG artwork has an invalid IEND chunk.");
        hasEnd = true;
        break;
      }
      offset = end;
    }
    if (!hasImageData || !hasEnd) throw new Error("PNG artwork is incomplete.");
    image = { mimeType: "image/png", width: uint32be(bytes, 16), height: uint32be(bytes, 20) };
  } else if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    let dimensions: { width: number; height: number } | null = null;
    let scanStart = -1;
    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1]!;
      offset += 2;
      if (marker === 0xd9) break;
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 1 >= bytes.length) break;
      const length = uint16be(bytes, offset);
      if (length < 2 || offset + length > bytes.length) throw new Error("JPEG artwork is truncated.");
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        if (length < 7) throw new Error("JPEG artwork has an invalid frame header.");
        dimensions = { width: uint16be(bytes, offset + 5), height: uint16be(bytes, offset + 3) };
      }
      if (marker === 0xda) { scanStart = offset + length; break; }
      offset += length;
    }
    if (!dimensions) throw new Error("JPEG artwork has no supported frame header.");
    if (scanStart < 0 || scanStart >= bytes.length - 2) throw new Error("JPEG artwork has no scan data.");
    if (bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
      throw new Error("JPEG artwork has no end marker.");
    }
    image = { mimeType: "image/jpeg", ...dimensions };
  } else if (bytes.length >= 30 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    if (uint32le(bytes, 4) + 8 !== bytes.length) throw new Error("WebP artwork has an invalid container length.");
    const kind = ascii(bytes, 12, 4);
    const chunkLength = uint32le(bytes, 16);
    if (chunkLength < 1 || 20 + chunkLength + (chunkLength % 2) > bytes.length) {
      throw new Error("WebP artwork has a truncated image chunk.");
    }
    if (kind === "VP8X") {
      if (chunkLength !== 10 || bytes.length <= 30) throw new Error("WebP artwork has no image payload.");
      image = {
        mimeType: "image/webp",
        width: 1 + bytes[24]! + (bytes[25]! << 8) + (bytes[26]! << 16),
        height: 1 + bytes[27]! + (bytes[28]! << 8) + (bytes[29]! << 16),
      };
    } else if (kind === "VP8 " && chunkLength >= 10 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
      image = {
        mimeType: "image/webp",
        width: (bytes[26]! + (bytes[27]! << 8)) & 0x3fff,
        height: (bytes[28]! + (bytes[29]! << 8)) & 0x3fff,
      };
    } else if (kind === "VP8L" && chunkLength >= 5 && bytes[20] === 0x2f) {
      image = {
        mimeType: "image/webp",
        width: 1 + bytes[21]! + ((bytes[22]! & 0x3f) << 8),
        height: 1 + ((bytes[22]! & 0xc0) >> 6) + (bytes[23]! << 2) + ((bytes[24]! & 0x0f) << 10),
      };
    } else {
      throw new Error("WebP artwork uses an unsupported frame type.");
    }
  }
  if (!image) throw new Error("Launch artwork must be a PNG, JPEG, or WebP image.");
  if (image.width < 1 || image.height < 1) throw new Error("Launch artwork dimensions are invalid.");
  if (image.width > MAX_LAUNCH_IMAGE_DIMENSION || image.height > MAX_LAUNCH_IMAGE_DIMENSION) {
    throw new Error("Launch artwork dimensions exceed 4096 by 4096 pixels.");
  }
  if (image.width * image.height > MAX_LAUNCH_IMAGE_PIXELS) {
    throw new Error("Launch artwork contains too many pixels.");
  }
  return image;
}

export function detectLaunchImageMimeType(bytes: Uint8Array): LaunchImageMimeType {
  return inspectLaunchImage(bytes).mimeType;
}

async function assertLaunchImageDecodable(
  bytes: Uint8Array,
  inspected: ReturnType<typeof inspectLaunchImage>,
) {
  if (inspected.mimeType === "image/png") {
    const chunks: Uint8Array[] = [];
    let compressedLength = 0;
    for (let offset = 8; offset + 12 <= bytes.length;) {
      const length = uint32be(bytes, offset);
      const kind = ascii(bytes, offset + 4, 4);
      if (kind === "IDAT") {
        const chunk = bytes.slice(offset + 8, offset + 8 + length);
        chunks.push(chunk);
        compressedLength += chunk.length;
      }
      offset += 12 + length;
      if (kind === "IEND") break;
    }
    const compressed = new Uint8Array(compressedLength);
    let compressedOffset = 0;
    for (const chunk of chunks) {
      compressed.set(chunk, compressedOffset);
      compressedOffset += chunk.length;
    }
    try {
      const decoded = await new Response(
        new Blob([compressed.buffer]).stream().pipeThrough(new DecompressionStream("deflate")),
      ).arrayBuffer();
      const colorChannels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[bytes[25]!];
      const bitDepth = bytes[24]!;
      const interlace = bytes[28]!;
      if (!colorChannels || ![1, 2, 4, 8, 16].includes(bitDepth) || ![0, 1].includes(interlace)) {
        throw new Error("unsupported PNG pixel layout");
      }
      if (interlace === 0) {
        const rowBytes = Math.ceil(inspected.width * colorChannels * bitDepth / 8);
        if (decoded.byteLength !== (rowBytes + 1) * inspected.height) {
          throw new Error("PNG pixel stream length does not match its dimensions");
        }
        const pixels = new Uint8Array(decoded);
        for (let row = 0; row < inspected.height; row += 1) {
          if (pixels[row * (rowBytes + 1)]! > 4) throw new Error("PNG uses an invalid row filter");
        }
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Launch artwork cannot be decoded as image/png: ${detail}`);
    }
  }
  if (typeof createImageBitmap === "function") {
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes).buffer], { type: inspected.mimeType }));
      if (bitmap.width !== inspected.width || bitmap.height !== inspected.height) {
        throw new Error("decoded dimensions do not match the image headers");
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Launch artwork cannot be decoded as ${inspected.mimeType}: ${detail}`);
    } finally {
      bitmap?.close();
    }
  } else if (inspected.mimeType === "image/jpeg") {
    try {
      const decoded = jpeg.decode(bytes, {
        useTArray: true,
        formatAsRGBA: false,
        maxResolutionInMP: 17,
        maxMemoryUsageInMB: 64,
      });
      if (decoded.width !== inspected.width || decoded.height !== inspected.height) {
        throw new Error("decoded dimensions do not match the image headers");
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Launch artwork cannot be decoded as image/jpeg: ${detail}`);
    }
  } else if (inspected.mimeType === "image/webp") {
    try {
      if (typeof process !== "undefined" && process.versions?.node) {
        nodeWebpDecoderInitialization ??= (async () => {
          // Keep the Node-only file loader out of browser dependency graphs.
          // A computed specifier remains a native dynamic import in Node while
          // browser bundlers can safely retain this unreachable branch.
          const nodeFileSystem = ["node", "fs/promises"].join(":");
          const { readFile } = await import(nodeFileSystem) as typeof import("node:fs/promises");
          const wasmUrl = import.meta.resolve("@jsquash/webp/codec/dec/webp_dec.wasm");
          await initWebp({ wasmBinary: await readFile(new URL(wasmUrl)) });
        })();
        await nodeWebpDecoderInitialization;
      }
      const input = Uint8Array.from(bytes).buffer as ArrayBuffer;
      const decoded = await decodeWebp(input);
      if (decoded.width !== inspected.width || decoded.height !== inspected.height) {
        throw new Error("decoded dimensions do not match the image headers");
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Launch artwork cannot be decoded as image/webp: ${detail}`);
    }
  }
}

async function sha256(bytes: Uint8Array): Promise<Hex> {
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(bytes).buffer);
  return `0x${[...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

export async function validateLaunchImageAuthorization(
  imageInput: Blob | Uint8Array | ArrayBuffer,
  authorization: LaunchImageAuthorization,
) {
  const image = await launchImageBytes(imageInput);
  if (image.length === 0 || image.length > MAX_LAUNCH_IMAGE_BYTES) {
    throw new Error("Launch artwork must be between 1 byte and 2 MB.");
  }
  const inspected = inspectLaunchImage(image);
  await assertLaunchImageDecodable(image, inspected);
  const digest = await sha256(image);
  if (
    digest.toLowerCase() !== authorization.imageSha256.toLowerCase()
    || inspected.mimeType !== authorization.imageMimeType
    || image.length !== authorization.imageBytes
  ) {
    throw new Error("Launch artwork does not match its signed authorization.");
  }
  return image;
}

export async function prepareLaunchImageAuthorization(
  input: PrepareLaunchImageAuthorizationInput,
) {
  if (!Number.isSafeInteger(input.chainId) || input.chainId < 1) {
    throw new Error("chainId must be a positive safe integer");
  }
  const image = await launchImageBytes(input.image);
  if (image.length === 0 || image.length > MAX_LAUNCH_IMAGE_BYTES) {
    throw new Error("Launch artwork must be between 1 byte and 2 MB.");
  }
  const inspected = inspectLaunchImage(image);
  await assertLaunchImageDecodable(image, inspected);
  const imageMimeType = inspected.mimeType;
  const issuedAt = input.issuedAt ?? Math.floor(Date.now() / 1000);
  const lifetimeSeconds = input.lifetimeSeconds ?? 300;
  if (!Number.isSafeInteger(issuedAt) || issuedAt < 1) throw new Error("issuedAt is invalid");
  if (!Number.isSafeInteger(lifetimeSeconds) || lifetimeSeconds < 30 || lifetimeSeconds > 600) {
    throw new Error("lifetimeSeconds must be between 30 and 600");
  }
  const authorization: LaunchImageAuthorization = {
    chainId: input.chainId,
    subject: getAddress(input.subject),
    creator: getAddress(input.creator),
    imageSha256: await sha256(image),
    imageMimeType,
    imageBytes: image.length,
    issuedAt,
    expiresAt: issuedAt + lifetimeSeconds,
  };
  return {
    authorization,
    typedData: launchImageAuthorizationTypedData(authorization),
    image,
  };
}
