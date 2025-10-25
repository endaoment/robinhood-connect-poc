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

