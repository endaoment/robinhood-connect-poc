import type { RobinhoodNetwork } from "../types";

/**
 * Validate wallet address format for given network
 */
export function isValidWalletAddress(
  address: string,
  network: RobinhoodNetwork
): boolean {
  if (!address || address.length === 0) {
    return false;
  }

  // Ethereum-based networks
  if (
    network === "ETHEREUM" ||
    network === "POLYGON" ||
    network === "AVALANCHE" ||
    network === "ARBITRUM" ||
    network === "OPTIMISM" ||
    network === "BASE" ||
    network === "ZORA" ||
    network === "ETHEREUM_CLASSIC"
  ) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Bitcoin
  if (network === "BITCOIN") {
    return address.length >= 26 && address.length <= 62;
  }

  // Solana
  if (network === "SOLANA") {
    return address.length >= 32 && address.length <= 44;
  }

  // Litecoin
  if (network === "LITECOIN") {
    return address.length >= 26 && address.length <= 62;
  }

  // Dogecoin
  if (network === "DOGECOIN") {
    return (
      address.startsWith("D") && address.length >= 26 && address.length <= 34
    );
  }

  // Bitcoin Cash
  if (network === "BITCOIN_CASH") {
    return address.length >= 26 && address.length <= 62;
  }

  // Cardano
  if (network === "CARDANO") {
    return address.length >= 30 && address.length <= 110;
  }

  // XRP
  if (network === "XRP") {
    return (
      address.startsWith("r") && address.length >= 25 && address.length <= 35
    );
  }

  // Stellar
  if (network === "STELLAR") {
    return address.startsWith("G") && address.length === 56;
  }

  // Hedera
  if (network === "HEDERA") {
    return /^0\.0\.\d+$/.test(address);
  }

  // Tezos
  if (network === "TEZOS") {
    return (
      address.startsWith("tz") && address.length >= 30 && address.length <= 40
    );
  }

  // Sui
  if (network === "SUI") {
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  }

  // Toncoin
  if (network === "TONCOIN") {
    return address.length >= 30 && address.length <= 60;
  }

  // Default: assume valid
  return true;
}

/**
 * Validate asset code format
 */
export function isValidAssetCode(assetCode: string): boolean {
  // Asset codes are typically 2-10 uppercase letters
  return /^[A-Z]{2,10}$/.test(assetCode);
}

/**
 * Validate amount format (positive number with optional decimals)
 */
export function isValidAmount(amount: string): boolean {
  return /^\d+(\.\d+)?$/.test(amount) && parseFloat(amount) > 0;
}

