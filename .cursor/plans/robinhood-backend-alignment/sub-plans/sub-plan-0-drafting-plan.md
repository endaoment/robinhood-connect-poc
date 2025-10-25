# Sub-Plan 0: Robinhood POC Backend Alignment - Drafting Plan

**Status**: Ready for Implementation
**Priority**: Critical
**Dependencies**: None
**Estimated Time**: 2-3 hours (planning only)

## Context Required

### Current POC Architecture

**File**: `robinhood-onramp/app/api/robinhood/` (Next.js API routes)

- Lines 1-103: `health/route.ts` - Health check endpoint
- `assets/route.ts` - Asset listing endpoint
- `generate-onramp-url/route.ts` - URL generation endpoint

**File**: `robinhood-onramp/lib/robinhood/` (Utility library)

- `api/robinhood-client.ts` - Robinhood API client (currently empty)
- `assets/` - Asset registry, discovery, helpers, prime addresses
- `constants/` - Error messages, network definitions
- `url-builder/` - URL generation logic
- `types.ts` - TypeScript type definitions
- `index.ts` - Public exports

**File**: `robinhood-onramp/lib/backend-integration/` (Partial backend mapping)

- `token-resolver.ts` - Maps Robinhood assets to backend tokens
- `amount-converter.ts` - Amount conversion utilities
- `pledge-mapper.ts` - Maps callback data to pledge format
- `validation.ts` - Input validation

**Tests**: Only one skeleton test file exists (`__tests__/url-builder.test.ts`)

### Gold Standard Reference: Coinbase Integration (PR #2123)

**Structure**: `libs/api/coinbase/`

- `src/lib/coinbase.controller.ts` - NestJS controller
- `src/lib/coinbase.module.ts` - Module with DI
- `src/lib/dtos/` - Request/response DTOs with validation
- `src/lib/services/` - Business logic layer
  - `coinbase-auth.service.ts` - OAuth flow (290 lines)
  - `coinbase.service.ts` - API client (227 lines)
  - `coinbase-pledge.service.ts` - Pledge integration (302 lines)
  - `coinbase-encryption.service.ts` - Token encryption (121 lines)
  - `url-validation.service.ts` - URL validation
- `tests/` - Comprehensive tests (2200+ lines total)
  - `coinbase-auth.spec.ts` - 756 lines
  - `coinbase-donation.spec.ts` - 929 lines
  - `coinbase-nock-api.ts` - 520 lines

**Key Patterns to Adopt**:

- Object parameters for 3+ arguments
- Comprehensive error handling with retry logic
- DTOs with class-validator decorators
- Integration tests with nock mocking
- Service-based architecture with DI
- Proper TypeScript exports

### Robinhood SDK Documentation

**Reference**: `Robinhood_Connect_SDK_Combined.md`

**Key APIs**:

- ConnectId API: `POST /catpay/v1/connect_id/`
- Discovery API: `GET /api/v1/crypto/trading/assets/`
- Quote API: `GET /catpay/v1/{assetCode}/quote/`

**Available in POC**: Sample responses, request formats, all documented

## Objectives

1. **Refactor POC Structure**: Align with backend patterns WITHOUT touching endaoment-backend
2. **Service Layer**: Extract business logic into injectable service classes
3. **Mock Backend Integration**: Create mock services showing backend API calls via toasts
4. **Comprehensive Testing**: Add tests matching Coinbase coverage standards
5. **Documentation**: Provide migration guide for future implementer
6. **Copy/Paste Ready**: Make structure directly portable to endaoment-backend

## Phase Outline

### Phase 1: Foundation (Sub-Plans 1-3)

- **SP1**: Service Layer Restructuring
- **SP2**: DTOs and Type Definitions
- **SP3**: Mock Backend Services

### Phase 2: Core Services (Sub-Plans 4-7)

- **SP4**: Robinhood Client Service
- **SP5**: Asset Registry Service
- **SP6**: URL Builder Service
- **SP7**: Mock Pledge Service (with toasts)

### Phase 3: Testing (Sub-Plans 8-9)

- **SP8**: Test Infrastructure Setup
- **SP9**: Comprehensive Test Suite

### Phase 4: Integration Demonstration (Sub-Plans 10-11)

- **SP10**: Backend Integration Mocks
- **SP11**: API Route Refactoring

### Phase 5: Documentation (Sub-Plans 12-13)

- **SP12**: Migration Guide
- **SP13**: Architecture Documentation

## Directory Structure

Refactored POC (stays in robinhood-connect-poc repo):

```
robinhood-onramp/
├── app/
│   ├── api/
│   │   └── robinhood/
│   │       ├── health/route.ts          # Keeps Next.js wrapper
│   │       ├── assets/route.ts          # Wraps AssetService
│   │       └── url/generate/route.ts    # Wraps UrlService
│   ├── callback/page.tsx                # Frontend - unchanged
│   └── dashboard/page.tsx               # Frontend - unchanged
├── lib/
│   ├── robinhood/
│   │   ├── services/                    # NEW: Backend-style services
│   │   │   ├── robinhood-client.service.ts
│   │   │   ├── asset-registry.service.ts
│   │   │   ├── url-builder.service.ts
│   │   │   ├── pledge.service.ts       # Mocked
│   │   │   └── types.ts
│   │   ├── dtos/                        # NEW: DTOs with validation
│   │   │   ├── generate-url.dto.ts
│   │   │   ├── create-pledge.dto.ts
│   │   │   └── asset.dto.ts
│   │   ├── constants/
│   │   │   ├── networks.ts
│   │   │   └── errors.ts
│   │   ├── types.ts
│   │   └── index.ts                     # Public exports
│   └── backend-mock/                    # NEW: Mock backend integration
│       ├── mock-pledge.service.ts
│       ├── mock-token.service.ts
│       ├── toast-logger.ts              # Shows API calls as toasts
│       └── types.ts                     # Backend entity types
├── __tests__/                           # NEW: Comprehensive tests
│   ├── services/
│   │   ├── robinhood-client.test.ts
│   │   ├── asset-registry.test.ts
│   │   ├── url-builder.test.ts
│   │   └── pledge.test.ts
│   ├── mocks/
│   │   └── robinhood-nock-api.ts       # Nock helpers
│   └── setup.ts
├── docs/
│   └── MIGRATION-GUIDE.md               # NEW: For backend implementer
└── package.json
```

## Dependencies

### Required Packages to Add

```json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "nock": "^13.5.0",
    "@types/node": "^20.0.0"
  },
  "dependencies": {
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  }
}
```

## Success Criteria

### Technical

- ✅ Services use object parameters for 3+ args
- ✅ DTOs have class-validator decorators
- ✅ All services properly exported from index.ts
- ✅ Error handling with try-catch and logging
- ✅ Test coverage 500+ lines per major spec
- ✅ Jest configured and running

### Mock Integration

- ✅ Toast shows all backend API calls
- ✅ CryptoDonationPledge structure documented
- ✅ Token resolution process demonstrated
- ✅ Backend endpoints clearly identified
- ✅ Request/response formats shown

### Documentation

- ✅ Migration guide for backend implementer
- ✅ Service architecture documented
- ✅ All mock services explained
- ✅ Copy/paste instructions provided

## Risk Assessment

### 🟢 LOW RISK

**Service Extraction**: Logic already exists, just reorganizing

- **Mitigation**: Keep original files until refactoring complete

**DTO Creation**: Straightforward type definitions

- **Mitigation**: Use Coinbase DTOs as template

**Mock Services**: No real backend dependency

- **Mitigation**: Clear documentation of what's mocked

### 🟡 MEDIUM RISK

**Test Infrastructure**: Need to add Jest, configure properly

- **Mitigation**: Use Coinbase jest.config.ts as template
- **Impact**: May need test setup debugging

**Nock Configuration**: First time using nock in POC

- **Mitigation**: Study Coinbase nock helpers closely
- **Impact**: Learning curve for nock patterns

### 🔴 CRITICAL

**CryptoDonationPledge Mapping**: Must map all fields correctly

- **Mitigation**: Review entity definition in PR #2123
- **Impact**: Incorrect mapping = wrong guidance for implementer
- **Validation**: Validate against actual entity structure

**Object Parameter Pattern**: Must apply consistently

- **Mitigation**: Create interface for every multi-arg function
- **Impact**: Large refactoring if done wrong
- **Checkpoint**: Review after SP3

## Estimated Timeline

**Total**: 45-58 hours (6-7 days focused work)

**Phase 1** (Foundation): 11-14 hours
**Phase 2** (Services): 14-18 hours
**Phase 3** (Testing): 12-15 hours
**Phase 4** (Integration): 5-7 hours
**Phase 5** (Documentation): 5-7 hours

## Next Steps

1. Create OVERVIEW.md with comprehensive project context
2. Create README.md for navigation
3. Draft all 13 sub-plans with detailed implementation steps
4. Review planning structure for completeness
5. Begin implementation with SP1
