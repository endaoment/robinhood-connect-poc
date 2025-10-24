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
  
  // Calculate divisor manually to avoid ES2016+ exponentiation
  let divisor = BigInt(1);
  for (let i = 0; i < decimals; i++) {
    divisor *= BigInt(10);
  }

  const integerPart = value / divisor;
  const remainder = value % divisor;

  if (remainder === BigInt(0)) {
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

