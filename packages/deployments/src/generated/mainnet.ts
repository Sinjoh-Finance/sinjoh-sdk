// GENERATED FILE - DO NOT EDIT.
// Derived from mainnet-deployments.json by tools/gen-deployments.mjs.
// Regenerate with: npm run generate:deployments.

export const mainnet = {
  chainId: 4663,
  status: "core-infrastructure-deployed",
  releaseCandidate: false,
  deployedAt: "2026-07-30",
  rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
  explorerUrl: "https://robinhoodchain.blockscout.com",
  deployer: "0x3d58E42d3a920dE4C1F71EE041c7eBb82ee23f49",
  governance: "0x39E2f5eFdFd808F26B98979a06BA11ea82E1C85f",
  roles: {
    "deployer": {
      "address": "0x3d58E42d3a920dE4C1F71EE041c7eBb82ee23f49",
      "kind": "eoa"
    },
    "governance": {
      "address": "0x39E2f5eFdFd808F26B98979a06BA11ea82E1C85f",
      "kind": "eoa"
    }
  },
  contracts: {
    "launchStakingEngine": {
      "address": "0x1f20bF432206C133C08FCCaC4857B22e2327CE2b",
      "deploymentBlock": 41666632,
      "deploymentTransaction": "0x2271aaa33905873d5dd0486e042cb5118e3703460205016edf5c2cb37ccc1bbd",
      "runtimeCodeHash": "0x4da43ef12471fdfefd88fdb3eebf47dbe13aee37ddb752bc7ab2a92f26876d34",
      "purpose": "Shared multi-token staking and snapshot-reward sink for new Sinjoh launches that explicitly require staking for airdrops. Standard holder airdrops remain the default."
    },
    "fundingBands.deployer": {
      "address": "0x3d58E42d3a920dE4C1F71EE041c7eBb82ee23f49",
      "kind": "eoa"
    },
    "fundingBands.governance": {
      "address": "0x39E2f5eFdFd808F26B98979a06BA11ea82E1C85f",
      "kind": "eoa"
    },
    "fundingBands.ponsV2Generation.adapterFactory": {
      "address": "0xa16389c14c9299A4317D50aEfd5e4cC442F2dF0d",
      "deploymentBlock": 46235444,
      "deploymentTransaction": "0x72b3f7408cf4cc89d7ad752eca7c26100526bb192b1b7a79085385efeb484e09",
      "runtimeCodeHash": "0x42b9b3eca3f4bf37072bcf60f3405e30bd6e95e7279c307cdef9c5905f67f3bf"
    },
    "fundingBands.ponsV2Generation.ordinaryAdapterImplementation": {
      "address": "0xAf3D6710621697d25096E01367A3D0490Fd11e2b",
      "deploymentBlock": 46235444,
      "deploymentTransaction": "0x72b3f7408cf4cc89d7ad752eca7c26100526bb192b1b7a79085385efeb484e09",
      "runtimeCodeHash": "0x5cc42a8a6ac7a9a792a04427f52063e5a8f4fb2c72fa614d46c1bc528d20ab4e"
    },
    "fundingBands.ponsV2Generation.projectAdapterImplementation": {
      "address": "0xC5C7B33708121d542AC8172104D1d708DF61cA37",
      "deploymentBlock": 46235453,
      "deploymentTransaction": "0x46555c50202b25fb65e96edb3a21a876a99891ba84c8e8c2fc23913778c55634",
      "runtimeCodeHash": "0x305007652acf94952e5feb97add75c50ed8934365c67b3f1522eaf4809810841"
    },
    "fundingBands.manager": {
      "address": "0x8AEb669200bcc03454Fe3B73124A4318027862e9",
      "deploymentBlock": 46235700,
      "deploymentTransaction": "0x528d45e4f783f2b4fe60ddcf01e7e7c1c9f56770a808268efd8ced082714ee21",
      "runtimeCodeHash": "0x27e79a76b510ea9ba4018822199e31339c8ac4a083e2723d6ec0b305c168e3d6"
    },
    "fundingBands.oracle": {
      "address": "0xB1115B9d0c409d6bCbb8d2483B2Cc0C425679754",
      "deploymentBlock": 46235502,
      "deploymentTransaction": "0x04fe763c37572f0655b57776e70b601440ed4b7608dfce9d7c12b336a5e8181d",
      "runtimeCodeHash": "0x0f34766397d79c63a443067d266f6cddce1107ad410fc75f68293c0386412bb7"
    },
    "fundingBands.ponsV2Verifier": {
      "address": "0x9d93036656C51dd9Fe2164f9325FeF850fC282D9",
      "deploymentBlock": 46235529,
      "deploymentTransaction": "0x38b5c6e7a9779cf499ecfdfc4789884bda80bb8c80c4db97a66a5a54d6754995",
      "runtimeCodeHash": "0xedb1114f6c470682c3142a35300db3bb0000cc42b73f2adbb3cdd554bb14d34d"
    },
    "fundingBands.ponsV2Guard": {
      "address": "0xADB3BD2222dBCd08ab78Bd7BD2BDbb6Adf043915",
      "deploymentBlock": 46235610,
      "deploymentTransaction": "0xe43df8cdfa83a37cbeba7878d391b42198953e06e9468c99d395aa73e45efcb2",
      "runtimeCodeHash": "0x08599108bd65ee9d3f87e6431dd3e6fa5ad1e25cf44cb597041a35836c79bc39"
    },
    "fundingBands.launchEscrow": {
      "address": "0xf8F28826d4837e10fc9eD0d7787F763725F10378",
      "deploymentBlock": 46235558,
      "deploymentTransaction": "0x8dc69d61a8efc0ca74dd35564bddce13d6540657fbd3bf37e9f812c80d99bf65",
      "runtimeCodeHash": "0xc4c40096bf36620fafdb166f7328f84c6907a60392fc3321fb66ab345b99dafc"
    },
    "fundingBands.subjectSellAdapter": {
      "address": "0x42C7ADD713Cf2084673f8490a66E97C6bd81b985",
      "deploymentBlock": 46235727,
      "deploymentTransaction": "0x7b2ab4f5a8c852a3a6a38bfae532ba8f4dba0d8353eecd699234f47a2066da1e",
      "runtimeCodeHash": "0x12f31d5a91362e4f5237365bb001b37d612b7f4bfc5a83e373311bf5edf2fdc7"
    },
    "fundingBands.subjectPriceGuard": {
      "address": "0x7Dd3D815fb2C188361Dd25340Cc3321D3dbfc8e3",
      "deploymentBlock": 46235752,
      "deploymentTransaction": "0xc9f07021339081550a49b192530fe0b984a4719a0ac37acf05a27093408b8bcb",
      "runtimeCodeHash": "0x4196022290855870057245f71692759baec5ca0ecd629db1372a131f836257bc"
    },
    "fundingBands.fundingBandMath": {
      "address": "0x24aC2A78fC684b7d40A1feB541FfBDC11098937c",
      "deploymentBlock": 46235631,
      "deploymentTransaction": "0x8a220ddbde745426b2df8dd5198e1552573618b152d6ed87d1d2c31eee1ded96",
      "runtimeCodeHash": "0xabeefeed70b46391de5b9f110cf0e9ee857b0225c8224bee324fee623f30096e"
    },
    "fundingBands.fundingBandV4": {
      "address": "0x223b8276B8652ED2bc36FBe4FdC6badaee542806",
      "deploymentBlock": 46235653,
      "deploymentTransaction": "0x232142da84386ad4aa7ed52bb89120474f4c0478affca1acc2b8486f29c3c7c7",
      "runtimeCodeHash": "0x33fdb83242e0cab13c9124170b861f6250134ca22689828b0937a8aab2230a41"
    },
    "fundingBands.v4Infrastructure.stateView": {
      "address": "0xF3334192D15450CdD385c8B70e03f9A6bD9E673b",
      "runtimeCodeHash": "0x7d9c591e0956fd89d98feb4ffcfe8bf1f7a62bd485edd979fa21d104b49878a6"
    },
    "fundingBands.v4Infrastructure.poolManager": {
      "address": "0x8366a39CC670B4001A1121B8F6A443A643e40951",
      "runtimeCodeHash": "0xbd3881180b547f5fe817545743cfb4343e96b1bc6640dcd70c106b0066e95626"
    },
    "fundingBands.operations.keeper": {
      "address": "0x39E2f5eFdFd808F26B98979a06BA11ea82E1C85f",
      "kind": "eoa"
    },
    "letscashAdapterFactory": {
      "address": "0x81f50D1695eeB6976b53f5dCc9E785Ff06C183DC",
      "deploymentBlock": 33989899,
      "deploymentTransaction": "0x12019fe3d4097259fd2e5c2e3e12e63ea02c23e218dd8bccea7c351523ad2747",
      "runtimeCodeHash": "0xd5e2b73d1464ba5d8912ec7f999893e7369456a8b64f97160e9097969f02cac3",
      "purpose": "Deploys deterministic creator-scoped letscash.fun adapters without creating a token or adapter clone during this dark deployment."
    },
    "letscashAdapterImplementation": {
      "address": "0x0B825f7d00adB6bF03A7c7853F670F192D742cC4",
      "deploymentBlock": 33989899,
      "deploymentTransaction": "0x12019fe3d4097259fd2e5c2e3e12e63ea02c23e218dd8bccea7c351523ad2747",
      "runtimeCodeHash": "0x15e9bdbf2be5d996731edaa189a797da85fd395e3f42e3671317534cd9eff131",
      "purpose": "Initialized implementation for immutable per-launch letscash.fun fee-recipient clones."
    },
    "letscashBuybackAdapter": {
      "address": "0xb372e5E82C189b2c6BFBdD218956E3e198533D17",
      "deploymentBlock": 33989899,
      "deploymentTransaction": "0x1fbe9b4a5a2432aa09d04eafaf19c28c74a959e61545efea2ee6668168fa1e5f",
      "runtimeCodeHash": "0x156272a01dad06df99f00d593d306fa3453a146d226d6115d3f2341f6fbf6695",
      "purpose": "Converts capped WETH allocations into letscash.fun subjects through their verified native v4 pools."
    },
    "letscashBuybackPriceGuard": {
      "address": "0x1fE014FDa9B4054a5Da3b52Be5031393F83eeC8d",
      "deploymentBlock": 33989899,
      "deploymentTransaction": "0x35631fddf7914df4a425d3deda0ee35cf1e7275435a1131c3da82c1ccca0d85a",
      "runtimeCodeHash": "0xc33f13461992aabea2fe3c4e01999930bba3e71e4c86ce6189fce47d67347f68",
      "purpose": "Requires an amount-, config-, router-, and time-bound signed floor for every letscash.fun buyback."
    },
    "agnosticFeeRouterImplementation": {
      "address": "0x06274b69d4Cd4D98Ed7Cf4f45Fd50137e8A184a6",
      "deploymentBlock": 25493716,
      "deploymentTransaction": "0x36ab5e151677b0e59c3e7a03980d4ddc8e1a149c3e52cc98835d340673dbb815",
      "runtimeCodeHash": "0x00eecc775b2dff40c52bdd038cdccc19b5812a527aa811b359a55249c6987276",
      "purpose": "Launchpad-agnostic SinjohFeeRouter implementation for per-launch clones."
    },
    "agnosticFeeRouterFactory": {
      "address": "0xA1F721a697Dd03a45f264F53bCBFd121212318eD",
      "deploymentBlock": 25493736,
      "deploymentTransaction": "0x97ae5ef3d8f80f0a8c5ffe2d169e3e0f651963eecb369a0f7f0e51f87662047e",
      "runtimeCodeHash": "0x9c409cacd26cd9e6acdf403ce14afa94c263a666886b2fec1a9e2af2063b4ca9",
      "purpose": "Deploys deterministic launchpad-agnostic fee-router clones without creating any clone during this dark deployment."
    },
    "flapAdapterFactory": {
      "address": "0x77748D07CAD323A7f6EFa54968aCF69de743be61",
      "deploymentBlock": 25493756,
      "deploymentTransaction": "0x89e4b482f1e8666d0727c5bac134f50f1cce0cf08edee4e643963e36381e4c16",
      "runtimeCodeHash": "0xa2a389b5cfe46de37dca8bdd86d5fb72b6d2182ea6dfd31aaa55686797c88df1",
      "purpose": "Deploys deterministic per-launch Sinjoh Flap adapters; no adapter clone or token was created during this dark deployment."
    },
    "flapAdapterImplementation": {
      "address": "0x4c34af31ef8962317497Cc558612a48443971243",
      "deploymentBlock": 25493756,
      "deploymentTransaction": "0x89e4b482f1e8666d0727c5bac134f50f1cce0cf08edee4e643963e36381e4c16",
      "runtimeCodeHash": "0xc6ea11907684d3b6eca3cde221edbf03ec5f900f3ba5302d3324aeee962f23c0",
      "purpose": "SinjohFlapAdapter implementation, initialized and self-deployed by the adapter factory constructor."
    },
    "flapBuybackAdapter": {
      "address": "0xf7d40EcD8cB38a43e898775bc382DB73B35B5574",
      "deploymentBlock": 25580356,
      "deploymentTransaction": "0x61133ee7ebd68c62af34f068916c8f57593ce1dfc928f9558d228eb8de27dcae",
      "runtimeCodeHash": "0xf4f6c9dd4583fed53c9ac47b31f270563a3b23e3938354edfd924877279f02ec",
      "purpose": "Converts WETH fee allocations into the launched Flap subject through the canonical Portal before and after graduation."
    },
    "flapBuybackPriceGuard": {
      "address": "0xe19827483E32690012840b2b9bC6CBf9bE177Bf5",
      "deploymentBlock": 25580376,
      "deploymentTransaction": "0xf072a0bd4ab04c41fe2cc586aeba78488ec041762ddc77311812dd425413d280",
      "runtimeCodeHash": "0x2a192b9123d71261cecf2180a472751c6f827416dd81227f770159d7d51f80b4",
      "purpose": "Requires an amount- and router-bound five-minute signed floor in addition to the live Portal quote for every Flap buyback."
    },
    "flapPayoutPriceGuard": {
      "address": "0x071d29A300C1b51db1BDe8BaA550B86E1892Dc5e",
      "deploymentBlock": 25640562,
      "deploymentTransaction": "0x5269775231da35a18e5265c87f7baf2bb9c9a14cc2dabd31a7007d82df1fc787",
      "runtimeCodeHash": "0x29c75dd94d657c7a0ac709e7653c92c651bd02da3b0986105a4c39d0f0e6449f",
      "purpose": "Requires an amount-, router-, subject-, and output-bound signed floor plus the live Flap Portal quote when routing fees into any Flap-supported payout token."
    },
    "flapV2LiquidityManager": {
      "address": "0x4E330772F12955E752aa4Fd2ba6191d8bD7d782E",
      "deploymentBlock": 25580396,
      "deploymentTransaction": "0x5ed435bf604fa818dd0fda032cea64f65bbc2f45a68faa08d448c558fb641c0d",
      "runtimeCodeHash": "0x135f907a56c2d21f7c19d0c8c6cbbafdf9e3542dd9ee7dd83baf58e3843eef39",
      "purpose": "Accumulates WETH before graduation, then buys the Flap subject, adds canonical Flap V2 liquidity, and sends the LP tokens directly to the burn address."
    },
    "revenueCollector": {
      "address": "0x5Bb7582557F5be30b62c335Ad3ccf4bA79E138c5",
      "deploymentBlock": 23491477,
      "deploymentTransaction": "0x387b2d49c1504c13fd64ceb8d48fe7bf1ad8c14e5c31d85551d33d994d8f75db",
      "runtimeCodeHash": "0x2a2605aed6c20353f19ea155b13605c9730f53b8b0fc9f2c1aea78433654789b",
      "purpose": "Protocol revenue sink. Owner and initial processor are governance; renounceOwnership permanently disabled."
    },
    "simpleSwapAdapter": {
      "address": "0xc9F600ebaf9EE1F4a24568D2e4Af9E8df1e07D7B",
      "deploymentBlock": 23576389,
      "deploymentTransaction": "0x76dfd0f6689c47401234604a57dcb8e7591ed1369495ca1ad2bcadcae12d8ac6",
      "runtimeCodeHash": "0x17b8eecc60ff9af5768240b0384e96c4e54fd8611355297e45146303294c6ac6",
      "purpose": "Shared direct WETH swap and WETH-to-ETH unwrap adapter, SwapRouter02 interface. Verified by live mainnet-fork swaps through fee tiers 10000 and 3000 plus the unwrap path."
    },
    "feeRouterImplementation": {
      "address": "0x17c76Ff58b7Da12E116bb22ebDcc7F31Cadf9B64",
      "deploymentBlock": 23491737,
      "deploymentTransaction": "0x8341cb304191aedba9ca661e368c7c5e14046b03fe59ab84ddb6b644610aacd8",
      "runtimeCodeHash": "0xd6f37a88ac47cf7ccedfa73bbb07412b3117282e47f914887e572d893572a9b4",
      "purpose": "SinjohFeeRouter implementation cloned per launch."
    },
    "feeRouterFactory": {
      "address": "0xFA51E67f799699A237D558F5FbE7B170F8c5584d",
      "deploymentBlock": 23491737,
      "deploymentTransaction": "0xd7dc8d302de47702c1004355631647260e8a1abb96c42b3e911baf7ddeed253b",
      "runtimeCodeHash": "0x0e655836d0b721d90e18f2edd779114908124c116dea9dabf818cf57abea72b4",
      "purpose": "Deploys per-launch fee router clones."
    },
    "priceGuard": {
      "address": "0xfdd4f594A9f7cD17fEE0BBF2859F4eEA3265F328",
      "deploymentBlock": 23492034,
      "deploymentTransaction": "0x3ee734cb02785d76f3f2f8a1c3ec91083eaede4262148b41c7f44ab1dced5326",
      "runtimeCodeHash": "0xed01ca68a9705fe3e595e39261a5700dc48593edb08d9737ecc98401cf2e856d",
      "purpose": "SinjohSharedV3TwapPriceGuard: shared TWAP guard for all launches. 15-min window, 10% max spot deviation, 7.5% max output slippage, 5-min validity, pools must be primed via prime()."
    },
    "airdropDistributor": {
      "address": "0xA1d65242D367501D9A261389a69005e584F4786a",
      "deploymentBlock": 23492149,
      "deploymentTransaction": "0x7d071b39734510141394d82b82fbe90666985a76c67b2f1d7cf4fe4d8702f79a",
      "runtimeCodeHash": "0x75dd6c860a639d0b283f308486fd1c6dafaf9f2e755e078850146cbecea33f7d",
      "purpose": "Merkle airdrop distributor. Protocol fee recipient is the revenue collector."
    },
    "liquidityManagerV3": {
      "address": "0xf67150FB39E6A9200C06F9F8DF589d40C94d79c3",
      "deploymentBlock": 23492375,
      "deploymentTransaction": "0x7ecb3a7dccb615e821f797689014fbbc9891a517a9ff27cb231759467502eb67",
      "runtimeCodeHash": "0x5686b9e5166e3c34a0928b93153a4edead9e8ee95bdc8d31b0f71c6f03ad3789",
      "purpose": "Single liquidity manager (v3 + v4). DeployPonsLiquidityManager was removed as identical; one instance serves both roles on mainnet."
    },
    "ponsAdapterFactory": {
      "address": "0x22F1755c85FeBCD486aCfF07FC5A3F5F60504950",
      "deploymentBlock": 23492626,
      "deploymentTransaction": "0xd5878a1775f92d263c2b8212b40620dc4940b46c5325560f61ea6be1f293d1ca",
      "runtimeCodeHash": "0x3c8f93001da484e96c32e697572fceb65a88ff6f8cc4f65c0a5f280cd2630840",
      "purpose": "Retained for fee collection and indexing of historical Pons v1 launches. Upstream Pons v1 new launches are disabled."
    },
    "ponsAdapterImplementation": {
      "address": "0x488b1068D10FBcd49b96A06F7f76A1D2853001A6",
      "deploymentBlock": 23492626,
      "deploymentTransaction": "0xd5878a1775f92d263c2b8212b40620dc4940b46c5325560f61ea6be1f293d1ca",
      "runtimeCodeHash": "0x1524070efa0fec4165da0d894d849925f4e38de401eff724362462201caecd23",
      "purpose": "SinjohPonsV1Adapter implementation retained for historical Pons v1 launch fee collection."
    },
    "ponsV2AdapterFactory": {
      "address": "0xa16389c14c9299A4317D50aEfd5e4cC442F2dF0d",
      "deploymentBlock": 46235444,
      "deploymentTransaction": "0x72b3f7408cf4cc89d7ad752eca7c26100526bb192b1b7a79085385efeb484e09",
      "runtimeCodeHash": "0x42b9b3eca3f4bf37072bcf60f3405e30bd6e95e7279c307cdef9c5905f67f3bf",
      "purpose": "Current public-indexed Pons V2 adapter factory for ordinary and Project launches, bound to the dual-adapter Funding Bands escrow."
    },
    "ponsV2AdapterImplementation": {
      "address": "0xAf3D6710621697d25096E01367A3D0490Fd11e2b",
      "deploymentBlock": 46235444,
      "deploymentTransaction": "0x72b3f7408cf4cc89d7ad752eca7c26100526bb192b1b7a79085385efeb484e09",
      "runtimeCodeHash": "0x5cc42a8a6ac7a9a792a04427f52063e5a8f4fb2c72fa614d46c1bc528d20ab4e",
      "purpose": "Ordinary SinjohPonsV2Adapter implementation for the current public-indexed dual-Funding factory."
    },
    "ponsV2BuybackAdapter": {
      "address": "0x39217172A3F07E827557093989039F968A571D43",
      "deploymentBlock": 28093879,
      "deploymentTransaction": "0x03a0bda9918c38bc63d9a99459b443e68b753381501876480eb81ca942b043e7",
      "runtimeCodeHash": "0xbf53dc3ec1c40573955362ae5715d219daac4669497d7514f7a7ebff8684d3f8",
      "purpose": "Singleton buyback route for pons v2 launches: converts a router's WETH bucket share into the launch token, routing by the factory's launch record at swap time - bonding curve before graduation, hooked Uniswap v4 pool after. Native-quote launches only."
    },
    "ponsV2BuybackPriceGuard": {
      "address": "0x3a4c8fF885e1B502a66a82cbEC67817b55776f7D",
      "deploymentBlock": 28093879,
      "deploymentTransaction": "0x1106c5cc370d27162e23d9f6c5ec3d8131d1259d8cc6ad497c38a3c8efd8d4d8",
      "runtimeCodeHash": "0x6c1c47639368323976954a66acae2b9c2e06942b60ae2dd367c83d207a2eaac2",
      "purpose": "Pure signed floor (SinjohPonsV2BuybackFloor, five-minute maximum validity) for pons v2 buybacks; no on-chain quote exists on either side of graduation, so the keeper's signer is the sole floor authority."
    },
    "ponsV2PairBuybackAdapter": {
      "address": "0xfAB57a5fE409B4503A1a09fD7DC80e6ffB85Abb8",
      "deploymentBlock": 28126079,
      "deploymentTransaction": "0x17579811baa9eb290ebe1a2a73534fecd1e93909edcf170a261418682ce5ec75",
      "runtimeCodeHash": "0x37fedab733793c3b192b44be34c45048b99915534b9e2a256cf9b518a7417a07",
      "purpose": "Current pair-capable public-indexed Pons V2 buyback route."
    },
    "ponsV2PairBuybackPriceGuard": {
      "address": "0x69768f0b41A5A51aB23b23ccfbE9e3122Ac0DA8b",
      "deploymentBlock": 28126079,
      "deploymentTransaction": "0x52b095758edc3d998dbff2c6a23b01d3e3e593c1c8f79334c9040d8c71e8a2de",
      "runtimeCodeHash": "0x27a8a84e173e127965717c020a07bb304ab0eb7e3396d0b6e3fc720f536cea21",
      "purpose": "Signed-floor guard for the current public-indexed pair-capable Pons V2 buyback route."
    },
    "ponsV2PairBuybackHistoricalGenerations.indexedLegacyFactory.launchFactory": {
      "address": "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e",
      "runtimeCodeHash": "0x89a27da6f703e0a7cdd4f233e7cb57604ff75b164530962d3ff7cf8483a67d84"
    },
    "ponsV2PairBuybackHistoricalGenerations.indexedLegacyFactory.adapter": {
      "address": "0xfAB57a5fE409B4503A1a09fD7DC80e6ffB85Abb8",
      "deploymentBlock": 28126079,
      "deploymentTransaction": "0x17579811baa9eb290ebe1a2a73534fecd1e93909edcf170a261418682ce5ec75",
      "runtimeCodeHash": "0x37fedab733793c3b192b44be34c45048b99915534b9e2a256cf9b518a7417a07"
    },
    "ponsV2PairBuybackHistoricalGenerations.indexedLegacyFactory.priceGuard": {
      "address": "0x69768f0b41A5A51aB23b23ccfbE9e3122Ac0DA8b",
      "deploymentBlock": 28126079,
      "deploymentTransaction": "0x52b095758edc3d998dbff2c6a23b01d3e3e593c1c8f79334c9040d8c71e8a2de",
      "runtimeCodeHash": "0x27a8a84e173e127965717c020a07bb304ab0eb7e3396d0b6e3fc720f536cea21"
    },
    "ponsV2PairBuybackHistoricalGenerations.trustedForwarderFactory.launchFactory": {
      "address": "0x7DCeEaB0A53684b001A4900768a52eAcDb27294e",
      "runtimeCodeHash": "0x3392f4e9040deec97e49bf05fc3a696f295b79806ef83910d84943d431d05e83"
    },
    "ponsV2PairBuybackHistoricalGenerations.trustedForwarderFactory.adapter": {
      "address": "0x1BE0E8F04221329FDfea34f41a1832a80c2c147c",
      "deploymentBlock": 45666464,
      "deploymentTransaction": "0x0a45abf50c63bae215062879061e05abd85e7f101e8e4e53ff0f875ade24cc26",
      "runtimeCodeHash": "0xba0a98c865c548ca90799cac47b7978380d52b8db6e7c66d4149d3010f77b6e3",
      "purpose": "Current pair-capable Pons v2 buyback route for launches created by the active Pons v2 factory: WETH into any native- or custom-pair market through the pinned v3 hop, bonding curve, or graduated v4 pool."
    },
    "ponsV2PairBuybackHistoricalGenerations.trustedForwarderFactory.priceGuard": {
      "address": "0x902A6Fa8Ca273aAB186633FF27879Cd3703F6AED",
      "deploymentBlock": 45666468,
      "deploymentTransaction": "0x371953095fae116a61de3ae970795c119430433bf286a33a329d9b941680a6c2",
      "runtimeCodeHash": "0xa03b64312803b10d3fe9bf511d0ba80cfc9ebd40931c64dc37481b49e9413e02",
      "purpose": "Signed-floor guard for the current-factory pair-capable Pons v2 buyback route."
    },
    "poolsTradeMerkleClaimFactory": {
      "address": "0x0C8B3e001C8DbBDbe15089c887C9323E097F0a15",
      "deploymentBlock": 28764635,
      "deploymentTransaction": "0x0a47c66195f17118339f49272f7057681333b5a0b0b998db2eedccbb1e7f4f0c",
      "runtimeCodeHash": "0x72f0dec290a37e999b78296312973a0f100f895f51d3ef6ee3bc7dce6594c450",
      "purpose": "Byte-identical Sinjoh deployment of Uniswap's MerkleClaimFactory (liquidity-launcher commit dd8769c), which Uniswap has not deployed on Robinhood Chain. CREATE2 through the canonical deterministic deployer with a zero salt, so the address is a pure function of the vendored artifact. Enables atomic airdrop legs on Sinjoh pools.trade LBP launches."
    },
    "poolsTradeInstantAdapterFactoryCreatorFee": {
      "address": "0xCD82f610b3949cfc8a787C9AdeC70cA2Af71b635",
      "deploymentBlock": 28764805,
      "deploymentTransaction": "0x391dfec7c3da9c9fd4105f6231643c5b8147904a6f56ac933a5144ca0a74378e",
      "runtimeCodeHash": "0x9fa9112ee6a2cd0745d9d79aac0be99e0a0404b7d8dc73fe197b1442e6dd2e9b",
      "purpose": "Deploys deterministic per-launch SinjohPoolsTradeInstantAdapter clones against the creator-fee InstantLaunchStrategy; no adapter clone or token was created during this dark deployment."
    },
    "poolsTradeInstantAdapterImplementationCreatorFee": {
      "address": "0xa6e8d31422042FAd961F8a132a757A294dcdb425",
      "deploymentBlock": 28764805,
      "deploymentTransaction": "0x391dfec7c3da9c9fd4105f6231643c5b8147904a6f56ac933a5144ca0a74378e",
      "runtimeCodeHash": "0x6cb1c44c00df96f34342caedb1c9a1e81668dac20415c43c1a198e3894558e04",
      "purpose": "SinjohPoolsTradeInstantAdapter implementation (creator-fee variant), initialized and self-deployed by the adapter factory constructor."
    },
    "poolsTradeInstantAdapterFactoryNoFee": {
      "address": "0x44AD6f52a9edBE37975Afa37A699065DAaa7C0D8",
      "deploymentBlock": 28764806,
      "deploymentTransaction": "0xe509e857c47496b954fdf175e36aa45921ae9c6c49465e9020f82b9f859833ea",
      "runtimeCodeHash": "0x4b1b81ffd967c4a52c228fa7bfc7ec2d2b39d96ea0e48b887d57e109317392a5",
      "purpose": "Deploys deterministic per-launch SinjohPoolsTradeInstantAdapter clones against the no-creator-fee InstantLaunchStrategy; collect and forward are permanent no-ops on this variant by construction."
    },
    "poolsTradeInstantAdapterImplementationNoFee": {
      "address": "0xD99F640b3dac6032471F5D7e509c54232BAc397d",
      "deploymentBlock": 28764806,
      "deploymentTransaction": "0xe509e857c47496b954fdf175e36aa45921ae9c6c49465e9020f82b9f859833ea",
      "runtimeCodeHash": "0xacf894e26e9f2f87194a298b5fd66377163d502c66252e86ddc5f71a01b21449",
      "purpose": "SinjohPoolsTradeInstantAdapter implementation (no-creator-fee variant), initialized and self-deployed by the adapter factory constructor."
    },
    "poolsTradeLBPAdapterFactory": {
      "address": "0x6A4D50D9469fed073c4445Dc4050cd29d1BE25D7",
      "deploymentBlock": 28764806,
      "deploymentTransaction": "0x0e6f9d734452a06f079b7971d50d6972220a5b5a1901ff6dee085d0b79436ba8",
      "runtimeCodeHash": "0xf87731535792f63f7fe130e58a1ea057b707c2fc03b1df4092a3ff3f433e3d57",
      "purpose": "Deploys deterministic per-launch SinjohPoolsTradeLBPAdapter clones and keeps the one-shot subject registry the pools.trade buyback route resolves launch-configured pool keys through."
    },
    "poolsTradeLBPAdapterImplementation": {
      "address": "0xFcE43DE2ccB8e14b18e33236C04485ebb33F55c6",
      "deploymentBlock": 28764806,
      "deploymentTransaction": "0x0e6f9d734452a06f079b7971d50d6972220a5b5a1901ff6dee085d0b79436ba8",
      "runtimeCodeHash": "0x452531108d0d2b6a65cc30de13c09ff95e84f62b3b3e192cf160758cc5fffdcd",
      "purpose": "SinjohPoolsTradeLBPAdapter implementation, initialized and self-deployed by the adapter factory constructor."
    },
    "poolsTradeBuybackAdapter": {
      "address": "0x3B479157D9c566c00F885BDFfFC22D33193714C2",
      "deploymentBlock": 28766995,
      "deploymentTransaction": "0xb19fcf8ef0713695142a1a411653499c01e4af7be81bd86cd296d1bddc9016cc",
      "runtimeCodeHash": "0x1acb612f21db2ca4401af4c4be61aff6be14f276dceab0b33ad28ecb5c24c409",
      "purpose": "Singleton buyback route for pools.trade launches, both shapes: LBP launches resolve their recorded migrated pool key through the LBP adapter factory registry (native-quote only); everything else derives the static instant-launch key and confirms the pool exists via slot0."
    },
    "poolsTradeSellAdapter": {
      "address": "0x192f324A9BF64C4c9f46aFF77d1A3C8d06c635a5",
      "deploymentBlock": 28781908,
      "deploymentTransaction": "0x2089b37369dd31f72fd51b1f8f9c08100ecfc8ff75fe128c3417ebc402d2c4de",
      "runtimeCodeHash": "0x9e4ea40e94270576db99e5900997d0271f7f3a3c529a9929d787131b104e8d4e",
      "purpose": "Singleton sell route for pools.trade subjects: the normalization direction (subject to WETH) LBP intake requires. Native-quote pools sell and wrap; custom-currency pools hop currency-to-WETH through the pinned SwapRouter02 with the v3 tier in routeData."
    },
    "poolsTradeSubjectPriceGuard": {
      "address": "0x4c75DB11b1Eb18251E84A98049918D534176b5a2",
      "deploymentBlock": 28781908,
      "deploymentTransaction": "0x1d036f8ecd80c84cf63befbc8181fa807ab48998ca9e0024001fd6258e1aeacb",
      "runtimeCodeHash": "0xb9874e31e2d48efdea35fe17d4729f62aed80d658b80442fe8fd6b5673803cba",
      "purpose": "Normalization guard for pools.trade subjects: v4 slot0 spot under a 5% haircut (v4 keeps no observations and cannot be quoted from view), composed with the shared v3 TWAP guard's quoteAtTwap for custom-currency legs. Normalization guards receive no caller data, so this quote plus the router's per-call cap and mandatory caller floor are the protection. Router configs MUST set a bounded normalization maxAmountInPerCall for the subject: unsold auction tokens can dwarf pool depth and an unbounded sync is refused by the haircut."
    },
    "poolsTradeBuybackPriceGuard": {
      "address": "0xF786782FeB44fE7c125D8AB7d570ee7bc129F685",
      "deploymentBlock": 28766995,
      "deploymentTransaction": "0x87b76bc36ba228d9b678bde93976b60cc5b6bbc65a0a3e18544375ed99c8e958",
      "runtimeCodeHash": "0x3af2e220dc9eb11097c28e6634d61d2f7da15be09cff4d655b7275d6878a0e98",
      "purpose": "Pure signed floor (SinjohPoolsTradeBuybackFloor, five-minute maximum validity) for pools.trade buybacks; no on-chain quote exists on hookless or launch-hooked v4 pools, so the keeper's signer is the sole floor authority."
    },
    "ecvrfRandomness": {
      "address": "0xD16BCD59ca33C1e85578Aa5d60a02C4E2231c491",
      "deploymentBlock": 28820824,
      "deploymentTransaction": "0x1a39cbfcf856ca85bc0f22e57f1d8ace57611063a615958e571c6c68789d5a03",
      "runtimeCodeHash": "0x72ce584dc295ce6e9bfb87803e2445c44a79ced3e5461d894d5028c13f9f5d0b",
      "purpose": "ECVRF randomness adapter for raffles. Immutable public key verified on-chain to hash to the prover account 0x8653117338aD8120FCC15A93452526e2695F8273; key held on the prover host, separate from the attestor."
    },
    "raffleFactory": {
      "address": "0xD030064fB83d14C97c22A6B63bF376552eBA7112",
      "deploymentBlock": 28821627,
      "deploymentTransaction": "0x515680dc28784964c518ed5e491d1a7d2da5224404a11220d09b9fc71ac4f9e1",
      "runtimeCodeHash": "0x35a31cf01b7c0f2ade47c6228f984e0d984f0fcb24214c031efebc38f92a4a5a",
      "purpose": "SinjohRaffleRewardsFactory. Implementation initialization-locked; deploymentChainId 4663 verified on-chain.",
      "implementation": "0x982F8B6612146E0963DFd18D74e1ffe4E110b47D",
      "implementationRuntimeCodeHash": "0xde10e2dbff2714101c98b24ab7320e0b1038a370a72b96f84e63626ec156cf98"
    },
    "raffleOperations.attestor": {
      "address": "0xbd5323053ca81c4fD208874Db73e1484819214d7",
      "kind": "eoa"
    },
    "raffleOperations.ecvrfProver": {
      "address": "0x8653117338aD8120FCC15A93452526e2695F8273",
      "kind": "eoa"
    },
    "rafflePriceGuards.guard500": {
      "address": "0xDad51edC925D4CCd46c1229763F40d1F32c7480C",
      "runtimeCodeHash": "0xd0d2cf2912d6344ddfaf657911a1fb2a9a4e74ecd6e829d835c18dd342f9801e"
    },
    "rafflePriceGuards.guard3000": {
      "address": "0xd01273Fa749BF16e333cFB85D27fD11A82D1515D",
      "runtimeCodeHash": "0xf3919ec4ce39d29d19e96af0452d1fe53cbb2dfce2a1e7ea053d48ae7f6cfc8f"
    },
    "rafflePriceGuards.guard10000": {
      "address": "0xf81d21e0b51A7DD815f44682B63b7e732E0b4803",
      "runtimeCodeHash": "0xd99afa61854a819bd0adcd593bbc8c3a9a278e5fe29cd2b6f150efe9cdc8b74d"
    },
    "projectV2.raffleImplementation": {
      "address": "0xdDcF1aE6C97675CA74C6F56D6ABDA1F19de252e1",
      "deploymentBlock": 46238503,
      "deploymentTransaction": "0x739a0b85e817440bb38e17d3b53c2fd1e282bb0f3f183c23452775ef3ca05a4e",
      "runtimeCodeHash": "0x3a0d74d0dd72ad1965c4bb6a7d2e9d9e0ccbd7ed88a294bda05317f5bfd919ff"
    },
    "projectV2.fundingBandV3IntegrationFactory": {
      "address": "0x554bF316B7dfbF4221A3fc5F56D3414cC3F584D1",
      "deploymentBlock": 46238503,
      "deploymentTransaction": "0x0bf345fa97c1cd328343d6ffb657c6d226e5a493201294c9a3e70343a4e191aa",
      "runtimeCodeHash": "0x42af7b6fdbaab808c06db8761a7a91578a1e07cc75ce40551b9d6e010c71dcb3"
    },
    "projectV2.fundingBandQuoteUsdOracle": {
      "address": "0x785339dadd748d410B286dd195F1644400B17772",
      "deploymentBlock": 46238503,
      "deploymentTransaction": "0x61a718889624d656d79ac9bbde3b4511da8a57d24d4edc18f5941456fef5a69f",
      "runtimeCodeHash": "0x6bde18fbfb602edfb4e5554b44ae9fe1f7b2d47ccbe35a7311b0936134a66efd"
    },
    "projectV2.projectV3PriceGuard500": {
      "address": "0xc14653f62dA1dFBD5b3Bb07f28d2Ab420281C3Ce",
      "deploymentBlock": 46238503,
      "deploymentTransaction": "0x632f100662c7ffc3f3c132c0e6da4508b812b4a018de16926c527e5f2383e7b9",
      "runtimeCodeHash": "0xf3934b69bbf1f16faab99a265e7b8ab197042c78db71100a4c349b8e0035720c"
    },
    "projectV2.projectV3PriceGuard3000": {
      "address": "0x2CDf0a31d0D9EF627A709e683d982812aF702011",
      "deploymentBlock": 46238503,
      "deploymentTransaction": "0x202a9e8176a4d5dde09af1041975148cfc964795e25464205d2a8bff1ebdc9f7",
      "runtimeCodeHash": "0xd3e6fa9ac370e5eac8a969dca134556809ff5c654875c0b221be5adefc474b3b"
    },
    "projectV2.projectV3PriceGuard10000": {
      "address": "0x68a262e65B994AbC5EFAcC415CCa967D3d729D17",
      "deploymentBlock": 46238503,
      "deploymentTransaction": "0x6cc5803c8a86935ca755adef047def991c69427521b40d3323d0ca1ab6ec94f4",
      "runtimeCodeHash": "0xd2c79ddcd6c133d5cab767f9d0b899a6148e6c76ef5b2d066a43a1147e53b937"
    },
    "projectV2.projectWethUnwrapPriceGuard": {
      "address": "0x65f3fA3654A080cb9f1AC962200BeC884D204420",
      "deploymentBlock": 46238503,
      "deploymentTransaction": "0xe3381af544f8c4acba761ae5880b786a2ef20ce7b58cec66f71044f1df290153",
      "runtimeCodeHash": "0x4b68dc8e8330fefeec40fc25a78622380ced829788c9bf3ce6467f82b8d0a12f"
    },
    "projectV2.ponsV2PairBuybackAdapter": {
      "address": "0xfAB57a5fE409B4503A1a09fD7DC80e6ffB85Abb8",
      "deploymentBlock": 28126079,
      "deploymentTransaction": "0x17579811baa9eb290ebe1a2a73534fecd1e93909edcf170a261418682ce5ec75",
      "runtimeCodeHash": "0x37fedab733793c3b192b44be34c45048b99915534b9e2a256cf9b518a7417a07"
    },
    "projectV2.ponsV2PairBuybackPriceGuard": {
      "address": "0x69768f0b41A5A51aB23b23ccfbE9e3122Ac0DA8b",
      "deploymentBlock": 28126079,
      "deploymentTransaction": "0x52b095758edc3d998dbff2c6a23b01d3e3e593c1c8f79334c9040d8c71e8a2de",
      "runtimeCodeHash": "0x27a8a84e173e127965717c020a07bb304ab0eb7e3396d0b6e3fc720f536cea21"
    },
    "projectV2.ponsProjectAdapterFactory": {
      "address": "0xa16389c14c9299A4317D50aEfd5e4cC442F2dF0d",
      "deploymentBlock": 46235444,
      "deploymentTransaction": "0x72b3f7408cf4cc89d7ad752eca7c26100526bb192b1b7a79085385efeb484e09",
      "runtimeCodeHash": "0x42b9b3eca3f4bf37072bcf60f3405e30bd6e95e7279c307cdef9c5905f67f3bf"
    },
    "projectV2.ponsProjectAdapterImplementation": {
      "address": "0xC5C7B33708121d542AC8172104D1d708DF61cA37",
      "deploymentBlock": 46235453,
      "deploymentTransaction": "0x46555c50202b25fb65e96edb3a21a876a99891ba84c8e8c2fc23913778c55634",
      "runtimeCodeHash": "0x305007652acf94952e5feb97add75c50ed8934365c67b3f1522eaf4809810841"
    },
    "projectV2.poolsInstantProjectAdapterFactory": {
      "address": "0x7e49bbC2b1A96d635C66E192972D90467cbEbBe8",
      "deploymentBlock": 46238443,
      "deploymentTransaction": "0xb8232b8f9cf9aa857d923c2d4cf308797e96820bd23b8280abd0761b1eddbda3",
      "runtimeCodeHash": "0x04a414d27a03e6e1fd240d4032f3b8cbc918c5259cef95f1c434c14444566a4c"
    },
    "projectV2.poolsInstantNoFeeProjectAdapterFactory": {
      "address": "0xbF6c13570B255826A438319EdFE986764039557B",
      "deploymentBlock": 46238444,
      "deploymentTransaction": "0xcded7ef81666c3091bad8b0444c9977252a62bb3300af3cf1d69899980770a53",
      "runtimeCodeHash": "0x6031b24a36b3034851bae6b0d890a77615c0b9ee2b32af9d17277c2606a29314"
    },
    "projectV2.poolsLbpProjectAdapterFactory": {
      "address": "0xCcC944A29D6eb84b4a4B9522800e3f2FdD53da19",
      "deploymentBlock": 46238444,
      "deploymentTransaction": "0x7370c5eeeea911f49878a4bed5c133307b173b9f74e5f1ea37f5217cc4664381",
      "runtimeCodeHash": "0xa0840e9b1e794827d4dfe824e976555a1a1eff77dc3c0c0e0d4bb727e6739e73"
    },
    "projectV2.poolsProjectRegistrationHelper": {
      "address": "0xE0F87B203384c48DE52Fe5A57a3Fc4A1704e49fa",
      "deploymentBlock": 46238444,
      "deploymentTransaction": "0x74691f8ac60059bc9000ba4e9db7214fd6e472e86b789d961f623b62b2507513",
      "runtimeCodeHash": "0x34bd1ccd3740087c6fa60792496ff3a479f1d10c8c2e81a8bafb0f8dff011d8b"
    },
    "projectV2.ponsProjectTokenFactory": {
      "address": "0x39701Ef4704Ce44957e0a8B6b802181ce4f635e2",
      "deploymentBlock": 46238506,
      "deploymentTransaction": "0xaa6d1a069798e8af0878d301796cb31cac90f99aa619969a2a09e55fd8b68e5a",
      "runtimeCodeHash": "0x3ab99ca63c12efb229c701e56787ec86f8c7b59be41465936e0384de7046173c"
    },
    "projectV2.launchpadProjectTokenFactory": {
      "address": "0xE81962ba0B7eBA2c5d6060096Cd3634b4aC57d24",
      "deploymentBlock": 46238506,
      "deploymentTransaction": "0xd2fda3da203e99d5600faad0abbf99cda08dc074459b41773867da142b7509dd",
      "runtimeCodeHash": "0xb03c479677d6d7da6f4e65ff10864f2f64f8a471c2b6abf259ec73b696a4240f"
    },
    "projectV2.registry": {
      "address": "0xF2F0C38dd9E4DCBa46A4b8bE2E7441377c103Bf4",
      "deploymentBlock": 46238506,
      "deploymentTransaction": "0xbe3a8d6ba5924e5886a72c4a433c6e503c3bc2c3a5bd2f2e33172bd0419de99f",
      "runtimeCodeHash": "0x0638ed852649bdca466c3d3a231893176f0d2659aba56782387f58af9bcc31d2"
    },
    "projectV2.deploymentEngine": {
      "address": "0xF2844Cd17F45adA05894AF938a96CB4417158f3B",
      "deploymentBlock": 46238507,
      "deploymentTransaction": "0x2c421416a0304155c60941a614131a52fabfcfa8a526351dc5005f11f224d6ca",
      "runtimeCodeHash": "0x53e0c3f1091041295157454414bf76becbc7225af1c9f883978a190152872c55"
    },
    "projectV2.launchValidator": {
      "address": "0xA227633Cc64FeB8c36c63602cd3480e26c0F26Eb",
      "deploymentBlock": 46238507,
      "deploymentTransaction": "0xe6e4d3bb2e06789a6e20b29325bdff9d00396d00db0faf42cb84cf6a403c6417",
      "runtimeCodeHash": "0x943fc6a6f784346ae310d5376510ed8086b16d74eb3f4de5e3584bb53af7e7ed"
    },
    "projectV2.launcher": {
      "address": "0x6b5e99b344C0671f77BAC00c5ADbE453Ffa39100",
      "deploymentBlock": 46238507,
      "deploymentTransaction": "0x7d1b0443dfcd5e0169438904764ef781afe0dfb41909410968d45ff7173f69bd",
      "runtimeCodeHash": "0x5dd89482f663119e13acfdbb0b3b89d35814f494cd8c90c0c3337f176395c824"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.raffleImplementation": {
      "address": "0x4043F2e3804B19F44cAf36Fb82cc7e9Cb332E818",
      "deploymentBlock": 45666812,
      "deploymentTransaction": "0x88dc5dfb3200e17bb1872e16dd776e638e9e54b38a471299a66b082d27d34ce3",
      "runtimeCodeHash": "0xba22d4e2aa622933541cb231f6ab8eca670539c748c8507e21742125157a0010"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.fundingBandV3IntegrationFactory": {
      "address": "0x6684283e52935f70264408215936F6C189c2f493",
      "deploymentBlock": 45666812,
      "deploymentTransaction": "0xbdd457968f06cb707ca9abb6ebbf6ada01badfd44f86044b3f9622505f55a504",
      "runtimeCodeHash": "0x42af7b6fdbaab808c06db8761a7a91578a1e07cc75ce40551b9d6e010c71dcb3"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.fundingBandQuoteUsdOracle": {
      "address": "0xE8ddE77C356980F9122e458286cBB8C9943f8240",
      "deploymentBlock": 45666812,
      "deploymentTransaction": "0x8a3761c53489d443bfb9686914feade426fea3342cd3f6693dfb3b10fd36f1d3",
      "runtimeCodeHash": "0x6bde18fbfb602edfb4e5554b44ae9fe1f7b2d47ccbe35a7311b0936134a66efd"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.projectV3PriceGuard500": {
      "address": "0x551a3c3f5945Dbd0A2AcB6cD30C6B3279f112094",
      "deploymentBlock": 45666812,
      "deploymentTransaction": "0x012d065858d35a771ca0312311b984f95a3c5add1e010172082a9c79d260fe35",
      "runtimeCodeHash": "0xf3934b69bbf1f16faab99a265e7b8ab197042c78db71100a4c349b8e0035720c"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.projectV3PriceGuard3000": {
      "address": "0x91880a80F022A829C75C06e9F679c9F0A407c3Aa",
      "deploymentBlock": 45666812,
      "deploymentTransaction": "0xd4cda8df185085f051a38808aa628559ce03a7b950ba54ca8d2a1cf038d961b0",
      "runtimeCodeHash": "0xd3e6fa9ac370e5eac8a969dca134556809ff5c654875c0b221be5adefc474b3b"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.projectV3PriceGuard10000": {
      "address": "0x9FE1671a7783cb658b25Bc05cc7E74C71b001dF3",
      "deploymentBlock": 45666812,
      "deploymentTransaction": "0xc1e76cf3b02abe8679a7d00be68449644b036b15b7f1fc49fe502ac376b0633f",
      "runtimeCodeHash": "0xd2c79ddcd6c133d5cab767f9d0b899a6148e6c76ef5b2d066a43a1147e53b937"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.projectWethUnwrapPriceGuard": {
      "address": "0x0B7299b61218077C9b41d32a5c6F3c78eaf8489a",
      "deploymentBlock": 45666812,
      "deploymentTransaction": "0x49e30e5f435f0ceaefa0f719c0a1411f2bf4efdca795bfca22d647c337f742a3",
      "runtimeCodeHash": "0x4b68dc8e8330fefeec40fc25a78622380ced829788c9bf3ce6467f82b8d0a12f"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.ponsV2PairBuybackAdapter": {
      "address": "0x1BE0E8F04221329FDfea34f41a1832a80c2c147c",
      "deploymentBlock": 45666464,
      "deploymentTransaction": "0x0a45abf50c63bae215062879061e05abd85e7f101e8e4e53ff0f875ade24cc26",
      "runtimeCodeHash": "0xba0a98c865c548ca90799cac47b7978380d52b8db6e7c66d4149d3010f77b6e3"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.ponsV2PairBuybackPriceGuard": {
      "address": "0x902A6Fa8Ca273aAB186633FF27879Cd3703F6AED",
      "deploymentBlock": 45666468,
      "deploymentTransaction": "0x371953095fae116a61de3ae970795c119430433bf286a33a329d9b941680a6c2",
      "runtimeCodeHash": "0xa03b64312803b10d3fe9bf511d0ba80cfc9ebd40931c64dc37481b49e9413e02"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.ponsProjectAdapterFactory": {
      "address": "0x2514bf827044578629572FD5a5b8A18f1662a0A2",
      "deploymentBlock": 45666715,
      "deploymentTransaction": "0x06f31eec118ce18e2d692d98c44a0ad36798a8d42577b75f648141f3c3a72a8a",
      "runtimeCodeHash": "0x613b384a36534cd2ec8f181a820bd9e987e29edc712b6912a76a69b257f9170f"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.ponsProjectAdapterImplementation": {
      "address": "0xCF8C1A211626FFc222C94bDBcC1CC40CE38Ea146",
      "deploymentBlock": 45666716,
      "deploymentTransaction": "0x513b1ea9752f14e01bb67f9467d7286dc5425423388cd1576179cc20fbacc2d6",
      "runtimeCodeHash": "0xbc01507bc09f4b15936149e7eef5e6ef13cbabbd03d3b7b3e56682d0255afea3"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.poolsInstantProjectAdapterFactory": {
      "address": "0x581F1996061e893BC717c9e8FB8524da7D84A4Df",
      "deploymentBlock": 45666754,
      "deploymentTransaction": "0x58c5a596c83d8f07a9fd1a6972e12a951bf6f58a4267866df0637894873b9c9a",
      "runtimeCodeHash": "0x2462223925a465ecececc3249872504b247596cea41fdbab0079fd00ce81b09e"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.poolsInstantNoFeeProjectAdapterFactory": {
      "address": "0x44416ef4E2D7bDCDb38f1c9c7eA66df77F257830",
      "deploymentBlock": 45666755,
      "deploymentTransaction": "0xb757fec8ce40a575af03cae9f0accab3ef4006253ed5d2d1a26c9367178221de",
      "runtimeCodeHash": "0xb3a1e8b7ac5be4ad2a21a98d028179b816603f92740addb9220b647f1abdd083"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.poolsLbpProjectAdapterFactory": {
      "address": "0xA9313357d780912BE83BAdBe149e173B64804943",
      "deploymentBlock": 45666755,
      "deploymentTransaction": "0xfd23dbadcb3b03625ca9a02de2f730bbb0ea6f70c437e489cadc18506e94d66b",
      "runtimeCodeHash": "0x3639e103347567ca95e75807ca4da49154046b13b3b31963b9f4e838eaee5473"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.poolsProjectRegistrationHelper": {
      "address": "0xEAc85f4D2A1e668D7Ec1Dc8199FCA2150e352bF6",
      "deploymentBlock": 45666755,
      "deploymentTransaction": "0xc6d77306737a14bc5a0ee767bff37c00c694f26591e71a1462211905ec635b87",
      "runtimeCodeHash": "0x1b7b30124c43aefc4274f285b4ed9c58a6c6da4de563ce5613cceec3a54519bd"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.ponsProjectTokenFactory": {
      "address": "0x1D61c35525e100dE7057DB1A3fA10EA58aab5950",
      "deploymentBlock": 45666815,
      "deploymentTransaction": "0xae57177c9dae747bf71cc6d666bac0efb5ed3c8a4ed5889012329b74251bd7df",
      "runtimeCodeHash": "0x3ab99ca63c12efb229c701e56787ec86f8c7b59be41465936e0384de7046173c"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.launchpadProjectTokenFactory": {
      "address": "0x0E3E8BE5e4073391E0837C83e85463820328e701",
      "deploymentBlock": 45666815,
      "deploymentTransaction": "0xe2e5312a9e1fb935b870b09790d8ad3d5959686f017c1bcb8ec0649ec2a150eb",
      "runtimeCodeHash": "0xb03c479677d6d7da6f4e65ff10864f2f64f8a471c2b6abf259ec73b696a4240f"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.registry": {
      "address": "0x9a1a86EbDB6E3Bb5baBef607E04fB3aB1b3507d5",
      "deploymentBlock": 45666815,
      "deploymentTransaction": "0x157e01b0d1f2690a2ed8290215af490f44776ae4c17bbfa0d72026592a9c3fc2",
      "runtimeCodeHash": "0x4f912c34827620da14f081367377008a925b1288371cd6e87b9ed432519e48f2"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.deploymentEngine": {
      "address": "0x67EDBC0eeF7C12c224c72eE9a4Df4F868844A9b8",
      "deploymentBlock": 45666816,
      "deploymentTransaction": "0xc61db9a383f6955fbdbc867c4fffc70aa7cc4f221c19728d15128366dc884c73",
      "runtimeCodeHash": "0x551cdc80f8f7a4a69bc1abf0f959a91a03b3416443a915c2849ec2aeef8028d2"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.launchValidator": {
      "address": "0x5E3F0Df4021764D493ed6e40dA2fCf145eccb435",
      "deploymentBlock": 45666816,
      "deploymentTransaction": "0x5467edf493d693331fb1177ce929ea42e97ab711f3fd4d0837cc0df2dc2de9ac",
      "runtimeCodeHash": "0xb12505823045afd50ed12d8b2f13e4a42456f31211ca09dbd6f761ca9fa11bc3"
    },
    "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.launcher": {
      "address": "0x4b748848f16DAA81D09d8743Ced4A9604bc7de69",
      "deploymentBlock": 45666816,
      "deploymentTransaction": "0x6a5213e0bd8f036f6e9627bdc4ec9303b9d9f5f1f500a7039440e1695aea4d8f",
      "runtimeCodeHash": "0x76c53ff90988f1e00e42738d70f41720b5c59c1a2f55f064602f83418a7849b2"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.raffleImplementation": {
      "address": "0x95d67d22a20eB306da925f9652F42d7cC240e4A3",
      "deploymentBlock": 45741938,
      "deploymentTransaction": "0x31959f395729534d489331fca50067d49747fd20e89b5d6cab8db58a29bc093a",
      "runtimeCodeHash": "0xba22d4e2aa622933541cb231f6ab8eca670539c748c8507e21742125157a0010"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.fundingBandV3IntegrationFactory": {
      "address": "0xb1f74070Aced380929d3EC34C5Ec766025bBC148",
      "deploymentBlock": 45741938,
      "deploymentTransaction": "0xe3222e2e95df33ccb6cfc3f62d0c4739f56dbee8a43517359669c384bc352329",
      "runtimeCodeHash": "0x42af7b6fdbaab808c06db8761a7a91578a1e07cc75ce40551b9d6e010c71dcb3"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.fundingBandQuoteUsdOracle": {
      "address": "0x88d3E990B23F1d967aDfAE1C4a7bFCdfc2f80996",
      "deploymentBlock": 45741938,
      "deploymentTransaction": "0x58268dbab3652afd7c2af62321633fbd4b49eedd869c39bdcd7afb0c30c42e19",
      "runtimeCodeHash": "0x6bde18fbfb602edfb4e5554b44ae9fe1f7b2d47ccbe35a7311b0936134a66efd"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.projectV3PriceGuard500": {
      "address": "0x522fcD2D65993AFeB82Ec49FC51dA2Cfa5139704",
      "deploymentBlock": 45741938,
      "deploymentTransaction": "0x28f55959c065da4e9d47174f75da9fd6e7affb472885100d4577901bd9688ae9",
      "runtimeCodeHash": "0xf3934b69bbf1f16faab99a265e7b8ab197042c78db71100a4c349b8e0035720c"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.projectV3PriceGuard3000": {
      "address": "0x9e50BDC39156eFB7C404f441A77A38E091345a6F",
      "deploymentBlock": 45741938,
      "deploymentTransaction": "0x5b235a1b0fd1ffb452e07cc350c5f97eefbf225dc15a8fb6a314b8752f6c9192",
      "runtimeCodeHash": "0xd3e6fa9ac370e5eac8a969dca134556809ff5c654875c0b221be5adefc474b3b"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.projectV3PriceGuard10000": {
      "address": "0x51744fDF7173c566f8C8FD8DEd3e97123Ef834f7",
      "deploymentBlock": 45741938,
      "deploymentTransaction": "0x02e33830ed57429e80fa1a2051826abb8485f027bac143e9df8c318adfefab63",
      "runtimeCodeHash": "0xd2c79ddcd6c133d5cab767f9d0b899a6148e6c76ef5b2d066a43a1147e53b937"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.projectWethUnwrapPriceGuard": {
      "address": "0xf9F0568b7D64a1331Ea196F576cce0285b07f4Ea",
      "deploymentBlock": 45741938,
      "deploymentTransaction": "0x55cfd85c5c3b3306af0cfad74fd610e97f1ce93afbc24cf43aa322e2d7b9b23d",
      "runtimeCodeHash": "0x4b68dc8e8330fefeec40fc25a78622380ced829788c9bf3ce6467f82b8d0a12f"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.ponsV2PairBuybackAdapter": {
      "address": "0x1BE0E8F04221329FDfea34f41a1832a80c2c147c",
      "deploymentBlock": 45666464,
      "deploymentTransaction": "0x0a45abf50c63bae215062879061e05abd85e7f101e8e4e53ff0f875ade24cc26",
      "runtimeCodeHash": "0xba0a98c865c548ca90799cac47b7978380d52b8db6e7c66d4149d3010f77b6e3"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.ponsV2PairBuybackPriceGuard": {
      "address": "0x902A6Fa8Ca273aAB186633FF27879Cd3703F6AED",
      "deploymentBlock": 45666468,
      "deploymentTransaction": "0x371953095fae116a61de3ae970795c119430433bf286a33a329d9b941680a6c2",
      "runtimeCodeHash": "0xa03b64312803b10d3fe9bf511d0ba80cfc9ebd40931c64dc37481b49e9413e02"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.ponsProjectAdapterFactory": {
      "address": "0x96Bd46849C2455A192Aa92ea20560AA860D8c8c7",
      "deploymentBlock": 45741849,
      "deploymentTransaction": "0xbc81e7e4c6e83ca950ecd884bf7239231a5a16b8c7728757bf352760287871fe",
      "runtimeCodeHash": "0x00bcb0d9499f15ffbc17e8c3f06da56c93de778b176707286d8b6331b93d2e30"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.ponsProjectAdapterImplementation": {
      "address": "0x8Bb43c7a6cBeb0fCAFd4A2a315De71bAcf77802F",
      "deploymentBlock": 45741850,
      "deploymentTransaction": "0x3106ee39cff4992bc1a53e87c96a7cab44155e88a8fb5413ce4def6f4be6d3ee",
      "runtimeCodeHash": "0x558a9ae8a7cb9323bc07c7773e2b0ba8bc5f17a3f389676005a6f7d26473aa41"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.poolsInstantProjectAdapterFactory": {
      "address": "0x106409ef1D27EdBdb765c4CaF263DB03394f8956",
      "deploymentBlock": 45741874,
      "deploymentTransaction": "0x7b80f274d3ede626ff28b73bcdcdd7f4bd251325c983250868a684e8ddc80949",
      "runtimeCodeHash": "0x4ead53b9cda29c67a53dcdccb31b985a4a90e16a303991cf368f74468f81585e"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.poolsInstantNoFeeProjectAdapterFactory": {
      "address": "0x2C9b46FEF6835462bEda83781245dBC7eACc2294",
      "deploymentBlock": 45741876,
      "deploymentTransaction": "0xf104201564a5d6f9b3a271843ee1b078e8494a36bff1c9b71f9d0100bb5a062d",
      "runtimeCodeHash": "0xc988676c05056285e4f6683040eb9c2c91b714bf80e675e78819e01196d3b1ef"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.poolsLbpProjectAdapterFactory": {
      "address": "0x05145f3c9074f7f20a69897843A3e9EaDcF5450c",
      "deploymentBlock": 45741876,
      "deploymentTransaction": "0x2b7e59ed721f05849b7d897178c8a56c64d2c24a1bf5e268a3b0ffb7499ed137",
      "runtimeCodeHash": "0xdd68ea5688b66015feb06fda039c9ed2e4fd552271d9563a818c3b3c5f716dd3"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.poolsProjectRegistrationHelper": {
      "address": "0x76195057B28395d86C532919C4Fe01824Cf1120D",
      "deploymentBlock": 45741876,
      "deploymentTransaction": "0xa0e33f45cdac6dc41cceccdd1d72c864dc519cf277ecce2a6a92095a14ea9111",
      "runtimeCodeHash": "0x1b7b30124c43aefc4274f285b4ed9c58a6c6da4de563ce5613cceec3a54519bd"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.ponsProjectTokenFactory": {
      "address": "0xfe8d6de18671546e92b713d918c2429F3d2F4A8E",
      "deploymentBlock": 45741941,
      "deploymentTransaction": "0x90ffc7f745421073838f05b47e84e5f625b83000eb75083d62e8ebbd909ec60c",
      "runtimeCodeHash": "0x3ab99ca63c12efb229c701e56787ec86f8c7b59be41465936e0384de7046173c"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.launchpadProjectTokenFactory": {
      "address": "0x3fD50fd6CCD2Bf1DFaE834ea0dE8EE2d862903A6",
      "deploymentBlock": 45741941,
      "deploymentTransaction": "0x8a432074ba9fa6457328fc8646d65238e47cba15402dd185a6c33142af1d00f4",
      "runtimeCodeHash": "0xb03c479677d6d7da6f4e65ff10864f2f64f8a471c2b6abf259ec73b696a4240f"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.registry": {
      "address": "0x7658B8a558a9A5F2bF8d4E247D02d756F55a6d4d",
      "deploymentBlock": 45741941,
      "deploymentTransaction": "0xa7b98712605ba59b60a4f4152e4862c08c37ddf27ce5dd8bdac5a7f658b38613",
      "runtimeCodeHash": "0xcf95dd02afb863f5b9047c5e981d02575708b5b5e431381ca4fc8a7a30965c80"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.deploymentEngine": {
      "address": "0x8C79a8fC9fb0A817D9eB12a40Dd1aE8806FC2B73",
      "deploymentBlock": 45741942,
      "deploymentTransaction": "0x92c7b350c2580fbeea9c446c703ef3267a619d9993deee1cf7203b5529ca2607",
      "runtimeCodeHash": "0x4d863bc14c272a62a9766cf55b09179317ac2c4f00a7853858046a536f12af53"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.launchValidator": {
      "address": "0xc7C6D0CB3EEeaf8fb693504cA73063Fb5E01fA41",
      "deploymentBlock": 45741942,
      "deploymentTransaction": "0xbdafcd121e2e6c76d7b103d9a99ca390cad9a7bdafebc571977c7369a88bd584",
      "runtimeCodeHash": "0xa1b88c15301138365168ae14929c8c41a867ec9370bbd505dbeb744708edcbfb"
    },
    "projectV2Generations.project-v2-gascap-20260825-3d6dd81.launcher": {
      "address": "0x2260655205Ad66D1034d3C8afA46E6168C9C48Ff",
      "deploymentBlock": 45741942,
      "deploymentTransaction": "0xa23e984bb1e6c85945ce2006b4a2db8398814b2bca6058beba2cddc41373eb3a",
      "runtimeCodeHash": "0x8fd84e21d7bf188ddd31eb2375e3b24dd49cb1a6018a8348c95375b192939704"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.raffleImplementation": {
      "address": "0xcEd195Bdc065D0A70B138fe07c6F9F79C70a65DF",
      "deploymentBlock": 46149746,
      "deploymentTransaction": "0x42447e5fe420102caaa4b0c3e8654ca472154874624807453abfc19b970d19cd",
      "runtimeCodeHash": "0x3a0d74d0dd72ad1965c4bb6a7d2e9d9e0ccbd7ed88a294bda05317f5bfd919ff"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.fundingBandV3IntegrationFactory": {
      "address": "0xB97462beb73C87c4c22734eF676c0d938ADf9Dde",
      "deploymentBlock": 46149746,
      "deploymentTransaction": "0x5d14b55a4ec5137e23163ccf232bfef87e18fc61db4a17b82241d9e4d05f48fb",
      "runtimeCodeHash": "0x42af7b6fdbaab808c06db8761a7a91578a1e07cc75ce40551b9d6e010c71dcb3"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.fundingBandQuoteUsdOracle": {
      "address": "0x8506Ce4B817f85974273cce65Ce427c3e7Ee40f7",
      "deploymentBlock": 46149746,
      "deploymentTransaction": "0xe75544577b3acfcd87e0a69da86f973795e1d44ea772a8a61cd9e09dcf9ce300",
      "runtimeCodeHash": "0x6bde18fbfb602edfb4e5554b44ae9fe1f7b2d47ccbe35a7311b0936134a66efd"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.projectV3PriceGuard500": {
      "address": "0xDE14dC262d130bd786249a58370bE2dc34662692",
      "deploymentBlock": 46149746,
      "deploymentTransaction": "0x955014cef86fe149759c19530196eb5760ff0ceaf5b6d60eb2081d2c16ab2e36",
      "runtimeCodeHash": "0xf3934b69bbf1f16faab99a265e7b8ab197042c78db71100a4c349b8e0035720c"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.projectV3PriceGuard3000": {
      "address": "0x5b14D8a18b34AeeA89013d2B8B8f6Fae7fE2d121",
      "deploymentBlock": 46149746,
      "deploymentTransaction": "0xff038fa38a2167aeadbefa97ff0d115b7b3bf81fa532ef8ac271b92ce887a4a2",
      "runtimeCodeHash": "0xd3e6fa9ac370e5eac8a969dca134556809ff5c654875c0b221be5adefc474b3b"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.projectV3PriceGuard10000": {
      "address": "0xe7cb99361f00ce8f136AfF7e096f2d743B1dAdF0",
      "deploymentBlock": 46149746,
      "deploymentTransaction": "0x2d972be27c4ac0180fc48d8da7dd70cdb6a453c3ba9b13a5eed1a0dc0a1da791",
      "runtimeCodeHash": "0xd2c79ddcd6c133d5cab767f9d0b899a6148e6c76ef5b2d066a43a1147e53b937"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.projectWethUnwrapPriceGuard": {
      "address": "0x86d4bb5E130CDA655778Bd59Af4A5E00268f2F85",
      "deploymentBlock": 46149746,
      "deploymentTransaction": "0xc011aeb1f701823076bf3fbc34eaa51590cecf434558f0a4940671fa37849a2d",
      "runtimeCodeHash": "0x4b68dc8e8330fefeec40fc25a78622380ced829788c9bf3ce6467f82b8d0a12f"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.ponsV2PairBuybackAdapter": {
      "address": "0xfAB57a5fE409B4503A1a09fD7DC80e6ffB85Abb8",
      "deploymentBlock": 28126079,
      "deploymentTransaction": "0x17579811baa9eb290ebe1a2a73534fecd1e93909edcf170a261418682ce5ec75",
      "runtimeCodeHash": "0x37fedab733793c3b192b44be34c45048b99915534b9e2a256cf9b518a7417a07"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.ponsV2PairBuybackPriceGuard": {
      "address": "0x69768f0b41A5A51aB23b23ccfbE9e3122Ac0DA8b",
      "deploymentBlock": 28126079,
      "deploymentTransaction": "0x52b095758edc3d998dbff2c6a23b01d3e3e593c1c8f79334c9040d8c71e8a2de",
      "runtimeCodeHash": "0x27a8a84e173e127965717c020a07bb304ab0eb7e3396d0b6e3fc720f536cea21"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.ponsProjectAdapterFactory": {
      "address": "0x37617C7603032b6a8437365d1582Fcb0B003501F",
      "deploymentBlock": 46149612,
      "deploymentTransaction": "0x906d0b0cb43c1c1c7e1f67633a425d41c0380736e28669e92f4ce0dbe8fe5374",
      "runtimeCodeHash": "0x1150584f86e1c3f99281506d270127729c1592291c3643040a40e4501015cf0e"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.ponsProjectAdapterImplementation": {
      "address": "0xF4a58F32200dc92D86D3f02CA1F2c909F1366Cb6",
      "deploymentBlock": 46149612,
      "deploymentTransaction": "0xf5d5e1ab2a08368c936ea7f964d32f7d2f741802c98ac1d61f55bc1a9202c715",
      "runtimeCodeHash": "0x6771b3d19c35e439a8b333def079e7dab2c55c7fec6a8c1332f765ab026abd81"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.poolsInstantProjectAdapterFactory": {
      "address": "0xfe31374738734593713ABa786770D4B743807357",
      "deploymentBlock": 46149688,
      "deploymentTransaction": "0xba6e62e13f0760f796a4161788d0c88792da869714c83f7b2374587bf76f6e9a",
      "runtimeCodeHash": "0x94f0173c31044ce739e4231875de7aad6de4f1b5b6ff154ccdd23900383e5543"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.poolsInstantNoFeeProjectAdapterFactory": {
      "address": "0x183D9B7b27eAAE93fC66fF5e2fCe48324AD45c13",
      "deploymentBlock": 46149688,
      "deploymentTransaction": "0x5a3f4a793d28ac29c40ed6ef9afcea3b22cb3f9b1008a7916a2aed973c99c132",
      "runtimeCodeHash": "0x8fbe4ecfc619ee0421b52471581c326f590b6fac73e4b9aa1c87770be0c3dc45"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.poolsLbpProjectAdapterFactory": {
      "address": "0xD9E67819353643CAb708B1b24DEE1915186C33D9",
      "deploymentBlock": 46149688,
      "deploymentTransaction": "0xc0f14f219225d6fa187c097b95cd6d37823f769b95f8018918c9265b15e66efe",
      "runtimeCodeHash": "0x0044814c692e020cfa48b09c2ecc51df83e6c7b41e39385bcaa61723f2fcdd0c"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.poolsProjectRegistrationHelper": {
      "address": "0x09Ab649D60faBF842B23f300c515b7043522CF08",
      "deploymentBlock": 46149689,
      "deploymentTransaction": "0xb605ce55fbdf0fffae796e5c5f7e3f41eb4427fa85d84854dbc27142c171c6d7",
      "runtimeCodeHash": "0x34bd1ccd3740087c6fa60792496ff3a479f1d10c8c2e81a8bafb0f8dff011d8b"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.ponsProjectTokenFactory": {
      "address": "0x8f27b906f0B7562E51d1E9B23963FE738D90C0E8",
      "deploymentBlock": 46149749,
      "deploymentTransaction": "0x876e13555b00c3ea253f67f1f7011ec6ef88fd6108b822f5e50d6e0a27058b25",
      "runtimeCodeHash": "0x3ab99ca63c12efb229c701e56787ec86f8c7b59be41465936e0384de7046173c"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.launchpadProjectTokenFactory": {
      "address": "0x4Ca750DBA9728942048898004fF545AAC56ecD38",
      "deploymentBlock": 46149749,
      "deploymentTransaction": "0x62ee30ee94b3233305129fe20bd52bba848480003ab1d3ebbeca6bca896e9c51",
      "runtimeCodeHash": "0xb03c479677d6d7da6f4e65ff10864f2f64f8a471c2b6abf259ec73b696a4240f"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.registry": {
      "address": "0xc8297e34aD37A8A6D9f237Eda996Ee207d23188A",
      "deploymentBlock": 46149749,
      "deploymentTransaction": "0xde5317f94005d70ae020bebe6f6baeb1775aeaa40f9feceb196243a9cef5d2f6",
      "runtimeCodeHash": "0x006a442303dbe7dcbc96806bd8f737a3c51cf161c775795ebafa9b5a0ebcd2ab"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.deploymentEngine": {
      "address": "0xf94acC8857e4EF5Be78aB6D53c8CbdDDBF22F460",
      "deploymentBlock": 46149750,
      "deploymentTransaction": "0xd8e3906f82f4742d5990dfdada6a612d4bb4dc39e80577000a1d980fc2ec9ce2",
      "runtimeCodeHash": "0x2b8aa6b4bc0c45c26bf369940b020173419eb1eae86b642b664fa712bf2aa92b"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.launchValidator": {
      "address": "0xe746519A82BD3E8356b502A5083e8873a3f15099",
      "deploymentBlock": 46149750,
      "deploymentTransaction": "0xd1d7008d8354cd9153a41fa72e041dcf3b14b68a7ef748d332b8c09cf14d91c1",
      "runtimeCodeHash": "0x31410cf109fc61613023020d6ab6a372f964e824162ba4f6f3aa0528b81e6bc0"
    },
    "projectV2Generations.project-v2-public-pons-wrong-locker-20260825-1925510.launcher": {
      "address": "0xbf9c48Bd4784016065613Fbde7bbc2BcA017FA7E",
      "deploymentBlock": 46149750,
      "deploymentTransaction": "0xdd333d11f1a1c44b01f065da5528723efdb86f48e311b5ec3a6576002feca58e",
      "runtimeCodeHash": "0x6fcfad826b44a3f115a709730f18d4b3976e6fc59fb03986ac97253783b81bdb"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.deployer": {
      "address": "0x39E2f5eFdFd808F26B98979a06BA11ea82E1C85f",
      "kind": "eoa"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.governance": {
      "address": "0x39E2f5eFdFd808F26B98979a06BA11ea82E1C85f",
      "kind": "eoa"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.manager": {
      "address": "0x49cCBaF51a141f726Ed8010612fd541cE8d81023",
      "deploymentBlock": 37220865,
      "deploymentTransaction": "0xf8cc28db48484df8657aed4b503c0b7031fd31c11b685fc92767c1b9f5958f69",
      "runtimeCodeHash": "0x7d52072593c645aa9eef53dc612bc8be076122f3181e0c5e2ae318646d5578f5"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.oracle": {
      "address": "0x09978409A32B7a8F574D2858c9981456E63CC65E",
      "deploymentBlock": 37220681,
      "deploymentTransaction": "0x34fefe5859b1365fecc3fc508ecb19042d009503f42e0c42ad481d9ff60088b0",
      "runtimeCodeHash": "0x0f34766397d79c63a443067d266f6cddce1107ad410fc75f68293c0386412bb7"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.ponsV2Verifier": {
      "address": "0xeE29bf87Fa7e4b9336D40D429874d3d9b0a01304",
      "deploymentBlock": 37220707,
      "deploymentTransaction": "0x816b25c6f05ac1b94c9e5bf40d1de3f572e320d0c69204f1c87f00551c2ab677",
      "runtimeCodeHash": "0x34be3e111f42753bca0b3ee18c9f753d49c7e876329fb8ecacb1bdfd16402ef1"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.ponsV2Guard": {
      "address": "0x7078b0b68293217678f9B8e0A2AfA8eC26eF149a",
      "deploymentBlock": 37220772,
      "deploymentTransaction": "0x61ddba7648f7a752f87ed6f91931cb901e4ed396bbe1b5b3c05f4e67dc9095bc",
      "runtimeCodeHash": "0x08599108bd65ee9d3f87e6431dd3e6fa5ad1e25cf44cb597041a35836c79bc39"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.launchEscrow": {
      "address": "0x1b1C878f5D7F46159Dc4aE34405a6b36631DFA23",
      "deploymentBlock": 37220736,
      "deploymentTransaction": "0x43e34824c7c91f54083027ca2ab66b2b3ec38c388683bc98b3b1bba3d2981ce8",
      "runtimeCodeHash": "0x449131c16711cac5a63a0c0c92a1838c0c6ce96bf86337a107a44f16dd320a4a"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.subjectSellAdapter": {
      "address": "0x13Aa34682F130105E363bE6aAA43d4421EB3c961",
      "deploymentBlock": 37220872,
      "deploymentTransaction": "0x6ae391c1650a24d2c8e6747a8654f89b67c7cb608cc8c7a3ff905d97effeb22e",
      "runtimeCodeHash": "0x12f31d5a91362e4f5237365bb001b37d612b7f4bfc5a83e373311bf5edf2fdc7"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.subjectPriceGuard": {
      "address": "0x8a9f9cB3e4523A973F243E81d248Fa4F3e7c2582",
      "deploymentBlock": 37220896,
      "deploymentTransaction": "0x160b526c4d1819093772f387762f81bb4ddafc0257cce3603f2b7b19ddcee1da",
      "runtimeCodeHash": "0x37b39d9a90abd782d8062309d5cf027dd9425cd7537e53e9b2eb262b355e2dd0"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.fundingBandMath": {
      "address": "0x9E421c5B72f3950333420C5749381f61b96436b8",
      "deploymentBlock": 37220794,
      "deploymentTransaction": "0xd53907742f5f8816d37a826ef9e22388d16af7701280f6d02bfdf6f152a65e47",
      "runtimeCodeHash": "0xabeefeed70b46391de5b9f110cf0e9ee857b0225c8224bee324fee623f30096e"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.fundingBandV4": {
      "address": "0x49D3C913844bdAF3960Db4738ED2B101E67986D6",
      "deploymentBlock": 37220817,
      "deploymentTransaction": "0x037547de8a8ac8d3b20aa3e8f4cfffeb6bd70fcca301b0de50b62fb60f1622e5",
      "runtimeCodeHash": "0xd373f618fc1355ec9344ae55717c563d9a1a795260bc5204ef50fc32e159d5a7"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.v4Infrastructure.stateView": {
      "address": "0xF3334192D15450CdD385c8B70e03f9A6bD9E673b",
      "runtimeCodeHash": "0x7d9c591e0956fd89d98feb4ffcfe8bf1f7a62bd485edd979fa21d104b49878a6"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.v4Infrastructure.poolManager": {
      "address": "0x8366a39CC670B4001A1121B8F6A443A643e40951",
      "runtimeCodeHash": "0xbd3881180b547f5fe817545743cfb4343e96b1bc6640dcd70c106b0066e95626"
    },
    "fundingBandsHistoricalGenerations.funding-bands-single-adapter-20260815-036972e.operations.keeper": {
      "address": "0x39E2f5eFdFd808F26B98979a06BA11ea82E1C85f",
      "kind": "eoa"
    },
    "ponsV2AdapterHistoricalGenerations.trustedForwarderFactory.launchFactory": {
      "address": "0x7DCeEaB0A53684b001A4900768a52eAcDb27294e",
      "runtimeCodeHash": "0x3392f4e9040deec97e49bf05fc3a696f295b79806ef83910d84943d431d05e83"
    },
    "ponsV2AdapterHistoricalGenerations.trustedForwarderFactory.launchDeployer": {
      "address": "0xa0bc05240f1cD1f3Df7FEfA35e48C19ffF4c6ACe",
      "runtimeCodeHash": "0x1a02242a68ae3b615880e87cba298a208fe991a7a6f87cbc9b34e596e9518fc7"
    },
    "ponsV2AdapterHistoricalGenerations.trustedForwarderFactory.feeEscrow": {
      "address": "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e",
      "runtimeCodeHash": "0xf25f75cfbc1637ba068dc34f69098fa4e8a80f8ee8fe7bf7820594e0b3fed2f1"
    },
    "ponsV2AdapterHistoricalGenerations.trustedForwarderFactory.memeHook": {
      "address": "0xE9Ec0Ffc7d5bEF33f815D7b0cDd15A7c5Dc1e044",
      "runtimeCodeHash": "0x5f3bc01971cffe8dea490d70f123c25c01ae2c3579b68d40109c3ac68e1461eb"
    },
    "ponsV2AdapterHistoricalGenerations.trustedForwarderFactory.launchLocker": {
      "address": "0x1006fA85294A9c38AA4214d52c86CC970Ddc5647",
      "runtimeCodeHash": "0x5304631acb89c64e75397509c745337b6ddb3e7f529e2297a335114049bcff7d"
    },
    "ponsV2AdapterHistoricalGenerations.trustedForwarderFactory.launchForwarder": {
      "address": "0xAc299024C0f4E561D6e99CEFABB9b7212de729b6",
      "runtimeCodeHash": "0x964762b1cdb587f7dc7d27f796e0ed403e0066e00a7ed0d015c90b1df32c5ec5"
    },
    "ponsV2AdapterHistoricalGenerations.trustedForwarderFactory.buybackVault": {
      "address": "0xA61f18568d3B817bbb95450D42F7403e871Ce0a1",
      "runtimeCodeHash": "0x99fd213fd5cccddc5bb26e9ab9763a69bd17f7286333f93ae9c3b96817f8f904"
    },
    "ponsV2AdapterHistoricalGenerations.trustedForwarderFactory.adapterFactory": {
      "address": "0xAc299024C0f4E561D6e99CEFABB9b7212de729b6",
      "deploymentBlock": 45029745,
      "deploymentTransaction": "0x5c632df37c4d79ed4c40ac1f944b431ee7f33ecaceb45a9309b783ac08bdaf41",
      "runtimeCodeHash": "0x964762b1cdb587f7dc7d27f796e0ed403e0066e00a7ed0d015c90b1df32c5ec5",
      "purpose": "Deploys deterministic per-launch SinjohPonsV2Adapter clones and atomically escrows configured first-buy inventory for Funding Bands."
    },
    "ponsV2AdapterHistoricalGenerations.trustedForwarderFactory.adapterImplementation": {
      "address": "0x8AAd1720e8a79b2DfF57294D768C3C2fC4a70e71",
      "deploymentBlock": 45029745,
      "deploymentTransaction": "0x5c632df37c4d79ed4c40ac1f944b431ee7f33ecaceb45a9309b783ac08bdaf41",
      "runtimeCodeHash": "0xde9bed0423e5a8c554e8ac2f4ce01b0c77b68674eb76425508e8c4595424e5a6",
      "purpose": "SinjohPonsV2Adapter implementation, initialized and self-deployed by the adapter factory constructor."
    },
    "ponsV2AdapterHistoricalGenerations.publicPonsUnboundFunding.launchFactory": {
      "address": "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e",
      "runtimeCodeHash": "0x89a27da6f703e0a7cdd4f233e7cb57604ff75b164530962d3ff7cf8483a67d84"
    },
    "ponsV2AdapterHistoricalGenerations.publicPonsUnboundFunding.launchDeployer": {
      "address": "0x3711ceA4feaDE896C913C68F01Eda97Cb06D1A42",
      "runtimeCodeHash": "0xeade22566c766377f6adfb99534f2772251efad9568642c0704a7051418e624c"
    },
    "ponsV2AdapterHistoricalGenerations.publicPonsUnboundFunding.feeEscrow": {
      "address": "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e",
      "runtimeCodeHash": "0xf25f75cfbc1637ba068dc34f69098fa4e8a80f8ee8fe7bf7820594e0b3fed2f1"
    },
    "ponsV2AdapterHistoricalGenerations.publicPonsUnboundFunding.memeHook": {
      "address": "0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044",
      "runtimeCodeHash": "0xc21b1e6c1b45403e81a581f22ed6d9c747997af1cfdac1b1dc9f4b1d346a10db"
    },
    "ponsV2AdapterHistoricalGenerations.publicPonsUnboundFunding.launchLocker": {
      "address": "0x267444D099b10fB5Ed7c3Cc7B7c767AdcA574952",
      "runtimeCodeHash": "0x58455f80b3773871d601a025e56ec27c71ab3bbb8e2ca6b17828954450742025"
    },
    "ponsV2AdapterHistoricalGenerations.publicPonsUnboundFunding.launchForwarder": {
      "address": "0xe33E9E479dF8802cb0866d5d05258bEc4cF62948",
      "runtimeCodeHash": "0xed9065184519eaa24a22c2556403d5d8bbb230ff94dbc5c414cf5028e20e52e7"
    },
    "ponsV2AdapterHistoricalGenerations.publicPonsUnboundFunding.buybackVault": {
      "address": "0x42df2a798f82289E177311362e8f5ccC45c1219c",
      "runtimeCodeHash": "0x5de8480874faffefa539648f1a7d6c1e69b39da3fa34de22fc95eb7586aece03"
    },
    "ponsV2AdapterHistoricalGenerations.publicPonsUnboundFunding.adapterFactory": {
      "address": "0x37617C7603032b6a8437365d1582Fcb0B003501F",
      "deploymentBlock": 46149612,
      "deploymentTransaction": "0x906d0b0cb43c1c1c7e1f67633a425d41c0380736e28669e92f4ce0dbe8fe5374",
      "runtimeCodeHash": "0x1150584f86e1c3f99281506d270127729c1592291c3643040a40e4501015cf0e"
    },
    "ponsV2AdapterHistoricalGenerations.publicPonsUnboundFunding.adapterImplementation": {
      "address": "0x095b16399337cd54652F766847c9208a18B1a779",
      "deploymentBlock": 46149612,
      "deploymentTransaction": "0x906d0b0cb43c1c1c7e1f67633a425d41c0380736e28669e92f4ce0dbe8fe5374",
      "runtimeCodeHash": "0x9be066c119b6c9d568c096ef14d9b6068292cfaaa3e984e52d7ceb34aee2fcd3"
    },
    "ponsV2AdapterHistoricalGenerations.publicPonsUnboundFunding.projectAdapterImplementation": {
      "address": "0xF4a58F32200dc92D86D3f02CA1F2c909F1366Cb6",
      "deploymentBlock": 46149612,
      "deploymentTransaction": "0xf5d5e1ab2a08368c936ea7f964d32f7d2f741802c98ac1d61f55bc1a9202c715",
      "runtimeCodeHash": "0x6771b3d19c35e439a8b333def079e7dab2c55c7fec6a8c1332f765ab026abd81"
    }
  },
  dependencies: {
    "ponsLaunchFactory": {
      "address": "0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB",
      "runtimeCodeHash": "0x0a62b8ed1d88d30c7b342ea8361dfaf0ac336706992cf0c8ba38b129f06391d4"
    },
    "ponsLocker": {
      "address": "0x736D76699C26D0d966744cAe304C000d471f7F35",
      "runtimeCodeHash": "0xa7880a625a649da833de5597c9f41585bb75e20ef91d45830ccc6f4e49cc281c"
    },
    "weth": {
      "address": "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
      "runtimeCodeHash": "0x5706be52f64875fee65a2cec0d80e47a23d8793cbe85d214b48445e2d05f5353"
    },
    "v3Factory": {
      "address": "0x1f7d7550B1b028f7571E69A784071F0205FD2EfA",
      "runtimeCodeHash": "0xec72b1abd1f2faee020cfea9c646bd8994f9fb389054f6e574f103a895091739"
    },
    "v3PositionManager": {
      "address": "0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3",
      "runtimeCodeHash": "0x0a493d1af3d0f25fed8efa205244ebee14114267a08647fc38c515c7cd6ead4f"
    },
    "swapRouter": {
      "address": "0xCaf681a66D020601342297493863E78C959E5cb2",
      "runtimeCodeHash": "0x6f36c378e272c6324c48f045182bcb54bd8ad654cf9ebd42e8893d52c4cb25dc"
    },
    "ponsV2LaunchFactory": {
      "address": "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e",
      "runtimeCodeHash": "0x89a27da6f703e0a7cdd4f233e7cb57604ff75b164530962d3ff7cf8483a67d84"
    },
    "ponsV2LaunchDeployer": {
      "address": "0x3711ceA4feaDE896C913C68F01Eda97Cb06D1A42",
      "runtimeCodeHash": "0xeade22566c766377f6adfb99534f2772251efad9568642c0704a7051418e624c"
    },
    "ponsV2FeeEscrow": {
      "address": "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e",
      "runtimeCodeHash": "0xf25f75cfbc1637ba068dc34f69098fa4e8a80f8ee8fe7bf7820594e0b3fed2f1"
    },
    "ponsV2MemeHook": {
      "address": "0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044",
      "runtimeCodeHash": "0xc21b1e6c1b45403e81a581f22ed6d9c747997af1cfdac1b1dc9f4b1d346a10db"
    },
    "ponsV2BuybackVault": {
      "address": "0x42df2a798f82289E177311362e8f5ccC45c1219c",
      "runtimeCodeHash": "0x5de8480874faffefa539648f1a7d6c1e69b39da3fa34de22fc95eb7586aece03"
    },
    "ponsV2LaunchLocker": {
      "address": "0x267444D099b10fB5Ed7c3Cc7B7c767AdcA574952",
      "runtimeCodeHash": "0x58455f80b3773871d601a025e56ec27c71ab3bbb8e2ca6b17828954450742025"
    },
    "ponsV2LaunchForwarder": {
      "address": "0xe33E9E479dF8802cb0866d5d05258bEc4cF62948",
      "runtimeCodeHash": "0xed9065184519eaa24a22c2556403d5d8bbb230ff94dbc5c414cf5028e20e52e7"
    },
    "uniswapV4PoolManager": {
      "address": "0x8366a39CC670B4001A1121B8F6A443A643e40951",
      "runtimeCodeHash": "0xbd3881180b547f5fe817545743cfb4343e96b1bc6640dcd70c106b0066e95626"
    },
    "uniswapV4PositionManager": {
      "address": "0x58daec3116aae6D93017bAAea7749052E8a04fA7",
      "runtimeCodeHash": "0xc873e135dc9aaec88489cfbad146b4cb49d6a32e0d80326377784b7ba17670b2"
    },
    "uniswapV4UniversalRouter": {
      "address": "0x8876789976dEcBfCbBbe364623C63652db8C0904",
      "runtimeCodeHash": "0x2ce6aaaf9f4151f5e1cbf774668772f17f532ae11b15e9284fd0a072a8b0fbde"
    },
    "poolsTradeLiquidityLauncher": {
      "address": "0x0000FffFBE8efE702c8703aE3477FF5dE3d319C0",
      "runtimeCodeHash": "0x4a586d925c9d59ece13ce2239ebd7dea9ee725f9d33c6667e0fd16ae8d977d80"
    },
    "poolsTradeUERC20Factory": {
      "address": "0x000000e200088D55C39a11F609E5F667729ad49b",
      "runtimeCodeHash": "0x9f042af1533641f048ced56b55898d9e87b2ccb0ec6854292e2cd8ea733e6aeb"
    },
    "poolsTradeInstantStrategyCreatorFee": {
      "address": "0x23f8209572b4a1C2AD88A42749E830791Fb027f1",
      "runtimeCodeHash": "0x29df27cf43533e9b3708dcd2a2c0fd17a1a8796407e7d39375f47e5c809cffca"
    },
    "poolsTradeInstantStrategyNoFee": {
      "address": "0xAD44D55E7f8337C3cE113fBb591486E85be104b2",
      "runtimeCodeHash": "0x6944058fa8339bcf018c4a2ddc043d378b47516f8756db34202bdc6cf93a9a8e"
    },
    "poolsTradeFeeSplitterCreatorFee": {
      "address": "0xeFF166AAf189323c58dc27eD1206EB2C37FaACDf",
      "runtimeCodeHash": "0x8238e5106b3a895514083110d1f3b4e51be61148604f35113719af56ae325f42"
    },
    "poolsTradeFeeSplitterNoFee": {
      "address": "0x222D6d4f1ce59b0d48D5505114eC8Addc90A4359",
      "runtimeCodeHash": "0x8238e5106b3a895514083110d1f3b4e51be61148604f35113719af56ae325f42"
    },
    "poolsTradeBeneficiaryVault": {
      "address": "0xd35E9CA72F64C7F93BE30fad67524323396B36D7",
      "runtimeCodeHash": "0x725412bf002214373afc095b0b9e4c756b1d12ac37d5c7dfe1667db4385403b6"
    },
    "poolsTradeCompoundingClaimRecipient": {
      "address": "0xf9526Dd3361fe0ba6b7a99533ed471D3E808E99a",
      "runtimeCodeHash": "0xb9b1a32990c06baedf12b01208967d6a8373afbf99b684ea81b07c7b99e5dbe9"
    },
    "poolsTradeLBPStrategy": {
      "address": "0x05d552391067389EE44fec3924157ed33F976000",
      "runtimeCodeHash": "0x6e822d6a2f634311363ec357109a691d86912414df5c211a2f6ac6de9a680d68"
    },
    "poolsTradeCCAFactory": {
      "address": "0x000000001F26a0044BaA66024e7b6599c61963F8",
      "runtimeCodeHash": "0xa1d2a90564f4f63580b25de42efaff92505c254b00fc666f65ab38126cce5cfa"
    },
    "poolsTradeInitializerHook": {
      "address": "0xD462a559337859369EF271814851A18F496ba000",
      "runtimeCodeHash": "0xbd115add5605cc659e68632d42884c67da58251c9ceb17d5019d0a85d36c2a2e"
    },
    "poolsTradeTokenSplitter": {
      "address": "0x4F5E3FBb9745358A92Da5674305FAb8D2B8a73cE",
      "runtimeCodeHash": "0x3373016823b274303947e411171478087acc3d1e844c649bc9b84e69de685d62"
    },
    "robinhoodStockBeacon": {
      "address": "0xe10b6f6B275de231345c20D14Ab812db62151b00",
      "runtimeCodeHash": "0x8b465c0b53a2ba499566e9b4ca67d8c90ed6131743df806a570d156956a7e90e",
      "implementation": "0xb35490d6f9163DE4F80d88dc75c3516eb64C5aE2",
      "implementationRuntimeCodeHash": "0xdc07e86ee482f99641bdafb9a0d772846b167401e094d90a666b94dbdcd1eec7",
      "implementationBinding": {
        "kind": "beacon"
      }
    },
    "robinhoodStockImplementation": {
      "address": "0xb35490d6f9163DE4F80d88dc75c3516eb64C5aE2",
      "runtimeCodeHash": "0xdc07e86ee482f99641bdafb9a0d772846b167401e094d90a666b94dbdcd1eec7"
    },
    "letscash.factoryProxy": {
      "address": "0x5bd1Fbe78a78fe8236fa00CF48fbEBA74ae34661",
      "runtimeCodeHash": "0x51faa3f1aaa267eb4ffb4dd57f07a89edf3ffd618213bf35cf7f8254a07961e5",
      "implementation": "0x3dFd73A63E15920aDd4B6c5C6a4b1b4B768b2c1A",
      "implementationRuntimeCodeHash": "0xef0219f515c49723f589e3aa4748b6f99caa8ef8a3f03e4c1a2b4d977d80f731",
      "implementationBinding": {
        "kind": "eip1967",
        "slot": "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
      }
    },
    "letscash.factoryImplementation": {
      "address": "0x3dFd73A63E15920aDd4B6c5C6a4b1b4B768b2c1A",
      "runtimeCodeHash": "0xef0219f515c49723f589e3aa4748b6f99caa8ef8a3f03e4c1a2b4d977d80f731"
    },
    "letscash.hook": {
      "address": "0x75A54357D9C78a2Db19004a5FDc76c50F9242AEC",
      "runtimeCodeHash": "0x5bbb7cb03abf34683d1f1e795e5e1a96573a0feee7c20c51f1cbf02139eb9003"
    },
    "letscash.poolManager": {
      "address": "0x8366a39CC670B4001A1121B8F6A443A643e40951",
      "runtimeCodeHash": "0xbd3881180b547f5fe817545743cfb4343e96b1bc6640dcd70c106b0066e95626"
    },
    "letscash.stateView": {
      "address": "0xF3334192D15450CdD385c8B70e03f9A6bD9E673b",
      "runtimeCodeHash": "0x7d9c591e0956fd89d98feb4ffcfe8bf1f7a62bd485edd979fa21d104b49878a6",
      "purpose": "Reads letscash.fun v4 slot0 for price, market-cap, and chart surfaces."
    },
    "letscash.quoter": {
      "address": "0x8Dc178eFB8111BB0973Dd9d722ebeFF267c98F94",
      "runtimeCodeHash": "0xd707b1da8cb165e5ea35a3b4450d971eb562ec171e23492aa117036b78a868f6",
      "purpose": "Quotes exact-input letscash.fun trades including hook fees."
    },
    "letscash.universalRouter": {
      "address": "0x8876789976dEcBfCbBbe364623C63652db8C0904",
      "runtimeCodeHash": "0x2ce6aaaf9f4151f5e1cbf774668772f17f532ae11b15e9284fd0a072a8b0fbde",
      "purpose": "Executes wallet-owned letscash.fun v4 buys and sells."
    },
    "letscash.permit2": {
      "address": "0x000000000022D473030F116dDEE9F6B43aC78BA3",
      "runtimeCodeHash": "0x5208783f52488f7d3493e5e38311ab707c1d75457fe472a19b0b4d57d66a7fca",
      "purpose": "Pull authorization for letscash.fun token sells through the Universal Router."
    },
    "letscash.weth": {
      "address": "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
      "runtimeCodeHash": "0x5706be52f64875fee65a2cec0d80e47a23d8793cbe85d214b48445e2d05f5353"
    }
  },
  notDeployed: [
    "v3ExecutionFactory",
    "v3RouteExecutionFactory",
    "routerOwnedPons"
  ]
} as const;
