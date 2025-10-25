# Sub-Plan 2: Deposit Address Redemption API

**Priority**: High (Core API)  
**Estimated Complexity**: Medium  
**Dependencies**: Sub-Plan 1 (Project Setup)

## Context

This sub-plan implements the core backend API for redeeming deposit addresses from Robinhood using a referenceId. This is the critical bridge between the user's Robinhood offramp completion and our system receiving the deposit address where crypto will be sent. As a result of completing this sub-plan, our backend will be able to securely communicate with Robinhood's API to retrieve deposit addresses and handle all error scenarios gracefully.

## What This Sub-Plan Accomplishes

1. **Secure API Integration**: Implement backend-only communication with Robinhood's deposit address redemption endpoint
2. **ReferenceId Validation**: Ensure proper validation and handling of referenceId parameters
3. **Error Handling**: Comprehensive error handling for API failures, network issues, and invalid requests
4. **Type Safety**: Full TypeScript integration with proper response typing
5. **Security Best Practices**: API keys never exposed to client, proper request validation

## Key Architectural Decisions

- **Backend-Only API Calls**: All Robinhood API communication happens on the server to protect API keys
- **Stateless Design**: No session storage needed, referenceId is the only tracking mechanism
- **Comprehensive Error Handling**: Handle all possible failure scenarios with user-friendly messages
- **Request Validation**: Validate referenceId format and presence before making API calls

## Implementation Details

### API Endpoint Specification

**Endpoint**: `POST /api/robinhood/redeem-deposit-address`

**Request Body**:

```typescript
{
  referenceId: string; // UUID v4 format
}
```

**Response (Success)**:

```typescript
{
  success: true;
  data: {
    address: string;
    addressTag?: string;
    assetCode: string;
    assetAmount: string;
    networkCode: string;
  }
}
```

**Response (Error)**:

```typescript
{
  success: false;
  error: string;
  code?: string;
}
```

### Files to Create/Modify

#### Create `app/api/robinhood/redeem-deposit-address/route.ts`

```typescript
import { NextResponse } from "next/server";
import { redeemDepositAddress } from "@/lib/robinhood-api";
import type { DepositAddressResponse } from "@/types/robinhood";

interface RedeemAddressRequest {
  referenceId: string;
}

// Validate referenceId format (UUID v4)
function isValidReferenceId(referenceId: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(referenceId);
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body: RedeemAddressRequest = await request.json();

    // Validate request body
    if (!body.referenceId) {
      return NextResponse.json(
        {
          success: false,
          error: "referenceId is required",
          code: "MISSING_REFERENCE_ID",
        },
        { status: 400 }
      );
    }

    // Validate referenceId format
    if (!isValidReferenceId(body.referenceId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid referenceId format. Must be a valid UUID v4.",
          code: "INVALID_REFERENCE_ID_FORMAT",
        },
        { status: 400 }
      );
    }

    // Call Robinhood API to redeem deposit address
    const depositAddressData = await redeemDepositAddress(body.referenceId);

    // Return success response
    return NextResponse.json({
      success: true,
      data: depositAddressData,
    });
  } catch (error: any) {
    console.error("Error in redeem-deposit-address API:", error);

    // Handle specific error types
    if (error.code === "ROBINHOOD_API_ERROR") {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: "ROBINHOOD_API_ERROR",
        },
        { status: 400 }
      );
    }

    if (error.code === "INVALID_REFERENCE_ID") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired referenceId",
          code: "INVALID_REFERENCE_ID",
        },
        { status: 404 }
      );
    }

    if (error.code === "NETWORK_ERROR") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Network error communicating with Robinhood. Please try again.",
          code: "NETWORK_ERROR",
        },
        { status: 503 }
      );
    }

    // Generic error handling
    return NextResponse.json(
      {
        success: false,
        error: "Failed to redeem deposit address. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
```

#### Update `lib/robinhood-api.ts`

```typescript
import type { DepositAddressResponse } from "@/types/robinhood";

// Custom error class for Robinhood API errors
class RobinhoodAPIError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = "RobinhoodAPIError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Validate environment variables
function validateEnvironmentVariables() {
  if (!process.env.ROBINHOOD_API_KEY) {
    throw new Error("ROBINHOOD_API_KEY environment variable is required");
  }
  if (!process.env.ROBINHOOD_APP_ID) {
    throw new Error("ROBINHOOD_APP_ID environment variable is required");
  }
}

/**
 * Redeem deposit address from Robinhood using referenceId
 * @param referenceId - UUID v4 generated during offramp initiation
 * @returns Promise<DepositAddressResponse>
 */
export async function redeemDepositAddress(
  referenceId: string
): Promise<DepositAddressResponse> {
  validateEnvironmentVariables();

  const url = "https://api.robinhood.com/catpay/v1/redeem_deposit_address/";

  try {
    console.log(`Redeeming deposit address for referenceId: ${referenceId}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": process.env.ROBINHOOD_API_KEY!,
        "application-id": process.env.ROBINHOOD_APP_ID!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referenceId }),
      // Ensure fresh request, no caching
      cache: "no-store",
    });

    // Log response status for debugging
    console.log(`Robinhood API response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Robinhood API error response:", errorData);

      // Handle specific HTTP status codes
      if (response.status === 404) {
        throw new RobinhoodAPIError(
          "ReferenceId not found or expired",
          "INVALID_REFERENCE_ID",
          404
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new RobinhoodAPIError(
          "Authentication failed. Check API credentials.",
          "AUTHENTICATION_ERROR",
          response.status
        );
      }

      if (response.status >= 500) {
        throw new RobinhoodAPIError(
          "Robinhood API server error. Please try again later.",
          "SERVER_ERROR",
          response.status
        );
      }

      // Generic API error
      const errorMessage =
        errorData.error || errorData.message || "Unknown API error";
      throw new RobinhoodAPIError(
        errorMessage,
        "ROBINHOOD_API_ERROR",
        response.status
      );
    }

    const responseData = await response.json();
    console.log("Robinhood API success response:", responseData);

    // Validate response structure
    if (
      !responseData.address ||
      !responseData.assetCode ||
      !responseData.networkCode
    ) {
      throw new RobinhoodAPIError(
        "Invalid response format from Robinhood API",
        "INVALID_RESPONSE_FORMAT"
      );
    }

    return {
      address: responseData.address,
      addressTag: responseData.addressTag,
      assetCode: responseData.assetCode,
      assetAmount: responseData.assetAmount,
      networkCode: responseData.networkCode,
    };
  } catch (error: any) {
    // Re-throw RobinhoodAPIError instances
    if (error instanceof RobinhoodAPIError) {
      throw error;
    }

    // Handle network errors
    if (
      error.code === "ENOTFOUND" ||
      error.code === "ECONNREFUSED" ||
      error.name === "FetchError"
    ) {
      console.error("Network error calling Robinhood API:", error);
      throw new RobinhoodAPIError(
        "Network error communicating with Robinhood",
        "NETWORK_ERROR"
      );
    }

    // Handle timeout errors
    if (error.name === "AbortError" || error.code === "ETIMEDOUT") {
      console.error("Timeout error calling Robinhood API:", error);
      throw new RobinhoodAPIError(
        "Request timeout communicating with Robinhood",
        "TIMEOUT_ERROR"
      );
    }

    // Generic error handling
    console.error("Unexpected error calling Robinhood API:", error);
    throw new RobinhoodAPIError(
      "Unexpected error communicating with Robinhood",
      "UNEXPECTED_ERROR"
    );
  }
}

// Placeholder for other API functions (will be implemented in later sub-plans)
export async function getOrderStatus(referenceId: string) {
  throw new Error("Not implemented yet - will be implemented in Sub-Plan 5");
}

export async function getPriceQuote(assetCode: string, networkCode: string) {
  throw new Error("Not implemented yet - will be implemented in Sub-Plan 5");
}
```

#### Create Test Utility `lib/robinhood-api-test.ts` (Optional)

```typescript
// Test utility for manual API testing during development
// This file should NOT be included in production builds

import { redeemDepositAddress } from "./robinhood-api";

/**
 * Test function for manual API testing
 * Usage: Call this from a temporary API route during development
 */
export async function testRedeemDepositAddress(referenceId: string) {
  try {
    console.log("Testing deposit address redemption...");
    const result = await redeemDepositAddress(referenceId);
    console.log("Success:", result);
    return result;
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}

// Example test referenceId (replace with actual referenceId from Robinhood flow)
export const EXAMPLE_REFERENCE_ID = "f2056f4c-93c7-422b-bd59-fbfb5b05b6ad";
```

## Step-by-Step Instructions

### Step 1: Create API Route Directory

```bash
# Navigate to project root
cd robinhood-offramp

# Create the API route directory
mkdir -p app/api/robinhood/redeem-deposit-address
```

### Step 2: Implement API Route

**Create `app/api/robinhood/redeem-deposit-address/route.ts`:**

- Copy the complete implementation from above
- Ensure proper imports and error handling
- Test TypeScript compilation

### Step 3: Update Robinhood API Client

**Update `lib/robinhood-api.ts`:**

- Replace placeholder function with full implementation
- Add comprehensive error handling
- Include logging for debugging

### Step 4: Verify Environment Variables

**Check `.env.local`:**

```bash
# Ensure these variables are set
ROBINHOOD_APP_ID=your-app-id-from-robinhood-team
ROBINHOOD_API_KEY=your-api-key-from-robinhood-team
```

### Step 5: Test API Route

**Create temporary test route `app/api/test-redeem/route.ts`:**

```typescript
import { NextResponse } from "next/server";
import { redeemDepositAddress } from "@/lib/robinhood-api";

export async function GET() {
  // Use a test referenceId (you'll need to get this from a real Robinhood flow)
  const testReferenceId = "f2056f4c-93c7-422b-bd59-fbfb5b05b6ad";

  try {
    const result = await redeemDepositAddress(testReferenceId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }
}
```

**Test the endpoint:**

```bash
# Start development server
npm run dev

# Test the API endpoint
curl -X POST http://localhost:3030/api/robinhood/redeem-deposit-address \
  -H "Content-Type: application/json" \
  -d '{"referenceId":"f2056f4c-93c7-422b-bd59-fbfb5b05b6ad"}'
```

### Step 6: Clean Up Test Files

```bash
# Remove test files after verification
rm app/api/test-redeem/route.ts
rm lib/robinhood-api-test.ts  # if created
```

## Testing Checklist

### API Route Testing

- [ ] POST request with valid referenceId returns success response
- [ ] POST request with missing referenceId returns 400 error
- [ ] POST request with invalid referenceId format returns 400 error
- [ ] POST request with non-existent referenceId returns 404 error
- [ ] API route handles network errors gracefully
- [ ] API route handles Robinhood API errors gracefully

### Environment Variable Testing

- [ ] Missing ROBINHOOD_API_KEY throws appropriate error
- [ ] Missing ROBINHOOD_APP_ID throws appropriate error
- [ ] Environment variables load correctly in API route

### Error Handling Testing

- [ ] Invalid JSON in request body returns proper error
- [ ] Network timeout scenarios handled
- [ ] Robinhood API 500 errors handled
- [ ] Authentication errors (401/403) handled
- [ ] Malformed Robinhood API responses handled

### TypeScript Integration

- [ ] All imports resolve correctly
- [ ] Response types match DepositAddressResponse interface
- [ ] Error objects have proper typing
- [ ] No TypeScript compilation errors

## Edge Cases & Considerations

### ReferenceId Validation

- **UUID Format**: Must be valid UUID v4 format
- **Case Sensitivity**: UUIDs should be case-insensitive
- **Expiration**: Robinhood referenceIds may expire after a certain time
- **Uniqueness**: Each referenceId can only be redeemed once

### API Rate Limiting

- **Robinhood Limits**: May have rate limits on API calls
- **Retry Logic**: Consider implementing exponential backoff for retries
- **Caching**: Don't cache deposit addresses (they're one-time use)

### Security Considerations

- **API Key Exposure**: Never log or expose API keys
- **Request Validation**: Always validate input before API calls
- **Error Information**: Don't expose internal error details to client
- **CORS**: Ensure API route is only accessible from your domain

### Network Reliability

- **Timeout Handling**: Set appropriate timeouts for API calls
- **Retry Strategy**: Implement retry logic for transient failures
- **Circuit Breaker**: Consider circuit breaker pattern for repeated failures

## Success Criteria

This sub-plan is complete when:

1. **API Route Functional**: `/api/robinhood/redeem-deposit-address` accepts POST requests and returns proper responses
2. **Error Handling Complete**: All error scenarios handled with appropriate HTTP status codes and messages
3. **Type Safety**: Full TypeScript integration with proper typing for requests and responses
4. **Security Verified**: API keys never exposed to client, proper input validation
5. **Testing Passed**: All test scenarios pass, including error cases
6. **Logging Implemented**: Appropriate logging for debugging without exposing sensitive data
7. **Documentation Updated**: Code is well-commented and self-documenting

## Next Steps

After completing this sub-plan:

1. **Sub-Plan 3**: Implement offramp URL generation utilities
2. **Sub-Plan 4**: Create callback handling to trigger this API
3. **Sub-Plan 5**: Add order status tracking functionality

## Notes

- **Real Testing**: Full testing requires actual referenceId from Robinhood flow
- **Error Messages**: Keep error messages user-friendly but informative for debugging
- **Logging Strategy**: Log enough for debugging but never log sensitive data
- **API Evolution**: Robinhood API may change, keep implementation flexible

## Common Issues & Solutions

### Issue: Environment Variables Not Loading

**Solution**: Restart development server and verify `.env.local` file location

### Issue: CORS Errors

**Solution**: API routes in Next.js handle CORS automatically, but verify request origin if issues persist

### Issue: TypeScript Import Errors

**Solution**: Ensure `types/robinhood.d.ts` is properly configured and imported

### Issue: Network Timeout Errors

**Solution**: Implement proper timeout handling and retry logic

### Issue: Invalid API Response Format

**Solution**: Add response validation and handle unexpected response structures

### Issue: Authentication Failures

**Solution**: Verify API keys are correct and have proper permissions from Robinhood team
