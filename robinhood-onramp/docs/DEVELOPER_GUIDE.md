# Robinhood Connect - Developer Guide

## Table of Contents

1. [Project Structure](#project-structure)
2. [Architecture Overview](#architecture-overview)
3. [Development Setup](#development-setup)
4. [Working with Services](#working-with-services)
5. [Testing](#testing)
6. [Environment Variables](#environment-variables)
7. [Common Workflows](#common-workflows)
8. [Deployment](#deployment)

---

## Project Structure

This POC follows a clean **Frontend/Backend separation** pattern, aligned with endaoment-backend standards:

```
robinhood-onramp/
├── app/                    # 🎨 FRONTEND: Next.js (POC demonstration)
│   ├── (routes)/           # Page routes
│   │   ├── dashboard/      # Asset selection UI
│   │   └── callback/       # Transfer confirmation
│   ├── api/robinhood/      # ⚠️ POC-only routes (deleted in migration)
│   ├── components/         # React components
│   ├── hooks/              # React hooks
│   ├── lib/                # Frontend utils (cn(), etc.)
│   └── types/              # Frontend TypeScript types
│
├── libs/                   # 🔧 BACKEND: Complete NestJS modules
│   ├── robinhood/          # ✅ Backend-ready (copy to endaoment-backend)
│   │   ├── src/lib/        # Implementation
│   │   │   ├── services/           # Business logic
│   │   │   ├── dtos/               # Validation with class-validator
│   │   │   ├── constants/          # Configuration
│   │   │   ├── assets/             # Asset discovery
│   │   │   ├── backend-integration/# Pledge mapping
│   │   │   ├── robinhood.module.ts  # NestJS module
│   │   │   └── robinhood.controller.ts # NestJS controller
│   │   └── tests/          # Jest tests co-located
│   │       ├── services/   # Service tests
│   │       ├── mocks/      # nock helpers
│   │       └── setup.ts    # Test configuration
│   │
│   ├── coinbase/           # Coinbase Prime support
│   │   ├── src/lib/services/
│   │   └── tests/
│   │
│   └── shared/             # Shared utilities
│       ├── src/lib/helpers/
│       └── src/lib/backend-mock/  # POC-only (toast logger)
│
├── docs/                   # 📚 Documentation
├── scripts/                # 🛠️ Development scripts
└── public/                 # 📦 Static assets
```

### Why This Structure?

**Frontend (`app/`)**: POC demonstration with Next.js
- React components, pages, hooks
- API routes (thin wrappers calling `libs/`)
- Deleted when migrating to backend

**Backend (`libs/`)**: Production-ready NestJS modules
- Complete service layer with dependency injection
- DTOs with class-validator decorators
- Comprehensive tests (183 tests, 98%+ coverage)
- Copy directly to endaoment-backend

See [STRUCTURE.md](../STRUCTURE.md) for complete organization details.

---

## Architecture Overview

### Service-Based Architecture

All business logic is in **injectable service classes**:

```typescript
@Injectable()
export class UrlBuilderService {
  constructor(
    private readonly robinhoodClient: RobinhoodClientService,
    private readonly assetRegistry: AssetRegistryService
  ) {}

  async generateUrl({
    asset,
    network,
    amount,
    userIdentifier
  }: GenerateUrlParams): Promise<GenerateUrlResult> {
    // Implementation with error handling, retry logic
  }
}
```

### Core Services

**libs/robinhood/src/lib/services/**:

1. **RobinhoodClientService** - Robinhood API communication
   - `generateConnectId()` - Get valid connect ID from Robinhood
   - `fetchAssets()` - Asset discovery
   - HTTP client with retry logic

2. **AssetRegistryService** - Asset metadata and discovery
   - `initialize()` - Build asset registry (singleton)
   - `getAssets()` - Return supported assets
   - `getAssetBySymbol()` - Find specific asset

3. **UrlBuilderService** - URL generation
   - `generateUrl()` - Create onramp URL
   - `buildRedirectUrl()` - Construct callback URL
   - Proper parameter encoding

4. **PledgeService** - Pledge creation
   - `createFromCallback()` - Convert callback to pledge
   - `mapCallbackToPledge()` - Field mapping logic
   - Amount conversion to smallest units

### DTO Validation

All API inputs validated with class-validator:

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
}
```

### Technology Stack

- **Framework**: Next.js 14+ (POC), NestJS ready for backend
- **Language**: TypeScript (strict mode)
- **Validation**: class-validator + class-transformer
- **Testing**: Jest 29+ with nock for HTTP mocking
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **API Client**: Native fetch with retry logic

---

## Development Setup

### Prerequisites

- Node.js 20+
- npm or pnpm
- Robinhood API credentials

### Installation

```bash
# Clone repository
cd robinhood-onramp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

Visit `http://localhost:3030/dashboard`

### Environment Variables

Required in `.env.local`:

```bash
# Robinhood API
ROBINHOOD_APP_ID=your-app-id
ROBINHOOD_API_KEY=your-api-key
ROBINHOOD_BASE_URL=https://trading.robinhood.com

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3030
```

See [Environment Configuration](#environment-configuration) for details.

---

## Working with Services

### Adding a New Service

1. **Create Service File**:

```typescript
// libs/robinhood/src/lib/services/my-service.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyService {
  constructor(
    private readonly dependency: OtherService
  ) {}

  async doSomething(params: MyParams): Promise<MyResult> {
    // Implementation
  }
}
```

2. **Export from Index**:

```typescript
// libs/robinhood/src/lib/services/index.ts
export * from './my-service.service';
```

3. **Add to Module**:

```typescript
// libs/robinhood/src/lib/robinhood.module.ts
providers: [
  // ... existing services
  MyService,
],
```

4. **Write Tests**:

```typescript
// libs/robinhood/tests/services/my-service.service.spec.ts
describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService(mockDependency);
  });

  it('should do something', async () => {
    // Arrange
    const params = { ... };
    
    // Act
    const result = await service.doSomething(params);
    
    // Assert
    expect(result).toEqual(expected);
  });
});
```

### Object Parameter Pattern

For functions with 3+ parameters, use object params:

```typescript
// ❌ Bad (positional parameters)
async generateUrl(asset: string, network: string, amount: number, userId: string) {}

// ✅ Good (object parameters)
async generateUrl({
  asset,
  network,
  amount,
  userId
}: GenerateUrlParams): Promise<GenerateUrlResult> {}
```

### Error Handling

All services implement proper error handling:

```typescript
try {
  const result = await operation();
  return result;
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  this.logger.error(`Operation failed: ${message}`, error);
  throw new CustomError(`User-friendly message: ${message}`);
}
```

---

## Testing

### Test Structure

```
libs/robinhood/tests/
├── services/                       # Service tests
│   ├── robinhood-client.service.spec.ts
│   ├── asset-registry.service.spec.ts
│   ├── url-builder.service.spec.ts
│   └── pledge.service.spec.ts
├── mocks/
│   └── robinhood-nock-api.ts      # nock helpers
└── setup.ts                        # Test configuration
```

**Stats**: 183 tests, 3,044 lines, 98%+ coverage

### Running Tests

```bash
# Run all tests
npm test

# Run specific library tests
npm test libs/robinhood

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

### Writing Tests (AAA Pattern)

```typescript
describe('UrlBuilderService', () => {
  describe('generateUrl', () => {
    it('should generate valid URL', async () => {
      // Arrange
      const dto = { asset: 'ETH', network: 'ETHEREUM', ... };
      mockRobinhoodConnectIdSuccess('abc-123');
      
      // Act
      const result = await service.generateUrl(dto);
      
      // Assert
      expect(result.url).toContain('connectId=abc-123');
      expect(nock.isDone()).toBe(true);
    });
  });
});
```

### Using nock for HTTP Mocking

```typescript
import nock from 'nock';
import { mockRobinhoodConnectIdSuccess } from './mocks/robinhood-nock-api';

// Mock Robinhood API
mockRobinhoodConnectIdSuccess('test-connect-id');

// Or manually:
nock('https://trading.robinhood.com')
  .post('/catpay/v1/connect_id/')
  .reply(200, { connect_id: 'abc-123' });
```

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing documentation.

---

## Environment Configuration

### Required Variables

```bash
# .env.local

# Robinhood API Configuration
ROBINHOOD_APP_ID=your-app-id-from-robinhood-dashboard
ROBINHOOD_API_KEY=your-api-key-from-robinhood-dashboard
ROBINHOOD_BASE_URL=https://trading.robinhood.com

# Application URL (for callbacks)
NEXT_PUBLIC_BASE_URL=http://localhost:3030  # or production domain

# Coinbase Prime (for Prime addresses)
COINBASE_PRIME_API_KEY=your-prime-api-key
COINBASE_SERVICE_ACCOUNT_ID=your-service-account-id
COINBASE_PRIME_PASSPHRASE=your-passphrase
COINBASE_PRIME_SIGNING_KEY=your-signing-key
COINBASE_PRIME_PORTFOLIO_ID=your-portfolio-id

# Default Fund ID
DEFAULT_FUND_ID=your-default-fund-id
```

### Security Best Practices

✅ **Do**:
- Store API keys in `.env.local` (not committed)
- Access keys only in API routes (server-side)
- Validate environment variables on startup
- Use proper error handling without exposing keys

❌ **Don't**:
- Hardcode API keys in code
- Expose keys in client-side code
- Log API keys in console or logs
- Commit keys to version control

---

## Common Workflows

### Development Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Make changes to services in libs/robinhood/src/lib/

# 3. Write/update tests in libs/robinhood/tests/

# 4. Run tests
npm test libs/robinhood

# 5. Type check
npx tsc --noEmit

# 6. Verify POC works
# Visit http://localhost:3030/dashboard
```

### Adding a New Asset

1. Check if asset is supported by Robinhood
2. Asset discovery will automatically include it
3. Ensure Prime address exists for asset's network
4. Test in POC dashboard

### Adding a New Network

1. Add network to `libs/robinhood/src/lib/constants/networks.ts`
2. Add Prime address for network
3. Update network mappers if needed
4. Test with assets on that network

### Debugging

```bash
# Enable detailed logging
DEBUG=* npm run dev

# Check TypeScript errors
npx tsc --noEmit

# Run specific test
npm test -- url-builder.service.spec.ts

# Check test coverage
npm run test:coverage -- --collectCoverageFrom='libs/robinhood/src/lib/services/**'
```

---

## Deployment

### Backend Migration (Production)

**See [MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md) for complete instructions.**

Quick summary:

```bash
# 1. Copy libs/robinhood to backend
cp -r libs/robinhood endaoment-backend/libs/api/robinhood

# 2. Uncomment decorators in module/controller

# 3. Wire real services (replace mocks)

# 4. Add environment variables

# 5. Import module in app.module.ts

# 6. Run tests
npm test libs/api/robinhood

# 7. Deploy
```

**Migration Time**: ~2 hours

### POC Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
vercel env add ROBINHOOD_APP_ID
vercel env add ROBINHOOD_API_KEY
vercel env add NEXT_PUBLIC_BASE_URL
```

### Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificate active
- [ ] Test complete transfer flow
- [ ] Monitor error logs
- [ ] Verify API connectivity
- [ ] Test on mobile devices

---

## Code Quality

### Type Checking

```bash
# Check all TypeScript
npx tsc --noEmit

# Should return exit code 0 (no errors)
```

**Current Status**: ✅ **0 Type Errors**

### Linting

See [LINTING-AND-TYPE-SAFETY.md](./LINTING-AND-TYPE-SAFETY.md) for standards.

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions (see [NAMING-CONVENTIONS.md](./NAMING-CONVENTIONS.md))
- Add JSDoc comments for public functions
- Use object parameters for 3+ arguments
- Proper error handling with typed errors

---

## Troubleshooting

### Common Issues

**TypeScript Compilation Errors**:
```bash
npx tsc --noEmit
# Fix any errors shown
```

**Environment Variables Not Loading**:
- Ensure `.env.local` exists in correct directory
- Restart dev server after changing env vars
- Check variable name spelling

**Tests Failing**:
```bash
# Clear cache
npm test -- --clearCache

# Run specific test
npm test -- url-builder.service.spec.ts --verbose
```

**Build Failures**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture documentation
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Comprehensive testing guide
- [MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md) - Backend integration guide
- [FLOW-DIAGRAMS.md](./FLOW-DIAGRAMS.md) - Visual flow diagrams
- [LINTING-AND-TYPE-SAFETY.md](./LINTING-AND-TYPE-SAFETY.md) - Code quality standards
- [NAMING-CONVENTIONS.md](./NAMING-CONVENTIONS.md) - Naming standards
- [USER_GUIDE.md](./USER_GUIDE.md) - End-user documentation

---

## Support & Resources

- **Robinhood Connect Documentation**: Contact Robinhood team for SDK docs
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **NestJS Documentation**: [docs.nestjs.com](https://docs.nestjs.com)
- **TypeScript Documentation**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs)
- **Jest Documentation**: [jestjs.io/docs](https://jestjs.io/docs)

---

**Last Updated**: October 25, 2025  
**Version**: v1.0.0 (Backend-Aligned)  
**Status**: Production-Ready
