# Sub-Plan 3: Feature Flag and Old Flow Removal

**Status**: Ready for Implementation
**Priority**: High
**Dependencies**: Sub-Plan 1 (Offramp Purge), Sub-Plan 2 (Deprecated Builders)
**Estimated Time**: 2-3 hours

---

## Context Required

### Understanding the Problem

Review these files to understand the feature flag system and old flow:

**Key Implementation Logs**:

- `.cursor/plans/robinhood-asset-preselection/implementation-logs/20251022-2025-SP4-COMPLETE.md` (lines 1-378)
  - Documents completion of asset pre-selection feature
  - Shows feature flag was used during testing phase
  - Confirms new flow is working and stable

**Current Code**:

- `robinhood-onramp/lib/feature-flags.ts` - Feature flag configuration
- `robinhood-onramp/app/dashboard/page.tsx` (lines 1-614)
  - Lines 1-380: NEW working asset selector flow (KEEP)
  - Lines 380-450: OLD flow code path controlled by feature flag (REMOVE)
- `robinhood-onramp/app/dashboard/page-old-backup.tsx` - Backup from before feature implementation (DELETE)

---

## Objectives

1. Verify feature flags are ONLY used for asset pre-selection
2. Remove FEATURE_FLAGS.assetPreselection check from dashboard
3. Delete old flow code path (non-asset-selection flow)
4. Delete `/app/dashboard/page-old-backup.tsx`
5. Delete `/lib/feature-flags.ts` (if only used for asset preselection)
6. Ensure dashboard has single, clean code path
7. Verify asset selector still works after cleanup

---

## Precise Implementation Steps

### Step 1: Identify All Feature Flag Usage

**Purpose**: Understand complete scope before deletion

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Find all FEATURE_FLAGS references
grep -r "FEATURE_FLAGS" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Find all imports of feature-flags.ts
grep -r "feature-flags" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# List what's in feature-flags.ts
cat lib/feature-flags.ts

```

**Expected Results**:

- Should find `FEATURE_FLAGS` primarily in dashboard

- Should find `assetPreselection` flag
- May find other feature flags (if so, we only remove assetPreselection)

**Document**:

- List ALL feature flags found
- List ALL files that import feature-flags
- Note any flags other than assetPreselection

---

### Step 2: Verify Feature Flag File Contents

**File**: `robinhood-onramp/lib/feature-flags.ts`

**Action**: Read the complete file

```bash
cat lib/feature-flags.ts
```

**Likely Contents**:

```typescript
export const FEATURE_FLAGS = {
  assetPreselection: true,
  // possibly other flags...
};
```

**Decision Point**:

- **If ONLY assetPreselection flag exists**: Delete entire file (proceed to Step 3A)
- **If other flags exist**: Keep file, remove only assetPreselection (proceed to Step 3B)

**Document Your Decision**:

```
Decision: [ ] Delete entire file  OR  [ ] Keep file, remove assetPreselection only
Reason: _______________________
```

---

### Step 3A: Delete Entire Feature Flags File (if only assetPreselection)

**File**: `robinhood-onramp/lib/feature-flags.ts`

**Condition**: ONLY execute if feature-flags.ts contains ONLY assetPreselection flag

**Action**: Delete the file

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
rm lib/feature-flags.ts
```

**Validation**:

```bash
# Verify file is gone
ls lib/feature-flags.ts 2>&1
# Should output: "No such file or directory"
```

**Next**: Skip Step 3B, proceed to Step 4

---

### Step 3B: Remove Only assetPreselection Flag (if other flags exist)

**File**: `robinhood-onramp/lib/feature-flags.ts`

**Condition**: ONLY execute if other feature flags exist besides assetPreselection

**Action**: Edit the file to remove assetPreselection

**Before**:

```typescript
export const FEATURE_FLAGS = {
  assetPreselection: true,
  someOtherFlag: false,
  anotherFlag: true,
};
```

**After**:

```typescript
export const FEATURE_FLAGS = {
  someOtherFlag: false,

  anotherFlag: true,
};
```

**Steps**:

1. Open `lib/feature-flags.ts`
2. Remove the `assetPreselection: true,` line
3. Keep all other flags
4. Save the file

**Validation**:

```bash
# Verify assetPreselection is gone
grep "assetPreselection" lib/feature-flags.ts
# Should return ZERO results
```

**Next**: Proceed to Step 4

---

### Step 4: Read Dashboard Page to Identify Old Flow Code

**File**: `robinhood-onramp/app/dashboard/page.tsx`

**Purpose**: Locate the exact lines of old flow code before removal

**Action**: Examine the file structure

```bash

cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# View file with line numbers
cat -n app/dashboard/page.tsx | head -100

# Search for FEATURE_FLAGS usage
grep -n "FEATURE_FLAGS" app/dashboard/page.tsx

# Search for assetPreselection
grep -n "assetPreselection" app/dashboard/page.tsx
```

**Expected Pattern**:

```typescript
// Around line 380-450
{FEATURE_FLAGS.assetPreselection ? (
  // NEW FLOW: Asset selector (KEEP THIS)
  <AssetSelector ... />
) : (
  // OLD FLOW: Direct transfer button (DELETE THIS)
  <Button onClick={oldFlowHandler}>
    Start Transfer Without Selection
  </Button>
)}
```

**Document**:

- Line number where feature flag check starts: **\_**
- Line number where new flow starts: **\_**
- Line number where old flow starts: **\_**
- Line number where conditional ends: **\_**

---

### Step 5: Remove Feature Flag Check from Dashboard

**File**: `robinhood-onramp/app/dashboard/page.tsx`

**Purpose**: Remove conditional and old flow code, keep only new flow

**Pattern to Find**:

```typescript
{FEATURE_FLAGS.assetPreselection ? (
  // NEW FLOW CODE
) : (
  // OLD FLOW CODE
)}
```

**Replace With**:

```typescript
{
  /* NEW FLOW CODE (no conditional) */
}
```

**Detailed Steps**:

1. Open `app/dashboard/page.tsx`

2. Find the feature flag conditional (likely around line 380)

3. Identify the three sections:

   - The conditional check: `FEATURE_FLAGS.assetPreselection ? (`
   - The new flow (asset selector): `<AssetSelector ... />` and related code
   - The old flow (alternative): `<Button ... />` and related code

4. Delete:

   - The ternary conditional wrapper
   - The entire old flow (else/false branch)
   - The feature flag import at top of file

5. Keep:
   - All the new flow code (asset selector)
   - Keep it at the same indentation level

**Example Transformation**:

**Before** (lines 380-450):

```typescript
import { FEATURE_FLAGS } from "@/lib/feature-flags";

// ... other code ...

<div className="dashboard-content">
  {FEATURE_FLAGS.assetPreselection ? (
    <div className="asset-selection">
      <AssetSelector
        onAssetSelect={handleAssetSelect}
        selectedAsset={selectedAsset}
      />
      <Button onClick={handleTransfer}>Initiate Transfer</Button>
    </div>
  ) : (
    <div className="old-flow">
      <h2>Start Transfer</h2>
      <Button onClick={handleOldFlowTransfer}>
        Transfer Without Asset Selection
      </Button>
    </div>
  )}
</div>;
```

**After** (lines 380-420):

```typescript
// import { FEATURE_FLAGS } from '@/lib/feature-flags'; // REMOVED

// ... other code ...

<div className="dashboard-content">
  <div className="asset-selection">
    <AssetSelector
      onAssetSelect={handleAssetSelect}
      selectedAsset={selectedAsset}
    />
    <Button onClick={handleTransfer}>Initiate Transfer</Button>
  </div>
</div>
```

6. Save the file

**Validation**:

```bash
# Verify no more FEATURE_FLAGS references in dashboard
grep "FEATURE_FLAGS" app/dashboard/page.tsx
# Should return ZERO results


# Verify no more assetPreselection references
grep "assetPreselection" app/dashboard/page.tsx
# Should return ZERO results

# Try to compile
npx tsc --noEmit
```

---

### Step 6: Remove Feature Flag Import from Dashboard

**File**: `robinhood-onramp/app/dashboard/page.tsx`

**Purpose**: Clean up unused import

**Action**: Remove import statement

**Find** (likely near top of file):

```typescript
import { FEATURE_FLAGS } from "@/lib/feature-flags";
```

**Delete**: The entire import line

**If you deleted feature-flags.ts in Step 3A**: This import will cause a TypeScript error until removed

**If you kept feature-flags.ts in Step 3B**: Linter will warn about unused import

**Validation**:

```bash
# Verify import is gone
grep -n "feature-flags" app/dashboard/page.tsx
# Should return ZERO results

npx tsc --noEmit
# Should compile successfully
```

---

### Step 7: Remove Old Flow Handler Functions

**File**: `robinhood-onramp/app/dashboard/page.tsx`

**Purpose**: Delete functions that were only used by old flow

**Likely Functions to Remove** (search for these):

- `handleOldFlowTransfer()`
- `handleDirectTransfer()`

- `handleNoSelectionFlow()`
- Any function only called from deleted old flow code

**Action**: Search for these patterns

```bash
# Find handler functions
grep -n "handleOldFlow\|handleDirectTransfer\|handleNoSelection" app/dashboard/page.tsx
```

**For Each Found**:

1. Verify it's ONLY used in the old flow (which we just deleted)
2. Delete the entire function definition

3. Remove from any dependency arrays

**Example - Delete This**:

```typescript
const handleOldFlowTransfer = () => {
  // old flow logic...
};
```

**Validation**:

```bash
npx tsc --noEmit
# Should compile - no "unused variable" warnings for these functions
```

---

### Step 8: Delete Dashboard Backup File

**File**: `robinhood-onramp/app/dashboard/page-old-backup.tsx`

**Purpose**: Remove backup from before feature implementation

**Pre-Check**:

```bash
# Verify file exists
ls -la app/dashboard/page-old-backup.tsx

# Confirm it's a backup (check creation date, size)
stat app/dashboard/page-old-backup.tsx
```

**Action**: Delete the file

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
rm app/dashboard/page-old-backup.tsx
```

**Validation**:

```bash
# Verify file is gone
ls app/dashboard/page-old-backup.tsx 2>&1

# Should output: "No such file or directory"

# Verify no imports reference it
grep -r "page-old-backup" --include="*.ts" --include="*.tsx" . | grep -v node_modules
# Should return ZERO results

```

---

### Step 9: Clean Up State Variables for Old Flow

**File**: `robinhood-onramp/app/dashboard/page.tsx`

**Purpose**: Remove state variables only used by old flow

**Action**: Review state declarations

```bash
# Find useState declarations
grep -n "useState" app/dashboard/page.tsx

```

**Likely State to Remove** (if present):

- `const [useOldFlow, setUseOldFlow] = useState(false);`
- `const [skipAssetSelection, setSkipAssetSelection] = useState(false);`
- Any state only used for old flow logic

**Steps**:

1. Identify state variables from deleted old flow code
2. Delete each unused state declaration
3. Remove from any useEffect dependencies

**Validation**:

```bash
npm run lint 2>/dev/null || echo "Linter not configured"

# Linter should catch unused state variables

npx tsc --noEmit
# Should compile successfully
```

---

### Step 10: Verify Feature Flags Completely Removed

**Purpose**: Ensure no lingering references

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Search entire codebase for FEATURE_FLAGS
grep -r "FEATURE_FLAGS" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Search for assetPreselection
grep -r "assetPreselection" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Search for feature-flags import
grep -r "feature-flags" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

**Expected Results**:

- **If you deleted feature-flags.ts**: ZERO results for all searches
- **If you kept feature-flags.ts**: Results only in feature-flags.ts itself (for other flags)

**If Unexpected Results Found**:

1. Review each occurrence
2. Determine if it's a missed cleanup
3. Remove or update as needed

---

## Deliverables Checklist

After completing all steps, verify:

- [ ] Feature flag usage identified and documented
- [ ] `lib/feature-flags.ts` deleted (or assetPreselection flag removed)
- [ ] Feature flag conditional removed from dashboard
- [ ] Old flow code removed from dashboard (lines ~380-450)
- [ ] New flow code kept (asset selector)
- [ ] Feature flag import removed from dashboard

- [ ] Old flow handler functions deleted
- [ ] `app/dashboard/page-old-backup.tsx` deleted
- [ ] Unused state variables removed
- [ ] No FEATURE_FLAGS references remain (except in other flags if kept)
- [ ] TypeScript compiles successfully
- [ ] Dashboard has single, clean code path

---

## Validation Steps

### Validation 1: Search for Feature Flag References

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Search for FEATURE_FLAGS
grep -r "FEATURE_FLAGS" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Search for assetPreselection
grep -r "assetPreselection" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

**Success Criteria**:

- ZERO results (if feature-flags.ts was deleted)
- Results only in feature-flags.ts for OTHER flags (if file was kept)

### Validation 2: TypeScript Compilation

```bash
npx tsc --noEmit
```

**Success Criteria**:

- Zero errors about missing feature-flags module
- Zero errors about undefined FEATURE_FLAGS
- Clean compilation

### Validation 3: Dashboard Code Review

```bash
# Check dashboard is clean
wc -l app/dashboard/page.tsx
# Should be ~350-400 lines (reduced from ~614)

# Verify single code path
grep -c "?" app/dashboard/page.tsx
# Should be minimal ternary operators (no feature flag conditionals)
```

### Validation 4: File Structure Check

```bash
# Verify backup file is gone
ls app/dashboard/
# Should show only page.tsx, not page-old-backup.tsx
```

---

## Backward Compatibility Checkpoint

**Purpose**: Verify sset selector flow still works after feature flag removal

### Manual Testing Steps

1. **Start Development Server**:

   ```bash
   cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
   npm run dev
   ```

2. **Navigate to Dashboard**: `http://localhost:3000/dashboard`

3. **Verify Asset Selector Renders**:

   - Should see asset selection UI immediately
   - Should NOT see any "old flow" buttons
   - No conditional rendering or feature flag checks visible

4. **Test Asset Selection**:

   - Select different assets (ETH, USDC, etc.)
   - Verify selection updates state
   - Verify network selection works

5. **Test Transfer Initiation**:

   - Click "Initiate Transfer" button
   - Should generate URL successfully
   - Should redirect to Robinhood

6. **Check Console**:

   - Should be ZERO errors
   - Should be ZERO warnings about feature flags
   - Should be ZERO warnings about unused variables

7. **Check Network Tab**:
   - POST to `/api/robinhood/generate-onramp-url` should succeed
   - Should return 200 OK with valid URL

### Success Criteria

- ✅ Dashboard renders asset selector
- ✅ No old flow UI elements visible
- ✅ Asset selection works correctly

- ✅ Transfer initiation works correctly
- ✅ No console errors or warnings
- ✅ No feature flag conditionals visible in rendered HTML
- ✅ Single, clean code path

### If Checkpoint Fails

1. **Dashboard Doesn't Render**:

   - Check browser console for errors
   - Likely: Syntax error from cleanup
   - Review Step 5: Verify conditional was removed properly

2. **Error: "FEATURE_FLAGS is not defined"**:

   - Review Step 6: Feature flag import not removed

   - Remove the import statement
   - If feature-flags.ts was deleted, this will cause error

3. **Asset Selector Not Working**:

   - Likely: Accidentally deleted new flow code instead of old flow
   - Review Step 5: Make sure you kept the RIGHT branch of conditional
   - Restore from git if needed

4. **Unused Variable Warnings**:
   - Review Step 7 & 9: Old flow handlers/state not removed
   - Find and remove the unused code

---

## Common Issues and Solutions

### Issue 1: "Cannot find module './lib/feature-flags'"

**Symptom**: TypeScript error after deleting feature-flags.ts

**Cause**: Missed import removal in some file

**Solution**:

```bash
# Find all imports
grep -r "feature-flags" --include="*.ts" --include="*.tsx" . | grep -v node_modules


# Remove each import found
```

### Issue 2: Dashboard shows nothing

**Symptom**: Dashboard page is blank after cleanup

**Cause**: Accidentally deleted new flow code

**Solution**:

```bash
# Check git diff
git diff app/dashboard/page.tsx

# Look for deleted AssetSelector code
# Restore if needed:
git checkout app/dashboard/page.tsx

# Re-do Step 5 carefully, keeping the NEW flow (true branch)
```

### Issue 3: Old flow still visible

**Symptom**: See both new and old flow elements

**Cause**: Didn't remove old flow code, only feature flag check

**Solution**:

- Review Step 5: Must delete entire false/else branch
- Only keep the true branch (asset selector)

### Issue 4: TypeScript rrors after feature flag removal

**Symptom**: Multiple TypeScript errors

**Cause**: Variables/functions used by old flow are still defined

**Solution**:

1. Review each error
2. If it's an unused variable from old flow, delete it
3. If it's a missing import, restore it (needed by new flow)

---

## Integration Points

### Provides to Next Sub-Plans

- **Sub-Plan 5**: Cleaner docs (no feature flag explanations needed)
- **Sub-Plan 7**: Simpler code (single path, easier to name consistently)
- **Sub-Plan 8**:Easier testing (only one flow to test)

### Dependencies from Previous Sub-Plans

- **Sub-Plan 1**: Offramp removed (less code complexity)
- **Sub-Plan 2**: Deprecated builders removed (simpler URL generation)

---

## Next Steps

After completing this sub-plan:

1. ✅ Create implementation log: `YYYYMMDD-HHMM-SP3-COMPLETE.md`
2. ✅ Commit changes: `git commit -m "SP3: Remove feature flags and old flow"`
3. ⬜ Proceed to **Sub-Plan 4: ID System Consolidation**

---

## Notes for Implementers

### Critical Checkpoints

- **Step 4**: Identify EXACTLY which code is new flow vs old flow before deleting
- **Step 5**: Keep the NEW flow (asset selector), delete the OLD flow
- **After Step 5**: Immediately test dashboard renders correctly

### Common Pitfalls

- ❌ Deleting the wrong branch of the conditional (keeping old flow, deleting new)
- ❌ Forgetting to remove the conditional wrapper itself
- ❌ Leaving unused handler functions that cause linter warnings
- ❌ Not testing dashboard after changes

### Time-Saving Tips

- **Before Step 5**: Take a screenshot of working dashboard for reference
- **During Step 5**: Use git diff frequently to verify correct code is being deleted
- **After Step 5**: Test immediately before proceeding to other steps
- Keep dev server running in background to catch errors quickly

### Key Decisions

**Keep This**: Asset selector code (the working new flow)
**Delete This**: Old flow code (direct transfer without selection)

If you're ever unsure which is which:

- New flow = Uses `AssetSelector` component
- Old flow = Direct transfer button without asset selection

---

**Status**: ⬜ Ready for Implementation  
**Estimated Duration**: 2-3 hours  
**Complexity**: Medium  
**Risk Level**: 🟡 Medium (must verify feature flag only used for asset preselection)
