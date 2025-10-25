# Linting and Type Safety Standards

This document outlines the linting and type safety standards for the Robinhood Connect onramp integration project.

## Table of Contents

- [Overview](#overview)
- [TypeScript Configuration](#typescript-configuration)
- [Type Safety Standards](#type-safety-standards)
- [Linting Setup](#linting-setup)
- [Common Patterns](#common-patterns)
- [Validation](#validation)

## Overview

This project maintains **zero type errors** with strict TypeScript checking enabled. All code is explicitly typed to ensure maximum type safety and alignment with the endaoment-backend types.

### Key Principles

1. **No `any` types** in application code (except generic constraints)
2. **Explicit return types** for all exported functions
3. **Strict null checking** enabled
4. **Proper error handling** with typed error objects
5. **Alignment with backend types** from endaoment-backend

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,                    // Enable all strict type-checking options
    "noEmit": true,                    // No JS output (Next.js handles compilation)
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "experimentalDecorators": true,     // For class-validator decorators
    "emitDecoratorMetadata": true,      // Required for class-transformer
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

### Key Settings Explained

- **`strict: true`**: Enables all strict type-checking options including:
  - `strictNullChecks`: null and undefined are not assignable to other types
  - `strictFunctionTypes`: Function parameter types are checked contravariantly
  - `strictBindCallApply`: Check that bind, call, and apply methods are called correctly
  - `noImplicitThis`: Raise error on 'this' expressions with an implied 'any' type

- **`experimentalDecorators`** and **`emitDecoratorMetadata`**: Required for class-validator and class-transformer decorators used in DTOs

## Type Safety Standards

### 1. No `any` Types

❌ **Bad:**
```typescript
function processData(data: any) {
  return data.value
}

catch (error: any) {
  console.error(error.message)
}
```

✅ **Good:**
```typescript
function processData(data: { value: string }): string {
  return data.value
}

catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  console.error(message)
}
```

### 2. Explicit Error Handling

All error handling uses `unknown` type and explicit type narrowing:

```typescript
try {
  await someAsyncOperation()
} catch (error: unknown) {
  // Type narrowing
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'An unexpected error occurred'
  
  logger.error('Operation failed:', errorMessage)
  throw new Error(errorMessage)
}
```

### 3. Proper DTO Typing

All DTOs use class-validator decorators with explicit types:

```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class AssetDto {
  @IsString()
  @IsNotEmpty({ message: 'Asset symbol is required' })
  symbol!: string

  @IsOptional()
  @Type(() => Number)
  decimals?: number
}
```

### 4. Reflect-Metadata Import

All libraries using decorators must import `reflect-metadata` in their index file:

```typescript
// libs/robinhood/src/index.ts
import 'reflect-metadata'

export * from './lib'
```

### 5. Generic Utility Functions

For generic utilities, use type parameters properly:

```typescript
// ✅ Acceptable use of 'any' in generic constraints
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
```

Note: `any[]` in generic constraints is acceptable because the actual types are inferred via `Parameters<T>`.

### 6. Logger Interfaces

Loggers accept `unknown[]` for maximum flexibility:

```typescript
export interface ServiceLogger {
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
  debug(message: string, ...args: unknown[]): void
}
```

## Linting Setup

### Type Checking

Run TypeScript compiler to check for type errors:

```bash
npm run type-check
# or
npx tsc --noEmit
```

This should **always** return exit code 0 (no errors).

### Expected Output

```
$ npx tsc --noEmit

# No output = success
```

## Common Patterns

### 1. API Response Handling

```typescript
interface ApiResponse {
  results?: Array<{ is_active?: boolean }>
  [key: string]: unknown
}

async function fetchAssets(): Promise<Asset[]> {
  const response = await fetch('/api/assets')
  const data: ApiResponse = await response.json()
  const assets = data.results || []
  
  // Type-safe filtering
  return assets.filter((asset): asset is { is_active: boolean } => 
    asset.is_active === true
  )
}
```

### 2. Unknown to Typed Narrowing

```typescript
function sanitizeInput(input: unknown): SanitizedData {
  // Use type assertions carefully
  const partial = input as Partial<SanitizedData>
  
  const sanitized: Partial<SanitizedData> = {}
  
  if (partial.field1) sanitized.field1 = partial.field1
  if (partial.field2) sanitized.field2 = partial.field2
  
  return sanitized as SanitizedData
}
```

### 3. Mock Data Typing

```typescript
interface MockRobinhoodAsset {
  asset_code: string
  name: string
  is_active: boolean
  networks: Array<{
    blockchain: string
    is_active: boolean
    confirmation_count: number
  }>
}

export function createMockAssets(count: number = 3): MockRobinhoodAsset[] {
  return Array.from({ length: count }, (_, i) => ({
    asset_code: `ASSET${i}`,
    name: `Asset ${i}`,
    is_active: true,
    networks: [{ 
      blockchain: 'ETHEREUM', 
      is_active: true, 
      confirmation_count: 12 
    }]
  }))
}
```

### 4. External Process Error Handling

When calling external processes (like Python scripts), handle errors with proper typing:

```typescript
try {
  const result = await execPythonScript()
  return result
} catch (error: unknown) {
  const stderr = (error as { stderr?: string }).stderr
  const message = error instanceof Error ? error.message : ''
  
  if (stderr?.includes('specific-error')) {
    console.error('Specific error occurred')
  } else {
    console.error('Script failed:', message || 'Unknown error')
  }
  throw error
}
```

## Validation

### Pre-Commit Checks

Before committing, always run:

```bash
# Type check
npx tsc --noEmit

# Should return exit code 0
echo $?  # Should print: 0
```

### Continuous Integration

The CI pipeline should include:

```yaml
- name: Type Check
  run: npm run type-check
  
- name: Build
  run: npm run build
```

### IDE Integration

Configure your IDE (VS Code, Cursor, etc.) to show TypeScript errors inline:

1. Install the TypeScript extension
2. Enable "TypeScript: Enable Strict Null Checks"
3. Set "TypeScript: Disable Automatic Type Acquisition" to false

## Backend Alignment

All types in this project are designed to align with endaoment-backend types for seamless migration.

### Service Classes

All services use NestJS patterns:

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class RobinhoodClientService {
  constructor(
    @Inject('CONFIG') private readonly config: RobinhoodConfig
  ) {}
}
```

### DTO Classes

All DTOs use class-validator decorators:

```typescript
import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class GenerateUrlDto {
  @IsString()
  @IsNotEmpty()
  asset: string;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  amount: number;
}
```

### Pledge Mapping

Aligned with `CryptoDonationPledge` entity:

```typescript
// Field mapping
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

## Summary

This codebase maintains **zero tolerance for type errors** by:

1. ✅ Using strict TypeScript configuration
2. ✅ Avoiding `any` types (except in generic constraints)
3. ✅ Proper error handling with `unknown` and type narrowing
4. ✅ Explicit typing for all DTOs and interfaces
5. ✅ Importing `reflect-metadata` for decorator support
6. ✅ Aligning with backend type definitions
7. ✅ Running type checks before commits

**Current Status**: ✅ **0 Type Errors**

```bash
$ npx tsc --noEmit
# (no output = success)
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and patterns
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development guidelines
- [NAMING-CONVENTIONS.md](./NAMING-CONVENTIONS.md) - Naming standards
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing documentation

---

**Last Updated**: October 25, 2025  
**Version**: v1.0.0 (Backend-Aligned)  
**Status**: ✅ 0 Type Errors

