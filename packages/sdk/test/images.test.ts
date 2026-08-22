import assert from "node:assert/strict";
import test from "node:test";
import {
  detectLaunchImageMimeType,
  inspectLaunchImage,
  prepareLaunchImageAuthorization,
  validateLaunchImageAuthorization,
} from "../src/images.js";

const SUBJECT = "0x0000000000000000000000000000000000000001";
const CREATOR = "0x0000000000000000000000000000000000000002";

function png(width = 2, height = 2) {
  const bytes = Uint8Array.from(
    atob("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAABAAAAAQBPJcTWAAAAEElEQVR4nGP8wwACLGCSAQANBAECv1AVswAAAABJRU5ErkJggg=="),
    (value) => value.charCodeAt(0),
  );
  bytes.set([(width >>> 24) & 0xff, (width >>> 16) & 0xff, (width >>> 8) & 0xff, width & 0xff], 16);
  bytes.set([(height >>> 24) & 0xff, (height >>> 16) & 0xff, (height >>> 8) & 0xff, height & 0xff], 20);
  let crc = 0xffffffff;
  for (let index = 12; index < 29; index += 1) {
    crc ^= bytes[index]!;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  crc = (crc ^ 0xffffffff) >>> 0;
  bytes.set([(crc >>> 24) & 0xff, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff], 29);
  return bytes;
}

function crc32(bytes: Uint8Array, start: number, end: number) {
  let crc = 0xffffffff;
  for (let index = start; index < end; index += 1) {
    crc ^= bytes[index]!;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function jpeg() {
  return Uint8Array.from(
    atob("/9j/4AAQSkZJRgABAgAAAQABAAD//gAQTGF2YzYyLjExLjEwMAD/2wBDAAgEBAQEBAUFBQUFBQYGBgYGBgYGBgYGBgYHBwcICAgHBwcGBgcHCAgICAkJCQgICAgJCQoKCgwMCwsODg4RERT/xABMAAEBAAAAAAAAAAAAAAAAAAAABgEBAQAAAAAAAAAAAAAAAAAABgcQAQAAAAAAAAAAAAAAAAAAAAARAQAAAAAAAAAAAAAAAAAAAAD/wAARCAACAAIDASIAAhEAAxEA/9oADAMBAAIRAxEAPwCLAE1/f//Z"),
    (value) => value.charCodeAt(0),
  );
}

function webp() {
  return Uint8Array.from(
    atob("UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoCAAIAAUAmJaACdLoB+AADsAD+8ut//NgVzXPv9//S4P0uD9Lg/9KQAAA="),
    (value) => value.charCodeAt(0),
  );
}

function fabricatedJpeg() {
  return Uint8Array.from([
    0xff, 0xd8,
    0xff, 0xc0, 0, 11, 8, 0, 2, 0, 2, 1, 1, 0, 0,
    0xff, 0xda, 0, 8, 1, 1, 0, 0, 0, 0,
    1, 2, 3, 4, 5,
    0xff, 0xd9,
  ]);
}

function fabricatedWebp() {
  const bytes = new Uint8Array(30);
  bytes.set([..."RIFF"].map((value) => value.charCodeAt(0)), 0);
  bytes.set([22, 0, 0, 0], 4);
  bytes.set([..."WEBPVP8 "].map((value) => value.charCodeAt(0)), 8);
  bytes.set([10, 0, 0, 0], 16);
  bytes.set([0, 0, 0, 0x9d, 0x01, 0x2a, 2, 0, 2, 0], 20);
  return bytes;
}

test("prepares the exact creator-bound launch image typed data", async () => {
  const prepared = await prepareLaunchImageAuthorization({
    chainId: 4663,
    subject: SUBJECT,
    creator: CREATOR,
    image: png(),
    issuedAt: 1_800_000_000,
    lifetimeSeconds: 300,
  });
  assert.equal(prepared.authorization.imageMimeType, "image/png");
  assert.match(prepared.authorization.imageSha256, /^0x[0-9a-f]{64}$/);
  assert.equal(prepared.authorization.imageBytes, 94);
  assert.equal(prepared.authorization.expiresAt, 1_800_000_300);
  assert.deepEqual(prepared.typedData.domain, {
    name: "Sinjoh Launch Metadata",
    version: "1",
    chainId: 4663,
  });
  assert.equal(prepared.typedData.message.subject, SUBJECT);
  assert.equal(prepared.typedData.message.creator, CREATOR);
  assert.equal(prepared.typedData.message.issuedAt, 1_800_000_000n);
});

test("rejects spoofed file types, oversized files, and long authorizations", async () => {
  assert.throws(() => detectLaunchImageMimeType(new Uint8Array([1, 2, 3])), /PNG, JPEG, or WebP/);
  await assert.rejects(() => prepareLaunchImageAuthorization({
    chainId: 4663,
    subject: SUBJECT,
    creator: CREATOR,
    image: new Uint8Array(2 * 1024 * 1024 + 1),
  }), /between 1 byte and 2 MB/);
  await assert.rejects(() => prepareLaunchImageAuthorization({
    chainId: 4663,
    subject: SUBJECT,
    creator: CREATOR,
    image: png(),
    lifetimeSeconds: 601,
  }), /between 30 and 600/);
  await assert.rejects(() => prepareLaunchImageAuthorization({
    chainId: 4663,
    subject: SUBJECT,
    creator: CREATOR,
    image: png(4097, 1),
  }), /exceed 4096/);
  const corrupt = png();
  const idatOffset = 54;
  const idatLength = 16;
  corrupt[idatOffset + 8] = corrupt[idatOffset + 8]! ^ 0xff;
  const crc = crc32(corrupt, idatOffset + 4, idatOffset + 8 + idatLength);
  corrupt.set([(crc >>> 24) & 0xff, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff], idatOffset + 8 + idatLength);
  await assert.rejects(() => prepareLaunchImageAuthorization({
    chainId: 4663,
    subject: SUBJECT,
    creator: CREATOR,
    image: corrupt,
  }), /cannot be decoded/);
});

test("decodes every accepted format before asking the creator to sign", async () => {
  assert.deepEqual(inspectLaunchImage(jpeg()), { mimeType: "image/jpeg", width: 2, height: 2 });
  assert.deepEqual(inspectLaunchImage(webp()), { mimeType: "image/webp", width: 2, height: 2 });
  for (const image of [jpeg(), webp()]) {
    const prepared = await prepareLaunchImageAuthorization({
      chainId: 4663,
      subject: SUBJECT,
      creator: CREATOR,
      image,
    });
    assert.equal(prepared.image.length, image.length);
  }
  for (const image of [fabricatedJpeg(), fabricatedWebp()]) {
    await assert.rejects(() => prepareLaunchImageAuthorization({
      chainId: 4663,
      subject: SUBJECT,
      creator: CREATOR,
      image,
    }), /cannot be decoded/);
  }
  assert.throws(
    () => detectLaunchImageMimeType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    /PNG, JPEG, or WebP/,
  );
});

test("publication rejects bytes that differ from the creator authorization", async () => {
  const prepared = await prepareLaunchImageAuthorization({
    chainId: 4663,
    subject: SUBJECT,
    creator: CREATOR,
    image: png(),
    issuedAt: 1_800_000_000,
  });
  assert.equal(
    (await validateLaunchImageAuthorization(prepared.image, prepared.authorization)).length,
    prepared.image.length,
  );
  await assert.rejects(
    () => validateLaunchImageAuthorization(png(33, 32), prepared.authorization),
    /does not match/,
  );
});
