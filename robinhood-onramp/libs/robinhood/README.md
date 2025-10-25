# Robinhood Connect API Library

## Overview

This library provides services, DTOs, and utilities for integrating with the Robinhood Connect API.

**Status**: ✅ Backend-Ready with NestJS Controller & Module

## Structure

```
src/
├── lib/
│   ├── services/                    # Business logic
│   │   ├── robinhood-client.service.ts
│   │   ├── asset-registry.service.ts
│   │   ├── url-builder.service.ts
│   │   ├── pledge.service.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── dtos/                        # Data transfer objects
│   │   ├── asset.dto.ts
│   │   ├── callback.dto.ts
│   │   ├── create-pledge.dto.ts
│   │   ├── generate-url.dto.ts
│   │   ├── validation-helper.ts
│   │   └── index.ts
│   ├── constants/                   # Constants and configurations
│   │   ├── errors.ts
│   │   ├── networks.ts
│   │   └── index.ts
│   ├── types/                       # TypeScript types
│   │   ├── robinhood.types.ts
│   │   └── index.ts
│   ├── robinhood.controller.ts      # NestJS controller (backend-ready)
│   ├── robinhood.module.ts          # NestJS module (backend-ready)
│   └── index.ts                     # Main barrel export
└── index.ts

tests/
├── services/                        # Service tests
│   ├── robinhood-client.service.spec.ts
│   ├── asset-registry.service.spec.ts
│   ├── url-builder.service.spec.ts
│   └── pledge.service.spec.ts
├── mocks/                           # Test mocks
│   └── robinhood-nock-api.ts
├── infrastructure.spec.ts
├── setup.ts
└── README.md
```

## Usage

### In POC (Next.js)

```typescript
import {
  RobinhoodClientService,
  AssetRegistryService,
  GenerateUrlDto,
} from '@/libs/robinhood'

const client = new RobinhoodClientService()
const registry = new AssetRegistryService()
```

### In Backend (NestJS)

```typescript
// Import the complete module
import { RobinhoodModule } from '@/libs/robinhood'

// In your app.module.ts
@Module({
  imports: [RobinhoodModule],
})
export class AppModule {}

// The controller automatically registers routes:
// GET  /robinhood/health
// GET  /robinhood/assets
// POST /robinhood/url/generate
// POST /robinhood/callback
// POST /robinhood/pledge/create
```

## Integration with endaoment-backend

✅ **This library is 100% backend-ready with NestJS controller and module!**

To integrate this library into endaoment-backend:

### Step 1: Copy the Library

```bash
cp -r robinhood-connect-poc/robinhood-onramp/libs/robinhood \
      endaoment-backend/libs/api/robinhood
```

### Step 2: Activate NestJS Decorators

In `robinhood.controller.ts` and `robinhood.module.ts`, uncomment the decorators:

```typescript
// Before (POC):
// @Controller('robinhood')
export class RobinhoodController { ... }

// After (Backend):
@Controller('robinhood')  // ← Uncomment
export class RobinhoodController { ... }
```

### Step 3: Update Module (if needed)

Add database entities and backend module dependencies:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([CryptoDonationPledge]),  // Add DB entities
    TokensModule,              // Backend dependencies
    NotificationModule,
  ],
  controllers: [RobinhoodController],
  providers: [
    RobinhoodClientService,
    AssetRegistryService,
    UrlBuilderService,
    PledgeService,
  ],
  exports: [
    RobinhoodClientService,
    AssetRegistryService,
    UrlBuilderService,
    PledgeService,
  ],
})
export class RobinhoodModule {}
```

### Step 4: Import in App Module

```typescript
// apps/api/src/app.module.ts
import { RobinhoodModule } from '@/libs/robinhood'

@Module({
  imports: [
    // ... other modules
    RobinhoodModule,
  ],
})
export class AppModule {}
```

### Step 5: Delete POC-Only Files

```bash
# Remove Next.js API routes (not needed in backend)
rm -rf app/api/robinhood/
```

### Step 6: Run Tests

```bash
npm test libs/api/robinhood
```

**That's it!** The controller, module, services, DTOs, and tests are all ready to go.

## Services

### RobinhoodClientService

Handles API interactions with Robinhood Connect:

- `generateConnectId()` - Generate a Connect ID for a user/wallet
- `getApiKey()` - Retrieve configured API key
- `getAppId()` - Retrieve configured App ID

### AssetRegistryService

Manages the registry of available Robinhood assets:

- `getAllAssets()` - Get all registered assets
- `getAssetBySymbol()` - Find asset by symbol
- `getAssetsByChain()` - Get all assets for a chain
- `isAssetSupported()` - Check if asset is available

### UrlBuilderService

Generates onramp URLs for Robinhood Connect:

- `generateOnrampUrl()` - Build complete onramp URL
- `validateUrl()` - Validate generated URL
- `parseCallbackUrl()` - Extract data from callback URL

### PledgeService

Maps Robinhood callbacks to pledge objects:

- `createPledge()` - Create pledge from callback data
- `createFromCallback()` - Process Robinhood callback
- `validatePledgeData()` - Validate pledge creation data

## DTOs

All DTOs use `class-validator` decorators for automatic validation:

- `AssetDto` - Asset configuration
- `GenerateUrlDto` - URL generation request
- `RobinhoodCallbackDto` - Callback payload from Robinhood
- `CreatePledgeDto` - Manual pledge creation

## Testing

Run tests for this library:

```bash
npm run test:robinhood
```

Coverage: **98%+** (183 tests passing)

## Environment Variables

Required:

```bash
ROBINHOOD_APP_ID=<your-app-id>
ROBINHOOD_API_KEY=<your-api-key>
```

Optional:

```bash
DEFAULT_FUND_ID=<default-destination-fund>
```

## Migration Checklist

When migrating to backend:

- [ ] Copy `libs/robinhood/` to `backend/libs/api/robinhood/`
- [ ] Uncomment `@Controller()` in `robinhood.controller.ts`
- [ ] Uncomment `@Module()` in `robinhood.module.ts`
- [ ] Add database entities to module imports
- [ ] Update service constructors with DI
- [ ] Import RobinhoodModule in AppModule
- [ ] Delete `app/api/robinhood/` (POC-only routes)
- [ ] Run tests: `npm test libs/api/robinhood`
- [ ] Verify routes work: `curl http://localhost:3000/robinhood/health`

## Architecture

This library follows the endaoment-backend service architecture:

- **Services**: Business logic layer
- **DTOs**: Input validation and type safety
- **Constants**: Shared configuration
- **Controller**: HTTP endpoint handling (NestJS)
- **Module**: Dependency injection setup (NestJS)

See [Migration Guide](../../docs/MIGRATION-GUIDE.md) for detailed instructions.

