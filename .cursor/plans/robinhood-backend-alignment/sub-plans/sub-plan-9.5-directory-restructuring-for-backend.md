# Sub-Plan 9.5: Directory Restructuring for Backend Alignment

**Status**: Ready for Implementation
**Priority**: Critical
**Dependencies**: SP0-SP9 (All previous sub-plans complete)

## Context Required

### Current Structure (POC-style)

```
robinhood-onramp/
├── lib/                                    # SINGULAR, flat structure
│   ├── robinhood/                          # Mixed content
│   │   ├── services/                       # ✅ Good
│   │   ├── dtos/                           # ✅ Good
│   │   ├── constants/                      # ✅ Good
│   │   ├── assets/                         # ❌ Should be in services
│   │   ├── url-builder/                    # ❌ Should be in services
│   │   ├── api/                            # ❌ Confusing
│   │   └── types.ts                        # ❌ Mixed with implementation
│   ├── backend-integration/                # ❌ Should be in robinhood service
│   ├── backend-mock/                       # ❌ Should be separate lib
│   └── *.ts                                # ❌ Utility files at root
└── __tests__/                              # ❌ Separate from libs
    ├── *.test.ts
    └── mocks/
```

### Target Structure (NestJS Backend-style)

```
robinhood-onramp/
├── libs/                                   # PLURAL
│   ├── robinhood/                          # API library
│   │   ├── src/
│   │   │   └── lib/
│   │   │       ├── services/               # All business logic
│   │   │       │   ├── robinhood-client.service.ts
│   │   │       │   ├── asset-registry.service.ts
│   │   │       │   ├── url-builder.service.ts
│   │   │       │   ├── pledge.service.ts
│   │   │       │   ├── asset-discovery.service.ts
│   │   │       │   ├── prime-address.service.ts
│   │   │       │   ├── types.ts
│   │   │       │   └── index.ts
│   │   │       ├── dtos/                   # All DTOs
│   │   │       │   ├── asset.dto.ts
│   │   │       │   ├── callback.dto.ts
│   │   │       │   ├── create-pledge.dto.ts
│   │   │       │   ├── generate-url.dto.ts
│   │   │       │   ├── validation-helper.ts
│   │   │       │   └── index.ts
│   │   │       ├── constants/              # All constants
│   │   │       │   ├── errors.ts
│   │   │       │   ├── networks.ts
│   │   │       │   └── index.ts
│   │   │       ├── types/                  # Shared types
│   │   │       │   ├── index.ts
│   │   │       │   └── robinhood.types.ts
│   │   │       └── index.ts                # Main barrel export
│   │   └── tests/                          # Tests WITH the lib
│   │       ├── services/
│   │       │   ├── robinhood-client.service.spec.ts
│   │       │   ├── asset-registry.service.spec.ts
│   │       │   ├── url-builder.service.spec.ts
│   │       │   └── pledge.service.spec.ts
│   │       ├── mocks/
│   │       │   └── robinhood-nock-api.ts
│   │       ├── infrastructure.spec.ts
│   │       ├── setup.ts
│   │       └── README.md
│   │
│   ├── coinbase/                           # NEW: Coinbase support lib
│   │   ├── src/
│   │   │   └── lib/
│   │   │       ├── services/
│   │   │       │   ├── prime-api.service.ts      # Prime API client
│   │   │       │   ├── wallet-address.service.ts  # Wallet management
│   │   │       │   └── index.ts
│   │   │       ├── constants/
│   │   │       │   └── prime-config.ts
│   │   │       └── index.ts
│   │   └── tests/
│   │       └── services/
│   │           └── prime-api.service.spec.ts
│   │
│   └── shared/                             # Shared utilities
│       ├── src/
│       │   └── lib/
│       │       ├── utils/
│       │       │   ├── performance-utils.ts
│       │       │   ├── security-utils.ts
│       │       │   └── index.ts
│       │       ├── backend-mock/           # Mock services
│       │       │   ├── mock-pledge.service.ts
│       │       │   ├── mock-token.service.ts
│       │       │   ├── mock-notification.service.ts
│       │       │   ├── toast-logger.ts
│       │       │   ├── types.ts
│       │       │   └── index.ts
│       │       └── index.ts
│       └── tests/
│           └── utils/
│               └── *.spec.ts
│
└── app/                                    # Next.js app (unchanged)
    └── ...
```

### Gold Standard: endaoment-backend Structure

**Reference**: `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/`

```
libs/api/
├── coinbase/
│   ├── src/
│   │   └── lib/
│   │       ├── services/
│   │       ├── dtos/
│   │       ├── constants/
│   │       ├── coinbase.controller.ts
│   │       ├── coinbase.module.ts
│   │       └── index.ts
│   └── tests/
│       └── ...
├── stripe/
│   └── ...
└── [other libs]
```

**Key Pattern**: Each lib is self-contained with `src/lib/` and `tests/`

## Objectives

1. **Rename**: `lib/` → `libs/` (plural) to match backend convention
2. **Restructure Robinhood**: Move all code into NestJS-style `src/lib/` structure
3. **Move Tests**: Relocate tests from `__tests__/` into `libs/robinhood/tests/`
4. **Create Coinbase Lib**: Extract Coinbase Prime logic into separate library
5. **Create Shared Lib**: Extract utilities and mocks into shared library
6. **Update Imports**: Fix all import paths throughout codebase
7. **Verify Functionality**: Ensure POC still works after restructuring

## Precise Implementation Steps

### Step 1: Create New Directory Structure

**Action**: Create the full `libs/` hierarchy

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Create libs root
mkdir -p libs

# Create robinhood lib structure
mkdir -p libs/robinhood/src/lib/{services,dtos,constants,types}
mkdir -p libs/robinhood/tests/{services,mocks}

# Create coinbase lib structure
mkdir -p libs/coinbase/src/lib/{services,constants}
mkdir -p libs/coinbase/tests/services

# Create shared lib structure
mkdir -p libs/shared/src/lib/{utils,backend-mock}
mkdir -p libs/shared/tests/utils
```

**Validation**:

```bash
tree -L 4 libs/
```

**Expected Output**:

```
libs/
├── coinbase/
│   ├── src/
│   │   └── lib/
│   │       ├── constants/
│   │       └── services/
│   └── tests/
│       └── services/
├── robinhood/
│   ├── src/
│   │   └── lib/
│   │       ├── constants/
│   │       ├── dtos/
│   │       ├── services/
│   │       └── types/
│   └── tests/
│       ├── mocks/
│       └── services/
└── shared/
    ├── src/
    │   └── lib/
    │       ├── backend-mock/
    │       └── utils/
    └── tests/
        └── utils/
```

### Step 2: Move Robinhood Services

**Action**: Move all service files into new structure

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Move existing services
cp lib/robinhood/services/robinhood-client.service.ts libs/robinhood/src/lib/services/
cp lib/robinhood/services/asset-registry.service.ts libs/robinhood/src/lib/services/
cp lib/robinhood/services/url-builder.service.ts libs/robinhood/src/lib/services/
cp lib/robinhood/services/pledge.service.ts libs/robinhood/src/lib/services/
cp lib/robinhood/services/types.ts libs/robinhood/src/lib/services/

# Extract services from assets/ directory
# These should be refactored into services
```

**Files to Move**:

- `lib/robinhood/services/*.ts` → `libs/robinhood/src/lib/services/`
- `lib/robinhood/assets/discovery.ts` → `libs/robinhood/src/lib/services/asset-discovery.service.ts`
- `lib/robinhood/assets/prime-addresses.ts` → Move to coinbase lib (Step 5)
- `lib/robinhood/assets/*.ts` → Refactor into services

**Validation**:

```bash
ls -la libs/robinhood/src/lib/services/
```

### Step 3: Move Robinhood DTOs and Constants

**Action**: Move DTOs and constants

**Commands**:

```bash
# Move DTOs
cp lib/robinhood/dtos/*.ts libs/robinhood/src/lib/dtos/

# Move constants
cp lib/robinhood/constants/*.ts libs/robinhood/src/lib/constants/

# Move types
cp lib/robinhood/types.ts libs/robinhood/src/lib/types/robinhood.types.ts
```

**Validation**:

```bash
ls -la libs/robinhood/src/lib/dtos/
ls -la libs/robinhood/src/lib/constants/
ls -la libs/robinhood/src/lib/types/
```

### Step 4: Move Robinhood Tests

**Action**: Move test files from `__tests__/` to `libs/robinhood/tests/`

**Commands**:

```bash
# Move service tests (rename to .spec.ts)
cp __tests__/robinhood-client.service.test.ts libs/robinhood/tests/services/robinhood-client.service.spec.ts
cp __tests__/asset-registry.service.test.ts libs/robinhood/tests/services/asset-registry.service.spec.ts
cp __tests__/url-builder.service.test.ts libs/robinhood/tests/services/url-builder.service.spec.ts
cp __tests__/pledge.service.test.ts libs/robinhood/tests/services/pledge.service.spec.ts

# Move infrastructure test
cp __tests__/infrastructure.test.ts libs/robinhood/tests/infrastructure.spec.ts

# Move mocks
cp -r __tests__/mocks/* libs/robinhood/tests/mocks/

# Move test setup
cp __tests__/setup.ts libs/robinhood/tests/
cp __tests__/README.md libs/robinhood/tests/
```

**Action**: Update test file extensions `.test.ts` → `.spec.ts` (NestJS convention)

**Validation**:

```bash
ls -la libs/robinhood/tests/services/
ls -la libs/robinhood/tests/mocks/
```

### Step 5: Create Coinbase Library

**Action**: Extract Coinbase Prime functionality into separate lib

**Create**: `libs/coinbase/src/lib/services/prime-api.service.ts`

```typescript
/**
 * Coinbase Prime API Service
 *
 * Handles interactions with Coinbase Prime API for wallet management.
 * This service is used by the Robinhood integration to fetch Prime wallet addresses.
 */

export class PrimeApiService {
  // Extract logic from lib/robinhood/assets/prime-addresses.ts

  /**
   * Fetch wallet addresses from Coinbase Prime for given networks
   */
  async fetchWalletAddresses(params: {
    portfolioId: string;
    networks: string[];
  }): Promise<Map<string, string>> {
    // Implementation from prime-addresses.ts
  }
}
```

**Create**: `libs/coinbase/src/lib/services/wallet-address.service.ts`

```typescript
/**
 * Wallet Address Service
 *
 * Manages wallet address lookup and caching for Coinbase Prime.
 */

export class WalletAddressService {
  // Wallet management logic
}
```

**Create**: `libs/coinbase/src/lib/constants/prime-config.ts`

```typescript
/**
 * Coinbase Prime Configuration
 */

export const PRIME_PORTFOLIO_ID = process.env.COINBASE_PRIME_PORTFOLIO_ID || "";

export const SUPPORTED_PRIME_NETWORKS = [
  "ETHEREUM",
  "POLYGON",
  "BASE",
  // ... etc
] as const;
```

**Create**: `libs/coinbase/src/lib/index.ts`

```typescript
export * from "./services";
export * from "./constants/prime-config";
```

**Create**: `libs/coinbase/src/lib/services/index.ts`

```typescript
export * from "./prime-api.service";
export * from "./wallet-address.service";
```

**Move**: `lib/robinhood/assets/prime-addresses.ts` logic → Coinbase lib

**Validation**:

```bash
ls -la libs/coinbase/src/lib/services/
```

### Step 6: Create Shared Library

**Action**: Move utilities and mocks to shared lib

**Commands**:

```bash
# Move utils
cp lib/performance-utils.ts libs/shared/src/lib/utils/
cp lib/security-utils.ts libs/shared/src/lib/utils/
cp lib/utils.ts libs/shared/src/lib/utils/

# Move backend-mock
cp -r lib/backend-mock/* libs/shared/src/lib/backend-mock/
```

**Create**: `libs/shared/src/lib/utils/index.ts`

```typescript
export * from "./performance-utils";
export * from "./security-utils";
```

**Create**: `libs/shared/src/lib/index.ts`

```typescript
export * from "./utils";
export * from "./backend-mock";
```

**Validation**:

```bash
ls -la libs/shared/src/lib/utils/
ls -la libs/shared/src/lib/backend-mock/
```

### Step 7: Create Barrel Exports

**Create**: `libs/robinhood/src/lib/index.ts`

```typescript
/**
 * Robinhood Connect API Library
 *
 * Main entry point for Robinhood integration services, DTOs, and types.
 */

// Services
export * from "./services";

// DTOs
export * from "./dtos";

// Constants
export * from "./constants";

// Types
export * from "./types";
```

**Create**: `libs/robinhood/src/lib/services/index.ts`

```typescript
export * from "./robinhood-client.service";
export * from "./asset-registry.service";
export * from "./url-builder.service";
export * from "./pledge.service";
export * from "./types";
```

**Create**: `libs/robinhood/src/lib/dtos/index.ts`

```typescript
export * from "./asset.dto";
export * from "./callback.dto";
export * from "./create-pledge.dto";
export * from "./generate-url.dto";
export * from "./validation-helper";
```

**Create**: `libs/robinhood/src/lib/constants/index.ts`

```typescript
export * from "./errors";
export * from "./networks";
```

**Create**: `libs/robinhood/src/lib/types/index.ts`

```typescript
export * from "./robinhood.types";
```

**Create**: Top-level barrel: `libs/robinhood/src/index.ts`

```typescript
export * from "./lib";
```

**Create**: Top-level barrel: `libs/coinbase/src/index.ts`

```typescript
export * from "./lib";
```

**Create**: Top-level barrel: `libs/shared/src/index.ts`

```typescript
export * from "./lib";
```

### Step 8: Update Import Paths Throughout Codebase

**Action**: Update all imports to use new `libs/` structure

**Old Import Pattern**:

```typescript
import { RobinhoodClientService } from "@/lib/robinhood/services";
import { GenerateUrlDto } from "@/lib/robinhood/dtos";
import { MockPledgeService } from "@/lib/backend-mock";
```

**New Import Pattern**:

```typescript
import { RobinhoodClientService, GenerateUrlDto } from "@/libs/robinhood/src";
import { MockPledgeService } from "@/libs/shared/src";
import { PrimeApiService } from "@/libs/coinbase/src";
```

**Files to Update**:

1. **App Routes**: `app/api/robinhood/**/*.ts`
2. **Frontend Pages**: `app/callback/page.tsx`, `app/dashboard/page.tsx`
3. **Test Files**: `libs/robinhood/tests/**/*.spec.ts`
4. **Service Files**: All services that import from other services

**Search and Replace Strategy**:

```bash
# Find all import statements
grep -r "from '@/lib/" robinhood-onramp/app/
grep -r "from '@/lib/" robinhood-onramp/libs/

# Update robinhood imports
find robinhood-onramp/app -type f -name "*.ts*" -exec sed -i '' 's|@/lib/robinhood|@/libs/robinhood/src|g' {} +

# Update backend-mock imports
find robinhood-onramp/app -type f -name "*.ts*" -exec sed -i '' 's|@/lib/backend-mock|@/libs/shared/src/lib/backend-mock|g' {} +

# Update utils imports
find robinhood-onramp/app -type f -name "*.ts*" -exec sed -i '' 's|@/lib/performance-utils|@/libs/shared/src/lib/utils/performance-utils|g' {} +
```

### Step 9: Update TypeScript Path Aliases

**File**: `tsconfig.json`

**Update** the `paths` configuration:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/libs/*": ["./libs/*"],
      "@/libs/robinhood": ["./libs/robinhood/src"],
      "@/libs/coinbase": ["./libs/coinbase/src"],
      "@/libs/shared": ["./libs/shared/src"]
    }
  }
}
```

**Validation**:

```bash
npx tsc --noEmit
```

**Expected**: No TypeScript errors

### Step 10: Update Jest Configuration

**File**: `jest.config.ts`

**Update** module name mapping:

```typescript
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/libs"],
  testMatch: ["**/__tests__/**/*.spec.ts", "**/?(*.)+(spec|test).ts"],
  moduleNameMapper: {
    "^@/libs/robinhood$": "<rootDir>/libs/robinhood/src",
    "^@/libs/robinhood/(.*)$": "<rootDir>/libs/robinhood/src/$1",
    "^@/libs/coinbase$": "<rootDir>/libs/coinbase/src",
    "^@/libs/coinbase/(.*)$": "<rootDir>/libs/coinbase/src/$1",
    "^@/libs/shared$": "<rootDir>/libs/shared/src",
    "^@/libs/shared/(.*)$": "<rootDir>/libs/shared/src/$1",
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "libs/**/src/**/*.ts",
    "!libs/**/src/**/index.ts",
    "!libs/**/tests/**",
  ],
};

export default config;
```

### Step 11: Refactor Asset Logic into Services

**Action**: Convert asset utility files into proper services

**Create**: `libs/robinhood/src/lib/services/asset-discovery.service.ts`

```typescript
/**
 * Asset Discovery Service
 *
 * Handles discovery of available Robinhood trading assets.
 */

export class AssetDiscoveryService {
  /**
   * Fetch all available trading assets from Robinhood API
   */
  async discoverAssets(params: { apiKey: string }): Promise<RobinhoodAsset[]> {
    // Move logic from lib/robinhood/assets/discovery.ts
  }
}
```

**Create**: `libs/robinhood/src/lib/services/evm-asset.service.ts`

```typescript
/**
 * EVM Asset Service
 *
 * Handles EVM-specific asset processing and wallet address resolution.
 */

export class EvmAssetService {
  /**
   * Process EVM assets with Prime wallet addresses
   */
  async processEvmAssets(params: {
    assets: RobinhoodAsset[];
    primeAddresses: Map<string, string>;
  }): Promise<ProcessedEvmAsset[]> {
    // Move logic from lib/robinhood/assets/evm-assets.ts
  }
}
```

**Create**: `libs/robinhood/src/lib/services/non-evm-asset.service.ts`

```typescript
/**
 * Non-EVM Asset Service
 *
 * Handles non-EVM asset processing (Bitcoin, Solana, etc.).
 */

export class NonEvmAssetService {
  /**
   * Process non-EVM assets
   */
  async processNonEvmAssets(params: {
    assets: RobinhoodAsset[];
  }): Promise<ProcessedNonEvmAsset[]> {
    // Move logic from lib/robinhood/assets/non-evm-assets.ts
  }
}
```

**Create**: `libs/robinhood/src/lib/services/otc-loader.service.ts`

```typescript
/**
 * OTC Token Loader Service
 *
 * Loads and manages OTC token configurations.
 */

export class OtcLoaderService {
  /**
   * Load OTC tokens from configuration
   */
  loadOtcTokens(): OtcToken[] {
    // Move logic from lib/robinhood/assets/otc-loader.ts
  }
}
```

**Update**: `libs/robinhood/src/lib/services/index.ts`

```typescript
export * from "./robinhood-client.service";
export * from "./asset-registry.service";
export * from "./asset-discovery.service";
export * from "./evm-asset.service";
export * from "./non-evm-asset.service";
export * from "./otc-loader.service";
export * from "./url-builder.service";
export * from "./pledge.service";
export * from "./types";
```

### Step 12: Add NestJS Controller and Module

**Action**: Create NestJS controller and module in the Robinhood library

**Purpose**: Make the library 100% backend-ready with working NestJS patterns

**⚠️ KEY INSIGHT**: This makes migration literally just copying the folder!

**Create**: `libs/robinhood/src/lib/robinhood.controller.ts`

```typescript
import { Body, Controller, Get, Post } from "@nestjs/common";
import {
  RobinhoodClientService,
  AssetRegistryService,
  UrlBuilderService,
  PledgeService,
} from "./services";
import { GenerateUrlDto, RobinhoodCallbackDto, CreatePledgeDto } from "./dtos";

/**
 * Robinhood Connect Controller
 *
 * Handles HTTP endpoints for Robinhood Connect integration.
 * This controller is backend-ready and will work in NestJS as-is.
 *
 * In POC: Not used by Next.js (uses app/api/robinhood instead)
 * In Backend: Replaces Next.js routes, handles actual API requests
 */
@Controller("robinhood")
export class RobinhoodController {
  constructor(
    private readonly robinhoodClient: RobinhoodClientService,
    private readonly assetRegistry: AssetRegistryService,
    private readonly urlBuilder: UrlBuilderService,
    private readonly pledgeService: PledgeService
  ) {}

  /**
   * Health check endpoint
   * GET /robinhood/health
   */
  @Get("health")
  async getHealth() {
    const registry = this.assetRegistry;
    const assets = registry.getAllAssets();

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      registry: {
        totalAssets: assets.length,
        evmAssets: assets.filter(
          (a) =>
            a.chain === "ETHEREUM" ||
            a.chain === "POLYGON" ||
            a.chain === "BASE"
        ).length,
        nonEvmAssets: assets.filter(
          (a) => !["ETHEREUM", "POLYGON", "BASE"].includes(a.chain)
        ).length,
      },
    };
  }

  /**
   * List all available assets
   * GET /robinhood/assets
   */
  @Get("assets")
  async getAssets() {
    const assets = this.assetRegistry.getAllAssets();
    return {
      success: true,
      count: assets.length,
      assets,
    };
  }

  /**
   * Generate onramp URL
   * POST /robinhood/url/generate
   */
  @Post("url/generate")
  async generateUrl(@Body() dto: GenerateUrlDto) {
    const url = this.urlBuilder.generateOnrampUrl(dto);

    return {
      success: true,
      url,
    };
  }

  /**
   * Handle callback from Robinhood
   * POST /robinhood/callback
   *
   * In production, this would:
   * 1. Validate callback data
   * 2. Create pledge in database
   * 3. Send notifications
   * 4. Return success
   */
  @Post("callback")
  async handleCallback(@Body() dto: RobinhoodCallbackDto) {
    // Create pledge from callback
    const pledge = await this.pledgeService.createFromCallback(dto);

    return {
      success: true,
      pledgeId: pledge.otcTransactionHash,
      status: pledge.status,
    };
  }

  /**
   * Create pledge manually (for testing)
   * POST /robinhood/pledge/create
   */
  @Post("pledge/create")
  async createPledge(@Body() dto: CreatePledgeDto) {
    const pledge = await this.pledgeService.createPledge(dto);

    return {
      success: true,
      pledge,
    };
  }
}
```

**Create**: `libs/robinhood/src/lib/robinhood.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { RobinhoodController } from "./robinhood.controller";
import {
  RobinhoodClientService,
  AssetRegistryService,
  UrlBuilderService,
  PledgeService,
  AssetDiscoveryService,
  EvmAssetService,
  NonEvmAssetService,
  OtcLoaderService,
} from "./services";

/**
 * Robinhood Connect Module
 *
 * Provides complete Robinhood Connect integration with:
 * - Asset registry management
 * - URL generation for onramp flows
 * - Pledge creation and tracking
 * - Robinhood API client
 *
 * This module is backend-ready and can be used as-is in NestJS.
 *
 * In POC: Services are used by Next.js API routes
 * In Backend: Full NestJS module with controller
 */
@Module({
  controllers: [RobinhoodController],
  providers: [
    // Main services
    RobinhoodClientService,
    AssetRegistryService,
    UrlBuilderService,
    PledgeService,

    // Asset processing services
    AssetDiscoveryService,
    EvmAssetService,
    NonEvmAssetService,
    OtcLoaderService,
  ],
  exports: [
    // Export services for use by other modules
    RobinhoodClientService,
    AssetRegistryService,
    UrlBuilderService,
    PledgeService,
  ],
})
export class RobinhoodModule {}
```

**Update**: `libs/robinhood/src/lib/index.ts`

Add controller and module exports:

```typescript
/**
 * Robinhood Connect API Library
 *
 * Main entry point for Robinhood integration services, DTOs, and types.
 */

// NestJS Module and Controller (backend-ready)
export * from "./robinhood.module";
export * from "./robinhood.controller";

// Services
export * from "./services";

// DTOs
export * from "./dtos";

// Constants
export * from "./constants";

// Types
export * from "./types";
```

**Add NestJS Dependencies**:

Update `package.json` to include NestJS (as dev dependencies for POC):

```json
{
  "devDependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0"
  }
}
```

**Install Dependencies**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
npm install --save-dev @nestjs/common@^10.0.0 @nestjs/core@^10.0.0 reflect-metadata@^0.1.13 rxjs@^7.8.0
```

**Validation**:

```bash
# Check files exist
ls -la libs/robinhood/src/lib/robinhood.controller.ts
ls -la libs/robinhood/src/lib/robinhood.module.ts

# TypeScript compilation should still work
npx tsc --noEmit

# Note: Controller won't be used by Next.js, but will be ready for backend
```

**Benefits**:

- ✅ Library is now **100% backend-ready**
- ✅ Migration is just: `cp -r libs/robinhood backend/libs/api/robinhood`
- ✅ Controller patterns proven in POC
- ✅ Module structure validated
- ✅ Future POCs have complete template
- ✅ Can write controller tests in POC

**Note**: The Next.js routes in `app/api/robinhood/` still exist for POC demo. When migrated to backend:

- Next.js routes are deleted (POC-only)
- NestJS controller handles the actual API routes
- Everything else (services, DTOs) works unchanged

### Step 13: Clean Up Old Directories

**Action**: Remove old `lib/` directory and `__tests__/` directory

**⚠️ CRITICAL**: Only after verifying all functionality works!

**Commands**:

```bash
# Verify tests pass first
npm test

# Verify app runs
npm run dev

# Then remove old directories
rm -rf lib/
rm -rf __tests__/
```

**Validation**:

```bash
# Should only show libs/
ls -la | grep -E "^d" | grep -v node_modules
```

### Step 13: Create README for Each Library

**Create**: `libs/robinhood/README.md`

```markdown
# Robinhood Connect API Library

## Overview

This library provides services, DTOs, and utilities for integrating with the Robinhood Connect API.

## Structure
```

src/
├── lib/
│ ├── services/ # Business logic
│ ├── dtos/ # Data transfer objects
│ ├── constants/ # Constants and configurations
│ └── types/ # TypeScript types
└── index.ts

tests/
├── services/ # Service tests
└── mocks/ # Test mocks

````

## Usage

### In POC (Next.js)

```typescript
import {
  RobinhoodClientService,
  AssetRegistryService,
  GenerateUrlDto
} from '@/libs/robinhood';

const client = new RobinhoodClientService();
const registry = new AssetRegistryService();
```

### In Backend (NestJS)

```typescript
// Import the complete module
import { RobinhoodModule } from '@/libs/robinhood';

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

1. **Copy the entire library**:
   ```bash
   cp -r robinhood-connect-poc/robinhood-onramp/libs/robinhood \
         endaoment-backend/libs/api/robinhood
   ```

2. **Update the module** (if needed):
   - Add database entities: `TypeOrmModule.forFeature([CryptoDonationPledge])`
   - Import backend modules: `TokensModule`, `NotificationModule`, etc.

3. **Import in app module**:
   ```typescript
   // apps/api/src/app.module.ts
   import { RobinhoodModule } from '@/libs/robinhood';

   @Module({
     imports: [
       // ... other modules
       RobinhoodModule,
     ],
   })
   ```

4. **Delete POC-only files** (not in libs/):
   - `app/api/robinhood/` (Next.js routes - not needed in backend)

5. **Run tests**: `npm test libs/api/robinhood`

**That's it!** The controller, module, services, DTOs, and tests are all ready to go.

See [Migration Guide](../../docs/MIGRATION-GUIDE.md) for detailed instructions.

````

**Create**: `libs/coinbase/README.md`

```markdown
# Coinbase Prime Support Library

## Overview

This library provides services for interacting with Coinbase Prime API, specifically for wallet address management used by the Robinhood integration.

## Structure
```

src/
├── lib/
│ ├── services/ # Prime API services
│ └── constants/ # Prime configuration
└── index.ts

tests/
└── services/ # Service tests

````

## Usage

```typescript
import { PrimeApiService } from '@/libs/coinbase';

const primeApi = new PrimeApiService();
const addresses = await primeApi.fetchWalletAddresses({
  portfolioId: 'xxx',
  networks: ['ETHEREUM', 'POLYGON']
});
````

## Integration with endaoment-backend

To integrate this library into endaoment-backend:

1. Copy `libs/coinbase/src/lib/services/` to `/Users/rheeger/Code/endaoment/endaoment-backend/libs/api/coinbase/src/lib/services/`
2. Merge with existing Coinbase services
3. Update imports in Robinhood services to use backend Coinbase module

````

**Create**: `libs/shared/README.md`

```markdown
# Shared Utilities Library

## Overview

Shared utilities and mock services used across the POC.

## Structure

````

src/
├── lib/
│ ├── utils/ # Performance, security utilities
│ └── backend-mock/ # Mock backend services for POC demo
└── index.ts

```

## Note

The `backend-mock/` services are **POC-only** and should NOT be migrated to endaoment-backend. They exist solely to demonstrate the integration via toast notifications.
```

### Step 14: Update Package.json Scripts

**File**: `package.json`

**Update** test script to point to new structure:

```json
{
  "scripts": {
    "test": "jest --config=jest.config.ts",
    "test:watch": "jest --config=jest.config.ts --watch",
    "test:coverage": "jest --config=jest.config.ts --coverage",
    "test:robinhood": "jest --config=jest.config.ts libs/robinhood",
    "test:coinbase": "jest --config=jest.config.ts libs/coinbase",
    "test:shared": "jest --config=jest.config.ts libs/shared"
  }
}
```

## Deliverables Checklist

- [ ] `libs/` directory created (plural)
- [ ] `libs/robinhood/src/lib/` follows NestJS structure
- [ ] `libs/robinhood/tests/` contains all tests (`.spec.ts` extension)
- [ ] `libs/robinhood/src/lib/robinhood.controller.ts` created (NestJS controller)
- [ ] `libs/robinhood/src/lib/robinhood.module.ts` created (NestJS module)
- [ ] NestJS dependencies added to package.json
- [ ] `libs/coinbase/` created with Prime API services
- [ ] `libs/shared/` created with utilities and mocks
- [ ] All services refactored from `assets/` directory
- [ ] All import paths updated throughout codebase
- [ ] TypeScript path aliases configured
- [ ] Jest configuration updated
- [ ] All tests passing with new structure
- [ ] README.md created for each library
- [ ] Old `lib/` and `__tests__/` directories removed
- [ ] POC still functional (app runs, tests pass)

## Validation Steps

### 1. Verify Directory Structure

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Check structure
tree -L 4 libs/

# Should show libs/robinhood, libs/coinbase, libs/shared
# Each with src/lib/ and tests/
```

**Expected Output**:

```
libs/
├── coinbase/
│   ├── README.md
│   ├── src/
│   │   ├── index.ts
│   │   └── lib/
│   │       ├── constants/
│   │       ├── index.ts
│   │       └── services/
│   └── tests/
│       └── services/
├── robinhood/
│   ├── README.md
│   ├── src/
│   │   ├── index.ts
│   │   └── lib/
│   │       ├── constants/
│   │       ├── dtos/
│   │       ├── index.ts
│   │       ├── services/
│   │       └── types/
│   └── tests/
│       ├── README.md
│       ├── infrastructure.spec.ts
│       ├── mocks/
│       ├── services/
│       └── setup.ts
└── shared/
    ├── README.md
    ├── src/
    │   ├── index.ts
    │   └── lib/
    │       ├── backend-mock/
    │       ├── index.ts
    │       └── utils/
    └── tests/
        └── utils/
```

### 2. Verify TypeScript Compilation

```bash
npx tsc --noEmit
```

**Expected**: Exit code 0, no errors

### 3. Run All Tests

```bash
npm test
```

**Expected**: All tests passing (183+ tests)

### 4. Run Test Coverage

```bash
npm run test:coverage
```

**Expected**: 80%+ coverage maintained

### 5. Verify App Runs

```bash
npm run dev
```

**Expected**: App starts on http://localhost:3030

**Manual Test**:

1. Visit dashboard
2. Select asset
3. Generate onramp URL
4. Verify no console errors

### 6. Verify Imports

```bash
# Check that no old imports remain
grep -r "from '@/lib/robinhood" robinhood-onramp/app/ || echo "✅ No old imports found"
grep -r "from '@/lib/backend" robinhood-onramp/app/ || echo "✅ No old imports found"
```

**Expected**: "✅ No old imports found"

## Backward Compatibility Checkpoint

**Purpose**: Verify restructuring doesn't break POC functionality

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# 1. TypeScript check
npx tsc --noEmit

# 2. Run all tests
npm test

# 3. Check coverage
npm run test:coverage

# 4. Build app
npm run build

# 5. Start app
npm run dev
```

**Success Criteria**:

- ✅ TypeScript compilation: 0 errors
- ✅ All tests: PASS (183+ tests)
- ✅ Test coverage: 80%+ maintained
- ✅ Build: SUCCESS
- ✅ App runs: No console errors
- ✅ Manual test: Can generate onramp URL

**If Checkpoint Fails**:

1. **TypeScript Errors**: Review import paths, check tsconfig.json paths
2. **Test Failures**: Check Jest moduleNameMapper, verify test file moves
3. **Coverage Drop**: Ensure all test files moved correctly
4. **Build Errors**: Review Next.js config, check for missing files
5. **Runtime Errors**: Check browser console, verify barrel exports

**Rollback Procedure**:

```bash
git checkout -- .
git clean -fd libs/
npm install
```

## Common Issues and Solutions

### Issue 1: "Cannot find module '@/libs/robinhood'"

**Cause**: TypeScript path aliases not configured

**Solution**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/libs/robinhood": ["./libs/robinhood/src"],
      "@/libs/robinhood/*": ["./libs/robinhood/src/*"]
    }
  }
}
```

### Issue 2: Jest can't find test files

**Cause**: Jest roots or testMatch incorrect

**Solution**:

```typescript
// jest.config.ts
{
  roots: ['<rootDir>/libs'],
  testMatch: [
    '**/tests/**/*.spec.ts',
    '**/?(*.)+(spec|test).ts'
  ]
}
```

### Issue 3: Circular dependency errors

**Cause**: Service imports creating cycles

**Solution**: Use barrel exports carefully, consider splitting types

### Issue 4: Tests fail with "unexpected import"

**Cause**: Test mocks not updated

**Solution**: Update mock paths in `libs/robinhood/tests/setup.ts`

## Integration Points

**Provides to SP10-13**:

- Clean NestJS-style library structure
- Proper separation of concerns (robinhood/coinbase/shared)
- Tests co-located with code
- Ready for backend migration

**Dependencies on SP1-9**:

- Services created (SP1, SP4-7)
- DTOs defined (SP2)
- Tests written (SP8-9)
- All code functional

## Next Steps

After completing SP9.5:

1. **Proceed to SP10**: Backend Integration Demo

   - Use new `libs/` imports
   - Demonstrate clean separation

2. **Update SP11**: API Route Refactoring

   - Import from `@/libs/robinhood`
   - Use barrel exports

3. **Update SP12**: Migration Guide

   - Document new structure
   - Provide copy/paste instructions for each lib

4. **Update SP13**: Architecture Documentation
   - Diagram new libs/ structure
   - Explain library boundaries

## Migration Instructions for Backend

When ready to integrate into endaoment-backend:

### Robinhood Library

```bash
# From robinhood-connect-poc repo
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Copy to backend
cp -r libs/robinhood /Users/rheeger/Code/endaoment/endaoment-backend/libs/api/

# Then in backend repo, add NestJS wrappers:
# - robinhood.module.ts
# - robinhood.controller.ts
# - Wire services to DI container
```

### Coinbase Prime Support

```bash
# Copy only the services needed
cp libs/coinbase/src/lib/services/prime-api.service.ts \
   /Users/rheeger/Code/endaoment/endaoment-backend/libs/api/coinbase/src/lib/services/

cp libs/coinbase/src/lib/services/wallet-address.service.ts \
   /Users/rheeger/Code/endaoment/endaoment-backend/libs/api/coinbase/src/lib/services/

# Update Coinbase module to export these services
# Update Robinhood module to import from Coinbase module
```

### Shared Utils (If Needed)

```bash
# Only migrate utils, NOT backend-mock (POC-only)
cp libs/shared/src/lib/utils/performance-utils.ts \
   /Users/rheeger/Code/endaoment/endaoment-backend/libs/shared/src/lib/utils/

# backend-mock/ stays in POC repo - not for production
```

---

**After this sub-plan, the POC will have a clean, backend-ready structure that mirrors the endaoment-backend libs/api/ organization, making final migration straightforward.**
