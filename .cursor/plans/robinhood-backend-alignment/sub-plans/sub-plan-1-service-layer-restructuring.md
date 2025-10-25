# Sub-Plan 1: Service Layer Restructuring

**Status**: Ready for Implementation
**Priority**: Critical
**Dependencies**: Sub-Plan 0 (Drafting)
**Estimated Time**: 4-5 hours

## Context Required

### Files to Review

**Coinbase Service Pattern** (Gold Standard):

- `libs/api/coinbase/src/lib/services/coinbase.service.ts` (lines 1-227)
  - Line 15-30: Service class structure
  - Line 45-60: Constructor with dependency injection
  - Line 80-120: Method signatures with object params
  - Line 150-180: Error handling patterns
- `libs/api/coinbase/src/lib/services/coinbase-auth.service.ts` (lines 1-290)
  - Line 1-20: Imports and decorators
  - Line 25-40: Injectable decorator usage
  - Line 50-70: Private method organization

**Current POC Files to Extract From**:

- `robinhood-onramp/lib/robinhood/api/robinhood-client.ts` (empty - needs population)
- `robinhood-onramp/lib/robinhood/assets/discovery.ts` (lines 1-150)
- `robinhood-onramp/lib/robinhood/assets/prime-addresses.ts` (lines 1-200)
- `robinhood-onramp/lib/robinhood/assets/registry.ts` (lines 1-300)
- `robinhood-onramp/lib/robinhood/url-builder/daffy-style.ts` (lines 1-250)

**Current Index File**:

- `robinhood-onramp/lib/robinhood/index.ts` - Current exports to understand

## Objectives

1. Create `lib/robinhood/services/` directory structure
2. Establish service class pattern matching Coinbase
3. Create placeholder service classes (implementation in later sub-plans)
4. Set up proper TypeScript exports
5. Establish object parameter pattern for all services
6. Add comprehensive JSDoc to service interfaces

## Precise Implementation Steps

### Step 1: Create Services Directory

**Action**: Create directory structure

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
mkdir -p lib/robinhood/services
```

**Validation**:

```bash
ls -la lib/robinhood/services
# Expected: Directory exists
```

### Step 2: Create Service Base Types

**File**: `lib/robinhood/services/types.ts`

**Action**: Create shared types for services

```typescript
/**
 * Shared types for Robinhood services
 */

/**
 * Base configuration for Robinhood services
 */
export interface RobinhoodConfig {
  appId: string;
  apiKey: string;
  baseUrl?: string;
}

/**
 * Standard error response from Robinhood API
 */
export interface RobinhoodApiError {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Retry configuration for API calls
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

/**
 * Logger interface for services
 */
export interface ServiceLogger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

/**
 * Default console logger implementation
 */
export const createConsoleLogger = (serviceName: string): ServiceLogger => ({
  info: (message: string, ...args: any[]) =>
    console.log(`[${serviceName}] INFO:`, message, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[${serviceName}] WARN:`, message, ...args),
  error: (message: string, ...args: any[]) =>
    console.error(`[${serviceName}] ERROR:`, message, ...args),
  debug: (message: string, ...args: any[]) =>
    console.debug(`[${serviceName}] DEBUG:`, message, ...args),
});
```

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/services/types.ts
# Expected: No errors
```

### Step 3: Create RobinhoodClientService Placeholder

**File**: `lib/robinhood/services/robinhood-client.service.ts`

**Action**: Create service class structure

````typescript
import {
  RobinhoodConfig,
  RetryConfig,
  DEFAULT_RETRY_CONFIG,
  ServiceLogger,
  createConsoleLogger,
} from "./types";

/**
 * Parameters for generating a ConnectId
 */
export interface GenerateConnectIdParams {
  /**
   * The blockchain wallet address to receive assets
   */
  walletAddress: string;

  /**
   * Unique identifier for the user (email, user ID, etc.)
   */
  userIdentifier: string;

  /**
   * Optional custom configuration
   */
  config?: Partial<RobinhoodConfig>;
}

/**
 * Parameters for fetching trading assets
 */
export interface FetchTradingAssetsParams {
  /**
   * Optional filter for asset type
   */
  assetType?: string;

  /**
   * Whether to include inactive assets
   */
  includeInactive?: boolean;

  /**
   * Custom configuration
   */
  config?: Partial<RobinhoodConfig>;
}

/**
 * Service for interacting with Robinhood Connect APIs
 *
 * Handles:
 * - ConnectId generation
 * - Trading asset discovery
 * - API authentication
 * - Error handling and retries
 *
 * @example
 * ```typescript
 * const client = new RobinhoodClientService({
 *   appId: process.env.ROBINHOOD_APP_ID,
 *   apiKey: process.env.ROBINHOOD_API_KEY,
 * });
 *
 * const connectId = await client.generateConnectId({
 *   walletAddress: '0x123...',
 *   userIdentifier: 'user@example.com',
 * });
 * ```
 */
export class RobinhoodClientService {
  private readonly config: RobinhoodConfig;
  private readonly retryConfig: RetryConfig;
  private readonly logger: ServiceLogger;

  constructor(
    config: RobinhoodConfig,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
    logger?: ServiceLogger
  ) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || "https://trading.robinhood.com",
    };
    this.retryConfig = retryConfig;
    this.logger = logger || createConsoleLogger("RobinhoodClientService");
  }

  /**
   * Generate a ConnectId for initiating a crypto donation flow
   *
   * @param params - Parameters for ConnectId generation
   * @returns Promise resolving to the ConnectId string
   * @throws {Error} If ConnectId generation fails
   *
   * @example
   * ```typescript
   * const connectId = await client.generateConnectId({
   *   walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   *   userIdentifier: 'donor@endaoment.org',
   * });
   * ```
   */
  async generateConnectId(params: GenerateConnectIdParams): Promise<string> {
    // Implementation in SP4
    this.logger.info("generateConnectId called", params);
    throw new Error("Not implemented - see Sub-Plan 4");
  }

  /**
   * Fetch available trading assets from Robinhood Discovery API
   *
   * @param params - Parameters for asset fetching
   * @returns Promise resolving to array of trading assets
   * @throws {Error} If asset fetching fails
   *
   * @example
   * ```typescript
   * const assets = await client.fetchTradingAssets({
   *   includeInactive: false,
   * });
   * ```
   */
  async fetchTradingAssets(
    params: FetchTradingAssetsParams = {}
  ): Promise<any[]> {
    // Implementation in SP4
    this.logger.info("fetchTradingAssets called", params);
    throw new Error("Not implemented - see Sub-Plan 4");
  }
}
````

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/services/robinhood-client.service.ts
# Expected: No errors
```

### Step 4: Create AssetRegistryService Placeholder

**File**: `lib/robinhood/services/asset-registry.service.ts`

**Action**: Create service class

````typescript
import { ServiceLogger, createConsoleLogger } from "./types";

/**
 * Parameters for initializing the asset registry
 */
export interface InitializeRegistryParams {
  /**
   * Force refresh even if cached
   */
  forceRefresh?: boolean;

  /**
   * Include Prime wallet addresses
   */
  includePrimeAddresses?: boolean;
}

/**
 * Parameters for asset lookup
 */
export interface GetAssetParams {
  /**
   * Asset symbol (e.g., 'BTC', 'ETH')
   */
  symbol: string;

  /**
   * Network name (e.g., 'BITCOIN', 'ETHEREUM')
   */
  network: string;
}

/**
 * Service for managing Robinhood asset registry
 *
 * Handles:
 * - Asset discovery and caching
 * - Prime wallet address mapping
 * - Asset metadata management
 * - Registry health checks
 *
 * Implements singleton pattern for registry caching
 *
 * @example
 * ```typescript
 * const registry = AssetRegistryService.getInstance();
 * await registry.initialize({ includePrimeAddresses: true });
 *
 * const btc = registry.getAsset({
 *   symbol: 'BTC',
 *   network: 'BITCOIN',
 * });
 * ```
 */
export class AssetRegistryService {
  private static instance: AssetRegistryService | null = null;
  private readonly logger: ServiceLogger;
  private initialized: boolean = false;

  private constructor(logger?: ServiceLogger) {
    this.logger = logger || createConsoleLogger("AssetRegistryService");
  }

  /**
   * Get singleton instance of AssetRegistryService
   */
  static getInstance(logger?: ServiceLogger): AssetRegistryService {
    if (!AssetRegistryService.instance) {
      AssetRegistryService.instance = new AssetRegistryService(logger);
    }
    return AssetRegistryService.instance;
  }

  /**
   * Initialize the asset registry
   *
   * Fetches assets from Discovery API and Prime addresses
   *
   * @param params - Initialization parameters
   * @throws {Error} If initialization fails
   */
  async initialize(params: InitializeRegistryParams = {}): Promise<void> {
    // Implementation in SP5
    this.logger.info("initialize called", params);
    throw new Error("Not implemented - see Sub-Plan 5");
  }

  /**
   * Get asset by symbol and network
   *
   * @param params - Asset lookup parameters
   * @returns Asset metadata or null if not found
   */
  getAsset(params: GetAssetParams): any | null {
    // Implementation in SP5
    this.logger.info("getAsset called", params);
    throw new Error("Not implemented - see Sub-Plan 5");
  }

  /**
   * Get all assets in registry
   *
   * @returns Array of all cached assets
   */
  getAllAssets(): any[] {
    // Implementation in SP5
    this.logger.info("getAllAssets called");
    throw new Error("Not implemented - see Sub-Plan 5");
  }

  /**
   * Check if registry is initialized and healthy
   *
   * @returns Object with health status
   */
  getHealthStatus(): {
    initialized: boolean;
    assetCount: number;
    primeAddressCount: number;
  } {
    // Implementation in SP5
    this.logger.info("getHealthStatus called");
    return { initialized: false, assetCount: 0, primeAddressCount: 0 };
  }
}
````

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/services/asset-registry.service.ts
# Expected: No errors
```

### Step 5: Create UrlBuilderService Placeholder

**File**: `lib/robinhood/services/url-builder.service.ts`

**Action**: Create service class

````typescript
import { ServiceLogger, createConsoleLogger } from "./types";

/**
 * Parameters for generating onramp URL
 */
export interface GenerateOnrampUrlParams {
  /**
   * ConnectId from Robinhood API
   */
  connectId: string;

  /**
   * Asset symbol (e.g., 'BTC')
   */
  asset: string;

  /**
   * Network name (e.g., 'BITCOIN')
   */
  network: string;

  /**
   * Amount in asset units
   */
  amount: string;

  /**
   * Callback URL for after transaction
   */
  callbackUrl: string;

  /**
   * Optional destination fund ID
   */
  destinationFundId?: string;

  /**
   * Optional user identifier
   */
  userIdentifier?: string;
}

/**
 * Parameters for validating a URL
 */
export interface ValidateUrlParams {
  /**
   * URL to validate
   */
  url: string;

  /**
   * Expected base URL
   */
  expectedBaseUrl?: string;
}

/**
 * Service for building and validating Robinhood onramp URLs
 *
 * Handles:
 * - URL generation in Daffy style
 * - Parameter encoding and validation
 * - URL structure validation
 *
 * @example
 * ```typescript
 * const urlBuilder = new UrlBuilderService();
 *
 * const url = urlBuilder.generateOnrampUrl({
 *   connectId: 'abc-123-def',
 *   asset: 'BTC',
 *   network: 'BITCOIN',
 *   amount: '0.5',
 *   callbackUrl: 'https://app.endaoment.org/callback',
 * });
 * ```
 */
export class UrlBuilderService {
  private readonly logger: ServiceLogger;
  private readonly baseUrl: string;

  constructor(baseUrl?: string, logger?: ServiceLogger) {
    this.baseUrl = baseUrl || "https://robinhood.com/crypto/donate";
    this.logger = logger || createConsoleLogger("UrlBuilderService");
  }

  /**
   * Generate Robinhood onramp URL for crypto donation
   *
   * @param params - URL generation parameters
   * @returns Complete onramp URL
   * @throws {Error} If parameters are invalid
   */
  generateOnrampUrl(params: GenerateOnrampUrlParams): string {
    // Implementation in SP6
    this.logger.info("generateOnrampUrl called", params);
    throw new Error("Not implemented - see Sub-Plan 6");
  }

  /**
   * Validate a Robinhood onramp URL
   *
   * @param params - Validation parameters
   * @returns True if URL is valid
   */
  validateUrl(params: ValidateUrlParams): boolean {
    // Implementation in SP6
    this.logger.info("validateUrl called", params);
    throw new Error("Not implemented - see Sub-Plan 6");
  }

  /**
   * Extract parameters from callback URL
   *
   * @param callbackUrl - URL received from Robinhood callback
   * @returns Parsed parameters
   */
  parseCallbackUrl(callbackUrl: string): Record<string, string> {
    // Implementation in SP6
    this.logger.info("parseCallbackUrl called", { callbackUrl });
    throw new Error("Not implemented - see Sub-Plan 6");
  }
}
````

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/services/url-builder.service.ts
# Expected: No errors
```

### Step 6: Create Services Index

**File**: `lib/robinhood/services/index.ts`

**Action**: Create barrel export file

```typescript
/**
 * Robinhood Services
 *
 * Service layer for Robinhood Connect integration
 * Following endaoment-backend patterns
 */

// Services
export { RobinhoodClientService } from "./robinhood-client.service";
export { AssetRegistryService } from "./asset-registry.service";
export { UrlBuilderService } from "./url-builder.service";

// Types
export type {
  RobinhoodConfig,
  RobinhoodApiError,
  RetryConfig,
  ServiceLogger,
} from "./types";

export type {
  GenerateConnectIdParams,
  FetchTradingAssetsParams,
} from "./robinhood-client.service";

export type {
  InitializeRegistryParams,
  GetAssetParams,
} from "./asset-registry.service";

export type {
  GenerateOnrampUrlParams,
  ValidateUrlParams,
} from "./url-builder.service";

// Constants
export { DEFAULT_RETRY_CONFIG, createConsoleLogger } from "./types";

// Singleton instances (for convenience)
export const getAssetRegistry = () => AssetRegistryService.getInstance();
```

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/services/index.ts
# Expected: No errors
```

### Step 7: Update Main Robinhood Index

**File**: `lib/robinhood/index.ts`

**Action**: Add services to main exports

```typescript
// Existing exports (keep all current exports)
export * from "./types";
export * from "./constants/networks";
export * from "./constants/errors";

// NEW: Service layer exports
export {
  RobinhoodClientService,
  AssetRegistryService,
  UrlBuilderService,
  getAssetRegistry,
} from "./services";

export type {
  RobinhoodConfig,
  GenerateConnectIdParams,
  FetchTradingAssetsParams,
  InitializeRegistryParams,
  GetAssetParams,
  GenerateOnrampUrlParams,
  ValidateUrlParams,
  ServiceLogger,
} from "./services";
```

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/index.ts
# Expected: No errors
```

### Step 8: Verify Service Structure

**Action**: Run comprehensive TypeScript check

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
npx tsc --noEmit
```

**Expected Output**:

```
No errors (or only pre-existing errors, not new ones)
```

**If Errors**: Review error messages, fix TypeScript issues in service files

### Step 9: Test Service Instantiation

**File**: `lib/robinhood/services/__test-instantiation.ts` (temporary)

**Action**: Create quick test file

```typescript
import {
  RobinhoodClientService,
  AssetRegistryService,
  UrlBuilderService,
  getAssetRegistry,
} from "./index";

// Test RobinhoodClientService
const client = new RobinhoodClientService({
  appId: "test-app-id",
  apiKey: "test-api-key",
});

console.log("✅ RobinhoodClientService instantiated");

// Test AssetRegistryService (singleton)
const registry1 = AssetRegistryService.getInstance();
const registry2 = getAssetRegistry();
console.log(
  "✅ AssetRegistryService singleton working:",
  registry1 === registry2
);

// Test UrlBuilderService
const urlBuilder = new UrlBuilderService();
console.log("✅ UrlBuilderService instantiated");

console.log("\n🎉 All services instantiate successfully!");
```

**Validation**:

```bash
npx ts-node lib/robinhood/services/__test-instantiation.ts
```

**Expected Output**:

```
✅ RobinhoodClientService instantiated
✅ AssetRegistryService singleton working: true
✅ UrlBuilderService instantiated

🎉 All services instantiate successfully!
```

**Cleanup**:

```bash
rm lib/robinhood/services/__test-instantiation.ts
```

## Deliverables Checklist

- [ ] Directory `lib/robinhood/services/` created
- [ ] `types.ts` created with shared types
- [ ] `robinhood-client.service.ts` created with placeholders
- [ ] `asset-registry.service.ts` created with singleton pattern
- [ ] `url-builder.service.ts` created with placeholders
- [ ] `services/index.ts` created with proper exports
- [ ] Main `index.ts` updated with service exports
- [ ] All TypeScript files compile without errors
- [ ] Service instantiation test passes
- [ ] Object parameter pattern established (3+ args)
- [ ] JSDoc added to all service methods
- [ ] Singleton pattern working for AssetRegistryService

## Validation Steps

### Validation 1: Directory Structure

```bash
tree lib/robinhood/services
```

**Expected**:

```
lib/robinhood/services
├── types.ts
├── robinhood-client.service.ts
├── asset-registry.service.ts
├── url-builder.service.ts
└── index.ts
```

### Validation 2: TypeScript Compilation

```bash
npx tsc --noEmit
```

**Expected**: Exit code 0, no errors related to new service files

### Validation 3: Import Test

```bash
npx ts-node -e "import { RobinhoodClientService, AssetRegistryService, UrlBuilderService } from './lib/robinhood/services'; console.log('✅ Imports work');"
```

**Expected**: "✅ Imports work"

### Validation 4: Object Parameter Pattern

Review each service method - ensure all methods with 3+ parameters use object params:

```bash
grep -n "async.*(.*, .*, .*)" lib/robinhood/services/*.service.ts
```

**Expected**: No matches (all should use object params)

## Common Issues and Solutions

### Issue 1: TypeScript Module Resolution

**Symptom**: "Cannot find module '@/lib/robinhood/services'"

**Solution**:

- Check `tsconfig.json` has proper path aliases
- Ensure using relative imports in service files
- Verify barrel exports in `services/index.ts`

### Issue 2: Circular Dependencies

**Symptom**: "ReferenceError: Cannot access 'X' before initialization"

**Solution**:

- Don't import services in `types.ts`
- Keep type definitions separate from implementations
- Use `import type` for type-only imports

### Issue 3: Singleton Not Working

**Symptom**: `registry1 !== registry2`

**Solution**:

- Ensure using `getInstance()` method
- Don't use `new AssetRegistryService()` directly
- Check for multiple module instances

## Integration Points

### What This Provides

- Service class structure matching backend patterns
- Object parameter interfaces for all service methods
- Singleton pattern for AssetRegistryService
- Proper TypeScript exports
- JSDoc documentation for all methods

### What Depends On This

- **SP2**: Will create DTOs matching these interfaces
- **SP3**: Will create mock services with same patterns
- **SP4**: Will implement RobinhoodClientService
- **SP5**: Will implement AssetRegistryService
- **SP6**: Will implement UrlBuilderService
- **SP8-9**: Will write tests against these interfaces

### What It Requires

- TypeScript configured properly
- Existing `lib/robinhood/` structure
- No changes needed to existing POC code

## Next Steps

After completing this sub-plan:

1. **Verify** all deliverables checked off
2. **Create** implementation log: `YYYYMMDD-HHMM-SP1-COMPLETE.md`
3. **Review** service interfaces for completeness
4. **Proceed to** [Sub-Plan 2: DTOs and Type Definitions](./sub-plan-2-dtos-and-validation.md)

## Notes

- Service implementations intentionally throw "Not implemented" errors
- Actual business logic extraction happens in SP4-6
- This sub-plan focuses on STRUCTURE, not implementation
- All services follow Coinbase patterns exactly
- Object parameter pattern is critical - validate thoroughly

