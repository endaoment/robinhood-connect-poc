# Sub-Plan 0: Drafting Plan - Robinhood Legacy Code Cleanup

**Status**: Complete
**Priority**: Critical
**Dependencies**: None (master planning document)
**Estimated Time**: N/A (planning phase)

---

## Context Required

### File References to Review

**Implementation Logs** (understand the journey):

```
.cursor/plans/robinhood-asset-preselection/implementation-logs/
├── 20251024-1545-POST-ROBINHOOD-CALL-SUMMARY.md (lines 1-458) ⭐ Most recent
├── 20251023-2110-POST-ROBINHOOD-CALL-SUMMARY.md (lines 1-413)
├── 20251023-1522-ROBINHOOD-CALL-TRANSCRIPT.txt (lines 1-128)
├── 20251022-2130-CRITICAL-URL-FIX.md (lines 1-169) ⭐ Critical URL insights
├── 20251022-2025-SP4-COMPLETE.md (lines 1-378) ⭐ Working implementation
├── 20251022-2017-SP3-COMPLETE.md
├── 20251022-2013-SP2-COMPLETE.md
└── CHANGES-ORDER-STATUS-REMOVAL.md ⭐ Why order status removed
```

**Current Working Code**:

```
robinhood-onramp/
├── app/dashboard/page.tsx (lines 1-614)
│   └── Lines 1-380: Working asset selector
│   └── Lines 380-450: OLD FLOW to remove
├── app/api/robinhood/generate-onramp-url/route.ts (lines 1-233)
│   └── Lines 90-178: Daffy-style implementation (keep)
│   └── Lines 180-201: Legacy fallback (remove)
├── lib/robinhood-url-builder.ts (lines 1-638)
│   └── Lines 400-550: buildDaffyStyleOnrampUrl() (keep)
│   └── Lines 166-200: buildOnrampUrl() DEPRECATED (remove)
│   └── Lines 327-370: buildMultiNetworkOnrampUrl() DEPRECATED (remove)
└── app/callback/page.tsx (lines 1-530)
    └── Already cleaned (order status polling removed Oct 23)
```

**Dead Code to Delete**:

```
robinhood-onramp/
├── app/api/robinhood/generate-offramp-url/        # Entire directory
├── app/api/robinhood/order-status/route.ts        # Offramp-only API
├── app/dashboard/page-old-backup.tsx              # Backup from before cleanup
├── components/order-status.tsx                    # Offramp-only component
├── lib/feature-flags.ts                           # Feature flag system
└── CHANGES-ORDER-STATUS-REMOVAL.md                # Temporary changelog
```

**Test Scripts**:

```
robinhood-onramp/scripts/
├── test-url-combinations.py          # DELETE (development only)
├── test-daffy-style-urls.py          # DELETE (development only)
├── test_transfer_no_preselect.py     # DELETE (development only)
├── *_20251020_*.json                 # DELETE (old test results)
├── *_20251020_*.ts                   # DELETE (old generated configs)
├── get_all_robinhood_assets.py       # KEEP (onramp capability)
├── get_trading_balance_addresses.py  # KEEP (onramp capability)
├── generate_prime_wallets.py         # KEEP (setup utility)
├── prime_api_client.py               # KEEP (integration)
└── start-with-ngrok.sh               # KEEP (development helper)
```

### Current State Analysis

**What's Working** (preserve this):

1. Asset pre-selection flow in dashboard
2. Daffy-style URL generation with Robinhood connectId API
3. Callback handling with redirectUrl pattern
4. Success toast with transfer details

**What's Broken/Unused** (remove this):

1. Deprecated URL builders (buildOnrampUrl, buildMultiNetworkOnrampUrl)
2. Offramp code (separate API, not our use case)
3. Order status polling (doesn't work for onramp)
4. Feature flag system (new flow is proven)
5. Development test scripts (job done)

### Gold Standards to Study

**Working Pattern** (from 20251024-1545-POST-ROBINHOOD-CALL-SUMMARY.md):

```
1. User selects asset in UI
2. Frontend calls /api/robinhood/generate-onramp-url with selectedAsset/selectedNetwork
3. Backend calls Robinhood: POST /catpay/v1/connect_id/
4. Backend calls buildDaffyStyleOnrampUrl() with valid connectId
5. Frontend redirects to URL: https://robinhood.com/connect/amount?...
6. User completes in Robinhood
7. Robinhood redirects to callback with: asset, network, referenceId, timestamp, orderId
8. Callback shows success (no API polling needed)
```

**Critical Parameters** (from 20251022-2130-CRITICAL-URL-FIX.md):

```
Base URL: https://robinhood.com/connect/amount (NOT /applink/connect)
Required Params:
- applicationId (from env)
- connectId (from Robinhood API - MUST be real, not random UUID)
- paymentMethod=crypto_balance (REQUIRED)
- redirectUrl (with transfer data encoded)
- supportedAssets (single asset, e.g. 'ETH')
- supportedNetworks (single network, e.g. 'ETHEREUM')
- walletAddress (from asset config)
- assetCode (same as supportedAssets)
- flow=transfer (REQUIRED for callback)
```

---

## Objectives

1. **Remove All Offramp Code** - It's a separate API that doesn't apply to onramp
2. **Delete Deprecated Builders** - Keep only buildDaffyStyleOnrampUrl()
3. **Eliminate Feature Flags** - Remove old flow code path entirely
4. **Standardize ID System** - Use connectId consistently, clarify referenceId
5. **Consolidate Documentation** - Single source of truth for architecture
6. **Clean Test Artifacts** - Remove development test scripts
7. **Ensure Naming Consistency** - Clear, accurate terminology throughout
8. **Validate and Document** - Verify everything works, document what was removed

---

## Phase Outline

### Sub-Plan 1: Offramp Purge (2-3 hours)

**Goal**: Remove all offramp-related code

**Files to Delete**:

- `/app/api/robinhood/generate-offramp-url/` (entire directory)
- `/app/api/robinhood/order-status/route.ts`
- `/components/order-status.tsx`

**Files to Modify**:

- `/types/robinhood.d.ts` - Remove offramp interfaces
- `/components/transaction-history.tsx` - Remove OrderStatusComponent import/usage
- Documentation files - Remove offramp references

**Validation**:

- Search codebase for "offramp" - should only appear in explanatory docs
- TypeScript compiles without errors
- No broken imports

### Sub-Plan 2: Deprecated URL Builder Cleanup (1-2 hours)

**Goal**: Keep only working URL builder

**Files to Modify**:

- `/lib/robinhood-url-builder.ts`:
  - Delete buildOnrampUrl() (lines ~166-200)
  - Delete buildMultiNetworkOnrampUrl() (lines ~327-370)
  - Keep buildDaffyStyleOnrampUrl() (lines ~400-550)
  - Remove deprecated warnings (no longer needed)
- `/app/api/robinhood/generate-onramp-url/route.ts`:
  - Delete legacy fallback (lines ~180-201)
  - Keep only Daffy-style path (lines ~90-178)

**Validation**:

- No @deprecated markers remain
- Only one URL builder function exists
- API route has single code path
- TypeScript compiles
- Test URL generation still works

### Sub-Plan 3: Feature Flag and Old Flow Removal (2-3 hours)

**Goal**: Remove feature flag system

**Files to Delete**:

- `/app/dashboard/page-old-backup.tsx`
- `/lib/feature-flags.ts` (if only used for asset preselection)

**Files to Modify**:

- `/app/dashboard/page.tsx`:
  - Remove lines ~380-450 (old flow code path)
  - Remove FEATURE_FLAGS.assetPreselection check
  - Keep only lines 1-380 (working asset selector)

**Validation**:

- No FEATURE_FLAGS references remain
- Dashboard has single code path
- Asset selector still works
- TypeScript compiles

### Sub-Plan 4: ID System Consolidation (1-2 hours)

**Goal**: Standardize on connectId

**Files to Modify**:

- `/app/callback/page.tsx`:
  - Use connectId consistently in variable names
  - Update localStorage keys to connectId
- `/app/api/robinhood/generate-onramp-url/route.ts`:
  - Return connectId as primary
  - Keep referenceId for backward compatibility
  - Add comment explaining relationship
- `/types/robinhood.d.ts`:
  - Add JSDoc explaining connectId vs referenceId

**Validation**:

- Consistent naming throughout
- Backward compatibility maintained
- TypeScript compiles
- Callback still works

### Sub-Plan 5: Documentation Consolidation (2-3 hours)

**Goal**: Single source of truth

**Files to Delete**:

- `CHANGES-ORDER-STATUS-REMOVAL.md` (merge into main docs)

**Files to Create**:

- `ARCHITECTURE.md` - Current implementation only

**Files to Modify**:

- `README.md` - Update to current state only
- `docs/DEVELOPER_GUIDE.md` - Remove non-working approaches
- `docs/USER_GUIDE.md` - Current flow only
- Consolidate `CALLBACK-TESTING.md` + `API-TESTING.md` into single `TESTING_GUIDE.md`

**Validation**:

- No contradictory information
- All docs describe current state
- Easy to understand for new developers

### Sub-Plan 6: Test Script and Artifact Cleanup (1 hour)

**Goal**: Remove development artifacts

**Files to Delete**:

```
scripts/test-url-combinations.py
scripts/test-daffy-style-urls.py
scripts/test_transfer_no_preselect.py
scripts/robinhood_assets_addresses_20251020_*.json
scripts/robinhood_assets_addresses_20251020_*.ts
scripts/robinhood-assets-config_20251020_*.json
scripts/robinhood-assets-config_20251020_*.ts
scripts/trading_balance_addresses_20251020_*.json
```

**Files to Keep**:

```
scripts/get_all_robinhood_assets.py (onramp capability)
scripts/get_trading_balance_addresses.py (onramp capability)
scripts/generate_prime_wallets.py (setup)
scripts/prime_api_client.py (integration)
scripts/start-with-ngrok.sh (development)
scripts/requirements.txt
scripts/README.md
```

**Files to Modify**:

- `scripts/README.md` - Update to reflect remaining scripts only

**Validation**:

- No production code depends on deleted scripts
- Remaining scripts documented

### Sub-Plan 7: Naming Consistency Pass (1-2 hours)

**Goal**: Clear, accurate naming

**Scope**:

- Verify no "offramp" in variable names (except explanatory comments)
- Standardize "transfer" vs "onramp" terminology
- Ensure component/function names are clear
- Check API endpoint names

**Files to Review**:

- All `.ts` and `.tsx` files
- Update as needed for consistency

**Validation**:

- Grep for "offramp" returns only explanatory text
- Consistent terminology throughout
- TypeScript compiles

### Sub-Plan 8: Final Validation and Documentation (1-2 hours)

**Goal**: Verify and document

**Tasks**:

1. Run full transfer flow test (asset select → Robinhood → callback)
2. Verify TypeScript compilation: `npx tsc --noEmit`
3. Run linter
4. Create `CLEANUP-SUMMARY.md` documenting:
   - What was removed and why
   - Before/after file counts
   - Key decisions made
   - Testing performed
5. Update `package.json` if any scripts referenced removed files
6. Prepare PR description

**Validation**:

- End-to-end flow works
- Zero TypeScript errors
- Zero linter errors
- All success criteria met

---

## Directory Structure

**Before Cleanup**:

```
robinhood-onramp/
├── app/
│   ├── api/robinhood/
│   │   ├── generate-offramp-url/         ❌ DELETE
│   │   ├── generate-onramp-url/          ✅ KEEP (cleanup)
│   │   ├── order-status/                 ❌ DELETE
│   │   └── redeem-deposit-address/       ✅ KEEP
│   ├── callback/                         ✅ KEEP (already clean)
│   └── dashboard/
│       ├── page.tsx                      ✅ KEEP (cleanup lines 380-450)
│       └── page-old-backup.tsx           ❌ DELETE
├── components/
│   ├── order-status.tsx                  ❌ DELETE
│   ├── asset-selector.tsx                ✅ KEEP
│   └── ...other components...            ✅ KEEP
├── lib/
│   ├── feature-flags.ts                  ❌ DELETE (if only for asset presel)
│   ├── robinhood-url-builder.ts          ✅ KEEP (remove 2 deprecated fns)
│   └── ...other libs...                  ✅ KEEP
├── scripts/
│   ├── test-*.py                         ❌ DELETE (development tests)
│   ├── *_20251020_*.*                    ❌ DELETE (old artifacts)
│   ├── get_all_robinhood_assets.py       ✅ KEEP (onramp capability)
│   ├── get_trading_balance_addresses.py  ✅ KEEP (onramp capability)
│   └── ...other production scripts...    ✅ KEEP
└── docs/
    ├── ARCHITECTURE.md                   ➕ CREATE
    └── TESTING_GUIDE.md                  ➕ CREATE (consolidate)
```

**After Cleanup**:

```
robinhood-onramp/
├── app/
│   ├── api/robinhood/
│   │   ├── generate-onramp-url/          ✅ Single code path
│   │   └── redeem-deposit-address/       ✅ Unchanged
│   ├── callback/                         ✅ Unchanged
│   └── dashboard/
│       └── page.tsx                      ✅ Single code path only
├── components/
│   ├── asset-selector.tsx                ✅ Core component
│   └── ...other components...            ✅ Clean
├── lib/
│   ├── robinhood-url-builder.ts          ✅ Single URL builder only
│   └── ...other libs...                  ✅ Clean
├── scripts/
│   ├── get_all_robinhood_assets.py       ✅ Production utility
│   ├── get_trading_balance_addresses.py  ✅ Production utility
│   └── ...other production scripts...    ✅ Clean
└── docs/
    ├── ARCHITECTURE.md                   ✅ Single source of truth
    ├── TESTING_GUIDE.md                  ✅ Consolidated guide
    └── ...other docs...                  ✅ Updated
```

---

## Dependencies

**Required Before Starting**:

- [ ] Current branch (`f/preselection`) is stable
- [ ] End-to-end flow tested and confirmed working
- [ ] No ongoing development conflicting with cleanup
- [ ] Team aware of cleanup effort

**Provides to Other Sub-Plans**:

- Sub-Plans 1-8 all depend on this planning document
- Implementation logs reference this for context
- CLEANUP-SUMMARY.md will reference this

---

## Success Criteria

**Planning Success**:

- [x] Comprehensive OVERVIEW.md created
- [x] Clear README.md navigation
- [x] All 8 sub-plans outlined
- [x] File lists comprehensive
- [x] Dependencies identified
- [x] Risks assessed
- [x] User decisions incorporated

**Implementation Success** (verified in Sub-Plan 8):

- [ ] All deprecated code removed
- [ ] No offramp references in code (except docs)
- [ ] Single URL builder only
- [ ] Single ID system (connectId)
- [ ] All docs reflect current state
- [ ] No feature flag code
- [ ] Clean, understandable codebase
- [ ] Zero TypeScript/linter errors
- [ ] End-to-end flow works
- [ ] Ready for code review

---

## Risk Assessment

### 🟢 Overall Risk: LOW

Most changes are deletions of documented dead code or unused components.

### Medium Risk: Feature Flag Verification

**Risk**: FEATURE_FLAGS might be used elsewhere
**Mitigation**:

- Grep entire codebase for FEATURE_FLAGS
- Check all imports of feature-flags.ts
- Verify only assetPreselection flag exists
- If other flags exist, only remove assetPreselection

### Low Risk: Everything Else

All other sub-plans are low risk:

- Deleting documented "offramp-only" code
- Deleting documented "@deprecated" functions
- Removing development test scripts
- Consolidating documentation
- Naming consistency

---

## Common Patterns for Sub-Plans

### File Deletion Pattern

````markdown
**Step N: Delete [filename]**

**Pre-Check**:

```bash
# Search for imports
grep -r "from.*[filename]" robinhood-onramp/
grep -r "import.*[filename]" robinhood-onramp/
```
````

**Action**: Delete the file

```bash
rm robinhood-onramp/path/to/file
```

**Validation**:

```bash
npx tsc --noEmit
# Should compile with zero errors
```

````

### Function Removal Pattern

```markdown
**Step N: Remove [functionName] from [filename]**

**Lines**: X-Y

**Pre-Check**:
```bash
# Search for function usage
grep -r "[functionName]" robinhood-onramp/
````

**Action**: Delete lines X-Y from file

**Validation**:

```bash
npx tsc --noEmit
# Should compile with zero errors
```

````

### Import Update Pattern

```markdown
**Step N: Update imports in [filename]**

**Action**: Remove unused imports

**Validation**:
```bash
# Linter will catch unused imports
npm run lint
````

````

---

## Critical Warnings

### ⚠️ Before Deleting ANY File

1. **Search for imports**:
   ```bash
   grep -r "from.*[filename]" robinhood-onramp/
````

2. **Search for function references**:

   ```bash
   grep -r "[functionName]" robinhood-onramp/
   ```

3. **Check git history** to understand why it exists:
   ```bash
   git log --follow -- path/to/file
   ```

### ⚠️ After EVERY Change

1. **TypeScript compilation**:

   ```bash
   npx tsc --noEmit
   ```

2. **Linter** (if available):
   ```bash
   npm run lint
   ```

### ⚠️ Before Final PR

1. **Full end-to-end test** (manual):

   - Select asset in dashboard
   - Generate URL
   - Complete transfer in Robinhood
   - Verify callback works
   - Check success toast

2. **All success criteria met** (checklist in Sub-Plan 8)

---

## Implementation Strategy

### Branch Strategy

```bash
# Start from current working branch
git checkout f/preselection

# Create cleanup branch
git checkout -b cleanup/legacy-code

# Each sub-plan is a commit
git add ...
git commit -m "SP1: Remove offramp code"

# etc for SP2-SP8

# Final merge back
git checkout f/preselection
git merge cleanup/legacy-code
```

### Commit Message Format

```
SP[N]: [Brief description]

- [Change 1]
- [Change 2]
- [Change 3]

Validation:
- TypeScript: ✅ Pass
- Linter: ✅ Pass
- [Other checks]

See: implementation-logs/YYYYMMDD-HHMM-SP[N]-COMPLETE.md
```

### Implementation Log Format

After each sub-plan, create:

```
implementation-logs/YYYYMMDD-HHMM-SP[N]-COMPLETE.md
```

**Use actual file birth time for timestamp!**

---

## Next Steps

1. ✅ Review this sub-plan-0
2. ⬜ Create detailed sub-plan-1 (Offramp Purge)
3. ⬜ Create detailed sub-plan-2 (Deprecated Builders)
4. ⬜ Create detailed sub-plan-3 (Feature Flags)
5. ⬜ Create detailed sub-plan-4 (ID Consolidation)
6. ⬜ Create detailed sub-plan-5 (Documentation)
7. ⬜ Create detailed sub-plan-6 (Test Cleanup)
8. ⬜ Create detailed sub-plan-7 (Naming)
9. ⬜ Create detailed sub-plan-8 (Validation)
10. ⬜ Get approval and begin implementation

---

**Status**: ✅ COMPLETE
**Last Updated**: October 24, 2025
**Next Action**: Create detailed sub-plans 1-8 (or approve and begin implementation)
