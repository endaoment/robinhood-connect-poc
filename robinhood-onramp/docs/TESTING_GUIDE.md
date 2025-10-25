# Testing Guide

> Testing approach for Robinhood Connect integration.

## Test Stats

- **Tests**: 183
- **Coverage**: 98%+
- **Framework**: Jest
- **HTTP Mocking**: nock

## Running Tests

```bash
npm test                          # All tests
npm run test:coverage             # With coverage
npm test libs/robinhood           # Specific library
npm test -- --watch               # Watch mode
npm test -- url-builder.spec.ts  # Single file
npm test -- --verbose             # Verbose output
```

## Test Structure

### Organized by Service

```
libs/robinhood/tests/
├── services/
│   ├── robinhood-client.service.spec.ts
│   ├── asset-registry.service.spec.ts
│   ├── url-builder.service.spec.ts
│   └── pledge.service.spec.ts
├── mocks/
│   └── robinhood-nock-api.ts    # HTTP mocking helpers
└── setup.ts                     # Jest configuration
```

### AAA Pattern

All tests follow Arrange-Act-Assert:

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do expected behavior', () => {
      // Arrange
      const input = { ... }
      mockRobinhoodConnectIdSuccess('test-id')

      // Act
      const result = await service.method(input)

      // Assert
      expect(result).toBe(expected)
      expect(nock.isDone()).toBe(true)
    })
  })
})
```

## HTTP Mocking with nock

### Mock Helpers

Reusable mocks in `mocks/robinhood-nock-api.ts`:

```typescript
export function mockRobinhoodConnectIdSuccess(connectId: string) {
  return nock(ROBINHOOD_BASE_URL).post('/catpay/v1/connect_id/').reply(200, {
    connect_id: connectId,
    status: 'active',
  })
}

export function mockRobinhoodConnectIdFailure(statusCode: number) {
  return nock(ROBINHOOD_BASE_URL).post('/catpay/v1/connect_id/').reply(statusCode, { error: 'API Error' })
}
```

### Using Mocks

```typescript
it('should generate connect ID', async () => {
  mockRobinhoodConnectIdSuccess('abc-123')

  const result = await service.generateConnectId(params)

  expect(result).toBe('abc-123')
  expect(nock.isDone()).toBe(true) // Verify mock called
})
```

### Cleanup

```typescript
afterEach(() => {
  nock.cleanAll() // Clear all mocks after each test
})
```

## Service Testing

### RobinhoodClientService

Tests:

- Connect ID generation
- Asset discovery
- Error handling
- Retry logic

### AssetRegistryService

Tests:

- Asset initialization
- Asset lookup by code
- Asset lookup by chain
- Asset filtering
- Invalid asset handling

### UrlBuilderService

Tests:

- URL generation
- Asset validation
- Network validation
- Redirect URL building
- Parameter encoding

### PledgeService

Tests:

- Callback processing
- Pledge creation
- Field mapping
- Amount conversion
- Error handling

## Manual Testing

### Without API Credentials

Test UI and client logic:

```bash
npm run dev
# Visit http://localhost:3030
```

- Dashboard loads
- Asset selection works
- URL generation works
- Note: API calls will fail (expected)

### With API Credentials

Complete end-to-end testing:

1. Add credentials to `.env.local`
2. Start dev server
3. Select asset on dashboard
4. Generate URL
5. Complete transfer in Robinhood
6. Verify callback handling

## Browser Testing

### Chrome DevTools

1. Open DevTools (F12)
2. Network tab for API calls
3. Console for errors
4. Application tab for localStorage

### Testing Flows

**Asset Selection**:

1. Visit `/dashboard`
2. Search for asset
3. Select asset
4. Verify wallet address displayed
5. Click "Initiate Transfer"

**Callback Handling**:

1. Complete Robinhood transfer
2. Verify redirect to `/callback`
3. Check query parameters
4. Verify success message

## Coverage Goals

Target: 80%+ on all metrics

Current:

- RobinhoodClientService: 98%+
- AssetRegistryService: 98%+
- UrlBuilderService: 99%+
- PledgeService: 97%+

## Test Configuration

```javascript
// jest.config.ts
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

## Common Issues

**nock mocks not cleaning**:

```typescript
afterEach(() => nock.cleanAll())
```

**Async test timeout**:

```typescript
it('should do async work', async () => {
  // ...
}, 10000) // 10 second timeout
```

**TypeScript errors**:

```bash
npx tsc --noEmit
```

## Writing New Tests

1. Create `.spec.ts` file next to service
2. Import service and mocks
3. Setup describe blocks
4. Write tests using AAA pattern
5. Mock external dependencies
6. Verify coverage: `npm run test:coverage`

Example:

```typescript
import { YourService } from './your.service'
import { mockHelper } from '../mocks/robinhood-nock-api'

describe('YourService', () => {
  let service: YourService

  beforeEach(() => {
    service = new YourService()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('yourMethod', () => {
    it('should work correctly', async () => {
      // Arrange
      mockHelper('expected-result')

      // Act
      const result = await service.yourMethod(input)

      // Assert
      expect(result).toBe('expected-result')
      expect(nock.isDone()).toBe(true)
    })
  })
})
```

## Documentation

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
