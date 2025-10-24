# Sub-Plan 10: Backend Pledge Integration - Robinhood to CryptoDonationPledge Mapping

**Status**: Ready for Implementation
**Priority**: High
**Dependencies**: Sub-Plan 9 (Backend Alignment Refactor - recommended but not required)
**Estimated Time**: 3-4 hours

---

## Context Required

### Backend CryptoDonationPledge Structure

**Reference**: `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/data-access/src/lib/entities/donations/donation-pledge.entity.ts` (lines 341-387)

**Entity Definition**:

```typescript
@ChildEntity(PledgeType.CryptoPledge)
export class CryptoDonationPledge extends DonationPledge {
  /**
   * Input amount of the donation crypto pledge. Denominated in the smallest unit of the given asset
   */
  @Column(cryptoNumericColumn)
  inputAmount!: bigint;

  /**
   * Input token of the donation pledge
   */
  @ManyToOne(() => Token, { nullable: false })
  @JoinColumn()
  inputToken!: Token | undefined;

  @Column()
  inputTokenId!: number;

  /**
   * OTC Transaction hash proving that the crypto token was indeed transferred to an Endaoment-controlled wallet.
   */
  @Column({
    type: "varchar",
    length: 200,
  })
  otcTransactionHash!: string;

  /**
   * Dollar amount pledged in microdollars. This amount is quoted on the API, at the time of donation. This
   * does not represent nor predict the liquidated amount, since that is dependent on the price of the token at the
   * time of liquidation.
   */
  @Column(cryptoNumericColumn)
  pledgedAmountMicroDollars!: bigint | null;
}
```

**Inherited from DonationPledge** (lines 196-339):

```typescript
export abstract class DonationPledge {
  id!: string; // UUID (auto-generated)
  pledgerUser!: User | undefined | null; // Optional - can be null
  pledgerUserId!: string | null;
  pledgerName!: string | null; // Display name
  pledgerIdentity!: NullableIdentity; // PII (optional)
  sharePledgerEmail!: boolean; // Default: false
  destinationOrg!: Org | null; // One of these must be set
  destinationFund!: Fund | null;
  destinationSubproject!: Subproject | null;
  status!: PledgeStatus; // PendingLiquidation, Liquidated, Failed, Cancelled
  statusDescription!: string | null; // Only for Failed/Cancelled
  registeredAtUtc!: Date; // Auto-set on creation
  liquidatedAtUtc!: Date | null; // Set when liquidated
  resultedDonationId!: string | null; // Set after liquidation
  pendingRebalance!: boolean; // Default: false
}
```

### CryptoPledgeInputDto Structure

**Reference**: `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/donation-pledges/src/lib/dtos/crypto-pledge-input.ts` (lines 34-154)

**Input DTO**:

```typescript
export class CryptoGivenDto {
  inputAmount!: bigint; // Smallest unit of token
  tokenId!: number; // Token ID from backend database
}

export class CryptoPledgeInputDto {
  cryptoGiven!: CryptoGivenDto; // REQUIRED
  otcDonationTransactionHash!: string; // REQUIRED - Transaction hash
  receivingEntityType!: DestinationType; // REQUIRED - 'fund', 'org', 'subproject'
  receivingEntityId!: string; // REQUIRED - UUID of entity
  recommendationId?: string; // OPTIONAL - UUID
  isRebalanceRequested?: boolean; // OPTIONAL - Default: false
  donorName?: string; // OPTIONAL
  donorIdentity?: IdentityInputDto; // OPTIONAL
  updateIdentity?: boolean; // OPTIONAL
  shareMyEmail?: boolean; // OPTIONAL
}
```

### Robinhood Connect Callback Data

**Current Implementation**: `app/callback/page.tsx`

**URL Parameters**:

```typescript
interface RobinhoodCallbackParams {
  orderId: string; // Robinhood's unique order ID (e.g., "RH_ORDER_123456")
  asset: string; // Asset symbol (e.g., "ETH", "BTC", "SOL")
  assetAmount: string; // Human-readable amount (e.g., "0.5" for 0.5 ETH)
  network: string; // Network name (e.g., "ETHEREUM", "BITCOIN")
  timestamp: string; // ISO timestamp of transfer
  referenceId?: string; // Additional tracking ID (optional)
}
```

**Example Callback URL**:

```
https://yourapp.com/callback?orderId=RH_ORD_abc123&asset=ETH&assetAmount=0.5&network=ETHEREUM&timestamp=2025-10-24T16:30:00Z
```

### Files to Review

**POC Current State**:

- `robinhood-onramp/app/callback/page.tsx` (lines 1-530)
- `robinhood-onramp/lib/robinhood-asset-metadata.ts` (lines 1-397)
- `robinhood-onramp/types/robinhood.d.ts` (lines 1-180)

**Backend Reference**:

- `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/donation-pledges/src/lib/dtos/crypto-pledge-input.ts` (lines 1-155)
- `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/donation-pledges/src/lib/pledge-service/crypto-pledge.service.ts` (lines 30-128)
- `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/data-access/src/lib/entities/donations/donation-pledge.entity.ts` (lines 341-387)

---

## Objectives

1. **Create Mapping Utilities** - Convert Robinhood callback data to CryptoPledgeInputDto format
2. **Implement Token Resolution** - Map asset symbols to backend tokenIds
3. **Amount Conversion** - Convert human-readable amounts to smallest unit (bigint)
4. **Transaction Hash Handling** - Use Robinhood orderId as otcTransactionHash
5. **Price Quoting** - Get USD value at time of donation
6. **Type-Safe Mapping** - Full TypeScript types for backend integration
7. **Validation Layer** - Ensure data meets backend constraints before submission
8. **Error Handling** - Graceful handling of missing/invalid data

---

## Proposed Solution

### New Files Structure

```
robinhood-onramp/lib/
├── backend-integration/
│   ├── types.ts                          # Backend-compatible types
│   ├── pledge-mapper.ts                  # Robinhood → CryptoPledgeInputDto
│   ├── token-resolver.ts                 # Symbol → TokenId mapping
│   ├── amount-converter.ts               # Human amount → bigint smallest unit
│   └── validation.ts                     # Pre-submission validation
```

---

## Precise Implementation Steps

### Step 1: Create Backend Integration Types

**File**: `lib/backend-integration/types.ts`

**Action**: Define types matching backend exactly

**Code**:

```typescript
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
```

**Validation**: TypeScript compiles with no errors

### Step 2: Create Token Resolver

**File**: `lib/backend-integration/token-resolver.ts`

**Action**: Map asset symbols to backend token IDs

**Code**:

```typescript
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
```

### Step 3: Create Amount Converter

**File**: `lib/backend-integration/amount-converter.ts`

**Action**: Convert human-readable amounts to smallest unit

**Code**:

```typescript
/**
 * Amount Conversion Utilities
 *
 * Converts human-readable token amounts to smallest unit (bigint)
 * as required by backend CryptoDonationPledge entity.
 */

/**
 * Convert human-readable amount to smallest unit
 *
 * @param amount - Human-readable amount (e.g., "0.5" for 0.5 ETH)
 * @param decimals - Token decimals (e.g., 18 for ETH, 8 for BTC)
 * @returns Amount in smallest unit as string (for JSON serialization)
 *
 * @example
 * convertToSmallestUnit("0.5", 18)  // "500000000000000000" (0.5 ETH in wei)
 * convertToSmallestUnit("1.0", 8)   // "100000000" (1 BTC in satoshi)
 * convertToSmallestUnit("100", 6)   // "100000000" (100 USDC)
 */
export function convertToSmallestUnit(
  amount: string,
  decimals: number
): string {
  // Parse the input amount
  const amountFloat = parseFloat(amount);

  if (isNaN(amountFloat) || amountFloat <= 0) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  if (decimals < 0 || decimals > 30) {
    throw new Error(`Invalid decimals: ${decimals}`);
  }

  // Split into integer and decimal parts
  const [integerPart, decimalPart = ""] = amount.split(".");

  // Pad or truncate decimal part to match token decimals
  const paddedDecimals = decimalPart.padEnd(decimals, "0").slice(0, decimals);

  // Combine and remove leading zeros
  const smallestUnit = (integerPart + paddedDecimals).replace(/^0+/, "") || "0";

  return smallestUnit;
}

/**
 * Convert smallest unit back to human-readable amount
 * Useful for display/validation
 */
export function convertFromSmallestUnit(
  smallestUnit: string,
  decimals: number
): string {
  const value = BigInt(smallestUnit);
  const divisor = BigInt(10) ** BigInt(decimals);

  const integerPart = value / divisor;
  const remainder = value % divisor;

  if (remainder === 0n) {
    return integerPart.toString();
  }

  // Pad remainder with leading zeros
  const decimalPart = remainder.toString().padStart(decimals, "0");

  return `${integerPart}.${decimalPart}`.replace(/\.?0+$/, "");
}

/**
 * Validate that amount conversion is reversible
 */
export function validateAmountConversion(
  humanAmount: string,
  decimals: number
): boolean {
  try {
    const smallest = convertToSmallestUnit(humanAmount, decimals);
    const backToHuman = convertFromSmallestUnit(smallest, decimals);
    const originalFloat = parseFloat(humanAmount);
    const convertedFloat = parseFloat(backToHuman);

    // Allow for minor floating point differences
    const diff = Math.abs(originalFloat - convertedFloat);
    return diff < 1e-10;
  } catch {
    return false;
  }
}

/**
 * Format amount with proper decimals for display
 */
export function formatTokenAmount(
  amount: string,
  decimals: number,
  maxDisplayDecimals = 6
): string {
  const value = parseFloat(amount);

  if (isNaN(value)) {
    return "0";
  }

  // Use fewer decimals for display
  const displayDecimals = Math.min(decimals, maxDisplayDecimals);

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}
```

### Step 4: Create Pledge Mapper

**File**: `lib/backend-integration/pledge-mapper.ts`

**Action**: Map Robinhood callback data to CryptoPledgeInput

**Code**:

```typescript
import {
  RobinhoodPledgeData,
  CryptoPledgeInput,
  PledgeMappingResult,
} from "./types";
import { getBackendToken } from "./token-resolver";
import { convertToSmallestUnit } from "./amount-converter";

/**
 * Map Robinhood Connect callback data to backend CryptoPledgeInputDto format
 *
 * This is the main integration point between Robinhood Connect and
 * Endaoment's backend donation-pledges API.
 *
 * @param robinhoodData - Data from Robinhood callback + destination info
 * @returns Mapping result with CryptoPledgeInput or errors
 */
export function mapRobinhoodToPledge(
  robinhoodData: RobinhoodPledgeData
): PledgeMappingResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!robinhoodData.orderId) {
    errors.push("Missing orderId from Robinhood callback");
  }

  if (!robinhoodData.asset) {
    errors.push("Missing asset symbol from Robinhood callback");
  }

  if (!robinhoodData.assetAmount) {
    errors.push("Missing assetAmount from Robinhood callback");
  }

  if (!robinhoodData.destination?.type) {
    errors.push("Missing destination type (fund/org/subproject)");
  }

  if (!robinhoodData.destination?.id) {
    errors.push("Missing destination entity ID");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Resolve token from backend
  const token = getBackendToken(robinhoodData.asset);
  if (!token) {
    errors.push(
      `Asset ${robinhoodData.asset} not supported in backend. ` +
        `Please add token mapping in token-resolver.ts`
    );
    return { success: false, errors };
  }

  // Convert amount to smallest unit
  let inputAmount: string;
  try {
    inputAmount = convertToSmallestUnit(
      robinhoodData.assetAmount,
      token.decimals
    );
  } catch (error) {
    errors.push(
      `Failed to convert amount: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return { success: false, errors };
  }

  // Validate donor identity if provided
  const donorIdentity = robinhoodData.donor?.identity;
  if (donorIdentity) {
    const identityErrors = validateDonorIdentity(donorIdentity);
    if (identityErrors.length > 0) {
      errors.push(...identityErrors);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Build CryptoPledgeInput
  const pledgeInput: CryptoPledgeInput = {
    cryptoGiven: {
      inputAmount,
      tokenId: token.tokenId,
    },
    // CRITICAL: Use Robinhood orderId as transaction hash
    // This uniquely identifies the transfer in Robinhood's system
    otcDonationTransactionHash: robinhoodData.orderId,
    receivingEntityType: robinhoodData.destination.type,
    receivingEntityId: robinhoodData.destination.id,
  };

  // Add optional fields if provided
  if (robinhoodData.donor?.name) {
    pledgeInput.donorName = robinhoodData.donor.name;
  }

  if (donorIdentity) {
    pledgeInput.donorIdentity = donorIdentity;
  }

  if (robinhoodData.donor?.shareEmail !== undefined) {
    pledgeInput.shareMyEmail = robinhoodData.donor.shareEmail;
  }

  if (robinhoodData.metadata?.recommendationId) {
    pledgeInput.recommendationId = robinhoodData.metadata.recommendationId;
  }

  if (robinhoodData.metadata?.requestRebalance !== undefined) {
    pledgeInput.isRebalanceRequested = robinhoodData.metadata.requestRebalance;
  }

  // Add warnings for optional but recommended fields
  if (!robinhoodData.donor?.name) {
    warnings.push("No donor name provided - pledge will be anonymous");
  }

  if (!donorIdentity) {
    warnings.push(
      "No donor identity provided - no tax receipt will be generated"
    );
  }

  return {
    success: true,
    data: pledgeInput,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate donor identity structure
 */
function validateDonorIdentity(identity: any): string[] {
  const errors: string[] = [];

  if (!identity.email) {
    errors.push("Donor identity missing email");
  } else if (!isValidEmail(identity.email)) {
    errors.push("Invalid email format");
  }

  if (!identity.firstname) {
    errors.push("Donor identity missing firstname");
  }

  if (!identity.lastname) {
    errors.push("Donor identity missing lastname");
  }

  if (!identity.addressLine1) {
    errors.push("Donor identity missing addressLine1");
  }

  if (!identity.addressCity) {
    errors.push("Donor identity missing addressCity");
  }

  if (!identity.addressCountry) {
    errors.push("Donor identity missing addressCountry");
  }

  // USA-specific validation
  if (identity.addressCountry === "USA") {
    if (!identity.addressState) {
      errors.push("USA address requires addressState");
    }
    if (!identity.addressZip) {
      errors.push("USA address requires addressZip");
    }
  }

  return errors;
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Create a pledge from Robinhood callback parameters
 * Convenience function for simple use cases
 */
export function createPledgeFromCallback(
  orderId: string,
  asset: string,
  assetAmount: string,
  network: string,
  destinationType: "fund" | "org" | "subproject",
  destinationId: string,
  donorName?: string
): PledgeMappingResult {
  return mapRobinhoodToPledge({
    orderId,
    asset,
    assetAmount,
    network,
    timestamp: new Date().toISOString(),
    destination: {
      type: destinationType,
      id: destinationId,
    },
    donor: donorName ? { name: donorName } : undefined,
  });
}
```

### Step 5: Create Validation Utilities

**File**: `lib/backend-integration/validation.ts`

**Action**: Pre-submission validation

**Code**:

```typescript
import { CryptoPledgeInput } from "./types";

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate CryptoPledgeInput before sending to backend
 *
 * Ensures data meets all backend constraints and requirements
 */
export function validatePledgeInput(
  input: CryptoPledgeInput
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate cryptoGiven
  if (!input.cryptoGiven) {
    errors.push("cryptoGiven is required");
  } else {
    if (!input.cryptoGiven.inputAmount) {
      errors.push("cryptoGiven.inputAmount is required");
    } else {
      // Validate inputAmount is a valid bigint string
      try {
        BigInt(input.cryptoGiven.inputAmount);
      } catch {
        errors.push(
          `Invalid inputAmount: "${input.cryptoGiven.inputAmount}" is not a valid bigint`
        );
      }
    }

    if (!input.cryptoGiven.tokenId) {
      errors.push("cryptoGiven.tokenId is required");
    } else if (input.cryptoGiven.tokenId <= 0) {
      errors.push("cryptoGiven.tokenId must be positive");
    }
  }

  // Validate otcDonationTransactionHash
  if (!input.otcDonationTransactionHash) {
    errors.push("otcDonationTransactionHash is required");
  } else if (input.otcDonationTransactionHash.length > 200) {
    errors.push("otcDonationTransactionHash exceeds 200 character limit");
  }

  // Validate receiving entity
  if (!input.receivingEntityType) {
    errors.push("receivingEntityType is required");
  } else if (
    !["fund", "org", "subproject"].includes(input.receivingEntityType)
  ) {
    errors.push('receivingEntityType must be "fund", "org", or "subproject"');
  }

  if (!input.receivingEntityId) {
    errors.push("receivingEntityId is required");
  } else if (!isValidUUID(input.receivingEntityId)) {
    errors.push("receivingEntityId must be a valid UUID");
  }

  // Validate optional UUID fields
  if (input.recommendationId && !isValidUUID(input.recommendationId)) {
    errors.push("recommendationId must be a valid UUID");
  }

  // Validate donor identity if provided
  if (input.donorIdentity) {
    const identity = input.donorIdentity;

    if (!identity.email || !identity.firstname || !identity.lastname) {
      errors.push("donorIdentity requires email, firstname, and lastname");
    }

    if (
      !identity.addressLine1 ||
      !identity.addressCity ||
      !identity.addressCountry
    ) {
      errors.push(
        "donorIdentity requires addressLine1, addressCity, and addressCountry"
      );
    }

    // USA-specific validation
    if (identity.addressCountry === "USA") {
      if (!identity.addressState || !identity.addressZip) {
        errors.push("USA addresses require addressState and addressZip");
      }
    }
  }

  // Warnings for missing optional but recommended fields
  if (!input.donorName && !input.donorIdentity) {
    warnings.push(
      "No donor name or identity provided - donation will be completely anonymous"
    );
  }

  if (!input.donorIdentity) {
    warnings.push(
      "No donor identity provided - donor will not receive a tax receipt"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize pledge input before submission
 * Removes undefined/null values that might cause issues
 */
export function sanitizePledgeInput(
  input: CryptoPledgeInput
): CryptoPledgeInput {
  const sanitized: any = {
    cryptoGiven: input.cryptoGiven,
    otcDonationTransactionHash: input.otcDonationTransactionHash,
    receivingEntityType: input.receivingEntityType,
    receivingEntityId: input.receivingEntityId,
  };

  // Only add optional fields if they have values
  if (input.recommendationId) {
    sanitized.recommendationId = input.recommendationId;
  }

  if (input.isRebalanceRequested !== undefined) {
    sanitized.isRebalanceRequested = input.isRebalanceRequested;
  }

  if (input.donorName) {
    sanitized.donorName = input.donorName;
  }

  if (input.donorIdentity) {
    sanitized.donorIdentity = input.donorIdentity;
  }

  if (input.updateIdentity !== undefined) {
    sanitized.updateIdentity = input.updateIdentity;
  }

  if (input.shareMyEmail !== undefined) {
    sanitized.shareMyEmail = input.shareMyEmail;
  }

  return sanitized;
}
```

### Step 6: Create Public API Index

**File**: `lib/backend-integration/index.ts`

**Action**: Export clean public API

**Code**:

```typescript
/**
 * Backend Integration - Public API
 *
 * Utilities for mapping Robinhood Connect transfers to
 * Endaoment backend CryptoDonationPledge format.
 */

// Types
export * from "./types";

// Token Resolution
export {
  BACKEND_TOKEN_MAP,
  getBackendToken,
  isTokenSupportedInBackend,
  getSupportedTokenSymbols,
  fetchBackendTokens,
} from "./token-resolver";

// Amount Conversion
export {
  convertToSmallestUnit,
  convertFromSmallestUnit,
  validateAmountConversion,
  formatTokenAmount,
} from "./amount-converter";

// Pledge Mapping
export {
  mapRobinhoodToPledge,
  createPledgeFromCallback,
} from "./pledge-mapper";

// Validation
export { validatePledgeInput, sanitizePledgeInput } from "./validation";
```

### Step 7: Update Callback Page to Use Mapping

**File**: `app/callback/page.tsx`

**Action**: Integrate pledge mapping into callback handling

**Code** (add to existing file):

```typescript
// Add import at top of file
import {
  createPledgeFromCallback,
  validatePledgeInput,
  type CryptoPledgeInput,
} from "@/lib/backend-integration";

// Add this function to handle pledge creation
async function createBackendPledge(
  pledgeData: CryptoPledgeInput,
  backendUrl: string
): Promise<{ success: boolean; pledgeId?: string; error?: string }> {
  try {
    // Validate before sending
    const validation = validatePledgeInput(pledgeData);
    if (!validation.valid) {
      console.error("Pledge validation failed:", validation.errors);
      return {
        success: false,
        error: validation.errors.join(", "),
      };
    }

    // Log warnings
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn("Pledge warnings:", validation.warnings);
    }

    // Submit to backend
    const response = await fetch(`${backendUrl}/v2/donation-pledges/crypto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add auth headers if needed
        // "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(pledgeData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Backend pledge creation failed:", error);
      return {
        success: false,
        error: `Backend error: ${response.statusText}`,
      };
    }

    const result = await response.json();
    console.log("Pledge created successfully:", result);

    return {
      success: true,
      pledgeId: result.id,
    };
  } catch (error) {
    console.error("Error creating backend pledge:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Example usage in callback component
function handleSuccessfulTransfer() {
  // Extract callback params
  const orderId = searchParams.get("orderId") || "";
  const asset = searchParams.get("asset") || "";
  const assetAmount = searchParams.get("assetAmount") || "";
  const network = searchParams.get("network") || "";

  // Map to pledge format
  const mappingResult = createPledgeFromCallback(
    orderId,
    asset,
    assetAmount,
    network,
    "fund", // or get from context
    "fund-uuid-here", // or get from context
    "Anonymous Donor" // or get from user
  );

  if (!mappingResult.success) {
    console.error("Pledge mapping failed:", mappingResult.errors);
    setError("Failed to create donation pledge");
    return;
  }

  // Submit to backend
  if (mappingResult.data) {
    createBackendPledge(
      mappingResult.data,
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.endaoment.org"
    )
      .then((result) => {
        if (result.success) {
          console.log("Pledge ID:", result.pledgeId);
          // Show success to user
        } else {
          console.error("Pledge creation failed:", result.error);
          setError(result.error);
        }
      })
      .catch((err) => {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      });
  }
}
```

### Step 8: Add Environment Configuration

**File**: `.env.local` (update)

**Action**: Add backend URL configuration

**Code**:

```bash
# Existing Robinhood config
NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID=your-app-id
ROBINHOOD_API_KEY=your-api-key
ROBINHOOD_APP_ID=your-app-id

# Backend Integration
NEXT_PUBLIC_BACKEND_URL=https://api.endaoment.org
# Or for local development:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### Step 9: Create Documentation

**File**: `docs/BACKEND-INTEGRATION.md`

**Action**: Document the integration

**Code**:

````markdown
# Backend Integration Guide

This document explains how Robinhood Connect transfers are mapped to Endaoment backend `CryptoDonationPledge` entities.

## Overview

When a user completes a transfer via Robinhood Connect, the callback handler:

1. Receives callback parameters (orderId, asset, assetAmount, network)
2. Maps the data to `CryptoPledgeInput` format
3. Validates the mapped data
4. Submits to backend `/v2/donation-pledges/crypto` endpoint

## Data Mapping

### Robinhood → Backend

| Robinhood Field | Backend Field                | Transformation         | Notes                          |
| --------------- | ---------------------------- | ---------------------- | ------------------------------ |
| `orderId`       | `otcDonationTransactionHash` | Direct                 | Robinhood's unique order ID    |
| `asset`         | `cryptoGiven.tokenId`        | Symbol → ID lookup     | Requires token resolution      |
| `assetAmount`   | `cryptoGiven.inputAmount`    | Amount → smallest unit | Converted to bigint string     |
| N/A             | `receivingEntityType`        | From context           | 'fund', 'org', or 'subproject' |
| N/A             | `receivingEntityId`          | From context           | UUID of destination entity     |
| N/A             | `donorName`                  | From user              | Optional display name          |
| N/A             | `donorIdentity`              | From user              | Optional for tax receipt       |

## Token ID Resolution

Before using in production, update `lib/backend-integration/token-resolver.ts`:

```bash
# Fetch current token IDs from backend
curl https://api.endaoment.org/v2/tokens

# Update BACKEND_TOKEN_MAP with actual IDs
```
````

## Amount Conversion

Amounts are converted from human-readable to smallest unit:

- ETH: `0.5` → `500000000000000000` (wei, 18 decimals)
- BTC: `1.0` → `100000000` (satoshi, 8 decimals)
- USDC: `100` → `100000000` (6 decimals)

## Example Usage

```typescript
import { createPledgeFromCallback } from "@/lib/backend-integration";

// From Robinhood callback
const result = createPledgeFromCallback(
  "RH_ORD_abc123", // orderId
  "ETH", // asset
  "0.5", // assetAmount
  "ETHEREUM", // network
  "fund", // destinationType
  "fund-uuid", // destinationId
  "Jane Doe" // donorName (optional)
);

if (result.success && result.data) {
  // Submit to backend
  await fetch("https://api.endaoment.org/v2/donation-pledges/crypto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.data),
  });
}
```

## Testing

Run validation tests:

```bash
npm test -- backend-integration
```

## Production Checklist

- [ ] Update `BACKEND_TOKEN_MAP` with actual backend token IDs
- [ ] Configure `NEXT_PUBLIC_BACKEND_URL` environment variable
- [ ] Add authentication headers to API requests
- [ ] Test with real Robinhood transfers
- [ ] Verify pledges appear in backend database
- [ ] Test tax receipt generation (if donor identity provided)

````

---

## Deliverables Checklist

- [ ] `lib/backend-integration/types.ts` - Backend-compatible types
- [ ] `lib/backend-integration/token-resolver.ts` - Symbol → TokenId mapping
- [ ] `lib/backend-integration/amount-converter.ts` - Amount conversion utilities
- [ ] `lib/backend-integration/pledge-mapper.ts` - Main mapping logic
- [ ] `lib/backend-integration/validation.ts` - Pre-submission validation
- [ ] `lib/backend-integration/index.ts` - Public API exports
- [ ] `app/callback/page.tsx` - Updated with pledge creation
- [ ] `.env.local` - Backend URL configuration
- [ ] `docs/BACKEND-INTEGRATION.md` - Integration documentation
- [ ] Token ID mapping updated with actual backend IDs
- [ ] Manual testing with sample data
- [ ] End-to-end test with real transfer

---

## Validation Steps

### 1. Test Amount Conversion

```typescript
import { convertToSmallestUnit, convertFromSmallestUnit } from "@/lib/backend-integration";

// Test ETH (18 decimals)
console.log(convertToSmallestUnit("0.5", 18));
// Expected: "500000000000000000"

console.log(convertFromSmallestUnit("500000000000000000", 18));
// Expected: "0.5"

// Test BTC (8 decimals)
console.log(convertToSmallestUnit("1.0", 8));
// Expected: "100000000"

// Test USDC (6 decimals)
console.log(convertToSmallestUnit("100", 6));
// Expected: "100000000"
````

### 2. Test Token Resolution

```typescript
import { getBackendToken } from "@/lib/backend-integration";

const ethToken = getBackendToken("ETH");
console.log(ethToken);
// Expected: { symbol: "ETH", tokenId: 1, decimals: 18, name: "Ethereum" }
```

### 3. Test Pledge Mapping

```typescript
import { createPledgeFromCallback } from "@/lib/backend-integration";

const result = createPledgeFromCallback(
  "RH_TEST_123",
  "ETH",
  "0.5",
  "ETHEREUM",
  "fund",
  "123e4567-e89b-12d3-a456-426614174000",
  "Test Donor"
);

console.log(result);
// Expected: { success: true, data: {...}, warnings: [...] }
```

### 4. Test Validation

```typescript
import { validatePledgeInput } from "@/lib/backend-integration";

const validation = validatePledgeInput({
  cryptoGiven: {
    inputAmount: "500000000000000000",
    tokenId: 1,
  },
  otcDonationTransactionHash: "RH_TEST_123",
  receivingEntityType: "fund",
  receivingEntityId: "123e4567-e89b-12d3-a456-426614174000",
});

console.log(validation);
// Expected: { valid: true, errors: [], warnings: [...] }
```

### 5. Integration Test

Create a test script:

```bash
# File: scripts/test-pledge-mapping.ts
import { createPledgeFromCallback, validatePledgeInput } from "../lib/backend-integration";

// Simulate Robinhood callback
const mappingResult = createPledgeFromCallback(
  "RH_ORD_TEST_001",
  "ETH",
  "0.5",
  "ETHEREUM",
  "fund",
  "test-fund-uuid",
  "Test Donor"
);

console.log("Mapping Result:", JSON.stringify(mappingResult, null, 2));

if (mappingResult.success && mappingResult.data) {
  const validation = validatePledgeInput(mappingResult.data);
  console.log("Validation Result:", JSON.stringify(validation, null, 2));
}
```

Run:

```bash
ts-node scripts/test-pledge-mapping.ts
```

---

## Backward Compatibility Checkpoint

**Purpose**: Ensure integration doesn't break existing functionality

**Commands**:

```bash
# 1. Build should pass
npm run build

# 2. Type checking
npm run type-check

# 3. Test callback page still works
npm run dev
# Visit: http://localhost:3030/callback?orderId=TEST&asset=ETH&assetAmount=0.5&network=ETHEREUM
```

**Success Criteria**:

- ✅ Build completes with 0 errors
- ✅ Callback page loads successfully
- ✅ Amount conversion works correctly
- ✅ Token resolution returns expected IDs
- ✅ Validation catches invalid data
- ✅ Mapping produces valid CryptoPledgeInput

**If Checkpoint Fails**:

1. Check TypeScript errors in build output
2. Verify token decimals are correct
3. Test amount conversion with various values
4. Ensure UUID validation is working

---

## Common Issues and Solutions

### Issue 1: Token Not Found in Backend

**Symptom**: "Asset ETH not supported in backend"

**Solution**:

```typescript
// Update BACKEND_TOKEN_MAP in token-resolver.ts
// OR fetch from backend:
import { fetchBackendTokens } from "@/lib/backend-integration";

const tokens = await fetchBackendTokens("https://api.endaoment.org");
console.log(tokens);
```

### Issue 2: Amount Conversion Precision Loss

**Symptom**: Converted amount doesn't match expected value

**Solution**:

```typescript
import { validateAmountConversion } from "@/lib/backend-integration";

const isValid = validateAmountConversion("0.5", 18);
if (!isValid) {
  console.error("Amount conversion failed precision check");
}
```

### Issue 3: Backend Rejects Pledge

**Symptom**: 400 Bad Request from backend API

**Solution**:

1. Check validation errors: `validatePledgeInput(pledgeData)`
2. Verify token ID exists in backend
3. Ensure destination entity UUID is valid
4. Check backend logs for constraint violations

### Issue 4: Missing Donor Information

**Symptom**: Pledge created but no tax receipt generated

**Solution**:

```typescript
// Ensure donor identity is provided
const pledgeData: RobinhoodPledgeData = {
  // ... other fields
  donor: {
    name: "Jane Doe",
    identity: {
      email: "jane@example.com",
      firstname: "Jane",
      lastname: "Doe",
      addressLine1: "123 Main St",
      addressCity: "New York",
      addressCountry: "USA",
      addressState: "NY",
      addressZip: "10001",
    },
    shareEmail: true,
  },
};
```

---

## Integration Points

### With Sub-Plan 9: Backend Alignment Refactor

- If SP9 completed: Import token metadata from unified registry
- If SP9 not done: Use existing asset files

### With Backend API

**Endpoint**: `POST /v2/donation-pledges/crypto`

**Headers**:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_TOKEN"
}
```

**Request Body**: `CryptoPledgeInput`

**Response**:

```json
{
  "id": "pledge-uuid",
  "status": "PendingLiquidation",
  "registeredAtUtc": "2025-10-24T16:30:00Z",
  ...
}
```

---

## Next Steps

After completing this sub-plan:

1. **Fetch Real Token IDs**: Run backend API call to get actual token IDs
2. **Add Authentication**: Implement auth headers for backend API calls
3. **Error Handling**: Add retry logic and error reporting
4. **Monitoring**: Add logging/analytics for pledge creation
5. **Testing**: End-to-end test with real Robinhood transfers

---

## Risk Assessment

**🟢 LOW RISK**:

- New directory (additive only)
- No changes to existing flows
- Backend data format is well-defined

**🟡 MEDIUM RISK**:

- Token ID mapping must be accurate
- Amount conversion must preserve precision
- Backend API must be available

**🔴 CRITICAL RISK**:

- **Token ID mismatch**: Wrong token in backend → pledge fails
  - **Mitigation**: Validate token IDs before production
  - **Fallback**: Fetch tokens from backend API on startup
- **Amount precision loss**: Incorrect conversion → wrong donation amount
  - **Mitigation**: Validation tests for all supported tokens
  - **Fallback**: Backend validates amount is reasonable

---

## Time Estimate Breakdown

- **Reading context**: 20-30 minutes
- **Steps 1-3 (Types, Token, Amount)**: 60-90 minutes
- **Steps 4-5 (Mapper, Validation)**: 60-90 minutes
- **Step 6-7 (Integration)**: 45-60 minutes
- **Step 8-9 (Config, Docs)**: 30-45 minutes
- **Testing**: 45-60 minutes

**Total**: 3-4 hours

**Complexity**: Medium (mainly data transformation)

---

## Success Indicators

✅ **Type Safety**:

- All backend types properly defined
- No TypeScript errors
- Full IntelliSense support

✅ **Conversion Accuracy**:

- Amount conversion reversible
- No precision loss
- Correct for all token decimals

✅ **Validation**:

- Invalid data caught before submission
- Clear error messages
- Backend constraints satisfied

✅ **Integration**:

- Pledges successfully created in backend
- Data appears correctly in database
- Tax receipts generated (if identity provided)
