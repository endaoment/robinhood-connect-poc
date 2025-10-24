/**
 * Backend Integration Types for CryptoDonationPledge
 *
 * These types mirror the backend's donation-pledges module to ensure
 * type-safe integration when submitting Robinhood transfers as pledges.
 *
 * Reference: endaoment-backend/libs/api/donation-pledges/src/lib/dtos/
 */

/**
 * Destination types for donation pledges
 */
export type DestinationType = "fund" | "org" | "subproject";

/**
 * Crypto asset given in the pledge
 * Maps to backend CryptoGivenDto
 */
export interface CryptoGiven {
  /**
   * Amount in smallest unit of the token (e.g., wei for ETH, satoshi for BTC)
   */
  inputAmount: string; // Serialized bigint

  /**
   * Backend token ID (from /v2/tokens endpoint)
   */
  tokenId: number;
}

/**
 * Identity information for tax receipts
 * Maps to backend IdentityInputDto
 */
export interface DonorIdentity {
  email: string;
  firstname: string;
  lastname: string;
  addressLine1: string;
  addressCity: string;
  addressCountry: string; // ISO 3166 Alpha-3 (e.g., 'USA')
  addressState?: string; // Required for USA
  addressZip?: string; // Required for USA
  addressLine2?: string;
}

/**
 * Complete crypto pledge input
 * Maps to backend CryptoPledgeInputDto
 */
export interface CryptoPledgeInput {
  /**
   * REQUIRED: Asset that was pledged
   */
  cryptoGiven: CryptoGiven;

  /**
   * REQUIRED: Transaction hash proving the asset was sent
   * For Robinhood: This will be the orderId
   */
  otcDonationTransactionHash: string;

  /**
   * REQUIRED: Type of entity receiving the pledge
   */
  receivingEntityType: DestinationType;

  /**
   * REQUIRED: UUID of the entity receiving the pledge
   */
  receivingEntityId: string;

  /**
   * OPTIONAL: Recommendation that led to the pledge
   */
  recommendationId?: string;

  /**
   * OPTIONAL: Whether to rebalance fund after pledge fulfillment
   */
  isRebalanceRequested?: boolean;

  /**
   * OPTIONAL: Display name for the donor
   */
  donorName?: string;

  /**
   * OPTIONAL: PII for tax receipt
   */
  donorIdentity?: DonorIdentity;

  /**
   * OPTIONAL: Update user's global identity with this donation identity
   */
  updateIdentity?: boolean;

  /**
   * OPTIONAL: Share donor email with receiving entity
   */
  shareMyEmail?: boolean;
}

/**
 * Robinhood callback parameters
 */
export interface RobinhoodCallbackParams {
  orderId: string;
  asset: string;
  assetAmount: string;
  network: string;
  timestamp: string;
  referenceId?: string;
}

/**
 * Extended callback data with destination information
 */
export interface RobinhoodPledgeData extends RobinhoodCallbackParams {
  /**
   * Destination for the pledge
   */
  destination: {
    type: DestinationType;
    id: string;
  };

  /**
   * Optional donor information
   */
  donor?: {
    name?: string;
    identity?: DonorIdentity;
    shareEmail?: boolean;
  };

  /**
   * Optional metadata
   */
  metadata?: {
    recommendationId?: string;
    requestRebalance?: boolean;
  };
}

/**
 * Result of pledge mapping
 */
export interface PledgeMappingResult {
  success: boolean;
  data?: CryptoPledgeInput;
  errors?: string[];
  warnings?: string[];
}

/**
 * Token lookup result
 */
export interface TokenLookup {
  symbol: string;
  tokenId: number;
  decimals: number;
  name: string;
}

