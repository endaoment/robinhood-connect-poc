# Sub-Plan 1: Offramp Purge

**Status**: Ready for Implementation
**Priority**: Critical
**Dependencies**: Sub-Plan 0 (Drafting Plan)
**Estimated Time**: 2-3 hours

---

## Context Required

### Understanding the Problem

Review these files to understand why offramp code must be removed:

**Key Implementation Logs**:

- `.cursor/plans/robinhood-asset-preselection/implementation-logs/20251024-1545-POST-ROBINHOOD-CALL-SUMMARY.md` (lines 1-458)
  - Lines 50-80: Explanation that onramp and offramp are separate APIs
  - Lines 200-250: Order status polling doesn't work for onramp
- `robinhood-onramp/CHANGES-ORDER-STATUS-REMOVAL.md` (entire file)
  - Documents why order status was removed from callback

**Files to Delete**:

- `robinhood-onramp/app/api/robinhood/generate-offramp-url/` (entire directory)
- `robinhood-onramp/app/api/robinhood/order-status/route.ts` (offramp-only API)
- `robinhood-onramp/components/order-status.tsx` (offramp-only component)

**Files to Modify**:

- `robinhood-onramp/types/robinhood.d.ts` - Remove offramp interfaces
- `robinhood-onramp/components/transaction-history.tsx` - Remove OrderStatusComponent import/usage
- Documentation files - Remove offramp references

---

## Objectives

1. Delete all offramp-specific API endpoints and components
2. Remove offramp type definitions and interfaces
3. Remove offramp references from documentation
4. Verify no code depends on removed offramp functionality
5. Ensure TypeScript compilation succeeds after cleanup

---

## Precise Implementation Steps

### Step 1: Pre-Cleanup Verification

**Purpose**: Identify all offramp references before deletion

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Search for "offramp" in code
grep -r "offramp" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Search for "generate-offramp-url" imports
grep -r "generate-offramp-url" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Search for "order-status" component imports
grep -r "order-status" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Search for OrderStatusComponent
grep -r "OrderStatusComponent" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

**Expected Output**:

- Should find references in files we're about to delete/modify
- Should NOT find references in core flow files (dashboard, callback)

**What to Look For**:

- Any unexpected imports of offramp code
- Any usage in production code paths
- Document all findings before proceeding

---

### Step 2: Delete Offramp URL Generation API

**File**: `robinhood-onramp/app/api/robinhood/generate-offramp-url/` (entire directory)

**Pre-Check**:

```bash
# Verify this directory exists
ls -la app/api/robinhood/generate-offramp-url/

# Search for any imports of this endpoint
grep -r "generate-offramp-url" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

**Action**: Delete the directory

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
rm -rf app/api/robinhood/generate-offramp-url/
```

**Validation**:

```bash
# Verify directory is gone
ls app/api/robinhood/generate-offramp-url/ 2>&1
# Should output: "No such file or directory"

# Verify no broken imports
npx tsc --noEmit
# Should compile (may have errors from other files we'll fix next)
```

---

### Step 3: Delete Order Status API Route

**File**: `robinhood-onramp/app/api/robinhood/order-status/route.ts`

**Pre-Check**:

```bash
# Verify file exists
cat app/api/robinhood/order-status/route.ts | head -20

# Search for imports/usage of this route
grep -r "order-status" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

**Action**: Delete the entire order-status directory

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
rm -rf app/api/robinhood/order-status/
```

**Validation**:

```bash
# Verify directory is gone
ls app/api/robinhood/order-status/ 2>&1
# Should output: "No such file or directory"
```

---

### Step 4: Delete Order Status Component

**File**: `robinhood-onramp/components/order-status.tsx`

**Pre-Check**:

```bash
# View the file to confirm it's offramp-only
head -50 components/order-status.tsx

# Search for imports of OrderStatusComponent
grep -r "OrderStatusComponent\|order-status.tsx" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

**Action**: Delete the file

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
rm components/order-status.tsx
```

**Validation**:

```bash
# Verify file is gone
ls components/order-status.tsx 2>&1
# Should output: "No such file or directory"

# Try to compile
npx tsc --noEmit
```

---

### Step 5: Remove Offramp Types from Type Definitions

**File**: `robinhood-onramp/types/robinhood.d.ts`

**Action**: Read the file first to identify offramp-specific types

```bash
cat types/robinhood.d.ts
```

**Likely Offramp Types to Remove**:

- `OfframpURLParams` interface
- `OfframpURLResponse` interface
- `OfframpOrderStatus` interface
- Any other types with "offramp" in the name

**Instructions**:

1. Open `types/robinhood.d.ts`
2. Search for "offramp" (case-insensitive)
3. Remove any interfaces/types that are offramp-specific
4. Keep all onramp-related types
5. Save the file

**Validation**:

```bash
# Search for remaining "offramp" references
grep -i "offramp" types/robinhood.d.ts

# Should return NO results (or only in comments explaining what was removed)

# Verify TypeScript compilation
npx tsc --noEmit
```

---

### Step 6: Remove OrderStatusComponent Usage from Transaction History

**File**: `robinhood-onramp/components/transaction-history.tsx`

**Pre-Check**:

```bash
# Check if this file imports OrderStatusComponent
grep -n "OrderStatusComponent\|order-status" components/transaction-history.tsx
```

**Action**: If OrderStatusComponent is imported or used:

1. Open `components/transaction-history.tsx`
2. Remove import statement: `import { OrderStatusComponent } from './order-status'`
3. Remove any JSX using `<OrderStatusComponent ... />`
4. Save the file

**If file doesn't use OrderStatusComponent**: Skip this step

**Validation**:

```bash
# Verify no more references
grep -n "OrderStatusComponent\|order-status" components/transaction-history.tsx
# Should return NO results

# Verify TypeScript compilation
npx tsc --noEmit
```

---

### Step 7: Remove Offramp Documentation References

**Files to Check**:

- `robinhood-onramp/README.md`
- `robinhood-onramp/docs/DEVELOPER_GUIDE.md`
- `robinhood-onramp/docs/USER_GUIDE.md`
- `robinhood-onramp/API-TESTING.md`
- `robinhood-onramp/CALLBACK-TESTING.md`

**Action**: For each file:

```bash
# Search for offramp mentions
grep -n -i "offramp" README.md
grep -n -i "offramp" docs/DEVELOPER_GUIDE.md
grep -n -i "offramp" docs/USER_GUIDE.md
grep -n -i "offramp" API-TESTING.md
grep -n -i "offramp" CALLBACK-TESTING.md
```

**Instructions**:

1. For each offramp mention found, decide:

   - **Delete** if it's describing how to use offramp
   - **Update** if it's explaining onramp vs offramp (make it clear we only support onramp)
   - **Keep** if it's historical context explaining why offramp was removed

2. Acceptable offramp references after cleanup:
   - "Note: Offramp is not supported. This integration only handles onramp (deposits)."
   - "This was removed because offramp uses a different API."

**Validation**:

```bash
# Search all docs for "offramp"
grep -r -i "offramp" *.md docs/*.md

# Review each result - should only be explanatory, not instructional
```

---

### Step 8: Final Compilation Check

**Purpose**: Ensure all TypeScript errors from deletions are resolved

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Full TypeScript compilation
npx tsc --noEmit

# Run linter if available
npm run lint 2>/dev/null || echo "Linter not configured, skipping"
```

**Expected Output**:

- **TypeScript**: Zero errors related to offramp code
- **Linter**: Zero errors related to offramp code
- May have other pre-existing errors (address in later sub-plans)

**If Errors Exist**:

1. Review each error message
2. Check if it's related to offramp code deletion
3. Fix by removing additional imports or references
4. Re-run compilation until clean

---

## Deliverables Checklist

After completing all steps, verify:

- [ ] `app/api/robinhood/generate-offramp-url/` directory deleted
- [ ] `app/api/robinhood/order-status/` directory deleted
- [ ] `components/order-status.tsx` file deleted
- [ ] Offramp types removed from `types/robinhood.d.ts`
- [ ] No imports of deleted files remain
- [ ] Documentation updated (offramp references removed or clarified)
- [ ] TypeScript compiles without offramp-related errors
- [ ] No "offramp" found in code (except explanatory docs)

---

## Validation Steps

### Validation 1: Search for Offramp References

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Search all TypeScript/TSX files
grep -r -i "offramp" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Expected: ZERO results in code files
# Acceptable: Results only in .md documentation files (explanatory only)
```

### Validation 2: TypeScript Compilation

```bash
npx tsc --noEmit
```

**Success Criteria**:

- Zero errors related to missing offramp files
- Zero errors related to undefined offramp types
- Other pre-existing errors are acceptable (will be addressed in later sub-plans)

### Validation 3: File Structure Check

```bash
# List API routes - should NOT include offramp or order-status
ls -la app/api/robinhood/

# Expected output:
# - generate-onramp-url/
# - redeem-deposit-address/
# (no generate-offramp-url/, no order-status/)

# List components - should NOT include order-status.tsx
ls -la components/ | grep -i status

# Expected: No results (order-status.tsx should be gone)
```

### Validation 4: Import Check

```bash
# Verify no broken imports
grep -r "from.*generate-offramp-url" --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -r "from.*order-status" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Expected: ZERO results
```

---

## Backward Compatibility Checkpoint

**Purpose**: Verify onramp functionality still works after offramp removal

### Commands

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Start dev server
npm run dev
```

### Manual Testing Checklist

- [ ] Navigate to dashboard (`http://localhost:3030/dashboard`)
- [ ] Verify asset selector renders
- [ ] Select an asset (e.g., ETH on Ethereum)
- [ ] Click "Initiate Transfer"
- [ ] Verify URL generation succeeds (no console errors)
- [ ] Verify no references to offramp in Network tab
- [ ] Check browser console for errors - should be ZERO errors related to missing offramp files

### Success Criteria

- ✅ Dashboard loads without errors
- ✅ Asset selector works
- ✅ URL generation works
- ✅ No console errors about missing offramp files
- ✅ No 404s for offramp endpoints

### If Checkpoint Fails

1. **Console Error: "Cannot find module 'order-status'"**

   - Review Step 6 - missed import removal
   - Search codebase: `grep -r "order-status" --include="*.ts" --include="*.tsx" .`
   - Remove the import

2. **TypeScript Error: "Cannot find type 'OfframpXYZ'"**

   - Review Step 5 - type still referenced somewhere
   - Search for the type: `grep -r "OfframpXYZ" --include="*.ts" --include="*.tsx" .`
   - Remove the reference or create a stub type

3. **404 Error for /api/robinhood/order-status**
   - This is expected and OK (we deleted it)
   - Verify nothing in working flow calls this endpoint
   - If callback or dashboard calls it, remove that code

---

## Common Issues and Solutions

### Issue 1: "Module not found: order-status"

**Symptom**: TypeScript or runtime error about missing order-status module

**Cause**: Missed import statement somewhere

**Solution**:

```bash
# Find all imports
grep -r "order-status\|OrderStatusComponent" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Remove each import found
```

### Issue 2: "Type 'OfframpXYZ' not found"

**Symptom**: TypeScript compilation error about missing offramp type

**Cause**: Code still references deleted offramp type

**Solution**:

```bash
# Find where type is used
grep -r "OfframpXYZ" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Either:
# - Remove the code using this type (if it's dead code)
# - Replace with onramp equivalent type
```

### Issue 3: Unexpected offramp references in logs

**Symptom**: `grep -r "offramp"` shows results in unexpected places

**Cause**: Offramp mentioned in comments, logs, or variable names

**Solution**:

- If it's a comment: Update to say "Note: Offramp not supported"
- If it's a variable name: Rename to "onramp" or "transfer"
- If it's console.log: Remove or update message

---

## Integration Points

### Provides to Next Sub-Plans

- **Sub-Plan 2**: Clean codebase without offramp confusion
- **Sub-Plan 5**: Clearer documentation structure
- **Sub-Plan 7**: Removes naming inconsistencies

### Dependencies from Previous Sub-Plans

- **Sub-Plan 0**: Planning and file identification

---

## Next Steps

After completing this sub-plan:

1. ✅ Create implementation log: `YYYYMMDD-HHMM-SP1-COMPLETE.md`
2. ✅ Commit changes: `git commit -m "SP1: Remove all offramp code"`
3. ⬜ Proceed to **Sub-Plan 2: Deprecated URL Builder Cleanup**

---

## Notes for Implementers

### Critical Checkpoints

- **Before deleting**: Always grep for imports first
- **After deleting**: Always run TypeScript compilation
- **Final step**: Manual test of onramp flow

### Common Pitfalls

- ❌ Forgetting to remove imports in other files
- ❌ Leaving offramp types referenced in interfaces
- ❌ Not testing after deletion (catches issues early)

### Time-Saving Tips

- Use global search (Cmd+Shift+F in VSCode) for "offramp" before starting
- Run `npx tsc --noEmit --watch` in separate terminal during cleanup
- Make small commits after each file deletion for easy rollback

---

**Status**: ⬜ Ready for Implementation
**Estimated Duration**: 2-3 hours
**Complexity**: Low-Medium
**Risk Level**: 🟢 Low (documented dead code)
