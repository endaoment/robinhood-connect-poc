# Robinhood Connect Testing Guide

Comprehensive testing documentation for the Robinhood Connect integration.

---

## Table of Contents

1. [Test Overview](#test-overview)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Service Testing](#service-testing)
5. [HTTP Mocking with nock](#http-mocking-with-nock)
6. [Manual Testing](#manual-testing)
7. [Browser Testing](#browser-testing)

---

## Test Overview

### Test Stats

- **Total Tests**: 183
- **Test Lines**: 3,044 lines
- **Coverage**: 98%+ (target: 80%+)
- **Framework**: Jest 29+
- **HTTP Mocking**: nock
- **Pattern**: AAA (Arrange-Act-Assert)

### Test Location

```
libs/robinhood/tests/
├── services/                       # Service tests
│   ├── robinhood-client.service.spec.ts    (500+ lines)
│   ├── asset-registry.service.spec.ts      (800+ lines)
│   ├── url-builder.service.spec.ts         (600+ lines)
│   └── pledge.service.spec.ts              (500+ lines)
├── mocks/
│   └── robinhood-nock-api.ts               (600+ lines, nock helpers)
└── setup.ts                                 (50 lines, Jest config)
```

### Coverage by Service

| Service | Lines | Branches | Functions | Status |
|---------|-------|----------|-----------|--------|
| RobinhoodClientService | 98%+ | 95%+ | 100% | ✅ |
| AssetRegistryService | 98%+ | 90%+ | 100% | ✅ |
| UrlBuilderService | 99%+ | 95%+ | 100% | ✅ |
| PledgeService | 97%+ | 90%+ | 100% | ✅ |

---

## Running Tests

### All Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

### Specific Library

```bash
# Test Robinhood library only
npm test libs/robinhood

# Test specific service
npm test -- url-builder.service.spec.ts

# Verbose output
npm test -- --verbose
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

**Expected Output**:

```
Test Suites: 4 passed, 4 total
Tests:       183 passed, 183 total
Snapshots:   0 total
Time:        12.5s

Coverage summary:
  Statements: 98.5% (450/457)
  Branches: 92.3% (120/130)
  Functions: 100% (85/85)
  Lines: 98.7% (440/446)
```

---

## Test Structure

### Jest Configuration

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/libs'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'libs/**/src/**/*.ts',
    '!libs/**/src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Test Setup

```typescript
// libs/robinhood/tests/setup.ts
import 'reflect-metadata';

// Global test configuration
beforeAll(() => {
  // Setup
});

afterEach(() => {
  // Cleanup after each test
  jest.clearAllMocks();
});
```

---

## Service Testing

### AAA Pattern (Arrange-Act-Assert)

All tests follow the AAA pattern:

```typescript
describe('UrlBuilderService', () => {
  describe('generateUrl', () => {
    it('should generate valid onramp URL', async () => {
      // Arrange - Set up test data and mocks
      const dto: GenerateUrlDto = {
        asset: 'ETH',
        network: 'ETHEREUM',
        amount: 1.0,
        userIdentifier: 'user@example.com',
        walletAddress: '0x...',
        destinationFundId: 'fund-123'
      };
      
      const mockConnectId = 'test-connect-id-123';
      mockRobinhoodConnectIdSuccess(mockConnectId);
      
      // Act - Execute the function being tested
      const result = await service.generateUrl(dto);
      
      // Assert - Verify the results
      expect(result.url).toContain('connectId=test-connect-id-123');
      expect(result.url).toContain('supportedAssets=ETH');
      expect(result.url).toContain('supportedNetworks=ETHEREUM');
      expect(result.connectId).toBe(mockConnectId);
      expect(nock.isDone()).toBe(true); // Verify all mocks called
    });
  });
});
```

### Testing Error Handling

```typescript
it('should handle API errors gracefully', async () => {
  // Arrange
  const dto = { ... };
  mockRobinhoodConnectIdError(404, 'Not found');
  
  // Act & Assert
  await expect(service.generateUrl(dto))
    .rejects
    .toThrow('Failed to generate connect ID');
  
  expect(nock.isDone()).toBe(true);
});
```

### Testing Edge Cases

```typescript
it('should handle missing optional parameters', async () => {
  const dto = {
    asset: 'ETH',
    network: 'ETHEREUM',
    // No destinationFundId
  };
  
  const result = await service.generateUrl(dto);
  
  expect(result.url).toBeDefined();
  // Verify default behavior
});
```

---

## HTTP Mocking with nock

### nock Helpers

```typescript
// libs/robinhood/tests/mocks/robinhood-nock-api.ts

export function mockRobinhoodConnectIdSuccess(connectId: string) {
  return nock(ROBINHOOD_BASE_URL)
    .post('/catpay/v1/connect_id/')
    .reply(200, {
      connect_id: connectId,
      status: 'active'
    });
}

export function mockRobinhoodConnectIdError(status: number, message: string) {
  return nock(ROBINHOOD_BASE_URL)
    .post('/catpay/v1/connect_id/')
    .reply(status, { error: message });
}

export function mockRobinhoodAssetsSuccess(assets: RobinhoodAsset[]) {
  return nock(ROBINHOOD_BASE_URL)
    .get('/discovery/v1/currency_pairs/')
    .reply(200, { results: assets });
}
```

### Using nock in Tests

```typescript
import {
  mockRobinhoodConnectIdSuccess,
  mockRobinhoodAssetsSuccess
} from '../mocks/robinhood-nock-api';

it('should fetch assets and generate URL', async () => {
  // Mock multiple API calls
  const mockAssets = [
    { asset_code: 'BTC', name: 'Bitcoin', is_active: true },
    { asset_code: 'ETH', name: 'Ethereum', is_active: true }
  ];
  
  mockRobinhoodAssetsSuccess(mockAssets);
  mockRobinhoodConnectIdSuccess('test-id-123');
  
  // Execute test
  const result = await service.performComplexOperation();
  
  // Verify all mocks were called
  expect(nock.isDone()).toBe(true);
});
```

### Cleaning Up nock

```typescript
afterEach(() => {
  // Clear all nock mocks
  nock.cleanAll();
});

afterAll(() => {
  // Restore HTTP
  nock.restore();
});
```

---

## Manual Testing

### Prerequisites

- Development server running (`npm run dev`)
- Valid Robinhood API credentials in `.env.local`
- ngrok for callback testing (recommended)

### Test 1: Complete Transfer Flow

**Steps**:

1. Visit `http://localhost:3030/dashboard`
2. Search for an asset (e.g., "ETH")
3. Select the asset
4. Review wallet address displayed
5. Click "Initiate Transfer with Robinhood"
6. Verify redirect to Robinhood
7. Complete transfer in Robinhood (sandbox mode)
8. Verify redirect back to `/callback`
9. Verify success message with transfer details
10. Return to dashboard and see success toast

**Expected Results**:

- ✅ Asset search filters correctly
- ✅ Asset selection works
- ✅ Wallet address displays
- ✅ URL generated without errors
- ✅ Robinhood shows pre-selected asset
- ✅ Callback receives all parameters
- ✅ Success message shows correct details

### Test 2: API Endpoint Testing

```bash
# Test URL generation
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "asset": "ETH",
    "network": "ETHEREUM",
    "amount": "1.0",
    "userIdentifier": "user@example.com",
    "walletAddress": "0x...",
    "destinationFundId": "fund-123",
    "redirectUrl": "http://localhost:3030/callback"
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "url": "https://robinhood.com/connect/amount?...",
  "connectId": "abc-123-..."
}
```

**Verify URL Parameters**:
- ✅ `applicationId` present
- ✅ `connectId` present (UUID format)
- ✅ `supportedAssets=ETH`
- ✅ `supportedNetworks=ETHEREUM`
- ✅ `walletAddress` present
- ✅ `paymentMethod=crypto_balance`
- ✅ `flow=transfer`
- ✅ `redirectUrl` URL-encoded

### Test 3: Error Handling

```bash
# Test invalid asset
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "asset": "INVALID",
    "network": "ETHEREUM"
  }'
```

**Expected**: 400 error with validation message

```bash
# Test missing parameters
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected**: 400 error about missing required fields

### Test 4: Callback Parameters

Manually navigate to callback URL:

```
http://localhost:3030/callback?asset=ETH&network=ETHEREUM&connectId=abc-123&amount=1.0&orderId=ORDER123&userId=user-456
```

**Verify**:
- ✅ Success message displays
- ✅ Asset name correct (Ethereum)
- ✅ Network correct (ETHEREUM)
- ✅ Amount displayed
- ✅ Order ID shown
- ✅ Can navigate back to dashboard

---

## Browser Testing

### Desktop Browsers

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)

### Mobile Browsers

Test in:
- [ ] iOS Safari
- [ ] Chrome Mobile (Android)
- [ ] Chrome Mobile (iOS)

### Mobile-Specific Tests

- [ ] Search input works with mobile keyboard
- [ ] Asset selection easy to tap
- [ ] Transfer button easy to tap
- [ ] Robinhood app opens (if installed)
- [ ] Callback works returning from app
- [ ] Success toast readable and dismissible

---

## Test Development Workflow

### Adding New Tests

1. **Create Test File**:

```typescript
// libs/robinhood/tests/services/my-service.service.spec.ts
import { MyService } from '../../src/lib/services/my-service.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService(mockDependencies);
  });

  describe('myMethod', () => {
    it('should do something', async () => {
      // Arrange
      const input = { ... };
      
      // Act
      const result = await service.myMethod(input);
      
      // Assert
      expect(result).toEqual(expected);
    });
  });
});
```

2. **Run Tests**:

```bash
npm test -- my-service.service.spec.ts --watch
```

3. **Check Coverage**:

```bash
npm run test:coverage -- --collectCoverageFrom='**/my-service.service.ts'
```

4. **Aim for 80%+ Coverage**:
- Test happy path
- Test error cases
- Test edge cases
- Test parameter validation

### Test-Driven Development (TDD)

1. Write failing test first
2. Implement minimal code to pass
3. Refactor
4. Repeat

Example:

```typescript
// 1. Write test (fails)
it('should validate asset/network compatibility', () => {
  expect(service.isCompatible('BTC', 'ETHEREUM')).toBe(false);
});

// 2. Implement (passes)
isCompatible(asset: string, network: string): boolean {
  return this.getValidNetworks(asset).includes(network);
}

// 3. Refactor if needed

// 4. Add more test cases
```

---

## Debugging Tests

### Enable Verbose Output

```bash
npm test -- --verbose
```

### Debug Specific Test

```bash
npm test -- --testNamePattern="should generate valid URL"
```

### View nock Interceptors

```typescript
import nock from 'nock';

// See pending interceptors
console.log(nock.pendingMocks());

// See active interceptors
console.log(nock.activeMocks());
```

### Common Issues

**Issue**: `nock.isDone()` is false

**Solution**: Check that all mocked URLs were actually called

```typescript
afterEach(() => {
  if (!nock.isDone()) {
    console.log('Pending mocks:', nock.pendingMocks());
  }
  nock.cleanAll();
});
```

**Issue**: Test timeout

**Solution**: Increase timeout or check for unresolved promises

```typescript
it('should complete', async () => {
  // Increase timeout for this test
  jest.setTimeout(10000);
  
  await service.longRunningOperation();
}, 10000); // Or set timeout here
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development setup
- [FLOW-DIAGRAMS.md](./FLOW-DIAGRAMS.md) - Visual flows
- [MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md) - Backend integration

---

**Last Updated**: October 25, 2025  
**Version**: v1.0.0 (Backend-Aligned)  
**Test Count**: 183 tests passing ✅  
**Coverage**: 98%+ ✅
