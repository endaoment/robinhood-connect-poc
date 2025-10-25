# Developer Guide

> Development reference for the Robinhood Connect POC.

## Quick Setup

```bash
npm install
cp .env.example .env.local  # Add API credentials
npm run dev                 # Start development server
```

See [../README.md](../README.md) for complete setup.

## Project Structure

See [STRUCTURE.md](./STRUCTURE.md) for complete directory organization.

**Frontend** (`app/`) - Next.js POC demonstration  
**Backend** (`libs/`) - NestJS modules for production migration

## Development Commands

```bash
npm run dev              # Development server
npm test                 # Run all tests
npm run test:coverage    # Coverage report
npx tsc --noEmit        # Type check
npm run build            # Production build
npm test libs/robinhood  # Run specific library tests
```

## Environment Variables

Required:

```env
ROBINHOOD_APP_ID=your-app-id
ROBINHOOD_API_KEY=your-api-key
```

## Working with Services

### Service Organization

**RobinhoodClientService** - API communication  
**AssetRegistryService** - Asset management  
**UrlBuilderService** - URL generation  
**PledgeService** - Pledge creation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for service details.

### Adding a New Service

1. Create service in `libs/robinhood/src/lib/services/`
2. Add `@Injectable()` decorator
3. Register in `robinhood.module.ts` providers
4. Create test file in `libs/robinhood/tests/services/`
5. Export from `libs/robinhood/src/index.ts`

### Service Patterns

Use object parameters for 3+ arguments:

```typescript
// Good
generateUrl({ asset, network, amount, walletAddress })

// Avoid
generateUrl(asset, network, amount, walletAddress)
```

## Testing

### Run Tests

```bash
npm test                          # All tests
npm test libs/robinhood           # Specific library
npm run test:coverage             # With coverage
npm test -- --watch               # Watch mode
npm test -- path/to/file.spec.ts # Single file
```

### Test Structure

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do expected behavior', () => {
      // Arrange
      const input = { ... }

      // Act
      const result = service.method(input)

      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

### Mocking HTTP Calls

Use nock for Robinhood API:

```typescript
import { mockRobinhoodConnectIdSuccess } from '../mocks/robinhood-nock-api'

mockRobinhoodConnectIdSuccess('test-connect-id')
const result = await service.generateConnectId(params)
expect(nock.isDone()).toBe(true)
```

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for complete testing documentation.

## Common Workflows

### Adding a New Asset

1. Add to `libs/robinhood/src/lib/assets/evm-assets.ts` or `non-evm-assets.ts`
2. Run tests to verify
3. Test in UI at `/dashboard`

### Adding a New Network

1. Add to `libs/robinhood/src/lib/constants/networks.ts`
2. Add wallet address to `libs/robinhood/src/lib/assets/prime-addresses.ts`
3. Update asset mappings
4. Add tests

### Debugging Issues

**TypeScript Errors**:

```bash
npx tsc --noEmit
```

**Test Failures**:

```bash
npm test -- --verbose
```

**Next.js Cache Issues**:

```bash
rm -rf .next node_modules/.cache
npm run dev
```

## Code Style

- TypeScript strict mode enabled
- Single quotes, no semicolons
- Object parameter pattern for 3+ args
- Comprehensive JSDoc on services
- class-validator decorators on DTOs

See [LINTING-AND-TYPE-SAFETY.md](./LINTING-AND-TYPE-SAFETY.md) for standards.

## Deployment

### Vercel

```bash
npm i -g vercel
vercel                   # Deploy
vercel --prod            # Production
```

Add environment variables in Vercel dashboard.

### Post-Deployment

1. Register callback URL with Robinhood
2. Test complete flow
3. Monitor logs

## Migration to Backend

See [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) for complete backend integration instructions.

**Summary**: Copy `libs/robinhood/` to `endaoment-backend/libs/api/robinhood/` and wire dependencies.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.MD) - System architecture
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing approach
- [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) - Backend migration
- [STRUCTURE.md](./STRUCTURE.md) - Directory layout
- [FLOW-DIAGRAMS.md](./FLOW-DIAGRAMS.md) - Visual flows
