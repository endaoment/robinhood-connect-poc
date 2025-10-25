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

**AssetRegistryService** - Asset management (singleton)

- `initialize()` - Build asset registry
- `getAssets()` - Return all assets
- `getAsset()` - Find asset by code/chain

**UrlBuilderService** - URL generation

- `generateUrl()` - Build complete onramp URL
- `buildRedirectUrl()` - Create callback URL

**PledgeService** - Pledge creation

- `createPledge()` - Convert callback to pledge entity
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

## Error Handling

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
