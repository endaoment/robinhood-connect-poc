# Sub-Plan 2: Deprecated URL Builder Cleanup

**Status**: Ready for Implementation
**Priority**: High
**Dependencies**: Sub-Plan 1 (Offramp Purge)
**Estimated Time**: 1-2 hours

---

## Context Required

### Understanding the Problem

Review these files to understand why deprecated URL builders must be removed:

**Key Implementation Logs**:

- `.cursor/plans/robinhood-asset-preselection/implementation-logs/20251022-2130-CRITICAL-URL-FIX.md` (lines 1-169)
  - Lines 45-90: Explains why buildOnrampUrl() failed
  - Lines 100-140: Documents 31 URL variations tested
  - Lines 150-169: Explains why only Daffy-style works
- `.cursor/plans/robinhood-asset-preselection/implementation-logs/20251024-1545-POST-ROBINHOOD-CALL-SUMMARY.md` (lines 280-350)
  - Robinhood team confirmed Daffy-style approach is correct

**Current Code State**:

- `robinhood-onramp/lib/robinhood-url-builder.ts` (lines 1-638)
  - Lines 166-200: `buildOnrampUrl()` - DEPRECATED (uses wrong base URL)
  - Lines 327-370: `buildMultiNetworkOnrampUrl()` - DEPRECATED (balance-first doesn't work)
  - Lines 400-550: `buildDaffyStyleOnrampUrl()` - WORKING (keep this)

**API Route State**:

- `robinhood-onramp/app/api/robinhood/generate-onramp-url/route.ts` (lines 1-233)
  - Lines 90-178: Primary path using buildDaffyStyleOnrampUrl() (KEEP)
  - Lines 180-201: Legacy fallback using old builders (REMOVE)

---

## Objectives

1. Remove `buildOnrampUrl()` function from robinhood-url-builder.ts
2. Remove `buildMultiNetworkOnrampUrl()` function from robinhood-url-builder.ts
3. Keep only `buildDaffyStyleOnrampUrl()` as the single URL builder
4. Remove legacy fallback code from API route
5. Remove all @deprecated warnings (no longer needed)
6. Verify URL generation still works correctly
7. Simplify code to single working path

---

## Precise Implementation Steps

### Step 1: Identify All URL Builder Functions

**File**: `robinhood-onramp/lib/robinhood-url-builder.ts`

**Action**: Read the file and identify all functions

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# List all exported functions
grep -n "export.*function" lib/robinhood-url-builder.ts

# Search for deprecated markers
grep -n "@deprecated" lib/robinhood-url-builder.ts
```

**Expected Functions to Find**:

1. `buildOnrampUrl()` - marked @deprecated (REMOVE)
2. `buildMultiNetworkOnrampUrl()` - marked @deprecated (REMOVE)
3. `buildDaffyStyleOnrampUrl()` - working implementation (KEEP)
4. Helper functions (keep if used by buildDaffyStyleOnrampUrl)

**Document**: Note the exact line numbers for each function

---

### Step 2: Verify buildOnrampUrl() is Not Used

**Purpose**: Confirm buildOnrampUrl() can be safely deleted

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Search for buildOnrampUrl usage
grep -r "buildOnrampUrl" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v "robinhood-url-builder.ts"

# Search for imports of this function
grep -r "import.*buildOnrampUrl" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

**Expected Output**:

- Should ONLY find references in:
  - `lib/robinhood-url-builder.ts` (the function definition itself)
  - Possibly in API route fallback (which we'll remove in Step 5)
- Should NOT find references in active code paths

**If Found Elsewhere**: Document where it's used and verify those are deprecated code paths

---

### Step 3: Remove buildOnrampUrl() Function

**File**: `robinhood-onramp/lib/robinhood-url-builder.ts`

**Action**: Delete the entire buildOnrampUrl() function

**Approximate Lines**: ~166-200 (verify exact lines by reading the file)

**Steps**:

1. Open `lib/robinhood-url-builder.ts`
2. Find the function definition:
   ```typescript
   /**
    * @deprecated Use buildDaffyStyleOnrampUrl instead
    */
   export function buildOnrampUrl(...) {
     // ... function body ...
   }
   ```
3. Delete the entire function including:
   - JSDoc comment
   - @deprecated marker
   - Function signature
   - Function body
4. Save the file

**Validation**:

```bash
# Verify function is gone
grep -n "buildOnrampUrl" lib/robinhood-url-builder.ts

# Should only appear in comments (if any), not as function definition

# Try to compile
npx tsc --noEmit
```

---

### Step 4: Remove buildMultiNetworkOnrampUrl() Function

**File**: `robinhood-onramp/lib/robinhood-url-builder.ts`

**Action**: Delete the entire buildMultiNetworkOnrampUrl() function

**Approximate Lines**: ~327-370 (verify exact lines by reading the file)

**Pre-Check**:

```bash
# Search for usage
grep -r "buildMultiNetworkOnrampUrl" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v "robinhood-url-builder.ts"

# Expected: ZERO results (or only in deprecated API fallback)
```

**Steps**:

1. Open `lib/robinhood-url-builder.ts`
2. Find the function definition:
   ```typescript
   /**
    * @deprecated Use buildDaffyStyleOnrampUrl instead
    */
   export function buildMultiNetworkOnrampUrl(...) {
     // ... function body ...
   }
   ```
3. Delete the entire function including:
   - JSDoc comment
   - @deprecated marker
   - Function signature
   - Function body
4. Save the file

**Validation**:

```bash
# Verify function is gone
grep -n "buildMultiNetworkOnrampUrl" lib/robinhood-url-builder.ts

# Should return ZERO results

# Try to compile
npx tsc --noEmit
```

---

### Step 5: Clean Up Deprecated Helper Functions

**File**: `robinhood-onramp/lib/robinhood-url-builder.ts`

**Purpose**: Remove any helper functions that were ONLY used by deleted builders

**Action**: Review remaining helper functions

```bash
# List remaining functions
grep -n "^export function\|^function" lib/robinhood-url-builder.ts
```

**Common Helpers** (likely safe to delete if present):

- `buildLegacyOnrampUrl()` - helper for old approach
- `validateOnrampParams()` - if only used by old builders
- Any functions with "legacy" in the name

**Keep These Helpers** (if used by buildDaffyStyleOnrampUrl):

- `buildBaseRobinhoodUrl()` - used by working builder
- `encodeTransferData()` - used for redirectUrl
- `validateAssetNetwork()` - used for validation

**Steps**:

1. For each helper function, check if it's used:
   ```bash
   grep -n "helperFunctionName" lib/robinhood-url-builder.ts
   ```
2. If ONLY called by deleted functions, delete it
3. If called by `buildDaffyStyleOnrampUrl()`, keep it

**Validation**:

```bash
npx tsc --noEmit
# Should compile successfully
```

---

### Step 6: Remove Legacy Fallback from API Route

**File**: `robinhood-onramp/app/api/robinhood/generate-onramp-url/route.ts`

**Action**: Read the file and identify the legacy fallback code

```bash
# View the file
cat app/api/robinhood/generate-onramp-url/route.ts | grep -A 5 -B 5 "fallback\|legacy"
```

**Approximate Lines**: ~180-201 (verify by reading file)

**Likely Code to Remove**:

```typescript
// Legacy fallback (if Daffy-style fails)
try {
  // ... old builder code ...
  url = buildOnrampUrl(params);
} catch (error) {
  // ... error handling ...
}
```

**Steps**:

1. Open `app/api/robinhood/generate-onramp-url/route.ts`
2. Find the legacy fallback code block (likely in a catch or after main try)
3. Delete the entire fallback block
4. Ensure the main code path (using buildDaffyStyleOnrampUrl) remains
5. Remove any comments about "trying fallback" or "legacy approach"
6. Save the file

**Validation**:

```bash
# Verify only one URL builder is called
grep -n "build.*OnrampUrl" app/api/robinhood/generate-onramp-url/route.ts

# Should ONLY show buildDaffyStyleOnrampUrl

# Compile TypeScript
npx tsc --noEmit
```

---

### Step 7: Update Imports in API Route

**File**: `robinhood-onramp/app/api/robinhood/generate-onramp-url/route.ts`

**Purpose**: Remove imports of deleted functions

**Current Import** (likely):

```typescript
import {
  buildOnrampUrl,
  buildMultiNetworkOnrampUrl,
  buildDaffyStyleOnrampUrl,
} from "@/lib/robinhood-url-builder";
```

**Action**: Update to only import working function

**New Import**:

```typescript
import { buildDaffyStyleOnrampUrl } from "@/lib/robinhood-url-builder";
```

**Steps**:

1. Open `app/api/robinhood/generate-onramp-url/route.ts`
2. Find the import statement from robinhood-url-builder
3. Remove `buildOnrampUrl` and `buildMultiNetworkOnrampUrl` from imports
4. Keep only `buildDaffyStyleOnrampUrl`
5. Save the file

**Validation**:

```bash
# Verify import
grep -n "from.*robinhood-url-builder" app/api/robinhood/generate-onramp-url/route.ts

# Should only import buildDaffyStyleOnrampUrl

# Compile
npx tsc --noEmit
```

---

### Step 8: Remove Deprecation Warnings from buildDaffyStyleOnrampUrl

**File**: `robinhood-onramp/lib/robinhood-url-builder.ts`

**Purpose**: Clean up warning messages now that old functions are gone

**Action**: Look for console.warn or @deprecated on the working function

```bash
# Check if buildDaffyStyleOnrampUrl has any warnings
grep -A 20 "buildDaffyStyleOnrampUrl" lib/robinhood-url-builder.ts | grep -i "warn\|deprecated"
```

**If Found**: Remove any warnings about other builders since they no longer exist

**Example - Remove This**:

```typescript
export function buildDaffyStyleOnrampUrl(...) {
  console.warn('Using buildDaffyStyleOnrampUrl - other builders are deprecated');
  // ... rest of function
}
```

**Should Become**:

```typescript
export function buildDaffyStyleOnrampUrl(...) {
  // Clean implementation - no warnings needed
  // ... rest of function
}
```

**Validation**: Function should have clear JSDoc but no deprecation warnings

---

### Step 9: Verify Type Exports

**File**: `robinhood-onramp/lib/robinhood-url-builder.ts`

**Purpose**: Ensure types for deleted functions are also removed

**Action**: Check for exported types related to old builders

```bash
# Search for type exports
grep -n "export.*type.*Onramp" lib/robinhood-url-builder.ts
grep -n "export.*interface.*Onramp" lib/robinhood-url-builder.ts
```

**Types to Remove** (if present):

- `OnrampUrlParams` (if only used by old buildOnrampUrl)
- `MultiNetworkOnrampParams` (if only used by buildMultiNetworkOnrampUrl)

**Types to Keep**:

- `DaffyStyleOnrampParams` (used by working builder)
- Any types used by buildDaffyStyleOnrampUrl

**If Types Only Used by Deleted Functions**: Delete them

**Validation**:

```bash
npx tsc --noEmit
# Should compile successfully
```

---

### Step 10: Final Code Cleanup

**File**: `robinhood-onramp/lib/robinhood-url-builder.ts`

**Purpose**: Clean up file formatting and comments

**Actions**:

1. Remove any TODO comments about deprecated functions
2. Remove comments comparing old vs new approaches
3. Ensure consistent spacing between remaining functions
4. Update file header comment if it mentions multiple builders
5. Verify exports are clean

**Example File Header Update**:

**Before**:

```typescript
/**
 * Robinhood URL Builders
 *
 * Contains multiple approaches to URL generation.
 * Use buildDaffyStyleOnrampUrl for new code.
 */
```

**After**:

```typescript
/**
 * Robinhood URL Builder
 *
 * Generates Robinhood Connect URLs for onramp transfers.
 */
```

**Validation**: File should be clean and easy to understand

---

## Deliverables Checklist

After completing all steps, verify:

- [ ] `buildOnrampUrl()` function deleted from robinhood-url-builder.ts
- [ ] `buildMultiNetworkOnrampUrl()` function deleted from robinhood-url-builder.ts
- [ ] Only `buildDaffyStyleOnrampUrl()` remains as URL builder
- [ ] Legacy fallback code removed from API route
- [ ] Imports updated (only import buildDaffyStyleOnrampUrl)
- [ ] No @deprecated markers remain in working code
- [ ] Helper functions cleaned up (unused helpers deleted)
- [ ] Type definitions cleaned up (unused types deleted)
- [ ] TypeScript compiles without errors
- [ ] No references to deleted functions in codebase

---

## Validation Steps

### Validation 1: Search for Deleted Functions

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Search for buildOnrampUrl
grep -r "buildOnrampUrl" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Expected: ZERO results (function should not exist)

# Search for buildMultiNetworkOnrampUrl
grep -r "buildMultiNetworkOnrampUrl" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Expected: ZERO results
```

### Validation 2: TypeScript Compilation

```bash
npx tsc --noEmit
```

**Success Criteria**:

- Zero errors about missing functions
- Zero errors about undefined types
- Clean compilation (may have pre-existing unrelated errors)

### Validation 3: Verify Single Code Path in API Route

```bash
# Check API route only calls one builder
grep -n "build.*OnrampUrl\|build.*Url" app/api/robinhood/generate-onramp-url/route.ts

# Expected: Only buildDaffyStyleOnrampUrl appears
```

### Validation 4: Test URL Generation

```bash
# Start dev server
npm run dev

# In browser console (http://localhost:3030/dashboard):
# Try generating a URL by selecting asset and clicking "Initiate Transfer"
# Should succeed without errors
```

**Success Criteria**:

- URL generated successfully
- No console errors
- URL follows pattern: `https://robinhood.com/connect/amount?applicationId=...&connectId=...`

---

## Backward Compatibility Checkpoint

**Purpose**: Verify URL generation still works with single builder

### Manual Testing Steps:

1. **Start Development Server**:

   ```bash
   cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
   npm run dev
   ```

2. **Navigate to Dashboard**: `http://localhost:3030/dashboard`

3. **Select Asset**: Choose ETH on Ethereum network

4. **Initiate Transfer**: Click "Initiate Transfer" button

5. **Verify URL Generation**:

   - Open Network tab in DevTools
   - Look for POST to `/api/robinhood/generate-onramp-url`
   - Should return 200 OK with valid URL

6. **Check Console**:

   - Should be ZERO errors
   - Should be ZERO warnings about deprecated functions

7. **Inspect Generated URL**:
   - Should start with `https://robinhood.com/connect/amount`
   - Should have `connectId` parameter (not random UUID)
   - Should have `supportedAssets` parameter
   - Should have `walletAddress` parameter

### Success Criteria:

- ✅ URL generates without errors
- ✅ URL follows correct pattern (Daffy-style)
- ✅ No console warnings about deprecated code
- ✅ No fallback code executes
- ✅ Response contains valid connectId from Robinhood API

### If Checkpoint Fails:

1. **Error: "buildOnrampUrl is not defined"**

   - Review Step 6-7: Didn't update API route imports
   - Check for missed references to old function
   - Update all imports to use buildDaffyStyleOnrampUrl

2. **Error: "Type 'OnrampUrlParams' not found"**

   - Review Step 9: Deleted type but code still references it
   - Search for the type: `grep -r "OnrampUrlParams" .`
   - Update to use correct type (DaffyStyleOnrampParams)

3. **URL Generation Fails**
   - Check browser console for specific error
   - Verify buildDaffyStyleOnrampUrl function is intact
   - Verify all required parameters are passed
   - Check that function wasn't accidentally deleted

---

## Common Issues and Solutions

### Issue 1: "Cannot find name 'buildOnrampUrl'"

**Symptom**: TypeScript error after deleting function

**Cause**: Code still calls the deleted function

**Solution**:

```bash
# Find all references
grep -r "buildOnrampUrl" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Update each reference to use buildDaffyStyleOnrampUrl instead
# Or delete the code if it's a deprecated path
```

### Issue 2: Build succeeds but runtime error

**Symptom**: TypeScript compiles but crashes when generating URL

**Cause**: Deleted a helper function that buildDaffyStyleOnrampUrl needs

**Solution**:

1. Check browser console for specific function name
2. Restore the helper function (git checkout)
3. Verify it's used by working builder
4. Keep it if needed, delete only if truly unused

### Issue 3: Too many things deleted

**Symptom**: Many TypeScript errors after cleanup

**Cause**: Accidentally deleted working code

**Solution**:

```bash
# Restore from git
git diff lib/robinhood-url-builder.ts

# Review what was deleted
# Restore buildDaffyStyleOnrampUrl and its helpers
# Re-delete only the deprecated functions
```

---

## Integration Points

### Provides to Next Sub-Plans:

- **Sub-Plan 3**: Simpler codebase for feature flag removal
- **Sub-Plan 5**: Clearer architecture for documentation
- **Sub-Plan 7**: Consistent naming (single approach)

### Dependencies from Previous Sub-Plans:

- **Sub-Plan 1**: Offramp code removed (cleaner codebase)

---

## Next Steps

After completing this sub-plan:

1. ✅ Create implementation log: `YYYYMMDD-HHMM-SP2-COMPLETE.md`
2. ✅ Commit changes: `git commit -m "SP2: Remove deprecated URL builders"`
3. ⬜ Proceed to **Sub-Plan 3: Feature Flag and Old Flow Removal**

---

## Notes for Implementers

### Critical Checkpoints:

- **Before deleting function**: Search entire codebase for usage
- **After deleting function**: Immediately run TypeScript compilation
- **Final step**: Manual test URL generation end-to-end

### Common Pitfalls:

- ❌ Deleting buildDaffyStyleOnrampUrl by accident (it's the working one!)
- ❌ Removing helper functions still used by working builder
- ❌ Forgetting to update imports in API route
- ❌ Not testing URL generation after changes

### Time-Saving Tips:

- Read the entire file before deleting anything
- Use git diff frequently to verify you're deleting the right code
- Keep TypeScript compiler running in watch mode
- Test URL generation after each major deletion

### Key Distinction:

**DELETE These**:

- `buildOnrampUrl()` - wrong base URL, tested and failed
- `buildMultiNetworkOnrampUrl()` - balance-first approach, doesn't work

**KEEP This**:

- `buildDaffyStyleOnrampUrl()` - working implementation, proven with Robinhood

---

**Status**: ⬜ Ready for Implementation  
**Estimated Duration**: 1-2 hours  
**Complexity**: Low  
**Risk Level**: 🟢 Low (well-documented deprecated code)
