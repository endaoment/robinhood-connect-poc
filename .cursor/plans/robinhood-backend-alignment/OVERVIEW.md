# Robinhood POC Backend Alignment - Project Overview

## Project Context

**Brief Description**: Refactor the Robinhood Connect POC to align with endaoment-backend architectural patterns, making it production-ready and copy/paste friendly for final backend integration.

**Goals**:

1. Transform POC structure to match backend service architecture
2. Create comprehensive tests matching Coinbase integration standards
3. Mock all backend dependencies with detailed toast demonstrations
4. Provide complete migration guide for future implementer

**Gold Standard**: Coinbase Integration (PR #2123) at `libs/api/coinbase/`

- Service-based architecture with dependency injection
- DTOs with class-validator decorators
- Comprehensive test coverage (2200+ lines)
- Object parameter pattern for complex functions
- Proper error handling and retry logic

**Current State**: Working POC with business logic scattered across API routes and utility functions, minimal testing, no service layer.

**Target State**: Backend-ready structure with services, DTOs, comprehensive tests, and mock backend integration demonstrations.

## Current State Snapshot

### Exact Current Architecture

**Next.js API Routes** (`robinhood-onramp/app/api/robinhood/`)

- `health/route.ts` (lines 1-103)
  - Line 15-30: Health check logic inline
  - Line 40-65: Asset registry initialization
  - Line 70-85: Prime API health check
  - **Issue**: Business logic in route handler
- `assets/route.ts`
  - Asset listing logic inline
  - No service layer separation
- `generate-onramp-url/route.ts`
  - URL generation logic inline
  - No DTO validation

**Utility Library** (`robinhood-onramp/lib/robinhood/`)

- `api/robinhood-client.ts` - Empty file, needs implementation
- `assets/discovery.ts` - Discovery API logic (lines 1-150)
- `assets/prime-addresses.ts` - Prime address fetching (lines 1-200)
- `assets/registry.ts` - Asset registry building (lines 1-300)
- `url-builder/daffy-style.ts` - URL generation (lines 1-250)
- **Issue**: No service classes, functions with 5+ parameters

**Backend Integration Attempt** (`robinhood-onramp/lib/backend-integration/`)

- `token-resolver.ts` - Token mapping logic
- `pledge-mapper.ts` - Partial pledge mapping
- `amount-converter.ts` - Amount utilities
- **Issue**: Incomplete, no connection to backend patterns

**Testing**

- Only `__tests__/url-builder.test.ts` exists (skeleton)
- No nock mocking setup
- No service-level tests
- **Issue**: <5% coverage vs required 80%+

### Key Issues

1. **No Service Layer**: Business logic in route handlers and utility functions
2. **No DTOs**: Plain TypeScript interfaces, no validation decorators
3. **Inadequate Testing**: Missing 2000+ lines of tests
4. **Poor Separation**: Mock backend logic mixed with real POC code
5. **Parameter Sprawl**: Functions with 5-7 parameters instead of object params
6. **No Error Handling**: Basic try-catch, no retry logic or proper logging

## Architecture Comparison

### Current vs Target State

| Aspect                  | Current POC        | Target (Backend-Ready)        |
| ----------------------- | ------------------ | ----------------------------- |
| **Structure**           | API routes + utils | Services + DTOs + Controllers |
| **Business Logic**      | Inline in routes   | Extracted to services         |
| **Validation**          | Manual checks      | Class-validator DTOs          |
| **Testing**             | 1 skeleton test    | 2200+ lines comprehensive     |
| **Error Handling**      | Basic try-catch    | Retry logic + custom errors   |
| **Parameters**          | 5-7 args           | Object params for 3+          |
| **Backend Integration** | None               | Mocked with toasts            |
| **Exports**             | Ad-hoc             | Proper index.ts barrel        |

### Service Architecture

**Current** (Everything in routes):

```typescript
// app/api/robinhood/generate-onramp-url/route.ts
export async function POST(request: Request) {
  const {
    asset,
    network,
    amount,
    userIdentifier,
    walletAddress,
    destinationFundId,
  } = await request.json();

  // Business logic here
  const response = await fetch("https://api.robinhood.com/...");
  const data = await response.json();

  return NextResponse.json({ success: true, data });
}
```

**Target** (Service-based):

```typescript
// lib/robinhood/services/robinhood-client.service.ts
export class RobinhoodClientService {
  async generateConnectId({
    walletAddress,
    userIdentifier,
  }: GenerateConnectIdParams): Promise<string> {
    // Implementation with error handling, retry logic
  }
}

// app/api/robinhood/url/generate/route.ts
import { urlBuilderService } from "@/lib/robinhood/services";

export async function POST(request: Request) {
  const dto = await validateDto(GenerateUrlDto, request);
  const result = await urlBuilderService.generateUrl(dto);
  return NextResponse.json(result);
}
```

## Migration Strategy Overview

### High-Level Phases

**Phase 1: Foundation** (SP1-3)

- Create service directory structure
- Define DTOs with validation
- Build mock backend services with toast logger

**Phase 2: Core Services** (SP4-7)

- Extract RobinhoodClientService
- Extract AssetRegistryService
- Extract UrlBuilderService
- Create MockPledgeService

**Phase 3: Testing** (SP8-9)

- Set up Jest + nock infrastructure
- Write comprehensive test suites
- Match Coinbase coverage standards

**Phase 4: Integration** (SP10-11)

- Wire up mock backend calls
- Refactor API routes to use services
- Demonstrate end-to-end flow with toasts

**Phase 5: Documentation** (SP12-13)

- Create migration guide for backend implementer
- Update architecture documentation

### Sequential Dependencies

```
SP0 (Planning)
  ↓
SP1 (Service Structure) → SP4 (Robinhood Client) → SP5 (Asset Registry) → SP6 (URL Builder)
  ↓                                                                              ↓
SP2 (DTOs) ──────────────────────────────────────────────────────────→ SP7 (Mock Pledge)
  ↓                                                                              ↓
SP3 (Mock Backend) ────────────────────────────────────────────────────────────→ ↓
                                                                                  ↓
                                    SP8 (Test Infrastructure) → SP9 (Tests) → SP10 (Integration)
                                                                                  ↓
                                                                        SP11 (API Routes)
                                                                                  ↓
                                                              SP12 (Migration Guide)
                                                                                  ↓
                                                            SP13 (Architecture Docs)
```

## Environment Mapping

### Available Environment Variables

All configured in `.env.local`:

```bash
# Robinhood
ROBINHOOD_APP_ID=<configured>
ROBINHOOD_API_KEY=<configured>

# Coinbase Prime (for Prime addresses)
COINBASE_PRIME_API_KEY=<configured>
COINBASE_SERVICE_ACCOUNT_ID=<configured>
COINBASE_PRIME_PASSPHRASE=<configured>
COINBASE_PRIME_SIGNING_KEY=<configured>
COINBASE_PRIME_PORTFOLIO_ID=<configured>

# Backend Integration
DEFAULT_FUND_ID=<configured>

# DaaS (Robbie API)
DAAS_ROBBIE_CLIENT_ID=<configured>
DAAS_ROBBIE_CLIENT_SECRET=<configured>
DAAS_ROBBIE_API_KEY=<configured>
```

**Note**: All environment variables are already set up. No new variables needed.

## Risk Assessment

### 🔴 HIGH RISK

**Risk**: Incorrect CryptoDonationPledge field mapping

- **Impact**: Wrong guidance for backend implementer, potential data loss
- **Mitigation**: Review actual entity in PR #2123, validate all fields
- **Owner**: SP7 implementer
- **Validation**: Create test with complete pledge object

**Risk**: Inconsistent object parameter pattern

- **Impact**: Large refactoring if applied wrong, technical debt
- **Mitigation**: Apply pattern in SP1, validate in SP2-3 before proceeding
- **Owner**: SP1 implementer
- **Checkpoint**: Code review after SP3

### 🟡 MEDIUM RISK

**Risk**: Jest/nock configuration issues

- **Impact**: Delayed testing phase, may need debugging
- **Mitigation**: Use Coinbase jest.config.ts as exact template
- **Owner**: SP8 implementer
- **Fallback**: Consult Coinbase test setup if issues arise

**Risk**: Mock services don't match backend reality

- **Impact**: Migration guide misleads implementer
- **Mitigation**: Review actual backend services in endaoment-backend
- **Owner**: SP3 implementer
- **Validation**: Backend engineer review

**Risk**: Toast logger breaks Next.js SSR

- **Impact**: POC functionality broken
- **Mitigation**: Client-side only implementation with guards
- **Owner**: SP3 implementer
- **Testing**: Verify in both dev and build modes

### 🟢 LOW RISK

**Risk**: Service extraction breaks existing functionality

- **Impact**: Temporary POC breakage
- **Mitigation**: Keep original files until refactoring complete
- **Owner**: SP1, SP4-6 implementers
- **Rollback**: Git revert available

**Risk**: DTO creation misses edge cases

- **Impact**: Some validation gaps
- **Mitigation**: Copy Coinbase DTO patterns exactly
- **Owner**: SP2 implementer
- **Fix**: Easy to add validators later

## Rollback Procedure

### Emergency Rollback (Critical Failure)

If refactoring breaks POC functionality critically:

1. **Identify Failed Phase**

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc
git log --oneline -20
# Find last working commit before phase
```

2. **Hard Reset** (DESTRUCTIVE)

```bash
git reset --hard <last-working-commit>
git clean -fd
npm install
npm run dev
# Verify POC works
```

3. **Document Failure**

```bash
cd .cursor/plans/robinhood-backend-alignment/implementation-logs
# Create YYYYMMDD-HHMM-ROLLBACK.md with:
# - What failed
# - Why rollback was needed
# - What to fix before retry
```

### Standard Rollback (Phase-Level)

If a sub-plan needs to be undone:

1. **Soft Reset to Before Phase**

```bash
git log --grep="SP<N>" -1  # Find phase commit
git revert <commit-hash>
```

2. **Selective File Restoration**

```bash
git checkout <commit-hash> -- path/to/file
```

3. **Update Implementation Log**

- Document what was reverted
- Why it needed rollback
- Corrections needed for retry

### Validation After Rollback

```bash
# Verify POC still works
npm run dev
# Visit http://localhost:3000
# Test health endpoint
curl http://localhost:3000/api/robinhood/health
```

## Success Metrics

### Technical Metrics

**Service Layer**

- ✅ 4 service classes created (RobinhoodClient, AssetRegistry, UrlBuilder, MockPledge)
- ✅ All services use object params for 3+ arguments
- ✅ All services have comprehensive JSDoc
- ✅ All services properly exported from index.ts

**DTOs**

- ✅ 3 DTO classes with class-validator decorators
- ✅ All required fields validated
- ✅ Transform decorators for type safety

**Testing**

- ✅ 2200+ lines of test code
- ✅ 80%+ code coverage
- ✅ Nock mocking for all external APIs
- ✅ All tests passing

**Mock Integration**

- ✅ Toast logger working in browser
- ✅ 3 backend service mocks (Pledge, Token, Notification)
- ✅ All API calls demonstrated

### Operational Metrics

**Documentation**

- ✅ Migration guide complete (20+ pages)
- ✅ File-by-file mapping (POC → Backend)
- ✅ Backend setup instructions clear
- ✅ Test migration guide included

**Code Quality**

- ✅ No linter errors
- ✅ No TypeScript errors
- ✅ Consistent code style
- ✅ All files have proper headers

**Integration Readiness**

- ✅ Services copy/paste ready for backend
- ✅ DTOs match backend patterns
- ✅ Tests portable to backend
- ✅ Mock services clearly documented

### Quality Metrics

**Error Handling**

- ✅ All services have try-catch blocks
- ✅ Custom error classes defined
- ✅ Retry logic for network calls
- ✅ Proper logging throughout

**Validation**

- ✅ All inputs validated with DTOs
- ✅ Edge cases handled
- ✅ Error messages helpful

**Performance**

- ✅ Asset registry cached properly
- ✅ No unnecessary API calls
- ✅ Efficient data structures

## Architecture Decisions

### Decision 1: Database Persistence Strategy

**Date**: 2025-10-24
**Context**: Need to map Robinhood callback data to backend pledge format

**Options Considered**:

1. Create new RobinhoodPledge entity - Separate table
2. Use existing CryptoDonationPledge - Shared with Coinbase
3. Store in temporary table, migrate later

**Decision**: Use existing `CryptoDonationPledge` entity

**Rationale**:

- Robinhood pledges identical to Coinbase pledges in structure
- Reuse existing pledge creation logic
- Consistent notification and reporting
- Simpler backend integration

**Consequences**:

- **Positive**: Faster implementation, consistent data model
- **Negative**: Must ensure field mapping is perfect
- **Mitigations**: Comprehensive mapping validation in SP7

**Field Mapping**:

```typescript
{
  otcTransactionHash: `robinhood:${connectId}`,
  pledgerUserId: userId,
  inputToken: resolvedToken,                    // From TokenService
  inputAmount: convertToSmallestUnit(amount, decimals),
  destinationOrgId: orgId,                      // From DEFAULT_FUND_ID
  status: PledgeStatus.PendingLiquidation,
  centralizedExchangeDonationStatus: 'Completed',
  centralizedExchangeTransactionId: orderId     // From callback
}
```

**Review Date**: After SP7 completion

### Decision 2: Implementation Scope

**Date**: 2025-10-24
**Context**: Determine where refactoring happens

**Options Considered**:

1. Refactor directly in endaoment-backend
2. Refactor in POC repo, then copy to backend
3. Create separate robinhood-integration repo

**Decision**: Refactor POC repository ONLY

**Rationale**:

- Keep POC standalone and demonstrable
- No risk to production backend
- Future implementer gets clean starting point
- Easier to test in isolation

**Consequences**:

- **Positive**: Zero backend risk, clear separation
- **Negative**: Copy/paste needed for final integration
- **Mitigations**: Excellent documentation, exact pattern matching

**Review Date**: N/A - Final decision

### Decision 3: Backend API Integration Approach

**Date**: 2025-10-24
**Context**: How to demonstrate backend integration without backend access

**Options Considered**:

1. Console.log all would-be API calls
2. Alert boxes for backend calls
3. Toast notifications with detailed info
4. Dedicated debug panel

**Decision**: Mock with detailed toast notifications

**Rationale**:

- Visual, non-blocking demonstration
- Can show full request/response
- Mirrors how real backend would respond
- Great for demo purposes

**Consequences**:

- **Positive**: Clear visual feedback, professional demo
- **Negative**: Need to ensure SSR compatibility
- **Mitigations**: Client-side only rendering, proper guards

**Mock Services**:

1. `MockPledgeService` - Shows pledge creation
2. `MockTokenService` - Shows token resolution
3. `MockNotificationService` - Shows notifications

**Toast Format**:

```
🎯 Backend API Call: POST /v1/robinhood/pledge/create

Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
  {
    "connectId": "abc-123...",
    "asset": "BTC",
    "network": "BITCOIN",
    "amount": "0.5"
  }

Expected Response:
  {
    "pledgeId": "uuid-...",
    "status": "PendingLiquidation"
  }
```

**Review Date**: After SP3 completion

### Decision 4: Test Mocking Strategy

**Date**: 2025-10-24
**Context**: How to mock external APIs in tests

**Options Considered**:

1. Mock axios/fetch manually
2. Use MSW (Mock Service Worker)
3. Use nock for HTTP mocking
4. Create custom mock server

**Decision**: Use nock with SDK documentation responses

**Rationale**:

- Coinbase uses nock - consistency
- Excellent HTTP mocking capabilities
- Can use actual SDK response examples
- Well-documented and maintained

**Consequences**:

- **Positive**: Realistic mocking, proven pattern
- **Negative**: Learning curve if unfamiliar
- **Mitigations**: Copy Coinbase nock helpers exactly

**Mock Sources**:

- `Robinhood_Connect_SDK_Combined.md` for API responses
- POC logs for real response examples
- Coinbase `coinbase-nock-api.ts` as template

**Review Date**: After SP8 completion

### Decision 5: Object Parameter Pattern

**Date**: 2025-10-24
**Context**: When to use object parameters vs positional

**Options Considered**:

1. Always use positional parameters
2. Always use object parameters
3. Object params only for 3+ arguments
4. Object params only for complex types

**Decision**: Object params for 3+ arguments

**Rationale**:

- Matches Coinbase pattern
- Readable call sites
- Easy to extend later
- Self-documenting code

**Consequences**:

- **Positive**: Better code readability, easier refactoring
- **Negative**: More TypeScript interfaces needed
- **Mitigations**: Create interfaces alongside services

**Examples**:

```typescript
// Before (5 parameters - hard to read)
async generateUrl(asset, network, amount, userIdentifier, destinationFundId)

// After (object param - self-documenting)
async generateUrl({
  asset,
  network,
  amount,
  userIdentifier,
  destinationFundId
}: GenerateUrlParams)
```

**Review Date**: After SP1 completion

### Decision 6: Directory Structure Alignment

**Date**: 2025-10-25
**Context**: Need POC structure to exactly match endaoment-backend for easy migration

**Options Considered**:

1. Keep flat `lib/` structure - Simpler for POC
2. Use `libs/` with partial alignment - Some backend patterns
3. Full NestJS structure with `src/lib/` - Exact backend match
4. Monorepo structure with nx - Overkill for POC

**Decision**: Full NestJS structure with `libs/` (plural) and `src/lib/`

**Rationale**:

- Enables copy/paste migration to backend
- Separates concerns (robinhood/coinbase/shared)
- Co-locates tests with code (backend standard)
- Makes library boundaries explicit
- Ready for NestJS module wrappers

**Consequences**:

- **Positive**: Drop-in ready for backend, clear organization
- **Negative**: More complex directory structure, import path changes
- **Mitigations**: Comprehensive sub-plan (SP9.5), automated import updates

**Structure**:

```
libs/
├── robinhood/         # → endaoment-backend/libs/api/robinhood/
│   ├── src/lib/       # Implementation
│   └── tests/         # Tests
├── coinbase/          # → merge into endaoment-backend/libs/api/coinbase/
│   ├── src/lib/
│   └── tests/
└── shared/            # → POC-only (backend-mock), some utils migrate
    ├── src/lib/
    └── tests/
```

**Review Date**: After SP9.5 completion

### Decision 7: Frontend/Backend Separation

**Date**: 2025-10-25
**Context**: Need POC to be a reusable template for future API integrations

**Options Considered**:

1. Leave components/hooks scattered at root - Simpler, no changes needed
2. Move to app/ subdirectories - Some organization
3. Full Next.js App Router pattern - Complete frontend in app/
4. Keep mixed structure - Accept inconsistency

**Decision**: Full Next.js App Router pattern with complete frontend/backend separation

**Rationale**:

- Makes POC a perfect template for future integrations
- Clear "frontend vs backend" boundaries
- All React/Next.js in `app/`, all API libs in `libs/`
- Self-documenting structure
- Easy to understand and replicate

**Consequences**:

- **Positive**: Template-ready, clear organization, future-proof
- **Negative**: More directory restructuring, import path updates
- **Mitigations**: Detailed sub-plan (SP9.6), automated updates

**Structure**:

```
robinhood-onramp/
├── app/              # 🎨 FRONTEND: Everything Next.js/React
│   ├── components/   # React components
│   ├── hooks/        # React hooks
│   ├── lib/          # Frontend utils (cn(), etc)
│   └── types/        # Frontend types
│
└── libs/             # 🔧 BACKEND: All API libraries
    ├── robinhood/    # Integration code
    ├── coinbase/     # Support code
    └── shared/       # Shared utilities
```

**Benefits for Future POCs**:

- Clone structure for new integrations
- Build frontend in `app/`, backend in `libs/`
- When ready, copy `libs/` to endaoment-backend
- Consistent pattern across all POCs

**Review Date**: After SP9.6 completion

## Notes for Implementers

### Critical Checkpoints

**Before Starting Any Sub-Plan**:

- [ ] Read sub-plan completely
- [ ] Review "Context Required" section
- [ ] Read all referenced files
- [ ] Understand gold standard patterns (Coinbase)
- [ ] Check dependencies are complete

**After Completing Each Sub-Plan**:

- [ ] All deliverables in checklist completed
- [ ] All validation steps passed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Create implementation log in implementation-logs/

**Before Moving to Next Phase**:

- [ ] All sub-plans in phase complete
- [ ] Phase-level validation passed
- [ ] No blocking issues
- [ ] Implementation logs up to date

### Common Pitfalls

❌ **Creating real backend dependencies**

- Keep it standalone, mock everything
- ✅ **Solution**: Use mock services with toasts

❌ **Incomplete pledge mapping**

- Missing CryptoDonationPledge fields
- ✅ **Solution**: Review entity definition, map all fields

❌ **Inconsistent patterns**

- Mixing object params and positional
- ✅ **Solution**: Follow Coinbase patterns religiously

❌ **Inadequate testing**

- Won't match backend standards
- ✅ **Solution**: Allocate 30% of time to testing

❌ **Skipping documentation**

- Future implementer won't understand
- ✅ **Solution**: Document as you go, not at end

❌ **No error handling**

- Services crash on edge cases
- ✅ **Solution**: Try-catch all async operations

❌ **Poor validation**

- Invalid data gets through
- ✅ **Solution**: Use class-validator DTOs properly

### Best Practices

✅ **Test-Driven Development**

- Write tests first when possible
- Ensures proper service design
- Catches edge cases early

✅ **Incremental Commits**

- Commit after each step in sub-plan
- Makes rollback easier
- Clear progress tracking

✅ **Code Review**

- Review own code against Coinbase patterns
- Check object param usage
- Verify error handling

✅ **Documentation**

- Add JSDoc to every service method
- Explain complex logic
- Document assumptions

✅ **Validation**

- Run tests after every change
- Verify POC still works
- Check linter and TypeScript

### Resource Links

- **Gold Standard**: Coinbase integration in endaoment-backend at `libs/api/coinbase/`
- **SDK Documentation**: `Robinhood_Connect_SDK_Combined.md`
- **Current POC**: `robinhood-onramp/` directory
- **Planning Methodology**: `.cursor/plans/` README
- **Entity Reference**: CryptoDonationPledge in endaoment-backend

### Agent Implementation Prompts

**Starting a Sub-Plan**:

```
I need to implement sub-plan-{N}-{name}.md from robinhood-backend-alignment.

Context:
- Read the sub-plan completely
- Review all files in "Context Required"
- Check dependencies are met

Approach:
- Follow steps exactly in order
- Validate after each step
- Document deviations

When complete:
- Create YYYYMMDD-HHMM-SP{N}-COMPLETE.md
- Verify all deliverables
- Confirm next steps
```

**Troubleshooting**:

```
Sub-plan-{N} encountered issue at step {X}.

Error: {description}
Files affected: {list}

Please:
1. Analyze root cause
2. Propose fix
3. Create YYYYMMDD-HHMM-SP{N}-ISSUE.md
4. Test fix
5. Re-run validation
```
