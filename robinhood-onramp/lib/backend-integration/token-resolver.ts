import { TokenLookup } from "./types";

/**
 * Token ID mapping from backend database
 *
 * This maps Robinhood asset symbols to Endaoment backend token IDs.
 *
 * ⚠️ IMPORTANT: These IDs must match your backend database exactly.
 * Run: GET /v2/tokens to get the current list from your backend.
 *
 * Example backend token structure:
 * {
 *   id: 1,
 *   symbol: "ETH",
 *   name: "Ethereum",
 *   decimals: 18,
 *   chainId: 1,
 *   contractAddress: "0x..."
 * }
 */
export const BACKEND_TOKEN_MAP: Record<string, TokenLookup> = {
  // ========================================
  // Layer 1 Blockchains
  // ========================================
  BTC: {
    symbol: "BTC",
    tokenId: 2, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 8,
    name: "Bitcoin",
  },

  ETH: {
    symbol: "ETH",
    tokenId: 1, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Ethereum",
  },

  SOL: {
    symbol: "SOL",
    tokenId: 3, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 9,
    name: "Solana",
  },

  AVAX: {
    symbol: "AVAX",
    tokenId: 10, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Avalanche",
  },

  LTC: {
    symbol: "LTC",
    tokenId: 12, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 8,
    name: "Litecoin",
  },

  BCH: {
    symbol: "BCH",
    tokenId: 13, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 8,
    name: "Bitcoin Cash",
  },

  ETC: {
    symbol: "ETC",
    tokenId: 14, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Ethereum Classic",
  },

  XLM: {
    symbol: "XLM",
    tokenId: 15, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 7,
    name: "Stellar",
  },

  XTZ: {
    symbol: "XTZ",
    tokenId: 16, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 6,
    name: "Tezos",
  },

  DOGE: {
    symbol: "DOGE",
    tokenId: 30, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 8,
    name: "Dogecoin",
  },

  // ========================================
  // Stablecoins
  // ========================================
  USDC: {
    symbol: "USDC",
    tokenId: 4, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 6,
    name: "USD Coin",
  },

  // ========================================
  // DeFi Tokens
  // ========================================
  AAVE: {
    symbol: "AAVE",
    tokenId: 20, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Aave",
  },

  UNI: {
    symbol: "UNI",
    tokenId: 21, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Uniswap",
  },

  LINK: {
    symbol: "LINK",
    tokenId: 22, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Chainlink",
  },

  COMP: {
    symbol: "COMP",
    tokenId: 23, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Compound",
  },

  CRV: {
    symbol: "CRV",
    tokenId: 24, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Curve DAO",
  },

  ONDO: {
    symbol: "ONDO",
    tokenId: 25, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Ondo",
  },

  // ========================================
  // Meme Coins
  // ========================================
  SHIB: {
    symbol: "SHIB",
    tokenId: 31, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Shiba Inu",
  },

  PEPE: {
    symbol: "PEPE",
    tokenId: 32, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Pepecoin",
  },

  FLOKI: {
    symbol: "FLOKI",
    tokenId: 33, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 9,
    name: "Floki",
  },

  BONK: {
    symbol: "BONK",
    tokenId: 34, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 5,
    name: "BONK",
  },

  MOODENG: {
    symbol: "MOODENG",
    tokenId: 35, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 9,
    name: "Moo Deng",
  },

  // ========================================
  // Other Tokens
  // ========================================
  TRUMP: {
    symbol: "TRUMP",
    tokenId: 40, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "OFFICIAL TRUMP",
  },

  VIRTUAL: {
    symbol: "VIRTUAL",
    tokenId: 41, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "Virtuals Protocol",
  },

  WLFI: {
    symbol: "WLFI",
    tokenId: 42, // ⚠️ UPDATE: Replace with actual backend token ID
    decimals: 18,
    name: "World Liberty Financial",
  },
};

/**
 * Get backend token information by symbol
 */
export function getBackendToken(symbol: string): TokenLookup | undefined {
  return BACKEND_TOKEN_MAP[symbol.toUpperCase()];
}

/**
 * Validate that a token is supported in backend
 */
export function isTokenSupportedInBackend(symbol: string): boolean {
  return symbol.toUpperCase() in BACKEND_TOKEN_MAP;
}

/**
 * Get all supported token symbols
 */
export function getSupportedTokenSymbols(): string[] {
  return Object.keys(BACKEND_TOKEN_MAP);
}

/**
 * Fetch token IDs from backend API
 * Use this to populate BACKEND_TOKEN_MAP with actual IDs
 */
export async function fetchBackendTokens(
  backendUrl: string
): Promise<Record<string, TokenLookup>> {
  try {
    const response = await fetch(`${backendUrl}/v2/tokens`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tokens: ${response.statusText}`);
    }

    const tokens = await response.json();
    const tokenMap: Record<string, TokenLookup> = {};

    for (const token of tokens) {
      tokenMap[token.symbol] = {
        symbol: token.symbol,
        tokenId: token.id,
        decimals: token.decimals,
        name: token.name,
      };
    }

    return tokenMap;
  } catch (error) {
    console.error("Error fetching backend tokens:", error);
    throw error;
  }
}

