/**
 * Backend Mock Services
 *
 * Simulates endaoment-backend services to demonstrate integration
 * All mocks show toasts with what backend would actually do
 */

// Services
export { MockTokenService, mockTokenService } from "./mock-token.service";
export { MockPledgeService, mockPledgeService } from "./mock-pledge.service";
export {
  MockNotificationService,
  mockNotificationService,
} from "./mock-notification.service";

// Types
export type {
  BackendToken,
  BackendOrganization,
  BackendCryptoPledge,
} from "./types";

export { BACKEND_TOKEN_MAP, DEFAULT_TEST_ORG } from "./types";

// Toast utilities
export {
  showApiCallToast,
  showBackendSuccess,
  showBackendError,
  safeToast,
  isClient,
} from "./toast-logger";

export type { ApiCallToastParams } from "./toast-logger";

