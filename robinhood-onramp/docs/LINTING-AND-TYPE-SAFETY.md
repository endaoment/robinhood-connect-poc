# Linting and Type Safety

> TypeScript standards for the POC.

## TypeScript Configuration

Strict mode enabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true
  }
}
```

## Type Safety Rules

### No `any` Types

```typescript
// ❌ Avoid
function process(data: any) { ... }

// ✅ Use specific types
function process(data: GenerateUrlDto) { ... }

// ✅ Or unknown for validation
function process(data: unknown) {
  if (isValidDto(data)) {
    // data is now typed
  }
}
```

### Explicit Error Handling

```typescript
try {
  await operation()
} catch (error) {
  if (error instanceof RobinhoodApiError) {
    // Handle API errors
  } else if (error instanceof Error) {
    // Handle other errors
  } else {
    // Handle unknown errors
    throw new Error('Unknown error occurred')
  }
}
```

### DTO Typing

All DTOs use `class-validator` decorators:

```typescript
export class GenerateUrlDto {
  @IsString()
  @IsNotEmpty()
  asset: string

  @IsNumber()
  @IsPositive()
  amount: number
}
```

## Type Checking

```bash
npx tsc --noEmit          # Type check
npm test                   # Run tests
```

Expected: No errors, exit code 0.

## Common Patterns

### API Response Handling

```typescript
interface RobinhoodResponse {
  connect_id: string
  status: string
}

const response = await fetch(url)
const data: RobinhoodResponse = await response.json()
```

### Type Narrowing

```typescript
function processData(data: unknown): ProcessedData {
  if (!isObject(data)) {
    throw new ValidationError('Invalid data')
  }

  if (!hasRequiredFields(data)) {
    throw new ValidationError('Missing fields')
  }

  // data is now typed as ProcessedData
  return data as ProcessedData
}
```

## Integration

### Pre-Commit

```bash
npx tsc --noEmit           # Must pass
npm test                   # Must pass
```

### CI/CD

```yaml
- name: Type Check
  run: npx tsc --noEmit

- name: Test
  run: npm test
```

## Backend Alignment

Services use dependency injection:

```typescript
@Injectable()
export class YourService {
  constructor(private readonly dependency: DependencyService) {}
}
```

DTOs use class-validator:

```typescript
export class YourDto {
  @IsString()
  @IsNotEmpty()
  field: string
}
```

## Documentation

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing approach
