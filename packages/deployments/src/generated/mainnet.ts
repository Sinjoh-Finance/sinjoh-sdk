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
    "yieldBanks.registry": {
      "address": "0x09e4542f9fEA13A00aAF400E81bDC10434af5278",
      "runtimeCodeHash": "0x946ec7768669b7520fa5744c788a77b2f865c6482b094f759ef323d6a5ecfef0",
      "purpose": "Canonical registry for permissionless, versioned Yield Bank collection factories."
    },
    "yieldBanks.publicFactory": {
      "address": "0x5Ef0056E4619a92CDeEa6139c29EDC76b19820c1",
      "deploymentBlock": 52917622,
      "deploymentTransaction": "0xec15a893131cf834145d0e1ff23bbb0ffdd6f058987a52803babd8d80025f7b9",
      "runtimeCodeHash": "0xc63a5edf6f11a0a49b11ab8dfd48502d5fcfef52aa4338d3a9631ccf19194dd9",
      "purpose": "Permissionless staged factory for configurable Yield Bank NFT collections."
    },
    "launchStakingEngine": {
      "address": "0x1f20bF432206C133C08FCCaC4857B22e2327CE2b",
      "deploymentBlock": 41666632,
      "deploymentTransaction": "0x2271aaa33905873d5dd0486e042cb5118e3703460205016edf5c2cb37ccc1bbd",
      "runtimeCodeHash": "0x4da43ef12471fdfefd88fdb3eebf47dbe13aee37ddb752bc7ab2a92f26876d34",
      "purpose": "Shared multi-token staking and snapshot-reward sink for new Sinjoh launches that explicitly require staking for airdrops. Standard holder airdrops remain the default."
    },
    "fundingBands.deployer": {
      "address": "0x39E2f5eFdFd808F26B98979a06BA11ea82E1C85f",
      "kind": "eoa"
    },
    "fundingBands.governance": {
      "address": "0x39E2f5eFdFd808F26B98979a06BA11ea82E1C85f",
      "kind": "eoa"
    },
    "fundingBands.manager": {
      "address": "0x49cCBaF51a141f726Ed8010612fd541cE8d81023",
      "deploymentBlock": 37220865,
      "deploymentTransaction": "0xf8cc28db48484df8657aed4b503c0b7031fd31c11b685fc92767c1b9f5958f69",
      "runtimeCodeHash": "0x7d52072593c645aa9eef53dc612bc8be076122f3181e0c5e2ae318646d5578f5"
    },
    "fundingBands.oracle": {
      "address": "0x09978409A32B7a8F574D2858c9981456E63CC65E",
      "deploymentBlock": 37220681,
      "deploymentTransaction": "0x34fefe5859b1365fecc3fc508ecb19042d009503f42e0c42ad481d9ff60088b0",
      "runtimeCodeHash": "0x0f34766397d79c63a443067d266f6cddce1107ad410fc75f68293c0386412bb7"
    },
    "fundingBands.ponsV2Verifier": {
      "address": "0xeE29bf87Fa7e4b9336D40D429874d3d9b0a01304",
      "deploymentBlock": 37220707,
      "deploymentTransaction": "0x816b25c6f05ac1b94c9e5bf40d1de3f572e320d0c69204f1c87f00551c2ab677",
      "runtimeCodeHash": "0x34be3e111f42753bca0b3ee18c9f753d49c7e876329fb8ecacb1bdfd16402ef1"
    },
    "fundingBands.ponsV2Guard": {
      "address": "0x7078b0b68293217678f9B8e0A2AfA8eC26eF149a",
      "deploymentBlock": 37220772,
      "deploymentTransaction": "0x61ddba7648f7a752f87ed6f91931cb901e4ed396bbe1b5b3c05f4e67dc9095bc",
      "runtimeCodeHash": "0x08599108bd65ee9d3f87e6431dd3e6fa5ad1e25cf44cb597041a35836c79bc39"
    },
    "fundingBands.launchEscrow": {
      "address": "0x1b1C878f5D7F46159Dc4aE34405a6b36631DFA23",
      "deploymentBlock": 37220736,
      "deploymentTransaction": "0x43e34824c7c91f54083027ca2ab66b2b3ec38c388683bc98b3b1bba3d2981ce8",
      "runtimeCodeHash": "0x449131c16711cac5a63a0c0c92a1838c0c6ce96bf86337a107a44f16dd320a4a"
    },
    "fundingBands.subjectSellAdapter": {
      "address": "0x13Aa34682F130105E363bE6aAA43d4421EB3c961",
      "deploymentBlock": 37220872,
      "deploymentTransaction": "0x6ae391c1650a24d2c8e6747a8654f89b67c7cb608cc8c7a3ff905d97effeb22e",
      "runtimeCodeHash": "0x12f31d5a91362e4f5237365bb001b37d612b7f4bfc5a83e373311bf5edf2fdc7"
    },
    "fundingBands.subjectPriceGuard": {
      "address": "0x8a9f9cB3e4523A973F243E81d248Fa4F3e7c2582",
      "deploymentBlock": 37220896,
      "deploymentTransaction": "0x160b526c4d1819093772f387762f81bb4ddafc0257cce3603f2b7b19ddcee1da",
      "runtimeCodeHash": "0x37b39d9a90abd782d8062309d5cf027dd9425cd7537e53e9b2eb262b355e2dd0"
    },
    "fundingBands.fundingBandMath": {
      "address": "0x9E421c5B72f3950333420C5749381f61b96436b8",
      "deploymentBlock": 37220794,
      "deploymentTransaction": "0xd53907742f5f8816d37a826ef9e22388d16af7701280f6d02bfdf6f152a65e47",
      "runtimeCodeHash": "0xabeefeed70b46391de5b9f110cf0e9ee857b0225c8224bee324fee623f30096e"
    },
    "fundingBands.fundingBandV4": {
      "address": "0x49D3C913844bdAF3960Db4738ED2B101E67986D6",
      "deploymentBlock": 37220817,
      "deploymentTransaction": "0x037547de8a8ac8d3b20aa3e8f4cfffeb6bd70fcca301b0de50b62fb60f1622e5",
      "runtimeCodeHash": "0xd373f618fc1355ec9344ae55717c563d9a1a795260bc5204ef50fc32e159d5a7"
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
      "address": "0xAc299024C0f4E561D6e99CEFABB9b7212de729b6",
      "deploymentBlock": 45029745,
      "deploymentTransaction": "0x5c632df37c4d79ed4c40ac1f944b431ee7f33ecaceb45a9309b783ac08bdaf41",
      "runtimeCodeHash": "0x964762b1cdb587f7dc7d27f796e0ed403e0066e00a7ed0d015c90b1df32c5ec5",
      "purpose": "Deploys deterministic per-launch SinjohPonsV2Adapter clones and atomically escrows configured first-buy inventory for Funding Bands."
    },
    "ponsV2AdapterImplementation": {
      "address": "0x8AAd1720e8a79b2DfF57294D768C3C2fC4a70e71",
      "deploymentBlock": 45029745,
      "deploymentTransaction": "0x5c632df37c4d79ed4c40ac1f944b431ee7f33ecaceb45a9309b783ac08bdaf41",
      "runtimeCodeHash": "0xde9bed0423e5a8c554e8ac2f4ce01b0c77b68674eb76425508e8c4595424e5a6",
      "purpose": "SinjohPonsV2Adapter implementation, initialized and self-deployed by the adapter factory constructor."
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
      "deploymentTransaction": "0x52b095758edc3d998dbff2c6a23b01d3e3e593c1c8f79334c9040d8c71e8a2de",
      "runtimeCodeHash": "0x37fedab733793c3b192b44be34c45048b99915534b9e2a256cf9b518a7417a07",
      "purpose": "Pair-capable pons v2 buyback route: WETH into any launch's market — native or custom pair — via the pinned v3 hop, the bonding curve, or the graduated v4 pool. Supersedes ponsV2BuybackAdapter for new routes."
    },
    "ponsV2PairBuybackPriceGuard": {
      "address": "0x69768f0b41A5A51aB23b23ccfbE9e3122Ac0DA8b",
      "deploymentBlock": 28126079,
      "deploymentTransaction": "0x17579811baa9eb290ebe1a2a73534fecd1e93909edcf170a261418682ce5ec75",
      "runtimeCodeHash": "0x27a8a84e173e127965717c020a07bb304ab0eb7e3396d0b6e3fc720f536cea21",
      "purpose": "Signed-floor guard for the pair-capable pons v2 buyback route."
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
      "address": "0xaf4E45a4BC6f7F14E97cA87333A6be4A0d5c3e95",
      "deploymentBlock": 45137533,
      "deploymentTransaction": "0x89b94fd22c6ad525fd475b5017b15879fcf20f083411667fe3398eef95a991d3",
      "runtimeCodeHash": "0xba22d4e2aa622933541cb231f6ab8eca670539c748c8507e21742125157a0010"
    },
    "projectV2.fundingBandV3IntegrationFactory": {
      "address": "0x30B80bb9bE611EEd0535beA0A382163ba91B2859",
      "deploymentBlock": 45137603,
      "deploymentTransaction": "0x4884d438e23907a30fb756a4b9d251ae7ce14025d63b513735e5cbea09af6bf6",
      "runtimeCodeHash": "0x42af7b6fdbaab808c06db8761a7a91578a1e07cc75ce40551b9d6e010c71dcb3"
    },
    "projectV2.fundingBandQuoteUsdOracle": {
      "address": "0x79c9152a8C9f3e609e9c9989ae0a46a57d4faaEa",
      "deploymentBlock": 45137662,
      "deploymentTransaction": "0xdf0cdc5823df7ae99599e8885910af12680b4c1b66def9fe4f5ae2c43bd96587",
      "runtimeCodeHash": "0x6bde18fbfb602edfb4e5554b44ae9fe1f7b2d47ccbe35a7311b0936134a66efd"
    },
    "projectV2.projectV3PriceGuard500": {
      "address": "0x0A6e4CE76163Cda15a5549d0436570De8a931Ba9",
      "deploymentBlock": 45137718,
      "deploymentTransaction": "0xc970850a74a59e9343f04d2b69c95cb3ef228315e524a094c559497c65dd5e73",
      "runtimeCodeHash": "0xa1eb83fbcd5959e18a125614d807969eae7cde0c718670e5aaecbe089797be4f"
    },
    "projectV2.projectV3PriceGuard3000": {
      "address": "0x82d830f603D437ea9dAbdD3a6de0b33100c01158",
      "deploymentBlock": 45137778,
      "deploymentTransaction": "0x3ecc33e9a6caf9b088e291de8d40ad9e2875968c8619195042d05d5110f235e0",
      "runtimeCodeHash": "0x0ccd2e844de8f5ee2dccdeca6140189a3e75c791a2a9d1969976f1447b495872"
    },
    "projectV2.projectV3PriceGuard10000": {
      "address": "0x58214C993A406eaC8C9eA26707dAE716fFf4D827",
      "deploymentBlock": 45137837,
      "deploymentTransaction": "0x6d715b4ed97b1d53e0bd5ffdb34c73e6807a89e35270b2a7640ff8fb3aa55bc8",
      "runtimeCodeHash": "0x6ad1162bbc16e7298069e52ae6d2313aabf751733f92c1e833e3ce8a54bcbd63"
    },
    "projectV2.ponsProjectAdapterFactory": {
      "address": "0xAc299024C0f4E561D6e99CEFABB9b7212de729b6",
      "deploymentBlock": 45029745,
      "deploymentTransaction": "0x5c632df37c4d79ed4c40ac1f944b431ee7f33ecaceb45a9309b783ac08bdaf41",
      "runtimeCodeHash": "0x964762b1cdb587f7dc7d27f796e0ed403e0066e00a7ed0d015c90b1df32c5ec5"
    },
    "projectV2.ponsProjectAdapterImplementation": {
      "address": "0x3943b7f46b201CFe5033367Ae2E102555e0ea50F",
      "deploymentBlock": 45029745,
      "deploymentTransaction": "0xc9121126ed8dae4812802ddc23b68fea872d7bfce68947258a24ea6cede2edbd",
      "runtimeCodeHash": "0xd61178a140dc8f8df8a0ae4987dc93b7063334496591c10e81aee660d1d916e6"
    },
    "projectV2.poolsInstantProjectAdapterFactory": {
      "address": "0xc13238cdF673eE82704255C14C6224fC7AfA9C36",
      "deploymentBlock": 45030114,
      "deploymentTransaction": "0xc23d1390ff4926fbbd3c0102fe63ed2bb53f24e42a50a34e3175302adc1c273f",
      "runtimeCodeHash": "0xccaf8d43bf0d0da6d4a7dd2e539c7d0f2d71c470546c0dc8b1df6e3f96e25428"
    },
    "projectV2.poolsInstantNoFeeProjectAdapterFactory": {
      "address": "0x990A008705c115eF1cb779B73D20F2BcA865f03A",
      "deploymentBlock": 45030114,
      "deploymentTransaction": "0xf61df3840e52ead2d51529c5cc1f3f09447face5801604bd86c21acadacb49a5",
      "runtimeCodeHash": "0x81e78639a3c06cb115f800feceba601a5eb06e756ef2fec48abfb2376251579c"
    },
    "projectV2.poolsLbpProjectAdapterFactory": {
      "address": "0x00ed429B6810281784372B6Bf610541670815A60",
      "deploymentBlock": 45030115,
      "deploymentTransaction": "0x249176abceb321e4afde8d03a5a799ddffa77816393931248266b385e1a1e99d",
      "runtimeCodeHash": "0x33329edabc21310bac6d6b90c462ba63c139f9937ad9cec6f8bdacda0d86b30b"
    },
    "projectV2.poolsProjectRegistrationHelper": {
      "address": "0x570CFbE42720d96bcEaa592D2D110EF7211E7FA9",
      "deploymentBlock": 45030115,
      "deploymentTransaction": "0xbbd9770f51027978def144646037548747232e859c4427e98da9ea702ddc3cf4",
      "runtimeCodeHash": "0xde1b2a2c36ea4734ffca677dbb588ede4fc96b1e243b07632e9f1efbb56e7f49"
    },
    "projectV2.ponsProjectTokenFactory": {
      "address": "0x42A7883275912256780A8689F9B29a426fB2C0BA",
      "deploymentBlock": 45137953,
      "deploymentTransaction": "0x0aa079a523de5f6330587ed27b2425f5f6e0b31f0bc8e8c7f75fccbfab924d3d",
      "runtimeCodeHash": "0x3ab99ca63c12efb229c701e56787ec86f8c7b59be41465936e0384de7046173c"
    },
    "projectV2.launchpadProjectTokenFactory": {
      "address": "0xefC203F86299Ac9113Bf746328C58d647d22E004",
      "deploymentBlock": 45138009,
      "deploymentTransaction": "0xe44b5b34a9d31b5e16b03716f26e2091d21e7dd51a35dfb1c26826c890a919be",
      "runtimeCodeHash": "0xb03c479677d6d7da6f4e65ff10864f2f64f8a471c2b6abf259ec73b696a4240f"
    },
    "projectV2.registry": {
      "address": "0xb10f8350264315850D3aa8b9794f34F496F6d0Cf",
      "deploymentBlock": 45138065,
      "deploymentTransaction": "0xaa8258c49b72d63ce0f7366802904ad5c15f16bb9992c7a9fb901b16a87b2226",
      "runtimeCodeHash": "0x4317d73c13f1c9706677709ef42fa4cf4b03202ed130230c363eb2e10082ffe6"
    },
    "projectV2.deploymentEngine": {
      "address": "0x92EBaC0139001Face632aA25Bf6EC19Dc3a5747e",
      "deploymentBlock": 45138129,
      "deploymentTransaction": "0x31cc7ba558ebe23677dadb7b7e5a683ce4d5d7984aa1774ca4c982dfd73bf590",
      "runtimeCodeHash": "0x4b84e29376fa6ab3363fb7256057e30741b41dd22356d7d5ea7be6ea82edf128"
    },
    "projectV2.launchValidator": {
      "address": "0x2502C08433f239123CCd4D31479B63646213cbC0",
      "deploymentBlock": 45138186,
      "deploymentTransaction": "0xaad785d1bdd5324c8654bdeff551f95347e085cf4bf2b248f90c0cdd5a29c4b3",
      "runtimeCodeHash": "0x4ce85e7a26197e230d09f76f1af51f14b64009ec9fe1fac8440a7664114395a9"
    },
    "projectV2.launcher": {
      "address": "0x87B67dfFf09363AA75f4BEf1a43ae7d90C8f497B",
      "deploymentBlock": 45138244,
      "deploymentTransaction": "0x0ed96cfdcb1a484bcfad83756f26f865489689a53fe8233744a612ec8906ae90",
      "runtimeCodeHash": "0x86b7c7f88e40538022f80f00cad22469d622cbfb45a66c8d39577560e6ac5131"
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
      "address": "0x7DCeEaB0A53684b001A4900768a52eAcDb27294e",
      "runtimeCodeHash": "0x3392f4e9040deec97e49bf05fc3a696f295b79806ef83910d84943d431d05e83"
    },
    "ponsV2LaunchDeployer": {
      "address": "0xa0bc05240f1cD1f3Df7FEfA35e48C19ffF4c6ACe",
      "runtimeCodeHash": "0x1a02242a68ae3b615880e87cba298a208fe991a7a6f87cbc9b34e596e9518fc7"
    },
    "ponsV2FeeEscrow": {
      "address": "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e",
      "runtimeCodeHash": "0xf25f75cfbc1637ba068dc34f69098fa4e8a80f8ee8fe7bf7820594e0b3fed2f1"
    },
    "ponsV2MemeHook": {
      "address": "0xE9Ec0Ffc7d5bEF33f815D7b0cDd15A7c5Dc1e044",
      "runtimeCodeHash": "0x5f3bc01971cffe8dea490d70f123c25c01ae2c3579b68d40109c3ac68e1461eb"
    },
    "ponsV2BuybackVault": {
      "address": "0xA61f18568d3B817bbb95450D42F7403e871Ce0a1",
      "runtimeCodeHash": "0x99fd213fd5cccddc5bb26e9ab9763a69bd17f7286333f93ae9c3b96817f8f904"
    },
    "ponsV2LaunchLocker": {
      "address": "0x1006fA85294A9c38AA4214d52c86CC970Ddc5647",
      "runtimeCodeHash": "0x5304631acb89c64e75397509c745337b6ddb3e7f529e2297a335114049bcff7d"
    },
    "ponsV2LaunchForwarder": {
      "address": "0xAc299024C0f4E561D6e99CEFABB9b7212de729b6",
      "runtimeCodeHash": "0x964762b1cdb587f7dc7d27f796e0ed403e0066e00a7ed0d015c90b1df32c5ec5"
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
