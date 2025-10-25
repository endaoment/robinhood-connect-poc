# Sub-Plan 3: Mock Backend Services

**Status**: Pending
**Priority**: High
**Dependencies**: Sub-Plan 2 (DTOs and Validation)

## Context Required

### Files to Review

**Current Backend Integration Attempt**:

- `robinhood-onramp/lib/backend-integration/token-resolver.ts` (lines 1-150)
  - See how token mapping attempted
  - Understand token resolution logic
- `robinhood-onramp/lib/backend-integration/pledge-mapper.ts` (lines 1-200)
  - See how pledge mapping started
  - Understand field transformations

**Backend Services to Mock** (from endaoment-backend):

- `CryptoDonationPledgeService` - Creates pledges
- `TokenService` - Resolves tokens by symbol
- `DonationPledgeNotificationService` - Sends notifications

**Toast Libraries** (for visual feedback):

- Research sonner toast library (already in project)
- Review `robinhood-onramp/components/ui/use-toast.ts`

## Objectives

1. Create `lib/backend-mock/` directory
2. Build `toast-logger.ts` for visual API call demonstrations
3. Create `mock-pledge.service.ts` simulating pledge creation
4. Create `mock-token.service.ts` simulating token resolution
5. Create `mock-notification.service.ts` simulating Discord notifications
6. Define backend entity types
7. Make all mocks client-side safe

## Precise Implementation Steps

### Step 1: Create Backend Mock Directory

**Action**: Create directory structure

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
mkdir -p lib/backend-mock
```

**Validation**:

```bash
ls -la lib/backend-mock
# Expected: Directory exists
```

### Step 2: Create Backend Entity Types

**File**: `lib/backend-mock/types.ts`

**Action**: Define backend entity shapes

```typescript
/**
 * Backend entity type definitions
 *
 * These mirror entities in endaoment-backend
 * Used for mock services to demonstrate backend integration
 */

/**
 * Token entity from backend database
 */
export interface BackendToken {
  id: number;
  symbol: string;
  name: string;
  decimals: number;
  network: string;
  contractAddress?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Organization/Fund entity from backend
 */
export interface BackendOrganization {
  id: string;
  name: string;
  ein?: string;
  isActive: boolean;
}

/**
 * CryptoDonationPledge entity from backend
 */
export interface BackendCryptoPledge {
  id: string;
  otcTransactionHash: string;
  pledgerUserId?: string;
  inputToken: number; // Token ID
  inputAmount: string; // Amount in smallest unit
  destinationOrgId: string;
  status: "PENDING_LIQUIDATION" | "LIQUIDATED" | "FAILED";
  centralizedExchangeDonationStatus: "Completed" | "Pending" | "Failed";
  centralizedExchangeTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Backend token mapping for common crypto assets
 */
export const BACKEND_TOKEN_MAP: Record<string, BackendToken> = {
  BTC: {
    id: 1,
    symbol: "BTC",
    name: "Bitcoin",
    decimals: 8,
    network: "BITCOIN",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  ETH: {
    id: 2,
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    network: "ETHEREUM",
    contractAddress: "0x0000000000000000000000000000000000000000",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  USDC: {
    id: 3,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    network: "ETHEREUM",
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  SOL: {
    id: 4,
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    network: "SOLANA",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

/**
 * Default organization for testing
 */
export const DEFAULT_TEST_ORG: BackendOrganization = {
  id: process.env.NEXT_PUBLIC_DEFAULT_FUND_ID || "default-fund-123",
  name: "Endaoment Community Fund",
  isActive: true,
};
```

**Validation**:

```bash
npx tsc --noEmit lib/backend-mock/types.ts
# Expected: No errors
```

### Step 3: Create Toast Logger Utility

**File**: `lib/backend-mock/toast-logger.ts`

**Action**: Create visual API call logger

````typescript
"use client";

import { toast } from "sonner";

/**
 * Parameters for showing a backend API call toast
 */
export interface ApiCallToastParams {
  /**
   * HTTP method (GET, POST, etc.)
   */
  method?: string;

  /**
   * Backend endpoint or service method
   */
  endpoint: string;

  /**
   * Request headers (sanitized)
   */
  headers?: Record<string, string>;

  /**
   * Request body
   */
  body?: any;

  /**
   * Expected response from backend
   */
  expectedResponse?: any;

  /**
   * Database query that would be executed
   */
  query?: string;

  /**
   * Explanation of what backend would do
   */
  explanation?: string;

  /**
   * Duration in milliseconds (optional)
   */
  duration?: number;
}

/**
 * Show a toast demonstrating a backend API call
 *
 * Displays detailed information about what the backend would do
 * if this was integrated into endaoment-backend
 *
 * @param params - API call parameters
 *
 * @example
 * ```typescript
 * showApiCallToast({
 *   method: 'POST',
 *   endpoint: '/v1/robinhood/pledge/create',
 *   body: { connectId: 'abc-123', amount: '0.5' },
 *   expectedResponse: { pledgeId: 'uuid-...', status: 'PENDING_LIQUIDATION' },
 * });
 * ```
 */
export function showApiCallToast(params: ApiCallToastParams): void {
  const {
    method = "CALL",
    endpoint,
    headers,
    body,
    expectedResponse,
    query,
    explanation,
    duration = 10000,
  } = params;

  // Format the toast message
  const title = `🎯 Backend API: ${method} ${endpoint}`;

  let description = "";

  if (explanation) {
    description += `📝 ${explanation}\n\n`;
  }

  if (headers) {
    description += "**Headers:**\n```\n";
    Object.entries(headers).forEach(([key, value]) => {
      description += `${key}: ${value}\n`;
    });
    description += "```\n\n";
  }

  if (body) {
    description += "**Request Body:**\n```json\n";
    description += JSON.stringify(body, null, 2);
    description += "\n```\n\n";
  }

  if (query) {
    description += "**Database Query:**\n```sql\n";
    description += query;
    description += "\n```\n\n";
  }

  if (expectedResponse) {
    description += "**Expected Response:**\n```json\n";
    description += JSON.stringify(expectedResponse, null, 2);
    description += "\n```";
  }

  // Show toast with rich content
  toast.info(title, {
    description,
    duration,
    closeButton: true,
  });
}

/**
 * Show success toast for backend operation
 */
export function showBackendSuccess(operation: string, details?: any): void {
  toast.success(`✅ Backend: ${operation}`, {
    description: details ? JSON.stringify(details, null, 2) : undefined,
    duration: 5000,
  });
}

/**
 * Show error toast for backend operation
 */
export function showBackendError(operation: string, error: string): void {
  toast.error(`❌ Backend Error: ${operation}`, {
    description: error,
    duration: 8000,
  });
}

/**
 * Client-side check to ensure toast functions only run in browser
 */
export const isClient = typeof window !== "undefined";

/**
 * Safe wrapper for toast functions (handles SSR)
 */
export function safeToast(fn: () => void): void {
  if (isClient) {
    fn();
  }
}
````

**Validation**:

```bash
npx tsc --noEmit lib/backend-mock/toast-logger.ts
# Expected: No errors
```

### Step 4: Create Mock Token Service

**File**: `lib/backend-mock/mock-token.service.ts`

**Action**: Create token resolution mock

````typescript
"use client";

import { BACKEND_TOKEN_MAP, BackendToken } from "./types";
import { showApiCallToast, safeToast } from "./toast-logger";

/**
 * Parameters for token resolution
 */
export interface ResolveTokenParams {
  /**
   * Asset symbol (e.g., 'BTC')
   */
  symbol: string;

  /**
   * Network name (e.g., 'BITCOIN')
   */
  network: string;

  /**
   * Whether to show toast (default: true)
   */
  showToast?: boolean;
}

/**
 * Mock implementation of backend TokenService
 *
 * Simulates database queries for token resolution
 * Shows what backend would do via toasts
 *
 * In real backend, this would:
 * - Query `token` table by symbol and network
 * - Return token entity with ID for foreign key
 */
export class MockTokenService {
  /**
   * Resolve token by symbol and network
   *
   * Simulates backend TokenService.resolveTokenBySymbol()
   *
   * @param params - Token resolution parameters
   * @returns BackendToken or null if not found
   *
   * @example
   * ```typescript
   * const token = await mockTokenService.resolveToken({
   *   symbol: 'BTC',
   *   network: 'BITCOIN',
   * });
   * // Shows toast with SQL query, returns token entity
   * ```
   */
  async resolveToken(params: ResolveTokenParams): Promise<BackendToken | null> {
    const { symbol, network, showToast = true } = params;

    const token = BACKEND_TOKEN_MAP[symbol.toUpperCase()];

    if (!token) {
      if (showToast) {
        safeToast(() =>
          showApiCallToast({
            endpoint: "TokenService.resolveTokenBySymbol",
            query: `
SELECT * FROM token 
WHERE symbol = '${symbol}' 
  AND network = '${network}' 
  AND is_active = true
LIMIT 1;
          `.trim(),
            explanation: `Backend would query database for token matching symbol '${symbol}' on network '${network}'`,
            expectedResponse: null,
          })
        );
      }
      return null;
    }

    if (showToast) {
      safeToast(() =>
        showApiCallToast({
          endpoint: "TokenService.resolveTokenBySymbol",
          query: `
SELECT * FROM token 
WHERE symbol = '${symbol}' 
  AND network = '${network}' 
  AND is_active = true
LIMIT 1;
        `.trim(),
          explanation: `Backend would query database and return token entity`,
          expectedResponse: token,
        })
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return token;
  }

  /**
   * Get token by ID
   *
   * Simulates backend TokenService.findById()
   */
  async getTokenById(
    tokenId: number,
    showToast: boolean = true
  ): Promise<BackendToken | null> {
    const token = Object.values(BACKEND_TOKEN_MAP).find(
      (t) => t.id === tokenId
    );

    if (showToast && token) {
      safeToast(() =>
        showApiCallToast({
          endpoint: "TokenService.findById",
          query: `SELECT * FROM token WHERE id = ${tokenId} LIMIT 1;`,
          expectedResponse: token,
        })
      );
    }

    return token || null;
  }
}

// Singleton instance
export const mockTokenService = new MockTokenService();
````

**Validation**:

```bash
npx tsc --noEmit lib/backend-mock/mock-token.service.ts
# Expected: No errors
```

### Step 5: Create Mock Pledge Service

**File**: `lib/backend-mock/mock-pledge.service.ts`

**Action**: Create pledge creation mock

````typescript
"use client";

import {
  CreatePledgeDto,
  PledgeStatus,
  CentralizedExchangeStatus,
} from "@/lib/robinhood/dtos";
import { BackendCryptoPledge } from "./types";
import {
  showApiCallToast,
  showBackendSuccess,
  safeToast,
} from "./toast-logger";
import { v4 as uuidv4 } from "uuid";

/**
 * Mock implementation of backend CryptoDonationPledgeService
 *
 * Simulates pledge creation in database
 * Shows what backend would do via toasts
 *
 * In real backend, this would:
 * - Validate DTO
 * - Insert into crypto_donation_pledge table
 * - Trigger notifications
 * - Return created pledge entity
 */
export class MockPledgeService {
  /**
   * Create a crypto donation pledge
   *
   * Simulates backend CryptoDonationPledgeService.create()
   *
   * @param dto - Validated pledge DTO
   * @param showToast - Whether to show toast (default: true)
   * @returns Created pledge entity
   *
   * @example
   * ```typescript
   * const pledge = await mockPledgeService.createPledge(pledgeDto);
   * // Shows toast with INSERT query and entity structure
   * ```
   */
  async createPledge(
    dto: CreatePledgeDto,
    showToast: boolean = true
  ): Promise<BackendCryptoPledge> {
    // Generate pledge ID
    const pledgeId = uuidv4();

    // Create pledge entity
    const pledge: BackendCryptoPledge = {
      id: pledgeId,
      otcTransactionHash: dto.otcTransactionHash,
      pledgerUserId: dto.pledgerUserId,
      inputToken: dto.inputToken,
      inputAmount: dto.inputAmount,
      destinationOrgId: dto.destinationOrgId,
      status: dto.status || PledgeStatus.PendingLiquidation,
      centralizedExchangeDonationStatus:
        dto.centralizedExchangeDonationStatus ||
        CentralizedExchangeStatus.Completed,
      centralizedExchangeTransactionId: dto.centralizedExchangeTransactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (showToast) {
      safeToast(() =>
        showApiCallToast({
          method: "POST",
          endpoint: "/v1/robinhood/pledge/create",
          headers: {
            Authorization: "Bearer <user-jwt-token>",
            "Content-Type": "application/json",
          },
          body: {
            otcTransactionHash: dto.otcTransactionHash,
            pledgerUserId: dto.pledgerUserId,
            inputToken: dto.inputToken,
            inputAmount: dto.inputAmount,
            destinationOrgId: dto.destinationOrgId,
            asset: dto.asset,
            network: dto.network,
          },
          query: `
INSERT INTO crypto_donation_pledge (
  id,
  otc_transaction_hash,
  pledger_user_id,
  input_token,
  input_amount,
  destination_org_id,
  status,
  centralized_exchange_donation_status,
  centralized_exchange_transaction_id,
  created_at,
  updated_at
) VALUES (
  '${pledgeId}',
  '${dto.otcTransactionHash}',
  ${dto.pledgerUserId ? `'${dto.pledgerUserId}'` : "NULL"},
  ${dto.inputToken},
  '${dto.inputAmount}',
  '${dto.destinationOrgId}',
  '${pledge.status}',
  '${pledge.centralizedExchangeDonationStatus}',
  ${
    dto.centralizedExchangeTransactionId
      ? `'${dto.centralizedExchangeTransactionId}'`
      : "NULL"
  },
  NOW(),
  NOW()
) RETURNING *;
        `.trim(),
          explanation:
            "Backend would insert pledge into database and trigger notifications",
          expectedResponse: pledge,
          duration: 12000,
        })
      );

      // Show success toast after delay
      setTimeout(() => {
        safeToast(() =>
          showBackendSuccess("Pledge Created", {
            pledgeId,
            status: pledge.status,
            amount: dto.inputAmount,
          })
        );
      }, 1000);
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return pledge;
  }

  /**
   * Get pledge by transaction hash
   */
  async getPledgeByTxHash(
    txHash: string,
    showToast: boolean = true
  ): Promise<BackendCryptoPledge | null> {
    if (showToast) {
      safeToast(() =>
        showApiCallToast({
          method: "GET",
          endpoint: `/v1/robinhood/pledge/by-tx/${txHash}`,
          query: `
SELECT * FROM crypto_donation_pledge 
WHERE otc_transaction_hash = '${txHash}' 
LIMIT 1;
        `.trim(),
          explanation:
            "Backend would query for existing pledge by transaction hash",
        })
      );
    }

    // Mock: assume not found for demonstration
    return null;
  }
}

// Singleton instance
export const mockPledgeService = new MockPledgeService();
````

**Validation**:

```bash
npx tsc --noEmit lib/backend-mock/mock-pledge.service.ts
# Expected: No errors
```

### Step 6: Create Mock Notification Service

**File**: `lib/backend-mock/mock-notification.service.ts`

**Action**: Create notification mock

```typescript
"use client";

import { BackendCryptoPledge } from "./types";
import { showApiCallToast, safeToast } from "./toast-logger";

/**
 * Mock implementation of backend DonationPledgeNotificationService
 *
 * Simulates Discord/Slack notifications
 * Shows what backend would do via toasts
 */
export class MockNotificationService {
  /**
   * Send notification for created crypto pledge
   *
   * Simulates backend notification to Discord
   *
   * @param pledge - Created pledge entity
   * @param showToast - Whether to show toast (default: true)
   */
  async notifyCryptoPledgeCreated(
    pledge: BackendCryptoPledge,
    showToast: boolean = true
  ): Promise<void> {
    const discordPayload = {
      embeds: [
        {
          title: "💰 New Robinhood Crypto Donation",
          color: 0x00ff00,
          fields: [
            {
              name: "Pledge ID",
              value: pledge.id,
              inline: true,
            },
            {
              name: "Amount",
              value: pledge.inputAmount,
              inline: true,
            },
            {
              name: "Status",
              value: pledge.status,
              inline: true,
            },
            {
              name: "Transaction",
              value: pledge.otcTransactionHash,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    if (showToast) {
      safeToast(() =>
        showApiCallToast({
          method: "POST",
          endpoint: "Discord Webhook: /donations-channel",
          headers: {
            "Content-Type": "application/json",
          },
          body: discordPayload,
          explanation:
            "Backend would send Discord notification to #donations channel",
          duration: 8000,
        })
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

// Singleton instance
export const mockNotificationService = new MockNotificationService();
```

**Validation**:

```bash
npx tsc --noEmit lib/backend-mock/mock-notification.service.ts
# Expected: No errors
```

### Step 7: Install UUID Dependency

**Action**: Install uuid package

```bash
npm install uuid
npm install --save-dev @types/uuid
```

**Validation**:

```bash
npm list uuid
# Expected: uuid package listed
```

### Step 8: Create Backend Mock Index

**File**: `lib/backend-mock/index.ts`

**Action**: Create barrel export

```typescript
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
```

**Validation**:

```bash
npx tsc --noEmit lib/backend-mock/index.ts
# Expected: No errors
```

### Step 9: Test Mock Services

**File**: `lib/backend-mock/__test-mocks.ts` (temporary)

**Action**: Test mock service functionality

```typescript
import {
  mockTokenService,
  mockPledgeService,
  mockNotificationService,
} from "./index";
import { CreatePledgeDto, PledgeStatus } from "@/lib/robinhood/dtos";

async function testMocks() {
  console.log("Testing Mock Services...\n");

  // Test 1: Token resolution
  console.log("Test 1: Resolve BTC token");
  const btcToken = await mockTokenService.resolveToken({
    symbol: "BTC",
    network: "BITCOIN",
    showToast: false, // Don't show toast in test
  });
  console.log("Token:", btcToken);
  console.log("✅ Test 1 passed\n");

  // Test 2: Create pledge
  console.log("Test 2: Create pledge");
  const pledgeDto: CreatePledgeDto = {
    otcTransactionHash: "robinhood:test-123-abc",
    inputToken: 1,
    inputAmount: "50000000",
    destinationOrgId: "fund-123",
    status: PledgeStatus.PendingLiquidation,
  } as CreatePledgeDto;

  const pledge = await mockPledgeService.createPledge(pledgeDto, false);
  console.log("Pledge ID:", pledge.id);
  console.log("✅ Test 2 passed\n");

  // Test 3: Notification
  console.log("Test 3: Send notification");
  await mockNotificationService.notifyCryptoPledgeCreated(pledge, false);
  console.log("✅ Test 3 passed\n");

  console.log("🎉 All mock service tests passed!");
}

testMocks().catch(console.error);
```

**Validation**:

```bash
npx ts-node lib/backend-mock/__test-mocks.ts
```

**Expected Output**:

```
Testing Mock Services...

Test 1: Resolve BTC token
Token: { id: 1, symbol: 'BTC', name: 'Bitcoin', ... }
✅ Test 1 passed

Test 2: Create pledge
Pledge ID: <uuid>
✅ Test 2 passed

Test 3: Send notification
✅ Test 3 passed

🎉 All mock service tests passed!
```

**Cleanup**:

```bash
rm lib/backend-mock/__test-mocks.ts
```

## Deliverables Checklist

- [ ] Directory `lib/backend-mock/` created
- [ ] `types.ts` with backend entity definitions
- [ ] `toast-logger.ts` with visual feedback utilities
- [ ] `mock-token.service.ts` simulating token resolution
- [ ] `mock-pledge.service.ts` simulating pledge creation
- [ ] `mock-notification.service.ts` simulating Discord notifications
- [ ] `index.ts` with exports
- [ ] UUID package installed
- [ ] All mocks client-side safe
- [ ] All TypeScript compiles
- [ ] Mock tests pass

## Validation Steps

### Validation 1: Imports Work

```bash
npx ts-node -e "import { mockTokenService, mockPledgeService } from './lib/backend-mock'; console.log('✅ Mock imports work');"
```

**Expected**: "✅ Mock imports work"

### Validation 2: Client-Side Safety

Check that all toast functions are wrapped with `'use client'` directive and `isClient` checks

**Expected**: No SSR errors when importing

### Validation 3: TypeScript

```bash
npx tsc --noEmit
```

**Expected**: No errors

## Common Issues and Solutions

### Issue 1: Toast Not Showing in Browser

**Symptom**: Toast functions called but nothing appears

**Solution**:

- Ensure Sonner Toaster is in layout
- Check `'use client'` directive is present
- Verify `safeToast` wrapper is used

### Issue 2: UUID Import Error

**Symptom**: Cannot find module 'uuid'

**Solution**:

- Run `npm install uuid @types/uuid`
- Check import syntax: `import { v4 as uuidv4 } from 'uuid';`

### Issue 3: SSR Hydration Errors

**Symptom**: Hydration mismatch errors

**Solution**:

- Use `isClient` check before calling toast functions
- Wrap all toast calls in `safeToast()`
- Ensure components using mocks are client components

## Integration Points

### What This Provides

- Visual demonstration of backend integration
- Mock services with realistic behavior
- Toast-based API call logging
- Backend entity type definitions

### What Depends On This

- **SP7**: Pledge service will use these mocks
- **SP10**: Integration demo will showcase toasts
- **SP11**: API routes may use mocks for demo

### What It Requires

- **SP2**: DTOs for type safety
- Sonner toast library (already installed)
- Client-side execution environment

## Next Steps

After completing this sub-plan:

1. **Verify** all deliverables checked off
2. **Create** implementation log: `YYYYMMDD-HHMM-SP3-COMPLETE.md`
3. **Test** toasts in browser manually
4. **Proceed to** [Sub-Plan 4: Robinhood Client Service](./sub-plan-4-robinhood-client-service.md)

## Notes

- All mocks are client-side only - safe for Next.js SSR
- Toast demonstrations last 8-12 seconds for readability
- BACKEND_TOKEN_MAP has 4 common tokens - extend as needed
- Mock services return realistic data structures
- All SQL queries shown are actual PostgreSQL syntax
- Object parameter pattern used consistently


