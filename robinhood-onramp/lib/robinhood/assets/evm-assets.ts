import {
  RobinhoodEvmAsset,
  RobinhoodTokenType,
  RobinhoodDepositAddress,
} from "../types";

/**
 * EVM Asset Definitions
 * Includes: Ethereum L1, L2s (Polygon, Arbitrum, etc.), and all ERC-20 tokens
 */

/**
 * Deposit addresses for EVM assets
 * Source: Coinbase Prime Trading Balance wallets
 */
export const EVM_DEPOSIT_ADDRESSES: Record<string, RobinhoodDepositAddress> = {
  // Native assets
  ETH: {
    address: "0xa22d566f52b303049d27a7169ed17a925b3fdb5e",
  },
  AVAX: {
    address: "0x2063115a37f55c19cA60b9d1eca2378De00CD79b",
  },
  ETC: {
    address: "0x269285683a921dbce6fcb21513b06998f8fbbc99",
  },

  // Layer 2 - Currently disabled (no Robinhood Connect support)
  ARB: {
    address: "0x6931a51e15763C4d8da468cbF7C51323d96F2e80",
  },
  OP: {
    address: "0xE006aBC90950DB9a81A3812502D0b031FaAf28D8",
  },
  ZORA: {
    address: "0x407506929b5C58992987609539a1D424f2305Cc3",
  },
  MATIC: {
    address: "0x11362ec5cc119448225abbbb1c9c67e22e776cdd",
  },

  // Stablecoins
  USDC: {
    address: "0xd71a079cb64480334ffb400f017a0dde94f553dd",
  },

  // DeFi tokens
  AAVE: {
    address: "0x0788702c7d70914f34b82fb6ad0b405263a00486",
  },
  LINK: {
    address: "0xcf26c0f23e566b42251bc0cf680c8999def1d7f0",
  },
  COMP: {
    address: "0x944bff154f0486b6c834c5607978b45ffc264902",
  },
  CRV: {
    address: "0xe2efa30cca6b06e4436c0f25f2d0409407ac3a4d",
  },
  UNI: {
    address: "0x396b24e9137befef326af9fdba92d95dd124d5d4",
  },
  ONDO: {
    address: "0x894f85323110a0a8883b22b18f26864882c3c63e",
  },

  // Meme coins
  SHIB: {
    address: "0x263dcd3e749b1f00c3998b5a0f14e3255658803b",
  },
  PEPE: {
    address: "0x9D5025B327E6B863E5050141C987d988c07fd8B2",
    note: "Fallback address",
  },
  FLOKI: {
    address: "0x9D5025B327E6B863E5050141C987d988c07fd8B2",
    note: "Fallback address",
  },
  TRUMP: {
    address: "0x9D5025B327E6B863E5050141C987d988c07fd8B2",
    note: "Fallback address",
  },
  VIRTUAL: {
    address: "0x9D5025B327E6B863E5050141C987d988c07fd8B2",
    note: "Fallback address",
  },
  WLFI: {
    address: "0x9D5025B327E6B863E5050141C987d988c07fd8B2",
    note: "Fallback address",
  },
};

/**
 * EVM Asset Registry
 */
export const EVM_ASSETS: Record<string, RobinhoodEvmAsset> = {
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    description: "Smart contract platform and cryptocurrency",
    network: "ETHEREUM",
    chainId: 1,
    category: "layer1",
    icon: "eth.svg",
    decimals: 18,
    enabled: true,
    featured: true,
    popularity: 100,
    sortOrder: 2,
    type: RobinhoodTokenType.EvmToken,
  },

  AVAX: {
    symbol: "AVAX",
    name: "Avalanche",
    description: "Fast, low-cost blockchain platform",
    network: "AVALANCHE",
    chainId: 43114,
    category: "layer1",
    icon: "avax.svg",
    decimals: 18,
    enabled: true,
    popularity: 70,
    sortOrder: 10,
    type: RobinhoodTokenType.EvmToken,
  },

  ETC: {
    symbol: "ETC",
    name: "Ethereum Classic",
    description: "Original Ethereum blockchain",
    network: "ETHEREUM_CLASSIC",
    chainId: 61,
    category: "layer1",
    icon: "etc.svg",
    decimals: 18,
    enabled: true,
    popularity: 40,
    sortOrder: 14,
    type: RobinhoodTokenType.EvmToken,
  },

  // Layer 2 - Currently disabled (no wallet addresses configured)
  MATIC: {
    symbol: "MATIC",
    name: "Polygon",
    description: "Ethereum scaling solution",
    network: "POLYGON",
    chainId: 137,
    category: "layer2",
    icon: "matic.svg",
    decimals: 18,
    enabled: false, // Disabled: No Robinhood Connect support
    popularity: 75,
    sortOrder: 11,
    type: RobinhoodTokenType.EvmToken,
  },

  // Stablecoins
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    description: "US Dollar stablecoin",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    category: "stablecoin",
    icon: "usdc.svg",
    decimals: 6,
    enabled: true,
    featured: true,
    popularity: 95,
    sortOrder: 4,
    type: RobinhoodTokenType.EvmToken,
  },

  // DeFi Tokens
  AAVE: {
    symbol: "AAVE",
    name: "Aave",
    description: "DeFi lending protocol token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    category: "defi",
    icon: "aave.svg",
    decimals: 18,
    enabled: true,
    popularity: 60,
    sortOrder: 20,
    type: RobinhoodTokenType.EvmToken,
  },

  UNI: {
    symbol: "UNI",
    name: "Uniswap",
    description: "Decentralized exchange token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    category: "defi",
    icon: "uni.svg",
    decimals: 18,
    enabled: true,
    popularity: 65,
    sortOrder: 21,
    type: RobinhoodTokenType.EvmToken,
  },

  LINK: {
    symbol: "LINK",
    name: "Chainlink",
    description: "Decentralized oracle network",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    category: "defi",
    icon: "link.svg",
    decimals: 18,
    enabled: true,
    popularity: 68,
    sortOrder: 22,
    type: RobinhoodTokenType.EvmToken,
  },

  COMP: {
    symbol: "COMP",
    name: "Compound",
    description: "DeFi lending protocol token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    category: "defi",
    icon: "comp.svg",
    decimals: 18,
    enabled: true,
    popularity: 55,
    sortOrder: 23,
    type: RobinhoodTokenType.EvmToken,
  },

  CRV: {
    symbol: "CRV",
    name: "Curve DAO",
    description: "DeFi stablecoin exchange token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    category: "defi",
    icon: "crv.svg",
    decimals: 18,
    enabled: true,
    popularity: 50,
    sortOrder: 24,
    type: RobinhoodTokenType.EvmToken,
  },

  ONDO: {
    symbol: "ONDO",
    name: "Ondo",
    description: "Institutional-grade DeFi protocol",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3",
    category: "defi",
    icon: "ondo.svg",
    decimals: 18,
    enabled: true,
    popularity: 45,
    sortOrder: 25,
    type: RobinhoodTokenType.EvmToken,
  },

  // Meme Coins
  SHIB: {
    symbol: "SHIB",
    name: "Shiba Inu",
    description: "Ethereum-based meme token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    category: "meme",
    icon: "shib.svg",
    decimals: 18,
    enabled: true,
    popularity: 72,
    sortOrder: 31,
    type: RobinhoodTokenType.EvmToken,
  },

  PEPE: {
    symbol: "PEPE",
    name: "Pepecoin",
    description: "Internet meme cryptocurrency",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    category: "meme",
    icon: "pepe.svg",
    decimals: 18,
    enabled: true,
    popularity: 60,
    sortOrder: 32,
    type: RobinhoodTokenType.EvmToken,
  },

  FLOKI: {
    symbol: "FLOKI",
    name: "Floki",
    description: "Community-driven meme token",
    network: "ETHEREUM",
    chainId: 1,
    contractAddress: "0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E",
    category: "meme",
    icon: "floki.svg",
    decimals: 9,
    enabled: true,
    popularity: 55,
    sortOrder: 33,
    type: RobinhoodTokenType.EvmToken,
  },

  // Other Tokens
  TRUMP: {
    symbol: "TRUMP",
    name: "OFFICIAL TRUMP",
    description: "Political-themed cryptocurrency",
    network: "ETHEREUM",
    chainId: 1,
    category: "other",
    icon: "trump.svg",
    decimals: 18,
    enabled: true,
    popularity: 50,
    sortOrder: 40,
    type: RobinhoodTokenType.EvmToken,
  },

  VIRTUAL: {
    symbol: "VIRTUAL",
    name: "Virtuals Protocol",
    description: "Virtual reality protocol token",
    network: "ETHEREUM",
    chainId: 1,
    category: "other",
    icon: "virtual.svg",
    decimals: 18,
    enabled: true,
    popularity: 45,
    sortOrder: 41,
    type: RobinhoodTokenType.EvmToken,
  },

  WLFI: {
    symbol: "WLFI",
    name: "World Liberty Financial",
    description: "DeFi financial protocol",
    network: "ETHEREUM",
    chainId: 1,
    category: "other",
    icon: "wlfi.svg",
    decimals: 18,
    enabled: true,
    popularity: 40,
    sortOrder: 42,
    type: RobinhoodTokenType.EvmToken,
  },
};

