# Sub-Plan 13: Migration Guide for Backend Implementation

**Status**: Pending
**Priority**: High
**Dependencies**: Sub-Plan 12 (API Route Refactoring)

> **Note**: This sub-plan documents migration of the complete `libs/` structure (from SP9.5-9.6) including NestJS controller and module.

## Context Required

All completed implementation from SP1-SP11

## Objectives

Create comprehensive migration guide for backend implementer showing:

1. File-by-file mapping (POC → Backend)
2. Module setup instructions
3. Entity and migration requirements
4. Service registration with DI
5. Environment variable setup
6. Test migration instructions

## Document Structure

### 1. Overview

- What was built in POC
- What needs to move to backend
- Architecture alignment summary

### 2. File Mapping

| POC File                                                      | Backend Destination                     | Notes                        |
| ------------------------------------------------------------- | --------------------------------------- | ---------------------------- |
| `libs/robinhood/src/lib/services/robinhood-client.service.ts` | `libs/api/robinhood/src/lib/services/`  | Convert to NestJS Injectable |
| `libs/robinhood/src/lib/dtos/generate-url.dto.ts`             | `libs/api/robinhood/src/lib/dtos/`      | Already has class-validator  |
| `libs/robinhood/src/lib/constants/*.ts`                       | `libs/api/robinhood/src/lib/constants/` | Copy directly                |
| `libs/robinhood/tests/services/*.spec.ts`                     | `libs/api/robinhood/tests/`             | Update for NestJS testing    |
| `libs/coinbase/src/lib/services/prime-api.service.ts`         | `libs/api/coinbase/src/lib/services/`   | Merge into existing Coinbase |
| `libs/shared/src/lib/utils/*.ts`                              | `libs/shared/src/lib/utils/`            | Copy selectively             |

### 3. Module Setup

✅ **Module already exists in POC!** Just needs minor updates for backend.

**POC Module** (already created in SP9.5):
```typescript
// libs/robinhood/src/lib/robinhood.module.ts
@Module({
  controllers: [RobinhoodController],
  providers: [
    RobinhoodClientService,
    AssetRegistryService,
    UrlBuilderService,
    PledgeService,
  ],
  exports: [RobinhoodClientService, AssetRegistryService],
})
export class RobinhoodModule {}
```

**Backend Module** (add TypeORM and dependencies):
```typescript
// After copying to backend
@Module({
  imports: [
    TypeOrmModule.forFeature([CryptoDonationPledge]),  // ADD THIS
    TokensModule,                                       // ADD THIS
    NotificationModule,                                 // ADD THIS
  ],
  controllers: [RobinhoodController],
  providers: [
    RobinhoodClientService,
    AssetRegistryService,
    UrlBuilderService,
    PledgeService,
  ],
  exports: [RobinhoodClientService, AssetRegistryService],
})
export class RobinhoodModule {}
```

**Changes needed**: Only add imports for backend modules (3 lines)

### 4. Entity Requirements

- CryptoDonationPledge already exists - no new entity needed
- Field mapping documentation
- Validation rules

### 5. Environment Variables

```bash
# .env
ROBINHOOD_APP_ID=<from-robinhood>
ROBINHOOD_API_KEY=<from-robinhood>
ROBINHOOD_BASE_URL=https://trading.robinhood.com
```

### 6. Database Migrations

No new migrations needed - uses existing CryptoDonationPledge table.

### 7. API Endpoints

```
POST /v1/robinhood/pledge/create
GET  /v1/robinhood/assets
POST /v1/robinhood/url/generate
GET  /v1/robinhood/health
```

### 8. Service Conversion

**POC**:

```typescript
export class RobinhoodClientService {
  constructor(config: RobinhoodConfig) {}
}
```

**Backend**:

```typescript
@Injectable()
export class RobinhoodClientService {
  constructor(
    @Inject("ROBINHOOD_CONFIG") config: RobinhoodConfig,
    private readonly logger: LoggerService
  ) {}
}
```

### 9. Test Migration

- Copy test files to `libs/api/robinhood/tests/`
- Update imports to NestJS testing utilities
- Add database test fixtures
- Update mocks for DI

### 10. Controller Implementation

✅ **Controller already exists in POC!** Copy as-is.

**POC Controller** (already created in SP9.5):
```typescript
// libs/robinhood/src/lib/robinhood.controller.ts
@Controller("robinhood")
export class RobinhoodController {
  constructor(
    private readonly robinhoodClient: RobinhoodClientService,
    private readonly assetRegistry: AssetRegistryService,
    private readonly urlBuilder: UrlBuilderService,
    private readonly pledgeService: PledgeService,
  ) {}

  @Get("health")
  async getHealth() { /* ... */ }
  
  @Get("assets")
  async getAssets() { /* ... */ }
  
  @Post("url/generate")
  async generateUrl(@Body() dto: GenerateUrlDto) { /* ... */ }
  
  @Post("callback")
  async handleCallback(@Body() dto: RobinhoodCallbackDto) { /* ... */ }
  
  @Post("pledge/create")
  async createPledge(@Body() dto: CreatePledgeDto) { /* ... */ }
}
```

**Backend**: Copy as-is, works unchanged!

### 11. Simplified Migration Checklist

✅ **Most work is already done!**

- [ ] Copy `libs/robinhood/` folder to backend
- [ ] Add TypeORM import to module (1 line)
- [ ] Add TokensModule import to module (1 line)
- [ ] Add NotificationModule import to module (1 line)
- [ ] Import RobinhoodModule in app.module.ts
- [ ] Update mock services to use real backend services
- [ ] Run tests: `npm test libs/api/robinhood`
- [ ] Test in staging
- [ ] Deploy to production

**What's already done**:
- ✅ Controller created (copy as-is)
- ✅ Module created (minor imports needed)
- ✅ Services ready (work unchanged)
- ✅ DTOs ready (already have decorators)
- ✅ Tests written (183+ tests)
- ✅ All exports configured

### 12. Known Gotchas

- Mock services need removal - replace with real backend services
- Toast logger is POC-only - remove
- Singleton pattern for AssetRegistryService may need adjustment for NestJS
- Object parameter pattern maintained - no changes needed

## Deliverables

- [ ] Complete MIGRATION-GUIDE.md (20+ pages)
- [ ] File mapping table
- [ ] Code examples for all patterns
- [ ] Checklist for implementer
- [ ] Troubleshooting section
- [ ] Testing guide

## Next Steps

**Proceed to** [Sub-Plan 13: Architecture Documentation](./sub-plan-13-architecture-documentation.md)
