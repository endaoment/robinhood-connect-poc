# Sub-Plan 8: Test Infrastructure Setup

**Status**: Pending
**Priority**: High
**Dependencies**: Sub-Plans 4-7 (All Services)

## Context Required

**Gold Standard**: Coinbase tests at `libs/api/coinbase/tests/`

- `coinbase-nock-api.ts` - Nock helper patterns

## Objectives

1. Install and configure Jest
2. Install and configure nock
3. Create nock helpers for Robinhood APIs
4. Create test utilities and fixtures
5. Set up test environment
6. Create example test structure

## Implementation

### Step 1: Install Dependencies

```bash
npm install --save-dev jest ts-jest @types/jest nock @types/nock
```

### Step 2: Create jest.config.ts

```typescript
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: ["lib/**/*.ts", "!lib/**/*.d.ts", "!lib/**/__test*.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
```

### Step 3: Create Nock Helpers

**File**: `__tests__/mocks/robinhood-nock-api.ts`

```typescript
import nock from "nock";

const ROBINHOOD_BASE_URL = "https://trading.robinhood.com";

export function mockConnectIdSuccess(
  connectId: string = "test-connect-id-123"
) {
  return nock(ROBINHOOD_BASE_URL)
    .post("/catpay/v1/connect_id/")
    .reply(200, {
      connect_id: connectId,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    });
}

export function mockDiscoverySuccess(assets: any[] = []) {
  return nock(ROBINHOOD_BASE_URL)
    .get("/api/v1/crypto/trading/assets/")
    .reply(200, {
      results: assets,
      count: assets.length,
    });
}

export function cleanAll() {
  nock.cleanAll();
}
```

### Step 4: Create Test Setup

**File**: `__tests__/setup.ts`

```typescript
import { cleanAll } from "./mocks/robinhood-nock-api";

beforeEach(() => {
  cleanAll();
});

afterEach(() => {
  cleanAll();
});
```

## Deliverables

- [ ] Jest configured
- [ ] Nock installed
- [ ] Nock helpers created
- [ ] Test setup file created
- [ ] Example test runs
- [ ] Coverage reporting works

## Next Steps

**Proceed to** [Sub-Plan 9: Comprehensive Test Suite](./sub-plan-9-comprehensive-test-suite.md)
