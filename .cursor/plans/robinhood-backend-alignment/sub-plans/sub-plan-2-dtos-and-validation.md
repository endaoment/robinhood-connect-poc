# Sub-Plan 2: DTOs and Type Definitions

**Status**: Pending
**Priority**: Critical
**Dependencies**: Sub-Plan 1 (Service Layer Restructuring)
**Estimated Time**: 3-4 hours

## Context Required

### Files to Review

**Coinbase DTO Patterns** (Gold Standard):

- `libs/api/coinbase/src/lib/dtos/create-order.dto.ts`

  - Lines 1-15: Imports and decorators
  - Lines 20-50: Class with validation decorators
  - Lines 55-80: Nested object validation
  - Lines 85-100: Transform decorators

- `libs/api/coinbase/src/lib/dtos/webhook-event.dto.ts`
  - Lines 1-30: Enum validations
  - Lines 35-60: Optional field patterns
  - Lines 65-90: Array validations

**Current Service Interfaces** (From SP1):

- `lib/robinhood/services/robinhood-client.service.ts`

  - Lines 10-25: GenerateConnectIdParams
  - Lines 30-45: FetchTradingAssetsParams

- `lib/robinhood/services/url-builder.service.ts`
  - Lines 10-35: GenerateOnrampUrlParams

**Backend Entity to Match**:

- CryptoDonationPledge entity in endaoment-backend
  - Review field types and requirements
  - Understand validation rules

## Objectives

1. Create `lib/robinhood/dtos/` directory
2. Define DTOs with class-validator decorators
3. Create DTOs matching service interfaces
4. Add transform decorators for type safety
5. Establish validation patterns
6. Export all DTOs from index

## Precise Implementation Steps

### Step 1: Install Dependencies

**Action**: Add class-validator and class-transformer

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
npm install class-validator class-transformer
npm install --save-dev @types/node
```

**Validation**:

```bash
npm list class-validator class-transformer
# Expected: Both packages listed with versions
```

### Step 2: Create DTOs Directory

**Action**: Create directory

```bash
mkdir -p lib/robinhood/dtos
```

**Validation**:

```bash
ls -la lib/robinhood/dtos
# Expected: Directory exists
```

### Step 3: Create Generate URL DTO

**File**: `lib/robinhood/dtos/generate-url.dto.ts`

**Action**: Create DTO with validation

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Matches,
  IsNumberString,
  MinLength,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * DTO for generating Robinhood onramp URL
 *
 * Validates all required parameters for URL generation
 */
export class GenerateUrlDto {
  /**
   * ConnectId from Robinhood API
   * Must be non-empty string
   */
  @IsString()
  @IsNotEmpty({ message: "ConnectId is required" })
  @MinLength(10, { message: "ConnectId must be at least 10 characters" })
  connectId!: string;

  /**
   * Asset symbol (e.g., 'BTC', 'ETH')
   * Must be uppercase alphanumeric
   */
  @IsString()
  @IsNotEmpty({ message: "Asset symbol is required" })
  @Matches(/^[A-Z0-9]+$/, { message: "Asset must be uppercase alphanumeric" })
  @MaxLength(10, { message: "Asset symbol too long" })
  @Transform(({ value }) => value?.toUpperCase())
  asset!: string;

  /**
   * Network name (e.g., 'BITCOIN', 'ETHEREUM')
   * Must be uppercase alphanumeric with underscores
   */
  @IsString()
  @IsNotEmpty({ message: "Network is required" })
  @Matches(/^[A-Z0-9_]+$/, {
    message: "Network must be uppercase alphanumeric with underscores",
  })
  @Transform(({ value }) => value?.toUpperCase())
  network!: string;

  /**
   * Amount in asset units (e.g., '0.5' for 0.5 BTC)
   * Must be positive number string
   */
  @IsNumberString({}, { message: "Amount must be a valid number string" })
  @IsNotEmpty({ message: "Amount is required" })
  @Matches(/^\d+\.?\d*$/, { message: "Amount must be positive" })
  amount!: string;

  /**
   * Callback URL for after transaction completes
   * Must be valid HTTPS URL
   */
  @IsUrl(
    {
      protocols: ["https"],
      require_protocol: true,
    },
    { message: "Callback URL must be valid HTTPS URL" }
  )
  @IsNotEmpty({ message: "Callback URL is required" })
  callbackUrl!: string;

  /**
   * Optional destination fund/organization ID
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  destinationFundId?: string;

  /**
   * Optional user identifier (email, user ID, etc.)
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  userIdentifier?: string;
}
```

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/dtos/generate-url.dto.ts
# Expected: No errors
```

### Step 4: Create Pledge DTO

**File**: `lib/robinhood/dtos/create-pledge.dto.ts`

**Action**: Create DTO matching CryptoDonationPledge

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Matches,
} from "class-validator";
import { Transform, Type } from "class-transformer";

/**
 * Status enum for crypto donation pledges
 */
export enum PledgeStatus {
  PendingLiquidation = "PENDING_LIQUIDATION",
  Liquidated = "LIQUIDATED",
  Failed = "FAILED",
}

/**
 * Status enum for centralized exchange donations
 */
export enum CentralizedExchangeStatus {
  Completed = "Completed",
  Pending = "Pending",
  Failed = "Failed",
}

/**
 * DTO for creating a crypto donation pledge from Robinhood callback
 *
 * Maps to CryptoDonationPledge entity in backend
 */
export class CreatePledgeDto {
  /**
   * Robinhood ConnectId used as transaction hash
   * Prefixed with 'robinhood:' to distinguish from blockchain tx hashes
   */
  @IsString()
  @IsNotEmpty({ message: "ConnectId is required" })
  @Matches(/^robinhood:/, {
    message: 'OTC transaction hash must start with "robinhood:"',
  })
  otcTransactionHash!: string;

  /**
   * ID of the user making the donation
   * Optional - may be anonymous donation
   */
  @IsOptional()
  @IsString()
  pledgerUserId?: string;

  /**
   * Input token ID from backend token registry
   * Resolved via TokenService.resolveTokenBySymbol()
   */
  @IsNumber()
  @Min(1, { message: "Input token ID must be valid" })
  @Type(() => Number)
  inputToken!: number;

  /**
   * Amount in smallest unit (e.g., satoshis for BTC)
   * Must be positive integer
   */
  @IsString()
  @Matches(/^\d+$/, { message: "Input amount must be positive integer string" })
  @IsNotEmpty({ message: "Input amount is required" })
  inputAmount!: string;

  /**
   * Destination organization/fund ID
   * From DEFAULT_FUND_ID or user selection
   */
  @IsString()
  @IsNotEmpty({ message: "Destination organization ID is required" })
  destinationOrgId!: string;

  /**
   * Current status of the pledge
   */
  @IsEnum(PledgeStatus)
  @IsOptional()
  status?: PledgeStatus;

  /**
   * Status of the centralized exchange donation
   */
  @IsEnum(CentralizedExchangeStatus)
  @IsOptional()
  centralizedExchangeDonationStatus?: CentralizedExchangeStatus;

  /**
   * Robinhood order ID from callback
   * Used to track transaction on Robinhood side
   */
  @IsOptional()
  @IsString()
  centralizedExchangeTransactionId?: string;

  /**
   * Asset symbol (e.g., 'BTC')
   * For logging and debugging
   */
  @IsOptional()
  @IsString()
  asset?: string;

  /**
   * Network name (e.g., 'BITCOIN')
   * For logging and debugging
   */
  @IsOptional()
  @IsString()
  network?: string;
}
```

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/dtos/create-pledge.dto.ts
# Expected: No errors
```

### Step 5: Create Asset DTO

**File**: `lib/robinhood/dtos/asset.dto.ts`

**Action**: Create DTO for asset responses

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO for asset network information
 */
export class AssetNetworkDto {
  /**
   * Network name (e.g., 'ETHEREUM', 'BITCOIN')
   */
  @IsString()
  @IsNotEmpty()
  networkName!: string;

  /**
   * Robinhood's internal network code
   */
  @IsString()
  @IsNotEmpty()
  networkCode!: string;

  /**
   * Whether network is currently active
   */
  @IsBoolean()
  isActive!: boolean;

  /**
   * Prime wallet address for this network (if available)
   */
  @IsOptional()
  @IsString()
  primeWalletAddress?: string;
}

/**
 * DTO for asset information from Robinhood
 *
 * Represents assets available for donation via Robinhood Connect
 */
export class AssetDto {
  /**
   * Asset symbol (e.g., 'BTC', 'ETH')
   */
  @IsString()
  @IsNotEmpty({ message: "Asset symbol is required" })
  symbol!: string;

  /**
   * Full asset name (e.g., 'Bitcoin', 'Ethereum')
   */
  @IsString()
  @IsNotEmpty({ message: "Asset name is required" })
  name!: string;

  /**
   * Robinhood's internal asset code
   */
  @IsString()
  @IsNotEmpty()
  assetCode!: string;

  /**
   * Number of decimal places for this asset
   */
  @IsOptional()
  @Type(() => Number)
  decimals?: number;

  /**
   * Whether asset is currently available for trading
   */
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  /**
   * Available networks for this asset
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetNetworkDto)
  @IsOptional()
  networks?: AssetNetworkDto[];

  /**
   * Icon URL for asset display
   */
  @IsOptional()
  @IsString()
  iconUrl?: string;

  /**
   * Description of the asset
   */
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO for asset registry response
 */
export class AssetRegistryDto {
  /**
   * Array of available assets
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetDto)
  assets!: AssetDto[];

  /**
   * Total count of assets
   */
  @Type(() => Number)
  totalCount!: number;

  /**
   * Whether Prime addresses are included
   */
  @IsBoolean()
  includePrimeAddresses!: boolean;

  /**
   * Timestamp of registry initialization
   */
  @IsOptional()
  @IsString()
  initializedAt?: string;
}
```

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/dtos/asset.dto.ts
# Expected: No errors
```

### Step 6: Create Callback DTO

**File**: `lib/robinhood/dtos/callback.dto.ts`

**Action**: Create DTO for Robinhood callback parameters

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsNumberString,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * DTO for Robinhood callback URL parameters
 *
 * Validates query parameters received from Robinhood after transaction
 */
export class RobinhoodCallbackDto {
  /**
   * Asset symbol (e.g., 'BTC')
   */
  @IsString()
  @IsNotEmpty({ message: "Asset is required" })
  @Matches(/^[A-Z0-9]+$/, { message: "Asset must be uppercase alphanumeric" })
  @Transform(({ value }) => value?.toUpperCase())
  asset!: string;

  /**
   * Network name (e.g., 'BITCOIN')
   */
  @IsString()
  @IsNotEmpty({ message: "Network is required" })
  @Matches(/^[A-Z0-9_]+$/, {
    message: "Network must be uppercase alphanumeric",
  })
  @Transform(({ value }) => value?.toUpperCase())
  network!: string;

  /**
   * ConnectId from initial URL generation
   */
  @IsString()
  @IsNotEmpty({ message: "ConnectId is required" })
  connectId!: string;

  /**
   * Robinhood order ID
   */
  @IsString()
  @IsNotEmpty({ message: "Order ID is required" })
  orderId!: string;

  /**
   * Optional amount (may not always be provided)
   */
  @IsOptional()
  @IsNumberString()
  amount?: string;

  /**
   * Optional status from Robinhood
   */
  @IsOptional()
  @IsString()
  status?: string;

  /**
   * Optional user identifier passed through
   */
  @IsOptional()
  @IsString()
  userIdentifier?: string;

  /**
   * Optional destination fund ID passed through
   */
  @IsOptional()
  @IsString()
  destinationFundId?: string;
}
```

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/dtos/callback.dto.ts
# Expected: No errors
```

### Step 7: Create DTO Index

**File**: `lib/robinhood/dtos/index.ts`

**Action**: Create barrel export

```typescript
/**
 * Robinhood DTOs
 *
 * Data Transfer Objects with validation for Robinhood Connect integration
 * Uses class-validator for runtime validation
 */

// DTOs
export { GenerateUrlDto } from "./generate-url.dto";
export {
  CreatePledgeDto,
  PledgeStatus,
  CentralizedExchangeStatus,
} from "./create-pledge.dto";
export { AssetDto, AssetNetworkDto, AssetRegistryDto } from "./asset.dto";
export { RobinhoodCallbackDto } from "./callback.dto";

// Re-export commonly used validators
export { validate, validateOrReject, ValidationError } from "class-validator";
export { plainToClass, classToPlain } from "class-transformer";
```

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/dtos/index.ts
# Expected: No errors
```

### Step 8: Update Main Robinhood Index

**File**: `lib/robinhood/index.ts`

**Action**: Add DTO exports

```typescript
// Existing exports (keep all)
export * from "./types";
export * from "./constants/networks";
export * from "./constants/errors";
export * from "./services";

// NEW: DTO exports
export {
  GenerateUrlDto,
  CreatePledgeDto,
  PledgeStatus,
  CentralizedExchangeStatus,
  AssetDto,
  AssetNetworkDto,
  AssetRegistryDto,
  RobinhoodCallbackDto,
} from "./dtos";

// Re-export validation utilities
export { validate, validateOrReject, ValidationError } from "./dtos";
```

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/index.ts
# Expected: No errors
```

### Step 9: Create Validation Helper

**File**: `lib/robinhood/dtos/validation-helper.ts`

**Action**: Create utility for validating DTOs

````typescript
import { validate, ValidationError } from "class-validator";
import { plainToClass, ClassConstructor } from "class-transformer";

/**
 * Validation result
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validate and transform plain object to DTO instance
 *
 * @param dtoClass - The DTO class to validate against
 * @param plainObject - Plain object to validate
 * @returns Validation result with transformed instance or errors
 *
 * @example
 * ```typescript
 * const result = await validateDto(GenerateUrlDto, requestBody);
 * if (!result.success) {
 *   throw new Error(result.errors.join(', '));
 * }
 * const dto = result.data;
 * ```
 */
export async function validateDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  plainObject: any
): Promise<ValidationResult<T>> {
  // Transform plain object to class instance
  const dtoInstance = plainToClass(dtoClass, plainObject);

  // Validate
  const errors: ValidationError[] = await validate(dtoInstance);

  if (errors.length > 0) {
    // Extract error messages
    const errorMessages = errors.flatMap((error) =>
      error.constraints ? Object.values(error.constraints) : []
    );

    return {
      success: false,
      errors: errorMessages,
    };
  }

  return {
    success: true,
    data: dtoInstance,
  };
}

/**
 * Validate DTO or throw error
 *
 * @param dtoClass - The DTO class to validate against
 * @param plainObject - Plain object to validate
 * @returns Validated DTO instance
 * @throws {Error} If validation fails
 */
export async function validateDtoOrThrow<T extends object>(
  dtoClass: ClassConstructor<T>,
  plainObject: any
): Promise<T> {
  const result = await validateDto(dtoClass, plainObject);

  if (!result.success) {
    throw new Error(`Validation failed: ${result.errors?.join(", ")}`);
  }

  return result.data!;
}
````

**Validation**:

```bash
npx tsc --noEmit lib/robinhood/dtos/validation-helper.ts
# Expected: No errors
```

### Step 10: Test DTO Validation

**File**: `lib/robinhood/dtos/__test-validation.ts` (temporary)

**Action**: Create validation test

```typescript
import { validateDto } from "./validation-helper";
import { GenerateUrlDto, CreatePledgeDto, RobinhoodCallbackDto } from "./index";

async function testValidation() {
  console.log("Testing DTO Validation...\n");

  // Test 1: Valid GenerateUrlDto
  console.log("Test 1: Valid GenerateUrlDto");
  const validUrlData = {
    connectId: "abc-123-def-456",
    asset: "btc", // Should transform to uppercase
    network: "bitcoin", // Should transform to uppercase
    amount: "0.5",
    callbackUrl: "https://example.com/callback",
  };

  const urlResult = await validateDto(GenerateUrlDto, validUrlData);
  console.log("Success:", urlResult.success);
  console.log("Transformed asset:", urlResult.data?.asset);
  console.log("Transformed network:", urlResult.data?.network);
  console.log("✅ Test 1 passed\n");

  // Test 2: Invalid GenerateUrlDto (missing required field)
  console.log("Test 2: Invalid GenerateUrlDto");
  const invalidUrlData = {
    connectId: "abc-123",
    asset: "BTC",
    // Missing network!
    amount: "0.5",
    callbackUrl: "https://example.com/callback",
  };

  const invalidResult = await validateDto(GenerateUrlDto, invalidUrlData);
  console.log("Success:", invalidResult.success);
  console.log("Errors:", invalidResult.errors);
  console.log("✅ Test 2 passed (caught validation error)\n");

  // Test 3: Valid CreatePledgeDto
  console.log("Test 3: Valid CreatePledgeDto");
  const pledgeData = {
    otcTransactionHash: "robinhood:abc-123-def",
    inputToken: 1,
    inputAmount: "50000000", // 0.5 BTC in satoshis
    destinationOrgId: "fund-123",
    status: "PENDING_LIQUIDATION",
  };

  const pledgeResult = await validateDto(CreatePledgeDto, pledgeData);
  console.log("Success:", pledgeResult.success);
  console.log("✅ Test 3 passed\n");

  // Test 4: Valid RobinhoodCallbackDto
  console.log("Test 4: Valid RobinhoodCallbackDto");
  const callbackData = {
    asset: "btc",
    network: "bitcoin",
    connectId: "abc-123-def",
    orderId: "order-789",
  };

  const callbackResult = await validateDto(RobinhoodCallbackDto, callbackData);
  console.log("Success:", callbackResult.success);
  console.log("✅ Test 4 passed\n");

  console.log("🎉 All DTO validation tests passed!");
}

testValidation().catch(console.error);
```

**Validation**:

```bash
npx ts-node lib/robinhood/dtos/__test-validation.ts
```

**Expected Output**:

```
Testing DTO Validation...

Test 1: Valid GenerateUrlDto
Success: true
Transformed asset: BTC
Transformed network: BITCOIN
✅ Test 1 passed

Test 2: Invalid GenerateUrlDto
Success: false
Errors: [ 'Network is required' ]
✅ Test 2 passed (caught validation error)

Test 3: Valid CreatePledgeDto
Success: true
✅ Test 3 passed

Test 4: Valid RobinhoodCallbackDto
Success: true
✅ Test 4 passed

🎉 All DTO validation tests passed!
```

**Cleanup**:

```bash
rm lib/robinhood/dtos/__test-validation.ts
```

## Deliverables Checklist

- [ ] Directory `lib/robinhood/dtos/` created
- [ ] `generate-url.dto.ts` created with validators
- [ ] `create-pledge.dto.ts` created matching CryptoDonationPledge
- [ ] `asset.dto.ts` created for asset responses
- [ ] `callback.dto.ts` created for Robinhood callbacks
- [ ] `validation-helper.ts` created with utilities
- [ ] `dtos/index.ts` created with exports
- [ ] Main `index.ts` updated
- [ ] All DTOs use class-validator decorators
- [ ] Transform decorators added where needed
- [ ] All TypeScript files compile
- [ ] Validation tests pass

## Validation Steps

### Validation 1: Imports Work

```bash
npx ts-node -e "import { GenerateUrlDto, CreatePledgeDto } from './lib/robinhood/dtos'; console.log('✅ DTO imports work');"
```

**Expected**: "✅ DTO imports work"

### Validation 2: Validation Works

Run the test from Step 10

**Expected**: All 4 tests pass

### Validation 3: Type Safety

```bash
npx tsc --noEmit
```

**Expected**: No errors

## Common Issues and Solutions

### Issue 1: Decorator Metadata

**Symptom**: "Design:type metadata" errors

**Solution**:

- Add `"emitDecoratorMetadata": true` to `tsconfig.json`
- Add `"experimentalDecorators": true` to `tsconfig.json`

### Issue 2: Transform Not Working

**Symptom**: Values not transforming to uppercase

**Solution**:

- Ensure using `plainToClass` from class-transformer
- Check Transform decorator is properly applied
- Verify class-transformer version compatible

### Issue 3: Validation Not Catching Errors

**Symptom**: Invalid data passes validation

**Solution**:

- Ensure using `validate` from class-validator
- Check decorators are properly imported
- Verify validation is actually awaited

## Integration Points

### What This Provides

- DTOs with runtime validation
- Type-safe data transfer objects
- Transform utilities
- Validation helper functions

### What Depends On This

- **SP3**: Mock services will use these DTOs
- **SP7**: Pledge service will validate with CreatePledgeDto
- **SP10**: Callback handling will use RobinhoodCallbackDto
- **SP11**: API routes will use validation helpers

### What It Requires

- **SP1**: Service interfaces to match
- class-validator package
- class-transformer package

## Next Steps

After completing this sub-plan:

1. **Verify** all deliverables checked off
2. **Create** implementation log: `YYYYMMDD-HHMM-SP2-COMPLETE.md`
3. **Test** DTO validation thoroughly
4. **Proceed to** [Sub-Plan 3: Mock Backend Services](./sub-plan-3-mock-backend-services.md)

## Notes

- All DTOs use class-validator for runtime validation
- Transform decorators ensure data normalization (e.g., uppercase)
- CreatePledgeDto matches CryptoDonationPledge entity exactly
- Validation helpers make DTO usage easy in routes
- All validation is asynchronous - must await

