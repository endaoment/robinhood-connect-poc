# Robinhood POC Backend Alignment - Project Plan

> **Goal**: Refactor Robinhood Connect POC to match endaoment-backend architectural patterns, making it production-ready and copy/paste friendly for backend integration.

📖 **[Read OVERVIEW.md](./OVERVIEW.md)** for comprehensive project context, architecture decisions, and risk assessment.

## Plan Structure

| Sub-Plan                                                                 | Title                       | Status      | Priority | Dependencies | Est. Time  |
| ------------------------------------------------------------------------ | --------------------------- | ----------- | -------- | ------------ | ---------- |
| [SP0](./sub-plans/sub-plan-0-drafting-plan.md)                           | Drafting Plan               | ✅ Complete | Critical | None         | 2-3 hours  |
| [SP1](./sub-plans/sub-plan-1-service-layer-restructuring.md)             | Service Layer Restructuring | ✅ Complete | Critical | SP0          | 4-5 hours  |
| [SP2](./sub-plans/sub-plan-2-dtos-and-validation.md)                     | DTOs and Type Definitions   | ✅ Complete | Critical | SP1          | 3-4 hours  |
| [SP3](./sub-plans/sub-plan-3-mock-backend-services.md)                   | Mock Backend Services       | ✅ Complete | High     | SP2          | 4-5 hours  |
| [SP4](./sub-plans/sub-plan-4-robinhood-client-service.md)                | Robinhood Client Service    | ✅ Complete | Critical | SP1          | 3-4 hours  |
| [SP5](./sub-plans/sub-plan-5-asset-registry-service.md)                  | Asset Registry Service      | ✅ Complete | Critical | SP4          | 5-6 hours  |
| [SP6](./sub-plans/sub-plan-6-url-builder-service.md)                     | URL Builder Service         | ✅ Complete | High     | SP5          | 2-3 hours  |
| [SP7](./sub-plans/sub-plan-7-mock-pledge-service.md)                     | Mock Pledge Service         | ✅ Complete | Critical | SP6, SP3     | 4-5 hours  |
| [SP8](./sub-plans/sub-plan-8-test-infrastructure.md)                     | Test Infrastructure Setup   | ✅ Complete | High     | SP4-SP7      | 4-5 hours  |
| [SP9](./sub-plans/sub-plan-9-comprehensive-test-suite.md)                | Comprehensive Test Suite     | ✅ Complete | High     | SP8          | 8-10 hours |
| [SP9.5](./sub-plans/sub-plan-9.5-directory-restructuring-for-backend.md) | Directory Restructuring      | 🔵 Ready    | Critical | SP9          | 3-4 hours  |
| [SP9.6](./sub-plans/sub-plan-9.6-frontend-backend-separation.md)         | Frontend/Backend Separation  | 🔵 Ready    | High     | SP9.5        | 2-3 hours  |
| [SP10](./sub-plans/sub-plan-10-backend-integration-demo.md)              | Backend Integration Demo     | ⚪ Pending  | Medium   | SP9.6        | 3-4 hours  |
| [SP11](./sub-plans/sub-plan-11-api-route-refactoring.md)                 | API Route Refactoring       | ⚪ Pending  | High     | SP10         | 2-3 hours  |
| [SP12](./sub-plans/sub-plan-12-migration-guide.md)                       | Migration Guide             | ⚪ Pending  | High     | SP11         | 3-4 hours  |
| [SP13](./sub-plans/sub-plan-13-architecture-documentation.md)            | Architecture Documentation  | ⚪ Pending  | Medium   | SP12         | 2-3 hours  |

**Legend**:

- ✅ Complete
- 🟢 In Progress
- 🔵 Ready for Implementation
- ⚪ Pending (dependencies not met)
- ⏸️ Paused
- ❌ Blocked

## Implementation Approach

### Sequential (Recommended)

Execute sub-plans in numerical order (SP1 → SP2 → SP3 → ... → SP13). This approach:

- ✅ Ensures all dependencies met
- ✅ Easier to track progress
- ✅ Safer for complex refactoring
- ✅ Clear validation checkpoints

### Parallel (Advanced)

Some sub-plans can be worked on simultaneously by different agents/people:

**Parallel Track 1** (Service Layer):

- SP1 → SP4 → SP5 → SP6

**Parallel Track 2** (DTOs & Mocks):

- SP2 → SP3 → SP7

**Parallel Track 3** (Testing):

- After SP4-SP7 complete: SP8 → SP9

**Parallel Track 4** (Integration):

- After SP9 complete: SP10 → SP11

**Sequential** (Must be sequential):

- SP12 → SP13 (documentation at end)

⚠️ **Note**: Parallel approach requires coordination to avoid merge conflicts.

## Dependency Graph

```
                    SP0 (Drafting Plan)
                         |
        +----------------+----------------+
        ↓                                 ↓
       SP1 (Service Structure)          SP2 (DTOs)
        |                                 |
        ↓                                 ↓
       SP4 (Robinhood Client)           SP3 (Mock Backend)
        |                                 |
        ↓                                 |
       SP5 (Asset Registry)               |
        |                                 |
        ↓                                 |
       SP6 (URL Builder) ←---------------+
        |                                 |
        +----------------+----------------+
                         ↓
                    SP7 (Mock Pledge)
                         |
                         ↓
                SP8 (Test Infrastructure)
                         |
                         ↓
              SP9 (Comprehensive Tests)
                         |
                         ↓
         SP9.5 (Directory Restructuring)
                         |
                         ↓
        SP9.6 (Frontend/Backend Separation)
                         |
                         ↓
           SP10 (Backend Integration Demo)
                         |
                         ↓
              SP11 (API Route Refactoring)
                         |
                         ↓
                SP12 (Migration Guide)
                         |
                         ↓
           SP13 (Architecture Documentation)
```

## Success Criteria Checklist

### Phase 1: Foundation (SP1-3)

- [x] Service directory structure created
- [x] All DTOs have class-validator decorators
- [x] Mock backend services working
- [x] Toast logger demonstrates API calls
- [x] Object parameter pattern established

### Phase 2: Core Services (SP4-7)

- [x] RobinhoodClientService extracted
- [x] AssetRegistryService extracted
- [x] UrlBuilderService extracted
- [x] PledgeService created (integrates MockPledgeService)
- [x] All services use object params for 3+ args
- [x] Comprehensive JSDoc on all services
- [x] Proper error handling throughout

### Phase 3: Testing (SP8-9)

- [x] Jest configured and running
- [x] Nock helpers created
- [x] 2200+ lines of test code written (3,044 lines achieved)
- [x] 80%+ code coverage achieved (98%+ achieved)
- [x] All tests passing (183/183)
- [x] Integration tests with nock mocking

### Phase 4: Integration (SP10-11)

- [ ] Callback page calls mock pledge service
- [ ] All backend API calls shown via toasts
- [ ] API routes refactored to use services
- [ ] Proper error handling in routes
- [ ] POC functionality maintained

### Phase 5: Documentation (SP12-13)

- [ ] Migration guide complete (20+ pages)
- [ ] File-by-file mapping documented
- [ ] Backend setup instructions clear
- [ ] Test migration guide included
- [ ] Architecture documentation updated
- [ ] All mock services explained

### Overall Success

- [ ] Services copy/paste ready for backend
- [ ] Zero linter errors
- [ ] Zero TypeScript errors
- [ ] All tests passing
- [ ] POC fully functional
- [ ] Ready for backend integration

## Key Resources

### Gold Standards

- **Coinbase Integration**: `libs/api/coinbase/` in endaoment-backend
  - Service architecture reference
  - DTO patterns
  - Test structure (2200+ lines)
  - Error handling patterns

### Current State

- **POC Code**: `robinhood-onramp/` directory
- **Health Endpoint**: `robinhood-onramp/app/api/robinhood/health/route.ts`
- **Asset Logic**: `robinhood-onramp/lib/robinhood/assets/`
- **URL Builder**: `robinhood-onramp/lib/robinhood/url-builder/`

### Documentation

- **Project Overview**: [OVERVIEW.md](./OVERVIEW.md)
- **Robinhood SDK**: `Robinhood_Connect_SDK_Combined.md`
- **Entity Reference**: `CryptoDonationPledge` in endaoment-backend
- **Environment Config**: `.env.local` (all variables configured)

### Implementation Logs

- **Location**: `./implementation-logs/`
- **Format**: `YYYYMMDD-HHMM-{DESCRIPTION}.md`
- **Purpose**: Track progress, document issues, preserve decisions

## Testing Strategy

### Unit Tests

**Coverage**: All service methods
**Tool**: Jest
**Location**: `robinhood-onramp/__tests__/services/`
**Standard**: 80%+ coverage per service

### Integration Tests

**Coverage**: Service interactions, external APIs
**Tool**: Jest + Nock
**Location**: `robinhood-onramp/__tests__/`
**Standard**: All API calls mocked with nock

### End-to-End Tests

**Coverage**: Complete user flows
**Tool**: Manual testing with toast verification
**Location**: Callback page, dashboard
**Standard**: All flows work, all toasts show

### Test Files

| File                       | Purpose                   | Lines | Status     |
| -------------------------- | ------------------------- | ----- | ---------- |
| `robinhood-client.test.ts` | Client service unit tests | 500+  | ⚪ Pending |
| `asset-registry.test.ts`   | Registry service tests    | 500+  | ⚪ Pending |
| `url-builder.test.ts`      | URL builder tests         | 500+  | ⚪ Pending |
| `pledge.test.ts`           | Pledge mapping tests      | 500+  | ⚪ Pending |
| `robinhood-nock-api.ts`    | Nock mock helpers         | 200+  | ⚪ Pending |
| `setup.ts`                 | Test configuration        | 50+   | ⚪ Pending |

**Total Target**: 2200+ lines (matching Coinbase standard)

## Critical Warnings

### ⚠️ BEFORE STARTING

**DO NOT**:

- ❌ Touch endaoment-backend repository
- ❌ Create real database migrations
- ❌ Delete existing POC functionality
- ❌ Skip writing tests
- ❌ Mix positional and object parameters
- ❌ Leave TODOs in final code

**DO**:

- ✅ Keep POC standalone
- ✅ Mock all backend dependencies
- ✅ Follow Coinbase patterns exactly
- ✅ Write comprehensive tests
- ✅ Use object params for 3+ arguments
- ✅ Document everything thoroughly

### ⚠️ DURING IMPLEMENTATION

**Checkpoints** (must pass before continuing):

1. After SP1: Verify service structure matches Coinbase
2. After SP3: Verify object parameter pattern applied consistently
3. After SP7: Verify pledge field mapping complete
4. After SP9: Verify 80%+ test coverage
5. After SP11: Verify POC functionality maintained

**If Checkpoint Fails**:

- STOP implementation
- Review sub-plan requirements
- Fix issues completely
- Re-run checkpoint
- Document in implementation log

### ⚠️ PRODUCTION SAFETY

**This is a POC refactoring** - No production impact:

- No backend changes
- No database changes
- No API changes
- No deployment changes

**Future Backend Integration** (not in scope):

- Backend implementer will copy services
- Create NestJS module
- Wire to actual database
- Deploy to production

## Estimated Timeline

### By Phase

- **Phase 1** (Foundation): 11-14 hours
- **Phase 2** (Services): 14-18 hours
- **Phase 3** (Testing): 12-15 hours
- **Phase 4** (Integration): 5-7 hours
- **Phase 5** (Documentation): 5-7 hours

**Total**: 47-61 hours (6-8 days of focused work)

### By Role

**Backend Engineer** (if doing all work):

- Planning: 3 hours
- Implementation: 40 hours
- Testing: 12 hours
- Documentation: 6 hours
- **Total**: 61 hours

**Team Approach** (parallel tracks):

- Planning: 3 hours
- Implementation: 25 hours (parallelized)
- Testing: 12 hours
- Documentation: 6 hours
- **Total**: 46 hours (3-4 days with 2 engineers)

## Quick Start

### For First-Time Implementer

1. **Read Documentation** (1 hour)

   - Read this README completely
   - Read [OVERVIEW.md](./OVERVIEW.md)
   - Scan all 13 sub-plans

2. **Review Gold Standard** (1 hour)

   - Study Coinbase integration structure
   - Review service patterns
   - Understand DTO validation
   - Check test coverage

3. **Verify Environment** (15 minutes)

   ```bash
   cd robinhood-onramp
   npm install
   npm run dev
   # Verify POC works at http://localhost:3000
   ```

4. **Start Implementation** (SP1)
   - Read [sub-plan-1-service-layer-restructuring.md](./sub-plans/sub-plan-1-service-layer-restructuring.md)
   - Review "Context Required" section
   - Follow steps exactly
   - Validate after each step

### For Continuing Implementation

1. **Check Last Completed Sub-Plan**

   ```bash
   cd .cursor/plans/robinhood-backend-alignment/implementation-logs
   ls -lt | head -5  # See recent completion logs
   ```

2. **Review Implementation Log**

   - Read last SP{N}-COMPLETE.md
   - Check for deviations or issues
   - Verify all deliverables completed

3. **Start Next Sub-Plan**
   - Open next sub-plan file
   - Verify dependencies complete
   - Review context required
   - Begin implementation

## Contact & Support

**Project Owner**: Endaoment Engineering Team

**Questions**:

- Review [OVERVIEW.md](./OVERVIEW.md) first
- Check sub-plan "Common Issues" sections
- Review Coinbase integration for patterns
- Document questions in implementation logs

**Issues**:

- Create `YYYYMMDD-HHMM-SP{N}-ISSUE.md` in implementation-logs/
- Include error messages, context, attempted solutions
- Reference in next completion log

## Project Metadata

**Project Name**: Robinhood POC Backend Alignment
**Repository**: robinhood-connect-poc
**Location**: `.cursor/plans/robinhood-backend-alignment/`
**Created**: 2025-10-24
**Status**: Phase 3 Complete (SP0-SP9)
**Current Phase**: Structure Refinement (SP9.5-9.6)
**Last Updated**: 2025-10-25

**Progress**: 9 of 16 sub-plans complete (56%)

---

**Next Steps**: Proceed to [Sub-Plan 9.5: Directory Restructuring for Backend Alignment](./sub-plans/sub-plan-9.5-directory-restructuring-for-backend.md)
