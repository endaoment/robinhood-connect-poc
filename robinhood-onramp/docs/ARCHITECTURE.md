# Robinhood Connect Architecture

> Frontend/Backend separation pattern. See [STRUCTURE.md](./STRUCTURE.md) for directory layout.

## Architecture Layers

**Frontend** (`app/`) - Next.js POC demonstration  
**Backend** (`libs/`) - NestJS modules for production

In POC: Next.js routes call `libs/` services directly.  
In Production: Copy `libs/` to endaoment-backend, delete `app/api/`.

See [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) for integration steps.

## Service Layer

### Core Services

**RobinhoodClientService** - Robinhood API communication

- `generateConnectId()` - Create connect ID
- `fetchAssets()` - Get supported assets
- ⭐ `getOrderDetails()` - Poll Order Details API for transfer data (NEW)

**AssetRegistryService** - Asset management (singleton)

- `initialize()` - Build asset registry
- `getAssets()` - Return all assets
- `getAsset()` - Find asset by code/chain

**UrlBuilderService** - URL generation

- `generateUrl()` - Build complete onramp URL
- `buildRedirectUrl()` - Create callback URL

**PledgeService** - Pledge creation

- `createFromCallback()` - Convert callback to pledge entity (legacy)
- ⭐ `createPledgeFromOrderDetails()` - Create pledge from Order Details API (NEW)
- `mapCallbackToPledge()` - Field mapping

### Support Services

**AssetDiscoveryService** - Fetch from Robinhood API  
**EvmAssetService** - ERC-20 token handling  
**NonEvmAssetService** - Native assets (BTC, SOL, etc.)

## Data Transfer Objects

All DTOs use `class-validator` decorators:

**GenerateUrlDto** - URL generation params  
**RobinhoodCallbackDto** - Callback validation  
**CreatePledgeDto** - Pledge creation data  
**AssetDto** - Asset information

Example:

```typescript
export class GenerateUrlDto {
  @IsString()
  @IsNotEmpty()
  asset: string

  @IsString()
  @IsNotEmpty()
  network: string

  @IsNumber()
  @IsPositive()
  amount: number
}
```

## Order Details API Integration ⭐ NEW

### Overview

The callback page now polls the Robinhood Order Details API to get definitive transfer data instead of relying on URL parameters.

### Flow

1. **Callback receives** `connectId` from Robinhood redirect
2. **Poll API** `GET /catpay/v1/external/order/{connectId}`
3. **Check status** - `ORDER_STATUS_IN_PROGRESS`, `ORDER_STATUS_SUCCEEDED`, or `ORDER_STATUS_FAILED`
4. **Retry logic** - Poll every 12 seconds, max 10 attempts (2 minutes total)
5. **Auto-create pledge** when status is `SUCCEEDED`

### Data Retrieved

From Order Details API response:

- ✅ **cryptoAmount** - Exact amount transferred (e.g., "0.002")
- ✅ **fiatAmount** - USD equivalent (e.g., "0.41")
- ✅ **blockchainTransactionId** - On-chain transaction hash
- ✅ **destinationAddress** - Wallet address funds were sent to
- ✅ **assetCode** - Asset symbol (e.g., "SOL")
- ✅ **networkCode** - Network name (e.g., "SOLANA")
- ✅ **status** - Transfer completion status
- ✅ **networkFee** - Network fee details
- ✅ **totalAmount** - Total including fees

### Benefits

**vs. Callback URL Parameters**:

- ❌ Old: `assetAmount=0` (unreliable)
- ✅ New: Actual amount from Robinhood API

- ❌ Old: No blockchain tx hash
- ✅ New: Real transaction hash for on-chain verification

- ❌ Old: No fiat amount
- ✅ New: USD value for reporting

- ❌ Old: Prefixed connectId as tx hash (`robinhood:abc-123`)
- ✅ New: Actual blockchain transaction hash

### Implementation

**Frontend**: `app/(routes)/callback/page.tsx`  
**API Route**: `app/api/robinhood/order-details/route.ts`  
**Service**: `RobinhoodClientService.getOrderDetails()`  
**Pledge Creation**: `PledgeService.createPledgeFromOrderDetails()`

### Error Handling

Custom error classes:

- `RobinhoodApiError` - API failures
- `AssetNotFoundError` - Asset lookup failures
- `ValidationError` - Invalid input

Retry logic with exponential backoff implemented for API calls.

## Testing

**Framework**: Jest  
**HTTP Mocking**: nock  
**Test Count**: 183 tests  
**Coverage**: 98%+

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for details.

## Mock Backend Integration

POC uses mock services to demonstrate backend calls without requiring actual backend:

**MockTokenService** - Shows token resolution  
**MockPledgeService** - Shows pledge creation  
**MockNotificationService** - Shows notifications

Replace with real services during migration. See [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md).

## Data Flow

### URL Generation

1. User selects asset on dashboard
2. Frontend calls `/api/robinhood/generate-onramp-url`
3. `UrlBuilderService.generateUrl()` called
4. `RobinhoodClientService.generateConnectId()` gets connect ID
5. `AssetRegistryService.getAsset()` validates asset
6. Complete URL returned with pre-selected asset

### Callback Handling

1. Robinhood redirects to callback URL with transfer data
2. Frontend receives query parameters
3. `PledgeService.createFromCallback()` processes data
4. Token resolved via TokenService (mock in POC)
5. Pledge saved to database (mock in POC)
6. Notification sent (mock in POC)

## Security

- API keys on backend only
- Input validation on all endpoints
- Type-safe interfaces throughout
- Address format validation per network
- XSS prevention patterns

## Migration to Backend

**Copy As-Is** (40+ files):

- All services (`services/*.ts`)
- All DTOs (`dtos/*.ts`)
- All constants (`constants/*.ts`)
- All tests (`tests/*.spec.ts`)

**Update** (3 files):

- `robinhood.module.ts` - Uncomment decorators, add imports
- `robinhood.controller.ts` - Uncomment decorators
- `pledge.service.ts` - Replace mock services

**Don't Copy**:

- `app/` directory (Next.js frontend)
- Mock services

See [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) for complete instructions.

## API Endpoints

Once migrated to backend:

- `GET /robinhood/health` - Health check
- `GET /robinhood/assets` - List assets
- `POST /robinhood/url/generate` - Generate URL
- `POST /robinhood/callback` - Handle callback
- `POST /robinhood/pledge/create` - Create pledge

## Documentation

- [STRUCTURE.md](./STRUCTURE.md) - Directory organization
- [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) - Backend integration
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing approach
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development guide
- [FLOW-DIAGRAMS.md](./FLOW-DIAGRAMS.md) - Visual flows
