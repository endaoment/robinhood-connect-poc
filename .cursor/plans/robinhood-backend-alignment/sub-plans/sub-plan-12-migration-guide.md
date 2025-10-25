# Sub-Plan 12: Migration Guide for Backend Implementation

**Status**: Pending
**Priority**: High
**Dependencies**: Sub-Plan 11 (API Route Refactoring)
**Estimated Time**: 3-4 hours

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

| POC File                                             | Backend Destination                    | Notes                        |
| ---------------------------------------------------- | -------------------------------------- | ---------------------------- |
| `lib/robinhood/services/robinhood-client.service.ts` | `libs/api/robinhood/src/lib/services/` | Convert to NestJS Injectable |
| `lib/robinhood/dtos/generate-url.dto.ts`             | `libs/api/robinhood/src/lib/dtos/`     | Already has class-validator  |
| ...                                                  | ...                                    | ...                          |

### 3. Module Setup

```typescript
// libs/api/robinhood/src/lib/robinhood.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([CryptoDonationPledge])],
  providers: [
    RobinhoodClientService,
    AssetRegistryService,
    UrlBuilderService,
    RobinhoodPledgeService,
  ],
  controllers: [RobinhoodController],
  exports: [RobinhoodClientService, AssetRegistryService],
})
export class RobinhoodModule {}
```

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

```typescript
@Controller("robinhood")
export class RobinhoodController {
  constructor(
    private readonly robinhoodClient: RobinhoodClientService,
    private readonly pledgeService: RobinhoodPledgeService
  ) {}

  @Post("pledge/create")
  async createPledge(@Body() dto: CreatePledgeDto) {
    return this.pledgeService.createPledge(dto);
  }
}
```

### 11. Checklist for Backend Implementer

- [ ] Copy service files
- [ ] Convert to NestJS Injectables
- [ ] Register in module
- [ ] Copy DTO files (already have decorators)
- [ ] Create controller
- [ ] Update imports
- [ ] Remove mock services
- [ ] Wire to real TokenService
- [ ] Wire to real CryptoDonationPledgeService
- [ ] Migrate tests
- [ ] Add integration tests
- [ ] Test in staging
- [ ] Deploy to production

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
