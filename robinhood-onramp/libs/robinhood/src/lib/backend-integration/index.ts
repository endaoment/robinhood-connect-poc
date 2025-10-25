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

