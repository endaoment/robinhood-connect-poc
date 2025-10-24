# Sub-Plan 12: DAAS API Integration - Submit Donation Pledges to Endaoment Backend

**Status**: Ready for Implementation
**Priority**: High  
**Dependencies**: Sub-Plan 10 (Backend Pledge Integration - recommended)
**Estimated Time**: 5-7 hours

---

> **📝 NOTE**: This is a single-user POC. All donations will be made by Robert Heeger to the Shloopy Doopy Charitable Fund. Donor information, fund UUID, and user identity are hard-coded in `donor-constants.ts`. When scaling to multiple users, this will need to be replaced with proper authentication and user management.

---

## Context Required

### Current State

**Pledge Mapping Exists**: `lib/backend-integration/` (Sub-Plan 10)

- ✅ `pledge-mapper.ts` - Maps Robinhood callback to `CryptoPledgeInput`
- ✅ `token-resolver.ts` - Resolves asset symbols to backend token IDs
- ✅ `amount-converter.ts` - Converts amounts to smallest unit
- ✅ `validation.ts` - Validates pledge data before submission
- ❌ **Missing**: Actual API client to submit pledges to Endaoment backend

**Current Callback Flow**: `app/callback/page.tsx` (lines 236-276)

```typescript
// Pledge mapping is called but NOT submitted
const pledgeMappingResult = createPledgeFromCallback(
  orderId,
  finalAsset,
  orderAmount,
  finalNetwork,
  "fund", // TODO: Get from donation context
  "00000000-0000-0000-0000-000000000000", // TODO: Get actual fund UUID
  undefined // TODO: Get donor name if authenticated
);

console.log("✅ [CALLBACK] Backend Pledge Data:", pledgeMappingResult.data);
// ⚠️ Data is logged but NEVER submitted to backend!
```

### Endaoment DAAS API

**Base URL**: `https://api.endaoment.org` (production) or `http://localhost:3000` (local)

**Endpoint**: `POST /v2/donation-pledges/crypto`

**Authentication**: Bearer token (JWT from authentication service)

**Request Body**: `CryptoPledgeInput`

```typescript
{
  cryptoGiven: {
    inputAmount: string;      // Smallest unit (e.g., "500000000000000000" for 0.5 ETH)
    tokenId: number;          // Backend token ID (e.g., 1 for ETH)
  },
  otcDonationTransactionHash: string;   // Robinhood orderId
  receivingEntityType: "fund" | "org" | "subproject";
  receivingEntityId: string;            // UUID of fund/org/subproject
  donorName?: string;                   // Optional display name
  donorIdentity?: DonorIdentity;        // Optional for tax receipt
  shareMyEmail?: boolean;
  recommendationId?: string;
  isRebalanceRequested?: boolean;
}
```

**Success Response** (201 Created):

```json
{
  "id": "pledge-uuid",
  "status": "PendingLiquidation",
  "registeredAtUtc": "2025-10-24T16:30:00Z",
  "inputAmount": "500000000000000000",
  "inputTokenId": 1,
  "otcTransactionHash": "RH_ORD_abc123",
  "receivingEntityType": "fund",
  "receivingEntityId": "fund-uuid",
  "pledgerName": "Anonymous",
  "pledgedAmountMicroDollars": null
}
```

**Error Response** (400/401/500):

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["receivingEntityId must be a valid UUID"]
}
```

### Files to Review

**Backend Integration**:

- `lib/backend-integration/index.ts` - Current public API exports
- `lib/backend-integration/types.ts` - Type definitions
- `lib/backend-integration/pledge-mapper.ts` - Pledge creation logic
- `lib/backend-integration/validation.ts` - Validation utilities

**Callback Page**:

- `app/callback/page.tsx` (lines 154-357) - Callback processing
- `app/callback/page.tsx` (lines 236-276) - Pledge mapping (not submitted)

**Dashboard**:

- `app/dashboard/page.tsx` - Where success is shown
- Currently shows localStorage data, not backend pledge status

---

## Objectives

1. **Add Amount Input** - Add donation amount field to asset selector
2. **Include Amount in URL** - Pass amount through Robinhood transfer flow
3. **Hard-Code Donor Info** - Use Robert's identity for all pledges
4. **Create DAAS API Client** - Implement API client for Endaoment backend
5. **Authentication Integration** - Add Bearer token authentication support
6. **Pledge Submission** - Submit pledge data when callback succeeds with full donor identity
7. **Error Handling** - Handle API errors gracefully with retries
8. **Loading States** - Show progress while submitting to backend
9. **Success Confirmation** - Display pledge ID and status to user
10. **Monitoring** - Log submission attempts for debugging

---

## Proposed Solution

### New Files Structure

```
robinhood-onramp/lib/
├── backend-integration/
│   ├── api-client.ts         # NEW: DAAS API client
│   ├── auth.ts               # NEW: Authentication utilities
│   ├── error-handler.ts      # NEW: API error handling
│   └── queue.ts              # NEW: Offline pledge queue (optional)
```

---

## Precise Implementation Steps

### Step 1: Add Amount Input to Asset Selector

**File**: `app/dashboard/page.tsx`

**Action**: Add amount input field to the asset selection interface

**Code** (find the asset selector section, around line 200-250):

**Add state for amount**:

```typescript
const [selectedAsset, setSelectedAsset] = useState<string>("");
const [selectedNetwork, setSelectedNetwork] = useState<string>("");
const [donationAmount, setDonationAmount] = useState<string>(""); // NEW
const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
```

**Add amount input field before the "Initiate Transfer" button**:

```typescript
{
  selectedAsset && selectedNetwork && (
    <div className="space-y-4">
      {/* Network Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono">
          {selectedNetwork}
        </Badge>
      </div>

      {/* Amount Input (NEW) */}
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium text-zinc-700">
          Donation Amount ({selectedAsset})
        </label>
        <Input
          id="amount"
          type="number"
          step="any"
          min="0"
          placeholder={`Enter amount in ${selectedAsset}`}
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
          className="text-lg"
        />
        <p className="text-xs text-zinc-500">
          Enter the amount you want to donate. This will be used to generate
          your transfer link.
        </p>
      </div>

      {/* Initiate Transfer Button */}
      <Button
        onClick={() => handleInitiateTransfer(selectedAsset, selectedNetwork)}
        disabled={
          isGeneratingUrl || !donationAmount || parseFloat(donationAmount) <= 0
        }
        className="w-full"
        size="lg"
      >
        {isGeneratingUrl ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Transfer Link...
          </>
        ) : (
          <>
            <ExternalLink className="mr-2 h-4 w-4" />
            Initiate Transfer with Robinhood
          </>
        )}
      </Button>
    </div>
  );
}
```

**Update the `handleInitiateTransfer` function to include amount**:

```typescript
const handleInitiateTransfer = async (asset: string, network: string) => {
  console.log("🚀 [DASHBOARD] Initiating transfer:", {
    asset,
    network,
    amount: donationAmount,
  });

  // Validate amount
  const amount = parseFloat(donationAmount);
  if (isNaN(amount) || amount <= 0) {
    toast({
      title: "Invalid Amount",
      description: "Please enter a valid donation amount greater than 0",
      variant: "destructive",
    });
    return;
  }

  setIsGeneratingUrl(true);

  try {
    // Get wallet address for this network
    const address = getDepositAddress(asset);

    if (!address) {
      throw new Error(`No deposit address configured for ${asset}`);
    }

    // Store transfer details in localStorage
    const transferTimestamp = Date.now();
    localStorage.setItem("robinhood_selected_asset", asset);
    localStorage.setItem("robinhood_selected_network", network);
    localStorage.setItem("robinhood_transfer_amount", donationAmount); // NEW
    localStorage.setItem(
      "robinhood_transfer_timestamp",
      transferTimestamp.toString()
    );

    // Call API to generate Robinhood URL with connectId
    const response = await fetch("/api/robinhood/generate-onramp-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assetCode: asset,
        supportedNetworks: [network],
        amount: donationAmount, // NEW - send to API
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("✅ [DASHBOARD] Robinhood URL generated:", data.url);
    console.log("   connectId:", data.connectId);
    console.log("   amount:", donationAmount);

    // Store connectId for tracking
    localStorage.setItem("robinhood_connect_id", data.connectId);

    // Redirect to Robinhood
    window.location.href = data.url;
  } catch (error: any) {
    console.error("❌ [DASHBOARD] Failed to generate transfer URL:", error);
    toast({
      title: "Transfer Failed",
      description:
        error.message || "Could not generate transfer link. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsGeneratingUrl(false);
  }
};
```

**Validation**:

```bash
cd robinhood-onramp
npx tsc --noEmit
```

**Expected Output**: No TypeScript errors, amount field appears in UI

---

### Step 2: Update API Route to Include Amount in Callback URL

**File**: `app/api/robinhood/generate-onramp-url/route.ts`

**Action**: Include amount in the redirect URL parameters

**Code** (find the redirectUrl construction, around line 60-80):

**Update to include amount parameter**:

```typescript
// Build callback URL with transfer details
const callbackParams = new URLSearchParams({
  asset: assetCode,
  network: supportedNetworks[0],
  connectId: connectId,
  timestamp: Date.now().toString(),
  amount: body.amount || "0", // NEW - include amount from request
});

const redirectUrl = `${
  process.env.APP_URL || "http://localhost:3030"
}/callback?${callbackParams.toString()}`;

console.log("📍 [API] Redirect URL:", redirectUrl);
```

**Also update the request body type to include amount**:

```typescript
// Parse request body
const body = await request.json();
const { assetCode, supportedNetworks, amount } = body;

console.log("📥 [API] Request:", { assetCode, supportedNetworks, amount });

// Validation
if (!assetCode || typeof assetCode !== "string") {
  return NextResponse.json({ error: "assetCode is required" }, { status: 400 });
}

if (
  !supportedNetworks ||
  !Array.isArray(supportedNetworks) ||
  supportedNetworks.length === 0
) {
  return NextResponse.json(
    { error: "supportedNetworks is required" },
    { status: 400 }
  );
}

// Amount is optional but should be valid if provided
if (amount && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
  return NextResponse.json(
    { error: "amount must be a positive number" },
    { status: 400 }
  );
}
```

**Validation**: TypeScript compiles with no errors

**Expected Output**: Amount is included in callback URL

---

### Step 3: Create Donor Constants File

**File**: `lib/backend-integration/donor-constants.ts`

**Action**: Hard-code Robert's donor information

**Code**:

```typescript
/**
 * Donor Constants for Endaoment Backend Integration
 *
 * Hard-coded donor information for Robert Heeger
 * (Single user POC - no authentication system yet)
 */

import type { DonorIdentity } from "./types";

/**
 * Robert Heeger's donor information
 */
export const DONOR_NAME = "Robert Heeger";

export const DONOR_IDENTITY: DonorIdentity = {
  email: "rheeger@gmail.com",
  firstname: "Robert",
  lastname: "Heeger",
  addressLine1: "116 S Portland Ave",
  addressCity: "Brooklyn",
  addressState: "NY",
  addressZip: "11217",
  addressCountry: "USA",
};

/**
 * Shloopy Doopy Charitable Fund information
 */
export const FUND_NAME = "Shloopy Doopy Charitable Fund";
export const FUND_UUID = "d59f52bb-740d-443b-bd4f-b9b23654c704";

/**
 * User UUID (for authenticated requests)
 */
export const USER_UUID = "b1b1e065-f749-469e-8c96-d19cdab7b7d5";

/**
 * Identity UUID (same as user UUID)
 */
export const IDENTITY_UUID = "b1b1e065-f749-469e-8c96-d19cdab7b7d5";

/**
 * Get complete pledge data with donor information
 */
export function getDefaultDonorInfo() {
  return {
    donorName: DONOR_NAME,
    donorIdentity: DONOR_IDENTITY,
    shareMyEmail: true, // Share email with receiving organization
  };
}

/**
 * Get default destination (fund)
 */
export function getDefaultDestination() {
  return {
    type: "fund" as const,
    id: FUND_UUID,
    name: FUND_NAME,
  };
}
```

**Validation**: TypeScript compiles with no errors

**Expected Output**: Donor constants file created

---

### Step 4: Create DAAS API Client

**File**: `lib/backend-integration/api-client.ts`

**Action**: Create comprehensive API client for Endaoment backend

**Code**:

```typescript
import type { CryptoPledgeInput } from "./types";

/**
 * DAAS API Client for Endaoment Backend
 *
 * Handles all communication with the Endaoment donation-pledges API.
 */

export interface ApiConfig {
  baseUrl: string;
  authToken?: string;
  timeout?: number;
}

export interface PledgeResponse {
  id: string;
  status: "PendingLiquidation" | "Liquidated" | "Failed" | "Cancelled";
  registeredAtUtc: string;
  inputAmount: string;
  inputTokenId: number;
  otcTransactionHash: string;
  receivingEntityType: string;
  receivingEntityId: string;
  pledgerName: string | null;
  pledgedAmountMicroDollars: bigint | null;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: string[];
}

export interface SubmitPledgeResult {
  success: boolean;
  data?: PledgeResponse;
  error?: ApiError;
}

/**
 * Submit crypto donation pledge to Endaoment backend
 */
export async function submitCryptoPledge(
  pledgeInput: CryptoPledgeInput,
  config: ApiConfig
): Promise<SubmitPledgeResult> {
  const startTime = Date.now();
  const endpoint = `${config.baseUrl}/v2/donation-pledges/crypto`;

  console.log("📤 [DAAS API] Submitting crypto pledge...");
  console.log("📍 [DAAS API] Endpoint:", endpoint);
  console.log("📦 [DAAS API] Payload:", JSON.stringify(pledgeInput, null, 2));

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add auth token if provided
    if (config.authToken) {
      headers["Authorization"] = `Bearer ${config.authToken}`;
      console.log("🔐 [DAAS API] Auth token included");
    } else {
      console.warn("⚠️ [DAAS API] No auth token provided - request may fail");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, config.timeout || 30000); // 30 second default timeout

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(pledgeInput),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    console.log(`⏱️ [DAAS API] Request completed in ${duration}ms`);

    // Parse response
    const responseData = await response.json();

    if (!response.ok) {
      // API returned error
      console.error("❌ [DAAS API] Pledge submission failed");
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error("   Response:", responseData);

      return {
        success: false,
        error: {
          statusCode: response.status,
          message: responseData.message || response.statusText,
          errors: responseData.errors || [],
        },
      };
    }

    // Success!
    console.log("✅ [DAAS API] Pledge submitted successfully!");
    console.log(`   Pledge ID: ${responseData.id}`);
    console.log(`   Status: ${responseData.status}`);
    console.log(`   Transaction Hash: ${responseData.otcTransactionHash}`);

    return {
      success: true,
      data: responseData as PledgeResponse,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error("❌ [DAAS API] Request failed");
    console.error(`   Duration: ${duration}ms`);

    if (error.name === "AbortError") {
      console.error("   Reason: Request timeout");
      return {
        success: false,
        error: {
          statusCode: 408,
          message: "Request timeout - backend did not respond in time",
        },
      };
    }

    console.error("   Error:", error);

    return {
      success: false,
      error: {
        statusCode: 0,
        message: error.message || "Network error - could not reach backend",
      },
    };
  }
}

/**
 * Get pledge status by ID
 */
export async function getPledgeStatus(
  pledgeId: string,
  config: ApiConfig
): Promise<SubmitPledgeResult> {
  const endpoint = `${config.baseUrl}/v2/donation-pledges/${pledgeId}`;

  console.log(`🔍 [DAAS API] Fetching pledge status: ${pledgeId}`);

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (config.authToken) {
      headers["Authorization"] = `Bearer ${config.authToken}`;
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          statusCode: response.status,
          message: responseData.message || response.statusText,
        },
      };
    }

    return {
      success: true,
      data: responseData as PledgeResponse,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        statusCode: 0,
        message: error.message || "Network error",
      },
    };
  }
}

/**
 * Retry logic wrapper for API calls
 */
export async function submitWithRetry(
  pledgeInput: CryptoPledgeInput,
  config: ApiConfig,
  maxRetries: number = 3
): Promise<SubmitPledgeResult> {
  let lastError: ApiError | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 [DAAS API] Attempt ${attempt}/${maxRetries}`);

    const result = await submitCryptoPledge(pledgeInput, config);

    if (result.success) {
      return result;
    }

    lastError = result.error;

    // Don't retry on client errors (400-499)
    if (
      result.error &&
      result.error.statusCode >= 400 &&
      result.error.statusCode < 500
    ) {
      console.log("⚠️ [DAAS API] Client error - not retrying");
      break;
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`   Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError,
  };
}
```

**Validation**: TypeScript compiles with no errors

**Expected Output**: New API client module ready to use

---

### Step 5: Create Authentication Utilities

**File**: `lib/backend-integration/auth.ts`

**Action**: Handle authentication token management

**Code**:

```typescript
/**
 * Authentication utilities for DAAS API
 */

export interface AuthToken {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

/**
 * Get DAAS API key from server environment
 *
 * IMPORTANT: This should only be called from server-side code (API routes).
 * Do NOT call this from client-side code as the env variable won't be available.
 */
export function getDaasApiKey(): string | undefined {
  // This only works in Node.js (server-side)
  if (typeof window === "undefined") {
    const apiKey = process.env.DAAS_ROBBIE_API_KEY;
    if (apiKey) {
      console.log("🔐 [AUTH] Using DAAS API key from environment");
      return apiKey;
    }
  }

  console.warn("⚠️ [AUTH] No DAAS API key found in environment");
  return undefined;
}

/**
 * Get auth token from localStorage or session (client-side only)
 *
 * For future use when implementing user authentication
 */
export function getAuthToken(): string | undefined {
  // Only works in browser
  if (typeof window !== "undefined" && window.localStorage) {
    const storedAuth = localStorage.getItem("endaoment_auth");
    if (storedAuth) {
      try {
        const parsed: AuthToken = JSON.parse(storedAuth);

        // Check if token is expired
        if (parsed.expiresAt > Date.now()) {
          console.log("🔐 [AUTH] Using token from localStorage");
          return parsed.token;
        } else {
          console.warn("⚠️ [AUTH] Token expired - please re-authenticate");
          localStorage.removeItem("endaoment_auth");
        }
      } catch (error) {
        console.error("❌ [AUTH] Failed to parse stored auth:", error);
        localStorage.removeItem("endaoment_auth");
      }
    }
  }

  return undefined;
}

/**
 * Save auth token to localStorage
 */
export function saveAuthToken(token: string, expiresIn: number): void {
  if (typeof window === "undefined" || !window.localStorage) {
    console.warn("⚠️ [AUTH] localStorage not available");
    return;
  }

  const authToken: AuthToken = {
    token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  localStorage.setItem("endaoment_auth", JSON.stringify(authToken));
  console.log("✅ [AUTH] Token saved to localStorage");
}

/**
 * Clear auth token from localStorage
 */
export function clearAuthToken(): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.removeItem("endaoment_auth");
    console.log("🗑️ [AUTH] Token cleared from localStorage");
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== undefined;
}
```

**Validation**: TypeScript compiles with no errors

**Expected Output**: Auth utilities ready for token management

---

### Step 6: Create Error Handler

**File**: `lib/backend-integration/error-handler.ts`

**Action**: Centralized error handling for API errors

**Code**:

```typescript
import type { ApiError } from "./api-client";

/**
 * User-friendly error messages for API errors
 */
export function formatApiError(error: ApiError): string {
  // Network errors
  if (error.statusCode === 0) {
    return "Could not connect to Endaoment servers. Please check your internet connection and try again.";
  }

  // Timeout
  if (error.statusCode === 408) {
    return "Request timed out. The server is taking too long to respond. Please try again.";
  }

  // Authentication errors
  if (error.statusCode === 401) {
    return "Authentication required. Please sign in to submit donations.";
  }

  if (error.statusCode === 403) {
    return "Access denied. You do not have permission to perform this action.";
  }

  // Validation errors
  if (error.statusCode === 400) {
    if (error.errors && error.errors.length > 0) {
      return `Validation failed: ${error.errors.join(", ")}`;
    }
    return (
      error.message ||
      "Invalid request data. Please check your input and try again."
    );
  }

  // Not found
  if (error.statusCode === 404) {
    return "The requested resource was not found. This may be a configuration issue.";
  }

  // Server errors
  if (error.statusCode >= 500) {
    return "Endaoment servers are experiencing issues. Please try again later.";
  }

  // Generic error
  return error.message || "An unexpected error occurred. Please try again.";
}

/**
 * Determine if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  // Network errors are retryable
  if (error.statusCode === 0) {
    return true;
  }

  // Timeout is retryable
  if (error.statusCode === 408) {
    return true;
  }

  // Server errors are retryable
  if (error.statusCode >= 500) {
    return true;
  }

  // Too many requests - retryable with backoff
  if (error.statusCode === 429) {
    return true;
  }

  // Client errors are NOT retryable
  return false;
}

/**
 * Log error for monitoring/debugging
 */
export function logApiError(
  operation: string,
  error: ApiError,
  context?: Record<string, any>
): void {
  console.error(`❌ [API ERROR] ${operation}`);
  console.error(`   Status: ${error.statusCode}`);
  console.error(`   Message: ${error.message}`);

  if (error.errors && error.errors.length > 0) {
    console.error("   Validation Errors:");
    error.errors.forEach((err) => {
      console.error(`     - ${err}`);
    });
  }

  if (context) {
    console.error("   Context:", context);
  }

  // TODO: Send to error tracking service (Sentry, Datadog, etc.)
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(new Error(error.message), {
  //     tags: { operation, statusCode: error.statusCode },
  //     extra: { error, context },
  //   })
  // }
}
```

**Validation**: TypeScript compiles with no errors

**Expected Output**: Error handling utilities ready

---

### Step 7: Update Public API Index

**File**: `lib/backend-integration/index.ts`

**Action**: Export new API client functions and donor constants

**Code** (update existing file):

```typescript
/**
 * Backend Integration - Public API
 *
 * Utilities for mapping Robinhood Connect transfers to
 * Endaoment backend CryptoDonationPledge format.
 */

// Types
export * from "./types";

// Donor Constants (NEW)
export {
  DONOR_NAME,
  DONOR_IDENTITY,
  FUND_NAME,
  FUND_UUID,
  USER_UUID,
  IDENTITY_UUID,
  getDefaultDonorInfo,
  getDefaultDestination,
} from "./donor-constants";

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

// API Client (NEW)
export {
  submitCryptoPledge,
  getPledgeStatus,
  submitWithRetry,
  type ApiConfig,
  type PledgeResponse,
  type ApiError,
  type SubmitPledgeResult,
} from "./api-client";

// Authentication (NEW)
export {
  getDaasApiKey,
  getAuthToken,
  saveAuthToken,
  clearAuthToken,
  isAuthenticated,
  type AuthToken,
} from "./auth";

// Error Handling (NEW)
export { formatApiError, isRetryableError, logApiError } from "./error-handler";
```

**Validation**: TypeScript compiles with no errors

**Expected Output**: Updated public API with donor constants exported

---

### Step 8: Create Pledge Submission API Route

**File**: `app/api/robinhood/submit-pledge/route.ts`

**Action**: Create server-side API route to submit pledges to Endaoment

**Code**:

```typescript
import { NextRequest, NextResponse } from "next/server";
import {
  submitWithRetry,
  getDaasApiKey,
  type CryptoPledgeInput,
  type ApiConfig,
} from "@/lib/backend-integration";

/**
 * Submit crypto donation pledge to Endaoment backend
 *
 * This is a server-side route that securely uses DAAS_ROBBIE_API_KEY
 * to authenticate with the Endaoment API.
 */
export async function POST(request: NextRequest) {
  console.log("📤 [SUBMIT-PLEDGE] Received pledge submission request");

  try {
    // Parse request body
    const body = await request.json();
    const pledgeInput: CryptoPledgeInput = body.pledgeInput;

    if (!pledgeInput) {
      return NextResponse.json(
        { error: "pledgeInput is required" },
        { status: 400 }
      );
    }

    console.log("📦 [SUBMIT-PLEDGE] Pledge data:", {
      asset: pledgeInput.cryptoGiven?.tokenId,
      amount: pledgeInput.cryptoGiven?.inputAmount,
      destination: pledgeInput.receivingEntityType,
      donor: pledgeInput.donorName,
    });

    // Get DAAS API key from server environment
    const apiKey = getDaasApiKey();

    if (!apiKey) {
      console.error("❌ [SUBMIT-PLEDGE] DAAS_ROBBIE_API_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error: API key not found" },
        { status: 500 }
      );
    }

    // Configure API client
    const apiConfig: ApiConfig = {
      baseUrl:
        process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.endaoment.org",
      authToken: apiKey,
      timeout: 30000,
    };

    console.log("🌐 [SUBMIT-PLEDGE] Submitting to Endaoment API...");
    console.log("   Backend URL:", apiConfig.baseUrl);

    // Submit pledge with retries
    const result = await submitWithRetry(pledgeInput, apiConfig, 3);

    if (result.success && result.data) {
      console.log("✅ [SUBMIT-PLEDGE] Pledge submitted successfully!");
      console.log(`   Pledge ID: ${result.data.id}`);
      console.log(`   Status: ${result.data.status}`);

      return NextResponse.json({
        success: true,
        pledgeId: result.data.id,
        status: result.data.status,
        registeredAt: result.data.registeredAtUtc,
        data: result.data,
      });
    } else {
      console.error("❌ [SUBMIT-PLEDGE] Pledge submission failed");
      console.error("   Error:", result.error);

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.error?.statusCode || 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ [SUBMIT-PLEDGE] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          statusCode: 500,
          message: error.message || "Internal server error",
        },
      },
      { status: 500 }
    );
  }
}
```

**Validation**: TypeScript compiles with no errors

**Expected Output**: API route created for secure pledge submission

---

### Step 9: Integrate API Route into Callback Page

**File**: `app/callback/page.tsx`

**Action**: Submit pledge when callback succeeds with Robert's donor information

**Code** (update existing file):

**First, add imports at top of file**:

```typescript
import {
  mapRobinhoodToPledge,
  validatePledgeInput,
  getDefaultDonorInfo,
  getDefaultDestination,
  type RobinhoodPledgeData,
} from "@/lib/backend-integration";
```

**Then find and update the amount extraction section** (add before pledge mapping):

```typescript
// PRIORITY 1: Get amount from URL query parameters
// The amount was passed through from the dashboard
const urlAmount = searchParams.get("amount");
const storedAmount = localStorage.getItem("robinhood_transfer_amount");

// Priority: URL params → localStorage → "Unknown"
const orderAmount = urlAmount || storedAmount || "Unknown";

console.log("💰 [CALLBACK] Amount resolution:", {
  urlAmount,
  storedAmount,
  finalAmount: orderAmount,
  source: urlAmount ? "URL" : storedAmount ? "localStorage" : "none",
});
```

**Find this section** (lines 236-276):

```typescript
// Map to backend pledge format (only if we have a valid amount)
let pledgeMappingResult = null;

if (orderAmount && orderAmount !== "Unknown" && orderAmount !== "") {
  console.log("🔄 [CALLBACK] Mapping to backend pledge format...");
  pledgeMappingResult = createPledgeFromCallback(
    orderId || "",
    finalAsset,
    orderAmount,
    finalNetwork,
    "fund", // TODO: Get from donation context
    "00000000-0000-0000-0000-000000000000", // TODO: Get actual fund UUID
    undefined // TODO: Get donor name if authenticated
  );

  console.log("📊 [CALLBACK] Pledge Mapping Result:", {
    success: pledgeMappingResult.success,
    hasData: !!pledgeMappingResult.data,
    errors: pledgeMappingResult.errors,
    warnings: pledgeMappingResult.warnings,
  });

  if (pledgeMappingResult.success && pledgeMappingResult.data) {
    console.log(
      "✅ [CALLBACK] Backend Pledge Data (CryptoPledgeInput):",
      JSON.stringify(pledgeMappingResult.data, null, 2)
    );

    // Validate the pledge input
    const validation = validatePledgeInput(pledgeMappingResult.data);
    console.log("🔍 [CALLBACK] Pledge Validation:", {
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
    });
  } else {
    console.error(
      "❌ [CALLBACK] Pledge mapping failed:",
      pledgeMappingResult.errors
    );
  }
} else {
  console.warn(
    "⚠️ [CALLBACK] Skipping pledge mapping - amount not available from callback"
  );
  console.warn(
    "   This is expected for Robinhood onramp (amount comes from user input, not callback)"
  );
}
```

**Replace with**:

```typescript
// Map to backend pledge format (only if we have a valid amount)
let pledgeMappingResult = null;
let backendSubmissionResult = null;

if (orderAmount && orderAmount !== "Unknown" && orderAmount !== "") {
  console.log("🔄 [CALLBACK] Mapping to backend pledge format...");

  // Get Robert's donor information and Shloopy Doopy fund
  const donorInfo = getDefaultDonorInfo();
  const destination = getDefaultDestination();

  console.log("👤 [CALLBACK] Using donor info:", {
    name: donorInfo.donorName,
    fund: destination.name,
    fundId: destination.id,
  });

  // Create full pledge data with donor identity
  const pledgeData: RobinhoodPledgeData = {
    orderId: orderId || "",
    asset: finalAsset,
    assetAmount: orderAmount,
    network: finalNetwork,
    timestamp: new Date().toISOString(),
    destination: {
      type: destination.type,
      id: destination.id,
    },
    donor: {
      name: donorInfo.donorName,
      identity: donorInfo.donorIdentity,
      shareEmail: donorInfo.shareMyEmail,
    },
  };

  // Map to backend pledge format
  pledgeMappingResult = mapRobinhoodToPledge(pledgeData);

  console.log("📊 [CALLBACK] Pledge Mapping Result:", {
    success: pledgeMappingResult.success,
    hasData: !!pledgeMappingResult.data,
    errors: pledgeMappingResult.errors,
    warnings: pledgeMappingResult.warnings,
  });

  if (pledgeMappingResult.success && pledgeMappingResult.data) {
    console.log(
      "✅ [CALLBACK] Backend Pledge Data (CryptoPledgeInput):",
      JSON.stringify(pledgeMappingResult.data, null, 2)
    );

    // Validate the pledge input
    const validation = validatePledgeInput(pledgeMappingResult.data);
    console.log("🔍 [CALLBACK] Pledge Validation:", {
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
    });

    if (validation.valid) {
      // Submit to Endaoment backend via our API route
      console.log("📤 [CALLBACK] Submitting pledge to Endaoment backend...");

      try {
        // Call our server-side API route which has access to DAAS_ROBBIE_API_KEY
        const response = await fetch("/api/robinhood/submit-pledge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pledgeInput: pledgeMappingResult.data,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          console.log("🎉 [CALLBACK] Pledge submitted successfully!");
          console.log(`   Pledge ID: ${result.pledgeId}`);
          console.log(`   Status: ${result.status}`);
          console.log(`   Registered: ${result.registeredAt}`);

          // Store pledge ID for later reference
          localStorage.setItem("robinhood_pledge_id", result.pledgeId);

          backendSubmissionResult = {
            success: true,
            pledgeId: result.pledgeId,
            status: result.status,
            registeredAt: result.registeredAt,
          };
        } else {
          console.error("❌ [CALLBACK] Pledge submission failed");
          console.error("   Error:", result.error);

          const errorMessage =
            result.error?.message || "Pledge submission failed";

          // Store error for user display
          localStorage.setItem("robinhood_pledge_error", errorMessage);

          backendSubmissionResult = {
            success: false,
            error: errorMessage,
          };
        }
      } catch (error: any) {
        console.error(
          "❌ [CALLBACK] Unexpected error during pledge submission:",
          error
        );

        const errorMessage =
          "An unexpected error occurred while submitting your donation. Please contact support.";

        localStorage.setItem("robinhood_pledge_error", errorMessage);

        backendSubmissionResult = {
          success: false,
          error: errorMessage,
        };
      }
    } else {
      console.error(
        "❌ [CALLBACK] Pledge validation failed - not submitting to backend"
      );
      console.error("   Validation errors:", validation.errors);
    }
  } else {
    console.error(
      "❌ [CALLBACK] Pledge mapping failed:",
      pledgeMappingResult.errors
    );
  }
} else {
  console.warn(
    "⚠️ [CALLBACK] Skipping pledge mapping - amount not available from callback"
  );
  console.warn(
    "   This is expected for Robinhood onramp (amount comes from user input, not callback)"
  );
}
```

**Also add imports at top of file** (after line 8):

```typescript
import {
  createPledgeFromCallback,
  validatePledgeInput,
  submitWithRetry,
  getAuthToken,
  formatApiError,
  logApiError,
  type ApiConfig,
} from "@/lib/backend-integration";
```

**Validation**:

```bash
cd robinhood-onramp
npx tsc --noEmit
```

**Expected Output**: No TypeScript errors

---

### Step 10: Update Order Details Storage

**File**: `app/callback/page.tsx`

**Action**: Include backend submission result in stored order details

**Code** (update existing code, lines 279-318):

**Find this section** (lines 279-318):

```typescript
// Store complete order details for dashboard to display
const orderDetails = {
  // IDs from Robinhood callback
  orderId: orderId || "",
  connectId: urlConnectId || connectId || storedConnectId || "",
  depositQuoteId: depositQuoteId || "",

  // Transaction details (URL params → API → localStorage priority)
  asset: finalAsset,
  network: finalNetwork,
  amount: orderAmount,
  status: orderStatus,

  // Timestamps
  initiatedAt: finalTimestamp
    ? new Date(parseInt(finalTimestamp)).toISOString()
    : "",
  completedAt: new Date().toISOString(),

  // Backend pledge data (if mapping was attempted)
  backendPledge: pledgeMappingResult
    ? pledgeMappingResult.success
      ? {
          data: pledgeMappingResult.data,
          warnings: pledgeMappingResult.warnings,
        }
      : {
          errors: pledgeMappingResult.errors,
        }
    : {
        skipped: true,
        reason: "Amount not available from callback",
      },
};
```

**Replace with**:

```typescript
// Store complete order details for dashboard to display
const orderDetails = {
  // IDs from Robinhood callback
  orderId: orderId || "",
  connectId: urlConnectId || connectId || storedConnectId || "",
  depositQuoteId: depositQuoteId || "",

  // Transaction details (URL params → API → localStorage priority)
  asset: finalAsset,
  network: finalNetwork,
  amount: orderAmount,
  status: orderStatus,

  // Timestamps
  initiatedAt: finalTimestamp
    ? new Date(parseInt(finalTimestamp)).toISOString()
    : "",
  completedAt: new Date().toISOString(),

  // Backend pledge data (if mapping was attempted)
  backendPledge: pledgeMappingResult
    ? pledgeMappingResult.success
      ? {
          data: pledgeMappingResult.data,
          warnings: pledgeMappingResult.warnings,
        }
      : {
          errors: pledgeMappingResult.errors,
        }
    : {
        skipped: true,
        reason: "Amount not available from callback",
      },

  // Backend submission result (NEW)
  backendSubmission: backendSubmissionResult
    ? backendSubmissionResult.success
      ? {
          success: true,
          pledgeId: backendSubmissionResult.data?.id,
          status: backendSubmissionResult.data?.status,
          registeredAt: backendSubmissionResult.data?.registeredAtUtc,
        }
      : {
          success: false,
          error: formatApiError(backendSubmissionResult.error!),
        }
    : {
        skipped: true,
        reason: "Pledge mapping failed or amount unavailable",
      },
};
```

**Validation**: TypeScript compiles with no errors

**Expected Output**: Order details now include backend submission status

---

### Step 11: Update Environment Variables

**File**: `.env.local` (update)

**Action**: Verify DAAS API credentials are configured

**Code**:

```bash
# Existing Robinhood config
NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID=your-app-id
ROBINHOOD_API_KEY=your-api-key
ROBINHOOD_APP_ID=your-app-id

# App URL for callbacks (already configured)
APP_URL=https://unsinfully-microcosmical-pierce.ngrok-free.dev

# Backend Integration - DAAS API Credentials
# These are server-side only (no NEXT_PUBLIC_ prefix)
DAAS_ROBBIE_CLIENT_ID=your-client-id
DAAS_ROBBIE_CLIENT_SECRET=your-client-secret
DAAS_ROBBIE_API_KEY=your-api-key

# Backend API URL
NEXT_PUBLIC_BACKEND_URL=https://api.endaoment.org
# For local development:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# Shloopy Doopy Charitable Fund (Robert's fund)
# Server-side only (no NEXT_PUBLIC_ prefix)
DEFAULT_FUND_ID=d59f52bb-740d-443b-bd4f-b9b23654c704
```

**Important Notes**:

- `DAAS_ROBBIE_*` variables are server-side only (no browser access)
- `APP_URL` is server-side only (used by API route)
- `DEFAULT_FUND_ID` is server-side only (security - don't expose fund ID to browser)
- Only `NEXT_PUBLIC_BACKEND_URL` is accessible from browser (for client-side API calls)

**Validation**: File saved, environment variables match above

**Expected Output**: Environment configured with DAAS API credentials

---

### Step 12: Update Dashboard to Show Pledge Status

**File**: `app/dashboard/page.tsx`

**Action**: Display pledge ID and status in success toast

**Code** (find success toast section, around line 95-120):

**Find the toast code**:

```typescript
// Show success toast with order details
toast({
  title: "✅ Transfer Complete!",
  description: (
    <div className="mt-2 space-y-2">
      <p className="font-semibold">
        {orderData.amount} {orderData.asset} via {orderData.network}
      </p>
      {/* ... existing toast content ... */}
    </div>
  ),
});
```

**Add pledge status after existing content**:

```typescript
// Show success toast with order details
toast({
  title: "✅ Transfer Complete!",
  description: (
    <div className="mt-2 space-y-2">
      <p className="font-semibold">
        {orderData.amount} {orderData.asset} via {orderData.network}
      </p>
      <p className="text-sm text-zinc-600">
        Order ID: {orderData.orderId?.substring(0, 20)}...
      </p>
      {orderData.completedAt && (
        <p className="text-xs text-zinc-500">
          Completed: {new Date(orderData.completedAt).toLocaleString()}
        </p>
      )}

      {/* Pledge Status (NEW) */}
      {orderData.backendSubmission?.success &&
        orderData.backendSubmission.pledgeId && (
          <div className="mt-3 pt-3 border-t border-zinc-200">
            <p className="text-sm font-semibold text-emerald-600">
              ✅ Donation Pledge Registered
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Pledge ID: {orderData.backendSubmission.pledgeId.substring(0, 8)}
              ...
            </p>
            <p className="text-xs text-zinc-500">
              Status: {orderData.backendSubmission.status}
            </p>
          </div>
        )}

      {/* Pledge Error (NEW) */}
      {orderData.backendSubmission?.error && (
        <div className="mt-3 pt-3 border-t border-zinc-200">
          <p className="text-sm font-semibold text-amber-600">
            ⚠️ Pledge Submission Issue
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            {orderData.backendSubmission.error}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Don't worry - we've recorded your transfer and will process it
            manually.
          </p>
        </div>
      )}
    </div>
  ),
  duration: 10000, // 10 seconds for more complex message
});
```

**Validation**: TypeScript compiles with no errors

**Expected Output**: Dashboard shows pledge status in success toast

---

### Step 13: Update Documentation

**File**: `docs/BACKEND-INTEGRATION.md`

**Action**: Add API submission documentation

**Code** (append to existing file):

````markdown
## API Submission

### Submitting Pledges

After mapping Robinhood callback data to `CryptoPledgeInput`, submit it to the Endaoment backend:

```typescript
import { submitWithRetry, getAuthToken } from '@/lib/backend-integration'

// Map pledge data
const mappingResult = createPledgeFromCallback(...)

if (mappingResult.success && mappingResult.data) {
  // Submit to backend with retries
  const result = await submitWithRetry(
    mappingResult.data,
    {
      baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.endaoment.org',
      authToken: getAuthToken(),
      timeout: 30000,
    },
    3, // max retries
  )

  if (result.success && result.data) {
    console.log('Pledge ID:', result.data.id)
    console.log('Status:', result.data.status)
  } else {
    console.error('Error:', result.error)
  }
}
```
````

### Authentication

The API client supports three authentication modes:

1. **Environment Token** (for testing):

   ```bash
   NEXT_PUBLIC_DAAS_API_TOKEN=your-test-token
   ```

2. **User Session** (for authenticated users):

   ```typescript
   import { saveAuthToken } from "@/lib/backend-integration";

   // After user signs in
   saveAuthToken(jwtToken, expiresInSeconds);
   ```

3. **Anonymous** (no token):
   - Pledges submitted without authentication
   - May have limitations (no tax receipts, etc.)

### Error Handling

```typescript
import { formatApiError, logApiError } from "@/lib/backend-integration";

if (!result.success && result.error) {
  // User-friendly error message
  const message = formatApiError(result.error);
  console.log(message);

  // Log for debugging
  logApiError("Submit Pledge", result.error, { orderId, asset });
}
```

### Retry Logic

The client automatically retries:

- ✅ Network errors (no response)
- ✅ Timeout errors (408)
- ✅ Server errors (500-599)
- ✅ Rate limit errors (429)
- ❌ Client errors (400-499) - not retried

Retry schedule: 2s → 4s → 8s (exponential backoff)

### Environment Configuration

```bash
# Production
NEXT_PUBLIC_BACKEND_URL=https://api.endaoment.org

# Staging
NEXT_PUBLIC_BACKEND_URL=https://staging-api.endaoment.org

# Local Development
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# Optional: Default fund for anonymous donations
NEXT_PUBLIC_DEFAULT_FUND_ID=fund-uuid-here
```

## Production Checklist (Updated)

- [ ] Update `BACKEND_TOKEN_MAP` with actual backend token IDs
- [ ] Configure `NEXT_PUBLIC_BACKEND_URL` environment variable
- [ ] Set `NEXT_PUBLIC_DEFAULT_FUND_ID` for anonymous donations
- [ ] Implement proper authentication flow
- [ ] Add error tracking integration (Sentry, etc.)
- [ ] Test with real Robinhood transfers
- [ ] Verify pledges appear in backend database
- [ ] Test retry logic with network failures
- [ ] Test anonymous vs authenticated pledges
- [ ] Verify toast notifications show pledge status

````

**Validation**: Documentation updated

**Expected Output**: Complete API integration guide

---

## Deliverables Checklist

- [ ] `app/dashboard/page.tsx` - Added amount input field
- [ ] `app/api/robinhood/generate-onramp-url/route.ts` - Include amount in callback URL (use APP_URL)
- [ ] `lib/backend-integration/donor-constants.ts` - Hard-coded Robert's donor information
- [ ] `lib/backend-integration/api-client.ts` - DAAS API client
- [ ] `lib/backend-integration/auth.ts` - Authentication utilities (getDaasApiKey for server-side)
- [ ] `lib/backend-integration/error-handler.ts` - Error handling
- [ ] `lib/backend-integration/index.ts` - Updated exports with donor constants and getDaasApiKey
- [ ] `app/api/robinhood/submit-pledge/route.ts` - Server-side pledge submission API route (NEW)
- [ ] `app/callback/page.tsx` - Integrated pledge submission via API route with full donor identity
- [ ] `app/dashboard/page.tsx` - Updated success toast with pledge status
- [ ] `.env.local` - Verify DAAS_ROBBIE_* credentials, APP_URL, DEFAULT_FUND_ID
- [ ] `docs/BACKEND-INTEGRATION.md` - Updated documentation
- [ ] Manual testing with amount input and callback flow
- [ ] End-to-end test with real transfer including pledge creation

---

## Validation Steps

### 1. Test API Client in Isolation

Create test file: `scripts/test-api-client.ts`

```typescript
import {
  createPledgeFromCallback,
  submitCryptoPledge,
  type ApiConfig,
} from '../lib/backend-integration'

async function testApiClient() {
  // Create sample pledge
  const result = createPledgeFromCallback(
    'TEST_ORD_123',
    'ETH',
    '0.5',
    'ETHEREUM',
    'fund',
    '00000000-0000-0000-0000-000000000000',
  )

  if (!result.success || !result.data) {
    console.error('Pledge creation failed:', result.errors)
    return
  }

  // Submit to backend
  const config: ApiConfig = {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
    authToken: process.env.NEXT_PUBLIC_DAAS_API_TOKEN,
  }

  const submission = await submitCryptoPledge(result.data, config)

  console.log('Submission result:', submission)
}

testApiClient().catch(console.error)
````

Run:

```bash
cd robinhood-onramp
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000 npx ts-node scripts/test-api-client.ts
```

**Expected Output**: API client successfully submits pledge to backend

### 2. Test Amount Input Field

```bash
# Start dev server
npm run dev

# Open dashboard
open "http://localhost:3030/dashboard"

# Test amount input:
# 1. Select an asset (e.g., ETH)
# 2. Amount input field should appear
# 3. Enter amount (e.g., 0.5)
# 4. Button should be disabled until amount > 0
# 5. Click "Initiate Transfer"
# 6. Should redirect to Robinhood with amount in URL
```

**Expected Output**:

- Amount input field appears after asset selection
- Button disabled when amount is empty or ≤ 0
- Button enabled when valid amount entered
- Amount included in Robinhood URL generation

### 3. Test Callback Integration with Amount

Simulate callback URL with amount:

```bash
# Start dev server
npm run dev

# Visit callback URL with test data including amount
open "http://localhost:3030/callback?orderId=TEST_123&asset=ETH&network=ETHEREUM&amount=0.5&timestamp=$(date +%s)000"
```

**Expected Output**:

- Amount extracted from URL params
- Pledge mapped with Robert's donor information
- Pledge submitted to backend (or error if backend unavailable)
- Dashboard shows pledge status in toast with Robert's name

### 4. Test Error Handling

```typescript
// In test script, test with invalid data
const result = createPledgeFromCallback(
  "TEST",
  "INVALID_ASSET",
  "0.5",
  "ETHEREUM",
  "fund",
  "not-a-uuid"
);

// Should fail validation
console.log("Validation:", result.errors);
```

**Expected Output**: Validation catches errors before submission

### 5. Test Authentication

```bash
# Test with auth token
export NEXT_PUBLIC_DAAS_API_TOKEN="test-token-here"
npm run dev

# Visit callback URL
# Should include Authorization header in API request
```

**Expected Output**: Auth token included in requests

---

## Backward Compatibility Checkpoint

**Purpose**: Ensure pledge submission doesn't break existing callback flow

**Commands**:

```bash
# 1. Build should pass
cd robinhood-onramp
npm run build

# 2. Type checking
npx tsc --noEmit

# 3. Test callback page still works without backend
npm run dev
# Visit: http://localhost:3030/callback?orderId=TEST&asset=ETH&network=ETHEREUM
```

**Success Criteria**:

- ✅ Build completes with 0 errors
- ✅ Callback page loads successfully
- ✅ Pledge mapping works even if backend is unavailable
- ✅ User sees appropriate error message if submission fails
- ✅ Transfer tracking continues to work
- ✅ Dashboard still shows transfer details

**If Checkpoint Fails**:

1. Check for TypeScript errors in build output
2. Verify API client handles network errors gracefully
3. Test with backend unavailable (should not crash)
4. Ensure localStorage data is preserved

---

## Common Issues and Solutions

### Issue 1: Backend URL Not Configured

**Symptom**: "Could not connect to Endaoment servers"

**Solution**:

```bash
# Add to .env.local
NEXT_PUBLIC_BACKEND_URL=https://api.endaoment.org

# Restart dev server
npm run dev
```

### Issue 2: CORS Errors

**Symptom**: "Access blocked by CORS policy"

**Solution**:

- Ensure backend has CORS configured for your frontend domain
- For local development, backend should allow `http://localhost:3030`
- Check backend CORS headers: `Access-Control-Allow-Origin`

### Issue 3: Authentication Failed

**Symptom**: 401 Unauthorized

**Solution**:

```typescript
// Check if token is being sent
console.log('Auth token:', getAuthToken())

// If testing, use environment variable
export NEXT_PUBLIC_DAAS_API_TOKEN="your-test-token"

// For production, implement proper OAuth/JWT flow
```

### Issue 4: Pledge Validation Failed

**Symptom**: 400 Bad Request with validation errors

**Solution**:

1. Check token ID mapping: `getBackendToken('ETH')`
2. Verify destination UUID is valid
3. Ensure amount conversion is correct
4. Review validation errors in console

### Issue 5: Request Timeout

**Symptom**: "Request timeout - backend did not respond in time"

**Solution**:

```typescript
// Increase timeout in API config
const config: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.endaoment.org",
  authToken: getAuthToken(),
  timeout: 60000, // 60 seconds instead of 30
};
```

---

## Integration Points

### With Sub-Plan 10: Backend Pledge Integration

- ✅ Uses `createPledgeFromCallback()` for pledge mapping
- ✅ Uses `validatePledgeInput()` for pre-submission validation
- ✅ Extends with actual API submission

### With Authentication System

**TODO**: Integrate with your authentication provider

```typescript
// Example: After user signs in with OAuth
import { saveAuthToken } from "@/lib/backend-integration";

async function handleOAuthCallback(code: string) {
  const response = await fetch("/api/auth/token", {
    method: "POST",
    body: JSON.stringify({ code }),
  });

  const { access_token, expires_in } = await response.json();

  saveAuthToken(access_token, expires_in);
}
```

### With Error Tracking

**TODO**: Add error tracking service

```typescript
// In error-handler.ts
export function logApiError(
  operation: string,
  error: ApiError,
  context?: Record<string, any>
) {
  console.error(`❌ [API ERROR] ${operation}`);

  // Send to Sentry
  if (typeof window !== "undefined" && window.Sentry) {
    window.Sentry.captureException(new Error(error.message), {
      tags: { operation, statusCode: error.statusCode },
      extra: { error, context },
    });
  }
}
```

---

## Next Steps

After completing this sub-plan:

1. **Implement Authentication Flow**

   - OAuth integration
   - JWT token management
   - User session handling

2. **Add Pledge Tracking UI**

   - View all user pledges
   - Check pledge status
   - View liquidation progress

3. **Implement Offline Queue**

   - Queue pledges if backend unavailable
   - Retry submission when online
   - IndexedDB for persistent storage

4. **Add Monitoring**

   - Error tracking (Sentry)
   - Analytics (pledge submission rate)
   - Performance monitoring

5. **Testing**
   - Unit tests for API client
   - Integration tests for callback flow
   - E2E tests with real transfers

---

## Risk Assessment

**🟢 LOW RISK**:

- New code is additive only
- Existing callback flow unchanged if backend unavailable
- Pledge submission failures don't break transfer tracking
- User still sees transfer completion even if pledge fails

**🟡 MEDIUM RISK**:

- **Backend availability**: API must be available for pledge submission
  - **Mitigation**: Retry logic with exponential backoff
  - **Fallback**: Store pledge data locally for manual processing

**🔴 CRITICAL RISK**:

- **Token ID mismatch**: Wrong token submitted to backend
  - **Mitigation**: Validate token IDs against backend `/v2/tokens` endpoint
  - **Fallback**: Backend validates and rejects invalid tokens
- **Authentication errors**: User can't submit authenticated pledges
  - **Mitigation**: Allow anonymous pledges as fallback
  - **Fallback**: Manual pledge creation by support team

---

## Time Estimate Breakdown

- **Reading context**: 20-30 minutes
- **Step 1 (Amount Input)**: 30-45 minutes
- **Step 2 (URL with Amount)**: 15-20 minutes
- **Step 3 (Donor Constants)**: 15-20 minutes
- **Steps 4-7 (API Client, Auth, Errors, Index)**: 90-120 minutes
- **Step 8 (Pledge Submission API Route)**: 30-45 minutes
- **Step 9 (Callback Integration)**: 45-60 minutes
- **Step 10 (Dashboard Status)**: 30-45 minutes
- **Step 11 (Environment Verification)**: 5-10 minutes
- **Step 12 (Documentation)**: 30-45 minutes
- **Testing**: 60-90 minutes

**Total**: 5-7 hours

**Complexity**: Medium-High (API integration with UI changes, server-side routing, and error handling)

---

## Success Indicators

✅ **Amount Input**:

- Amount field appears after asset selection
- Amount validation works (must be > 0)
- Amount passed through Robinhood URL
- Amount available in callback

✅ **Donor Information**:

- Robert's information hard-coded correctly
- Shloopy Doopy fund UUID used for all pledges
- Full donor identity included in pledges
- Tax receipt capability enabled (via donor identity)

✅ **API Integration**:

- Pledges successfully submitted to backend
- Pledge ID returned and stored
- Status visible in dashboard
- Full donor identity sent with each pledge

✅ **Error Handling**:

- Network errors handled gracefully
- User sees appropriate error messages
- Errors logged for debugging
- Amount validation errors shown

✅ **Authentication & Security**:

- DAAS_ROBBIE_API_KEY used from server-side only
- API key never exposed to browser/client
- Pledge submission through secure API route
- Hard-coded donor info used correctly

✅ **User Experience**:

- Success toast shows pledge status with Robert's name
- Errors don't break the flow
- Transfer tracking continues regardless of pledge status
- Amount input is intuitive and validated

---

**Last Updated**: October 24, 2025
**Next Review**: After implementation and testing
