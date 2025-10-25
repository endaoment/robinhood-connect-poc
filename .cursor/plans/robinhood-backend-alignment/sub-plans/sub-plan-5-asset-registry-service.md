# Sub-Plan 5: Asset Registry Service Implementation

**Status**: Pending
**Priority**: Critical
**Dependencies**: Sub-Plan 4 (Robinhood Client Service)
**Estimated Time**: 5-6 hours

## Context Required

**Files to Review**:

- `lib/robinhood/assets/discovery.ts` - Current discovery logic
- `lib/robinhood/assets/prime-addresses.ts` - Prime address fetching
- `lib/robinhood/assets/registry.ts` - Registry building logic
- `lib/robinhood/services/asset-registry.service.ts` - Placeholder from SP1

## Objectives

1. Extract asset discovery logic into service
2. Extract Prime address fetching into service
3. Implement singleton pattern with caching
4. Add initialization method
5. Add asset lookup methods
6. Add health check functionality
7. Maintain backward compatibility

## Precise Implementation Steps

### Step 1: Implement initialize() Method

Extract logic from current `discovery.ts` and `prime-addresses.ts` into the `AssetRegistryService.initialize()` method.

**Key Points**:

- Fetch from Discovery API via RobinhoodClientService
- Fetch Prime addresses if requested
- Build asset registry map
- Cache in instance variable
- Set `initialized = true`

### Step 2: Implement getAsset() Method

Create efficient lookup by symbol + network combination.

### Step 3: Implement getAllAssets() Method

Return cached asset array.

### Step 4: Implement getHealthStatus() Method

Return initialization state and asset counts.

### Step 5: Add Private Cache Methods

Manage in-memory cache with proper TypeScript types.

## Deliverables Checklist

- [ ] `initialize()` implemented
- [ ] Asset discovery integrated
- [ ] Prime address fetching integrated
- [ ] `getAsset()` implemented with fast lookup
- [ ] `getAllAssets()` implemented
- [ ] `getHealthStatus()` implemented
- [ ] Singleton pattern working
- [ ] Caching functional
- [ ] TypeScript compiles
- [ ] Tests pass

## Validation Steps

```bash
npx tsc --noEmit lib/robinhood/services/asset-registry.service.ts
```

## Next Steps

**Proceed to** [Sub-Plan 6: URL Builder Service](./sub-plan-6-url-builder-service.md)

