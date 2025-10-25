/**
 * Backend entity type definitions
 *
 * These mirror entities in endaoment-backend
 * Used for mock services to demonstrate backend integration
 */

/**
 * Token entity from backend database
 */
export interface BackendToken {
  id: number;
  symbol: string;
  name: string;
  decimals: number;
  network: string;
  contractAddress?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Organization/Fund entity from backend
 */
export interface BackendOrganization {
  id: string;
  name: string;
  ein?: string;
  isActive: boolean;
}

/**
 * CryptoDonationPledge entity from backend
 */
export interface BackendCryptoPledge {
  id: string;
  otcTransactionHash: string;
  pledgerUserId?: string;
  inputToken: number; // Token ID
  inputAmount: string; // Amount in smallest unit
  destinationOrgId: string;
  status: "PENDING_LIQUIDATION" | "LIQUIDATED" | "FAILED";
  centralizedExchangeDonationStatus: "Completed" | "Pending" | "Failed";
  centralizedExchangeTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Backend token mapping for common crypto assets
 */
export const BACKEND_TOKEN_MAP: Record<string, BackendToken> = {
  BTC: {
    id: 1,
    symbol: "BTC",
    name: "Bitcoin",
    decimals: 8,
    network: "BITCOIN",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  ETH: {
    id: 2,
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    network: "ETHEREUM",
    contractAddress: "0x0000000000000000000000000000000000000000",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  USDC: {
    id: 3,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    network: "ETHEREUM",
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  SOL: {
    id: 4,
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    network: "SOLANA",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

/**
 * Default organization for testing
 */
export const DEFAULT_TEST_ORG: BackendOrganization = {
  id: process.env.NEXT_PUBLIC_DEFAULT_FUND_ID || "default-fund-123",
  name: "Endaoment Community Fund",
  isActive: true,
};

