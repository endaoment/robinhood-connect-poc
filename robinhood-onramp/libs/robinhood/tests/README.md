# Test Infrastructure

This directory contains the test infrastructure and test suites for the Robinhood Connect integration.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Directory Structure

```
__tests__/
├── README.md                    # This file
├── setup.ts                     # Jest configuration and global setup
├── infrastructure.test.ts       # Infrastructure validation tests
├── mocks/                       # Test mocks and helpers
│   └── robinhood-nock-api.ts   # Nock helpers for Robinhood API
└── services/                    # Service tests (SP9)
    ├── robinhood-client.service.test.ts
    ├── asset-registry.service.test.ts
    ├── url-builder.service.test.ts
    └── pledge.service.test.ts
```

## Test Infrastructure Components

### Jest Configuration (`jest.config.ts`)

- **Preset**: `ts-jest` for TypeScript support
- **Test Environment**: Node.js
- **Module Mapping**: `@/*` aliases to workspace root
- **Coverage**: 80% target (set to 70% during SP8, will increase in SP9)
- **Timeout**: 10 seconds for API calls

### Setup File (`setup.ts`)

Runs before each test suite:

- Sets environment variables for testing
- Cleans nock mocks before/after each test
- Configures global timeout

### Nock Helpers (`mocks/robinhood-nock-api.ts`)

Utilities for mocking Robinhood API calls:

**Available Helpers**:

- `mockConnectIdSuccess(connectId?)` - Mock successful ConnectId generation
- `mockConnectIdFailure(statusCode?, message?)` - Mock ConnectId failure
- `mockDiscoverySuccess(assets?)` - Mock successful Discovery API call
- `mockDiscoveryFailure(statusCode?, message?)` - Mock Discovery failure
- `mockTimeout(endpoint, method?)` - Mock network timeout
- `createMockAsset(overrides?)` - Create a single mock asset
- `createMockAssets(count?)` - Create multiple mock assets
- `cleanAll()` - Clean all nock interceptors
- `restore()` - Restore HTTP interceptors
- `isDone()` - Check if all mocks were used
- `pendingMocks()` - Get list of unused mocks

## Writing Tests

### Basic Test Structure

```typescript
import { mockConnectIdSuccess } from './mocks/robinhood-nock-api'
import { RobinhoodClientService } from '@/lib/robinhood/services/robinhood-client.service'

describe('MyFeature', () => {
  it('should do something', async () => {
    // Arrange: Set up mocks
    mockConnectIdSuccess('test-id-123')
    
    const service = new RobinhoodClientService({
      appId: process.env.ROBINHOOD_APP_ID!,
      apiKey: process.env.ROBINHOOD_API_KEY!,
    })

    // Act: Execute the code
    const result = await service.generateConnectId({
      walletAddress: '0x123',
      userIdentifier: 'test@example.com',
    })

    // Assert: Verify results
    expect(result).toBe('test-id-123')
  })
})
```

### Mocking API Calls

```typescript
import { mockDiscoverySuccess, createMockAssets } from './mocks/robinhood-nock-api'

it('should fetch assets', async () => {
  const mockAssets = createMockAssets(3)
  mockDiscoverySuccess(mockAssets)

  const service = new RobinhoodClientService({
    appId: process.env.ROBINHOOD_APP_ID!,
    apiKey: process.env.ROBINHOOD_API_KEY!,
  })

  const result = await service.fetchTradingAssets()
  
  expect(result).toHaveLength(3)
  expect(result[0].asset_code).toBe('BTC')
})
```

### Testing Error Handling

```typescript
import { mockConnectIdFailure } from './mocks/robinhood-nock-api'

it('should handle API errors', async () => {
  mockConnectIdFailure(500, 'Internal Server Error')

  const service = new RobinhoodClientService({
    appId: process.env.ROBINHOOD_APP_ID!,
    apiKey: process.env.ROBINHOOD_API_KEY!,
  })

  await expect(
    service.generateConnectId({
      walletAddress: '0x123',
      userIdentifier: 'test@example.com',
    })
  ).rejects.toThrow()
})
```

### Testing Retry Logic

```typescript
import nock from 'nock'

it('should retry on failure', async () => {
  // First call fails
  nock('https://trading.robinhood.com')
    .post('/catpay/v1/connect_id/')
    .reply(500)
  
  // Second call succeeds
  nock('https://trading.robinhood.com')
    .post('/catpay/v1/connect_id/')
    .reply(200, { connect_id: 'test-id' })

  const service = new RobinhoodClientService({
    appId: process.env.ROBINHOOD_APP_ID!,
    apiKey: process.env.ROBINHOOD_API_KEY!,
  })

  const result = await service.generateConnectId({
    walletAddress: '0x123',
    userIdentifier: 'test@example.com',
  })

  expect(result).toBe('test-id')
})
```

## Environment Variables

The following environment variables are set automatically in tests (see `setup.ts`):

- `ROBINHOOD_APP_ID` - Test application ID
- `ROBINHOOD_API_KEY` - Test API key
- `DEFAULT_FUND_ID` - Test fund ID

## Coverage Requirements

Current thresholds (set in `jest.config.ts`):

- **Branches**: 40% (target: 80% in SP9)
- **Functions**: 70% (target: 80% in SP9)
- **Lines**: 70% (target: 80% in SP9)
- **Statements**: 70% (target: 80% in SP9)

Files excluded from coverage:

- `*.d.ts` - TypeScript declaration files
- `__test*.ts` - Test files
- `index.ts` - Barrel export files
- `types.ts` - Type-only files

## Best Practices

### 1. Clean Mocks

Always clean nock mocks after tests:

```typescript
afterEach(() => {
  cleanAll()
})
```

This is done globally in `setup.ts` but can be added per-suite if needed.

### 2. Use Descriptive Test Names

```typescript
// Good ✅
it('should generate ConnectId with valid wallet address', () => {})

// Bad ❌
it('should work', () => {})
```

### 3. Test Both Success and Failure

```typescript
describe('generateConnectId', () => {
  it('should return ConnectId on success', async () => {
    // Test happy path
  })

  it('should throw error on API failure', async () => {
    // Test error handling
  })

  it('should retry on network timeout', async () => {
    // Test retry logic
  })
})
```

### 4. Use Helpers for Common Setup

```typescript
// Create a helper function
function createTestService() {
  return new RobinhoodClientService({
    appId: process.env.ROBINHOOD_APP_ID!,
    apiKey: process.env.ROBINHOOD_API_KEY!,
  })
}

// Use in tests
it('should do something', async () => {
  const service = createTestService()
  // ...
})
```

### 5. Verify All Mocks Are Used

```typescript
import { isDone, pendingMocks } from './mocks/robinhood-nock-api'

it('should call all APIs', async () => {
  mockConnectIdSuccess()
  mockDiscoverySuccess()

  // Execute code that should call both APIs
  await service.doSomething()

  // Verify all mocks were used
  expect(isDone()).toBe(true)
  expect(pendingMocks()).toHaveLength(0)
})
```

## Troubleshooting

### Tests Hanging

If tests hang, you might have nock interceptors that weren't used:

```bash
# Check for pending mocks
console.log(pendingMocks())
```

### Module Resolution Errors

If you see "Cannot find module '@/...'", verify:

1. `jest.config.ts` has correct `moduleNameMapper`
2. `tsconfig.json` has matching path aliases

### TypeScript Errors in Tests

Ensure you have all type definitions installed:

```bash
npm install --save-dev @types/jest @types/node @types/nock
```

### Coverage Not Working

Verify `collectCoverageFrom` in `jest.config.ts` includes your files:

```typescript
collectCoverageFrom: [
  'lib/**/*.ts',
  '!lib/**/*.d.ts',
  '!lib/**/index.ts',
]
```

## Next Steps (Sub-Plan 9)

The comprehensive test suite will add:

- `services/robinhood-client.service.test.ts` (500+ lines)
- `services/asset-registry.service.test.ts` (500+ lines)
- `services/url-builder.service.test.ts` (500+ lines)
- `services/pledge.service.test.ts` (500+ lines)

Total target: 2200+ lines matching Coinbase standard

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Nock Documentation](https://github.com/nock/nock)
- [Coinbase Test Pattern](../docs/TESTING_GUIDE.md)

