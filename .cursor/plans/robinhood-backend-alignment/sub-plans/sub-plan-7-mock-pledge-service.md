# Sub-Plan 7: Mock Pledge Service Integration

**Status**: Pending
**Priority**: Critical  
**Dependencies**: Sub-Plan 6 (URL Builder), Sub-Plan 3 (Mock Backend)
**Estimated Time**: 4-5 hours

## Context Required

**Files**: `lib/backend-integration/pledge-mapper.ts`, `lib/backend-mock/mock-pledge.service.ts`

## Objectives

1. Create service wrapping mock pledge creation
2. Integrate token resolution
3. Map Robinhood callback to CryptoDonationPledge format
4. Add amount conversion utilities
5. Demonstrate complete flow with toasts

## Implementation

1. Create `PledgeService` in `lib/robinhood/services/`
2. Implement `createFromCallback()` method
3. Integrate `mockTokenService` for token resolution
4. Integrate `mockPledgeService` for pledge creation
5. Add validation and error handling
6. Show all backend calls via toasts

## Deliverables

- [ ] PledgeService created
- [ ] Token resolution integrated
- [ ] Amount conversion working
- [ ] Field mapping complete
- [ ] Toasts demonstrate flow
- [ ] Tests pass

## Next Steps

**Proceed to** [Sub-Plan 8: Test Infrastructure](./sub-plan-8-test-infrastructure.md)

