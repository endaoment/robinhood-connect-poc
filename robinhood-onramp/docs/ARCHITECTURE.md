# Robinhood Connect Architecture

> **🎯 This POC follows a clean Frontend/Backend separation pattern, aligned with endaoment-backend standards.**  
> See [../STRUCTURE.md](../STRUCTURE.md) for complete directory organization.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Architecture Diagram](#system-architecture-diagram)
3. [Service Layer](#service-layer)
4. [DTO Validation Layer](#dto-validation-layer)
5. [Mock Backend Integration](#mock-backend-integration)
6. [Testing Infrastructure](#testing-infrastructure)
7. [Migration Path to Backend](#migration-path-to-backend)
8. [Data Flow](#data-flow)
9. [Architectural Decisions](#architectural-decisions)
10. [Security Considerations](#security-considerations)

---

## Architecture Overview

This integration uses a **dual-layer architecture** designed for seamless backend migration:

1. **Frontend Layer** (`app/`) - Next.js application for POC demonstration
2. **Backend Layer** (`libs/`) - Complete NestJS modules ready for production

### Why Two Layers?

**In POC**:

- `app/api/robinhood/` demonstrates the integration with Next.js routes
- `libs/robinhood/` contains the complete backend-ready code
- Frontend calls `libs/` services directly (thin API route wrappers)

**In Production** (endaoment-backend):

- `app/api/robinhood/` is deleted (Next.js specific)
- `libs/robinhood/` is copied to `endaoment-backend/libs/api/robinhood/`
- NestJS controller handles HTTP endpoints
- Everything else (services, DTOs, tests) works unchanged

**Migration Time**: ~2 hours (see [MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md))

---

## System Architecture Diagram

```
┌─────────────────────────────────────────┐
│          Next.js Frontend               │
│  (Dashboard, Callback Pages)            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        API Routes (Next.js)             │
│  - /api/robinhood/health                │
│  - /api/robinhood/assets                │
│  - /api/robinhood/generate-onramp-url   │
└────────────────┬────────────────────────┘
                 │ (thin wrappers)
┌────────────────▼────────────────────────┐
│      libs/robinhood Library             │
│    (Backend-ready structure)            │
│  ┌────────────────────────────────┐    │
│  │ src/lib/services/              │    │
│  │  - RobinhoodClientService      │    │
│  │  - AssetRegistryService        │    │
│  │  - UrlBuilderService           │    │
│  │  - PledgeService               │    │
│  │  - AssetDiscoveryService       │    │
│  │  - EvmAssetService             │    │
│  │  - NonEvmAssetService          │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │ src/lib/dtos/                  │    │
│  │  - GenerateUrlDto              │    │
│  │  - RobinhoodCallbackDto        │    │
│  │  - CreatePledgeDto             │    │
│  │  - AssetDto                    │    │
│  └────────────────────────────────┘    │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│ libs/coinbase│  │ libs/shared      │
│              │  │                  │
│ Prime API    │  │ Mock Services    │
│ Services     │  │ Utils            │
└──────────────┘  └──────────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ Toast Logger│
                  │ (POC demo)  │
                  └─────────────┘
```

---

## Service Layer

### Architecture Pattern

All business logic is extracted into **injectable service classes** following NestJS patterns:

```typescript
@Injectable()
export class RobinhoodClientService {
  constructor(private readonly configService: ConfigService) {}

  async generateConnectId({
    walletAddress,
    userIdentifier,
  }: GenerateConnectIdParams): Promise<string> {
    // Implementation with error handling, retry logic
  }
}
```

### Core Services

#### 1. RobinhoodClientService

**Purpose**: Direct communication with Robinhood Connect API

**Key Methods**:
- `generateConnectId()` - Create valid connect ID for transfers
- `fetchAssets()` - Retrieve supported assets from Robinhood
- HTTP client with retry logic and error handling

**Object Parameter Pattern**: All methods with 3+ parameters use object params for readability

#### 2. AssetRegistryService

**Purpose**: Asset discovery, metadata management, and Prime address integration

**Key Methods**:
- `initialize()` - Build complete asset registry (singleton)
- `getAssets()` - Return all supported assets with metadata
- `getAssetBySymbol()` - Find specific asset by symbol
- `isAssetNetworkCompatible()` - Validate asset/network combinations

**Pattern**: Singleton service with lazy initialization and caching

#### 3. UrlBuilderService

**Purpose**: Generate Robinhood Connect URLs with proper encoding and parameters

**Key Methods**:
- `generateUrl()` - Create complete onramp URL
- `buildRedirectUrl()` - Construct callback URL with transfer metadata
- Proper URL encoding and parameter validation

**Critical**: Uses correct base URL (`https://robinhood.com/connect/amount`)

#### 4. PledgeService

**Purpose**: Map Robinhood callback data to CryptoDonationPledge format

**Key Methods**:
- `createPledge()` - Convert callback data to pledge entity
- `mapCallbackToPledge()` - Field mapping logic
- Amount conversion to smallest units

**Backend Integration**: Mocks replaced with real services during migration

#### 5. AssetDiscoveryService

**Purpose**: Discover and process assets from Robinhood API

**Responsibilities**:
- Fetch assets from Robinhood Discovery API
- Filter enabled assets
- Merge with Prime addresses
- Asset metadata enrichment

#### 6. EvmAssetService & NonEvmAssetService

**Purpose**: Specialized asset processing for different blockchain types

**EvmAssetService**:
- ERC-20 token handling
- Contract address validation
- EVM chain compatibility

**NonEvmAssetService**:
- Native blockchain assets (BTC, SOL, etc.)
- Memo/tag handling (XRP, Stellar)
- Non-EVM chain specifics

### Error Handling Strategy

All services implement:

```typescript
try {
  // Business logic
} catch (error) {
  this.logger.error(`Operation failed: ${error.message}`, error.stack);
  throw new CustomErrorType(`User-friendly message: ${error.message}`);
}
```

**Custom Error Classes**:
- `RobinhoodApiError` - API communication failures
- `AssetNotFoundError` - Asset lookup failures
- `ValidationError` - Input validation failures

### Retry Logic

Network calls implement exponential backoff:

```typescript
async fetchWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  const maxRetries = 3;
  const baseDelay = 1000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(baseDelay * Math.pow(2, i));
    }
  }
}
```

### Logging Strategy

All services use structured logging:

```typescript
this.logger.log('Operation started', { context, metadata });
this.logger.error('Operation failed', error.stack);
this.logger.warn('Unusual condition detected', { details });
```

---

## DTO Validation Layer

### Why DTOs?

All API inputs are validated using **class-validator decorators** for:
- Type safety
- Automatic validation
- Self-documenting APIs
- Error message consistency

### DTO Pattern

```typescript
export class GenerateUrlDto {
  @IsString()
  @IsNotEmpty()
  asset: string;

  @IsString()
  @IsNotEmpty()
  network: string;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsString()
  @IsNotEmpty()
  userIdentifier: string;

  @IsString()
  @IsOptional()
  destinationFundId?: string;
}
```

### Transform Decorators

Used for type coercion and normalization:

```typescript
@Transform(({ value }) => parseFloat(value))  // String → Number
@Transform(({ value }) => value.toUpperCase()) // Normalize case
@Transform(({ value }) => value.trim())        // Clean whitespace
```

### Validation Helper

Centralized validation with consistent error handling:

```typescript
export async function validateDto<T extends object>(
  DtoClass: ClassConstructor<T>,
  data: unknown
): Promise<T> {
  const dto = plainToClass(DtoClass, data);
  const errors = await validate(dto);
  
  if (errors.length > 0) {
    throw new ValidationError(formatErrors(errors));
  }
  
  return dto;
}
```

### Error Response Format

Validation errors return structured responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "property": "amount",
      "constraints": {
        "isPositive": "amount must be a positive number"
      }
    }
  ]
}
```

### All DTOs

1. **GenerateUrlDto** - URL generation parameters
2. **RobinhoodCallbackDto** - Callback data validation  
3. **CreatePledgeDto** - Pledge creation data
4. **AssetDto** - Asset information structure

---

## Mock Backend Integration

### Why Mocks?

The POC demonstrates backend integration **without requiring actual backend access** by:
- Mocking service dependencies (TokenService, NotificationService)
- Showing expected API calls via toast notifications
- Demonstrating data flow end-to-end

### Toast Demonstration Approach

All backend API calls are demonstrated with detailed toasts:

```typescript
showToast({
  type: 'backend-api',
  method: 'POST',
  endpoint: '/v1/robinhood/pledge/create',
  headers: { /* ... */ },
  body: { /* actual request data */ },
  expectedResponse: { /* what backend would return */ }
});
```

**User Experience**: Visual feedback showing what would happen in production

### Mock Services

#### 1. MockTokenService

**Simulates**: `libs/api/tokens` from endaoment-backend

```typescript
async resolveToken(asset: string, network: string): Promise<Token> {
  // Simulates database lookup
  showToast({ endpoint: 'GET /v1/tokens/resolve', ... });
  return mockTokenData;
}
```

**Backend Mapping**: Shows exact TokenService API call

#### 2. MockPledgeService  

**Simulates**: Repository<CryptoDonationPledge> operations

```typescript
async createPledge(pledgeData: CreatePledgeDto): Promise<Pledge> {
  // Simulates database insert
  showToast({ endpoint: 'POST /v1/pledges', ... });
  return mockPledge;
}
```

**Backend Mapping**: Maps to CryptoDonationPledge entity

#### 3. MockNotificationService

**Simulates**: `libs/api/notifications` from endaoment-backend

```typescript
async sendPledgeConfirmation(pledgeId: string): Promise<void> {
  showToast({ endpoint: 'POST /v1/notifications/send', ... });
}
```

**Backend Mapping**: Shows notification service integration

### CryptoDonationPledge Mapping

Complete field mapping from Robinhood callback to entity:

```typescript
{
  otcTransactionHash: `robinhood:${connectId}`,
  pledgerUserId: userId,
  inputToken: resolvedToken,           // From TokenService
  inputAmount: convertToSmallestUnit(amount, decimals),
  destinationOrgId: fundId,
  status: PledgeStatus.PendingLiquidation,
  centralizedExchangeDonationStatus: 'Completed',
  centralizedExchangeTransactionId: orderId
}
```

---

## Testing Infrastructure

### Testing Stack

- **Framework**: Jest 29+
- **HTTP Mocking**: nock  
- **Coverage**: 98%+ achieved (target: 80%+)
- **Test Count**: 183 tests across all services

### Jest Configuration

```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/libs'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: ['libs/**/src/**/*.ts'],
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

### Nock Helper Patterns

Reusable HTTP mocking for Robinhood API:

```typescript
export function mockRobinhoodConnectIdSuccess(connectId: string) {
  return nock(ROBINHOOD_BASE_URL)
    .post('/catpay/v1/connect_id/')
    .reply(200, {
      connect_id: connectId,
      status: 'active'
    });
}
```

**Pattern**: Match Coinbase nock helpers exactly

### Test Structure (AAA Pattern)

All tests follow Arrange-Act-Assert:

```typescript
describe('RobinhoodClientService', () => {
  describe('generateConnectId', () => {
    it('should generate valid connect ID', async () => {
      // Arrange
      const params = { walletAddress: '0x...', userIdentifier: 'user123' };
      mockRobinhoodConnectIdSuccess('abc-123');
      
      // Act
      const connectId = await service.generateConnectId(params);
      
      // Assert
      expect(connectId).toBe('abc-123');
      expect(nock.isDone()).toBe(true);
    });
  });
});
```

### Test Coverage Goals

| Service | Lines | Branches | Functions | Status |
|---------|-------|----------|-----------|--------|
| RobinhoodClientService | 98%+ | 95%+ | 100% | ✅ |
| AssetRegistryService | 98%+ | 90%+ | 100% | ✅ |
| UrlBuilderService | 99%+ | 95%+ | 100% | ✅ |
| PledgeService | 97%+ | 90%+ | 100% | ✅ |

### Integration Tests

Full flow testing with nock:

```typescript
it('should generate URL end-to-end', async () => {
  // Mock all external dependencies
  mockRobinhoodConnectIdSuccess('abc-123');
  mockPrimeAddresses();
  
  // Execute complete flow
  const result = await urlBuilderService.generateUrl(dto);
  
  // Verify all calls made
  expect(result.url).toContain('connectId=abc-123');
  expect(nock.isDone()).toBe(true);
});
```

---

## Migration Path to Backend

### Overview

**Migration Time**: 2-3 hours  
**Complexity**: Low  
**Risk**: Low (all code tested and validated)

See [MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md) for complete step-by-step instructions.

### File Mapping Approach

POC structure → Backend structure (direct copy):

```bash
# Copy entire library
cp -r robinhood-onramp/libs/robinhood \
      endaoment-backend/libs/api/robinhood
```

### What Gets Migrated

**✅ Copy As-Is** (40+ files):
- All services (`services/*.ts`)
- All DTOs (`dtos/*.ts`)
- All constants (`constants/*.ts`)
- All tests (`tests/**/*.spec.ts`)
- Module (`robinhood.module.ts`)
- Controller (`robinhood.controller.ts`)

**⚠️ Minor Updates** (3 files):
- `robinhood.module.ts` - Uncomment decorators, add imports
- `robinhood.controller.ts` - Uncomment decorators
- `pledge.service.ts` - Replace mock services with real ones

**❌ Do Not Copy**:
- `app/` directory (Next.js frontend)
- `libs/shared/.../backend-mock/` (toast logger)
- `scripts/` directory (POC helpers)

### NestJS Conversion Steps

#### Step 1: Module Setup (10 min)

```typescript
// Before (POC)
// @Module({ ... })  // Commented out
export class RobinhoodModule {}

// After (Backend) - Just uncomment + add 3 lines
@Module({
  imports: [
    TypeOrmModule.forFeature([CryptoDonationPledge]),  // ADD
    TokensModule,                                       // ADD
    NotificationModule,                                 // ADD
  ],
  controllers: [RobinhoodController],
  providers: [...],
})
export class RobinhoodModule {}
```

#### Step 2: Service Wiring (30 min)

Replace mock services with real backend services:

```typescript
// POC
constructor(
  private readonly mockTokenService: MockTokenService,
) {}

// Backend
constructor(
  @InjectRepository(CryptoDonationPledge)
  private readonly pledgeRepo: Repository<CryptoDonationPledge>,
  private readonly tokenService: TokenService,
) {}
```

#### Step 3: Backend Service Integration

Remove toast logger calls, use real services:

```typescript
// POC
const token = await this.mockTokenService.resolve(asset, network);
showToast({ /* demo */ });

// Backend
const token = await this.tokenService.resolve(asset, network);
// No toast, just business logic
```

### Production Deployment Checklist

**Before Deployment**:
- [ ] All 183 tests passing in backend
- [ ] Environment variables configured
- [ ] Module imported in app.module.ts
- [ ] No TypeScript errors
- [ ] No linter errors

**Testing in Staging**:
- [ ] Health endpoint responds
- [ ] Assets endpoint returns data
- [ ] URL generation works
- [ ] Callback processing works
- [ ] Pledge creation succeeds

**Post-Deployment**:
- [ ] Monitor logs for errors
- [ ] Verify Robinhood API connectivity
- [ ] Test end-to-end flow
- [ ] Check database pledge records

---

## Architecture Components

### Backend Layer (`libs/robinhood/`)

#### NestJS Module (`robinhood.module.ts`) ✅ BACKEND-READY

```typescript
@Module({
  controllers: [RobinhoodController],
  providers: [
    RobinhoodClientService,
    AssetRegistryService,
    UrlBuilderService,
    PledgeService,
    // ... asset processing services
  ],
  exports: [RobinhoodClientService, AssetRegistryService],
})
export class RobinhoodModule {}
```

**Purpose**: Configures dependency injection and exports services for other modules.

#### NestJS Controller (`robinhood.controller.ts`) ✅ BACKEND-READY

```typescript
@Controller('robinhood')
export class RobinhoodController {
  @Get('health')
  async getHealth() { /* ... */ }

  @Get('assets')
  async getAssets() { /* ... */ }

  @Post('url/generate')
  async generateUrl(@Body() dto: GenerateUrlDto) { /* ... */ }

  @Post('callback')
  async handleCallback(@Body() dto: RobinhoodCallbackDto) { /* ... */ }
}
```

**Purpose**: Handles HTTP endpoints in production backend.

**Note**: In POC, these endpoints are handled by Next.js routes in `app/api/robinhood/` for demonstration. The controller exists but isn't used until migration.

#### Services (`services/`)

1. **RobinhoodClientService** - Robinhood API communication
2. **AssetRegistryService** - Asset metadata and discovery
3. **UrlBuilderService** - Connect URL generation
4. **PledgeService** - Pledge creation and mapping
5. **AssetDiscoveryService** - Asset discovery from Robinhood API
6. **EvmAssetService** - EVM asset processing
7. **NonEvmAssetService** - Non-EVM asset processing

#### DTOs (`dtos/`)

All DTOs use `class-validator` decorators for automatic validation:

- **GenerateUrlDto** - URL generation parameters
- **RobinhoodCallbackDto** - Callback data validation
- **CreatePledgeDto** - Pledge creation data
- **AssetDto** - Asset information structure

#### Tests (`tests/`)

- 183+ tests with 98%+ coverage
- Service tests (`*.spec.ts`)
- Integration tests with nock mocking
- Test helpers and mocks

### Frontend Layer (`app/`) - POC Only

#### API Routes (`app/api/robinhood/`) ⚠️ POC-ONLY

- **generate-onramp-url/route.ts** - Calls `urlBuilderService`
- **health/route.ts** - Calls `assetRegistry`

**These routes are deleted when migrating to backend.**  
They exist only to demonstrate the integration in the POC.

#### Pages (`app/**/page.tsx`)

- **dashboard/page.tsx** - Asset selection UI
- **callback/page.tsx** - Transfer confirmation

#### Components (`app/components/`)

- **asset-selector.tsx** - Asset picker with search
- **asset-card.tsx** - Individual asset display
- **ui/** - shadcn/ui components

---

## Original Components (For Reference)

### 1. Frontend Components

#### Dashboard (`app/(routes)/dashboard/page.tsx`)

- Displays asset selector with search functionality
- User selects cryptocurrency (ETH, SOL, USDC, etc.)
- Initiates transfer with selected asset
- Shows success toast after transfer completion

**Key Component**: Asset selection with dropdown search and filtering

#### Callback (`app/(routes)/callback/page.tsx`)

- Receives redirect from Robinhood after transfer completion
- Displays transfer success message
- Shows transaction details (asset, network, amount, orderId)
- Stores order details in localStorage for dashboard display

### 2. API Routes

#### Generate Onramp URL (`app/api/robinhood/generate-onramp-url/route.ts`)

- Calls Robinhood Connect ID API
- Generates Robinhood Connect URL with pre-selected asset
- Returns URL and connectId to frontend

**Flow**:

1. Receives `selectedAsset` and `selectedNetwork` from frontend
2. Validates asset and network compatibility
3. Calls `POST /catpay/v1/connect_id/` to get valid connectId from Robinhood
4. Retrieves wallet address for selected network
5. Builds URL using `buildDaffyStyleOnrampUrl()`
6. Returns URL and connectId to frontend

**Critical**: The connectId MUST be obtained from Robinhood API, not generated locally with UUID.

### 3. URL Builder (`lib/robinhood-url-builder.ts`)

**Function**: `buildDaffyStyleOnrampUrl(connectId, asset, network, walletAddress)`

Builds the Robinhood Connect URL with these key parameters:

- `applicationId`: Your Robinhood app ID
- `connectId`: Valid ID from Robinhood API (NOT a random UUID)
- `paymentMethod=crypto_balance`: Required for onramp
- `supportedAssets`: Single asset (e.g., 'ETH')
- `supportedNetworks`: Single network (e.g., 'ETHEREUM')
- `walletAddress`: Destination address from network addresses config
- `assetCode`: Asset being transferred (same as supportedAssets)
- `flow=transfer`: Required for callback to work
- `redirectUrl`: Encoded callback URL with transfer metadata

**Critical Implementation Details**:

- **Base URL**: `https://robinhood.com/connect/amount` (NOT `/applink/connect`)
- **Connect ID Source**: Must come from `/catpay/v1/connect_id/` API
- **Single Asset**: Only one asset can be pre-selected per URL
- **Single Network**: Only one network can be specified per URL

### 4. Configuration

#### Asset Metadata (`lib/robinhood-asset-metadata.ts`)

- Complete asset metadata (names, symbols, icons, networks)
- Asset search and filtering functionality
- Enabled/disabled asset flags
- ~120 supported assets across 20 networks

#### Network Addresses (`lib/network-addresses.ts`)

- Wallet addresses for each supported network
- Organized by network type (EVM, Bitcoin-like, memo-required)
- Includes memo/destination tag for networks that require them
- Supports 19 networks (TON pending address)

#### Asset Addresses (`lib/robinhood-asset-addresses.ts`)

- Maps assets to their specific network addresses
- Helper functions for getting addresses by asset
- Validation of asset/network compatibility

---

## Data Flow

### Complete Transfer Flow

1. **User Selection**:

   - User visits dashboard
   - Searches or selects asset from list (e.g., ETH, SOL, USDC)
   - System determines compatible network for asset
   - User clicks "Initiate Transfer"

2. **URL Generation**:

   - Frontend calls `/api/robinhood/generate-onramp-url`
   - Sends: `{ selectedAsset: "ETH", selectedNetwork: "ETHEREUM" }`
   - Backend validates asset/network compatibility
   - Backend calls Robinhood: `POST /catpay/v1/connect_id/`
   - Backend receives valid `connectId` from Robinhood
   - Backend retrieves wallet address for network
   - Backend builds URL with `buildDaffyStyleOnrampUrl()`
   - Backend returns URL to frontend: `{ url, connectId }`

3. **Robinhood Transfer**:

   - Frontend redirects browser to Robinhood Connect URL
   - User completes authentication in Robinhood
   - User confirms amount for the pre-selected asset
   - Robinhood processes the transfer
   - User completes the transfer

4. **Callback**:
   - Robinhood redirects to `/callback` with parameters:
     - `asset`: The transferred asset (e.g., "ETH")
     - `network`: The network used (e.g., "ETHEREUM")
     - `connectId`: The tracking ID
     - `timestamp`: When transfer completed
     - `orderId`: Robinhood's internal order ID
   - Callback page extracts parameters from URL
   - Stores order details in localStorage
   - Displays success message
   - User is redirected to dashboard
   - Dashboard shows success toast with transfer details

---

## Architectural Decisions

### Decision 1: Database Persistence Strategy

**Date**: 2025-10-24  
**Context**: Need to map Robinhood callback data to backend pledge format

**Options Considered**:
1. Create new RobinhoodPledge entity
2. Use existing CryptoDonationPledge entity
3. Store in temporary table

**Decision**: Use existing `CryptoDonationPledge` entity

**Rationale**:
- Robinhood pledges identical to Coinbase pledges in structure
- Reuse existing pledge creation logic
- Consistent notification and reporting
- Simpler backend integration

**Field Mapping**:
```typescript
{
  otcTransactionHash: `robinhood:${connectId}`,
  pledgerUserId: userId,
  inputToken: resolvedToken,  // From TokenService
  inputAmount: convertToSmallestUnit(amount, decimals),
  destinationOrgId: fundId,
  status: PledgeStatus.PendingLiquidation,
  centralizedExchangeDonationStatus: 'Completed',
  centralizedExchangeTransactionId: orderId
}
```

### Decision 2: Implementation Scope

**Date**: 2025-10-24  
**Context**: Determine where refactoring happens

**Decision**: Refactor POC repository ONLY, not endaoment-backend

**Rationale**:
- Keep POC standalone and demonstrable
- No risk to production backend
- Future implementer gets clean starting point
- Easier to test in isolation

### Decision 3: Backend API Integration Approach

**Date**: 2025-10-24  
**Context**: How to demonstrate backend integration without backend access

**Decision**: Mock with detailed toast notifications

**Rationale**:
- Visual, non-blocking demonstration
- Can show full request/response
- Mirrors how real backend would respond
- Great for demo purposes

**Mock Services**:
1. `MockTokenService` - Shows token resolution
2. `MockPledgeService` - Shows pledge creation
3. `MockNotificationService` - Shows notifications

### Decision 4: Test Mocking Strategy

**Date**: 2025-10-24  
**Context**: How to mock external APIs in tests

**Decision**: Use nock with SDK documentation responses

**Rationale**:
- Coinbase uses nock - consistency
- Excellent HTTP mocking capabilities
- Can use actual SDK response examples
- Well-documented and maintained

### Decision 5: Object Parameter Pattern

**Date**: 2025-10-24  
**Context**: When to use object parameters vs positional

**Decision**: Object params for 3+ arguments

**Rationale**:
- Matches Coinbase pattern
- Readable call sites
- Easy to extend later
- Self-documenting code

**Example**:
```typescript
// Before (5 parameters - hard to read)
async generateUrl(asset, network, amount, userIdentifier, destinationFundId)

// After (object param - self-documenting)
async generateUrl({
  asset,
  network,
  amount,
  userIdentifier,
  destinationFundId
}: GenerateUrlParams)
```

### Decision 6: Directory Structure Alignment

**Date**: 2025-10-25  
**Context**: Need POC structure to exactly match endaoment-backend

**Decision**: Full NestJS structure with `libs/` (plural) and `src/lib/`

**Rationale**:
- Enables copy/paste migration to backend
- Separates concerns (robinhood/coinbase/shared)
- Co-locates tests with code (backend standard)
- Makes library boundaries explicit
- Ready for NestJS module wrappers

**Structure**:
```
libs/
├── robinhood/         # → endaoment-backend/libs/api/robinhood/
│   ├── src/lib/       # Implementation
│   └── tests/         # Tests
├── coinbase/          # → merge into endaoment-backend/libs/api/coinbase/
│   ├── src/lib/
│   └── tests/
└── shared/            # → POC-only (backend-mock), some utils migrate
    ├── src/lib/
    └── tests/
```

### Decision 7: Frontend/Backend Separation

**Date**: 2025-10-25  
**Context**: Need POC to be a reusable template for future API integrations

**Decision**: Full Next.js App Router pattern with complete frontend/backend separation

**Rationale**:
- Makes POC a perfect template for future integrations
- Clear "frontend vs backend" boundaries
- All React/Next.js in `app/`, all API libs in `libs/`
- Self-documenting structure
- Easy to understand and replicate

**Benefits for Future POCs**:
- Clone structure for new integrations
- Build frontend in `app/`, backend in `libs/`
- When ready, copy `libs/` to endaoment-backend
- Consistent pattern across all POCs

### Design Decisions from Testing

#### Why Asset Pre-Selection?

Through testing 31 URL variations and consultation with Robinhood's team (Oct 23, 2025):

- Balance-first approach doesn't work reliably for external wallet transfers
- Asset must be pre-selected for onramp to work correctly
- This is a Robinhood API requirement, not a choice
- Users need to select what they want to transfer before initiating the flow

#### Why No Order Status Polling?

The Order Status API (`/catpay/v1/external/order/`) is for offramp only. For onramp:

- All transfer data is available in the callback URL parameters
- No additional API calls needed after transfer
- Order status polling was removed Oct 23, 2025 after Robinhood clarification
- Simpler architecture without unnecessary polling

#### Why Only Daffy-Style URL Builder?

Extensive testing showed:

- ❌ `buildOnrampUrl()` used wrong base URL - failed
- ❌ `buildMultiNetworkOnrampUrl()` balance-first approach - didn't work
- ✅ `buildDaffyStyleOnrampUrl()` with asset pre-selection - works perfectly

Only the working approach was kept. Deprecated builders were removed in legacy cleanup.

#### Why No Offramp?

Offramp (withdrawals from external wallets to Robinhood) uses a completely different API:

- Different endpoints (`/redeem_deposit_address/` vs `/connect_id/`)
- Different parameters and flow
- Different use case (withdraw TO Robinhood vs transfer FROM Robinhood)
- Order status API only works for offramp

Mixing onramp and offramp code created confusion. All offramp code was removed to focus exclusively on onramp.

---

## Important Notes

### ConnectId is Required

- **connectId**: Official Robinhood API term for the transfer tracking ID
- **Must be obtained**: Call `POST /catpay/v1/connect_id/` before building URL
- **Not a random UUID**: Do not generate UUIDs locally for production use
- **Used in callback**: Robinhood returns the connectId in callback parameters

### Base URL is Critical

**✅ Correct**: `https://robinhood.com/connect/amount`

**❌ Incorrect**: `https://robinhood.com/applink/connect`

The correct base URL is critical for the redirectUrl to work properly.

### Required Parameters

These parameters are REQUIRED for onramp to work:

- `applicationId` - Your Robinhood app ID
- `connectId` - From Robinhood API (not random UUID)
- `paymentMethod=crypto_balance` - Specifies transfer from Robinhood balance
- `supportedAssets` - Single asset code
- `supportedNetworks` - Single network
- `walletAddress` - Destination wallet address
- `flow=transfer` - Required for callback parameters
- `redirectUrl` - Where to send user after completion

### Supported Networks

**19 networks supported** (95% of Robinhood networks):

**EVM Networks (8)**:

- ETHEREUM, POLYGON, ARBITRUM, OPTIMISM, BASE, ZORA, AVALANCHE, ETHEREUM_CLASSIC

**Bitcoin-like (4)**:

- BITCOIN, BITCOIN_CASH, LITECOIN, DOGECOIN

**Other L1 (4)**:

- SOLANA, CARDANO, TEZOS, SUI

**Memo-Required (3)**:

- STELLAR (memo required), XRP (destination tag required), HEDERA (memo required)

**Pending (1)**:

- TONCOIN (address needed)

---

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

---

## Troubleshooting

### Transfer doesn't redirect back

**Cause**: Missing or incorrect `redirectUrl` parameter

**Solution**: Verify `redirectUrl` is properly encoded and includes protocol (https://)

### Robinhood shows error

**Possible Causes**:

1. Invalid or missing connectId
2. Wrong base URL
3. Missing required parameters

**Solution**:

- Verify you're calling `/catpay/v1/connect_id/` API first
- Check you're using `https://robinhood.com/connect/amount` base URL
- Validate all required parameters are present

### Callback receives no parameters

**Cause**: Missing `flow=transfer` parameter or wrong base URL

**Solution**: Ensure URL includes `&flow=transfer` and uses correct base URL

### Asset/network mismatch error

**Cause**: Selected asset not compatible with selected network

**Solution**: Use `isAssetNetworkCompatible()` to validate before generating URL

---

## Security Considerations

### API Key Protection

- API keys stored in environment variables only
- Never exposed to client-side code
- All Robinhood API calls made from backend routes
- Keys not logged or included in error messages

### Input Validation

- Asset codes validated against known list
- Network names validated against supported networks
- Wallet addresses validated per network type
- ConnectId validated as proper UUID v4 format

### URL Parameter Safety

- All URL parameters properly encoded
- No user input directly injected into URLs
- Wallet addresses validated before use

---

## Related Documentation

### Implementation Guides

- [MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md) - Complete backend migration guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - How to test the integration
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development setup
- [USER_GUIDE.md](./USER_GUIDE.md) - User-facing documentation
- [FLOW-DIAGRAMS.md](./FLOW-DIAGRAMS.md) - Visual flow diagrams

### Project Organization

- [STRUCTURE.md](../STRUCTURE.md) - Directory organization and template usage
- [QUICK-START.md](../QUICK-START.md) - Getting started guide
- [README.md](../README.md) - Project overview

### Planning Documentation

Complete planning and implementation history:
- `.cursor/plans/robinhood-backend-alignment/` - Backend alignment project
- `.cursor/plans/robinhood-asset-preselection/` - Asset pre-selection feature
- `.cursor/plans/robinhood-legacy-cleanup/` - Code cleanup

---

## Summary

This architecture provides:

### ✅ Production-Ready Code

- **4 Core Services**: All tested and backend-aligned
- **7 Supporting Services**: Asset discovery and processing
- **4 DTOs**: Complete validation with class-validator
- **183 Tests**: 98%+ coverage, 3,044 lines of test code
- **NestJS Module**: Ready for backend import

### ✅ Clean Separation

- **Frontend** (`app/`): Next.js pages, components, hooks
- **Backend** (`libs/`): Services, DTOs, tests, module
- **Clear boundaries**: No mixing of concerns

### ✅ Migration Ready

- **Copy/Paste**: `libs/robinhood/` → `endaoment-backend/libs/api/robinhood/`
- **Minimal Changes**: Uncomment decorators, wire services
- **2-Hour Migration**: Complete step-by-step guide
- **Low Risk**: All code tested and validated

### ✅ Template Pattern

- **Reusable Structure**: Pattern for future API integrations
- **Clear Organization**: Frontend vs backend boundaries
- **Documented Decisions**: All architectural choices explained
- **Best Practices**: Object params, error handling, testing

---

**Last Updated**: October 25, 2025  
**Version**: v1.0.0 (Backend-Aligned)  
**Status**: Production-Ready  
**Test Coverage**: 98%+ (183 tests passing)  
**Migration Time**: ~2 hours

