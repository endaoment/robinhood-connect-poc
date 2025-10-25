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

