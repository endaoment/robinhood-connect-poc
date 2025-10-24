# Sub-Plan 7: Naming Consistency Pass

**Status**: Ready for Implementation
**Priority**: Medium
**Dependencies**: Sub-Plans 1-6 (clean codebase)
**Estimated Time**: 1-2 hours

---

## Context Required

### Understanding the Problem

After removing offramp code, deprecated builders, and cleaning up, we need to ensure naming is consistent throughout the codebase.

**Common Issues**:
- Variable names still using "offramp" terminology
- Inconsistent use of "transfer" vs "onramp" vs "deposit"
- Component names that don't clearly indicate purpose
- API endpoint names that could be clearer

**Goal**: Clear, consistent, self-documenting code

---

## Objectives

1. Remove any lingering "offramp" in variable/function names (not in comments)
2. Standardize "transfer" vs "onramp" terminology
3. Ensure component names are clear and descriptive
4. Verify API endpoint names are appropriate
5. Check file/directory names are clear
6. Ensure consistent terminology in user-facing strings
7. Update any confusing abbreviations

---

## Precise Implementation Steps

### Step 1: Search for "Offramp" in Code

**Purpose**: Find any remaining offramp terminology in variable/function names

**Commands**:
```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Search for offramp in code (excluding comments)
grep -r "offramp" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v "//.*offramp" | grep -v "/\*.*offramp"

# Search for case variations
grep -ri "offramp\|off-ramp\|off_ramp" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

**Expected Results**: 
- Should be ZERO results in actual code
- Comments explaining "onramp only, not offramp" are OK

**If Found in Code**:
- Variable names → rename to use "onramp" or "transfer"
- Function names → rename to use "onramp" or "transfer"
- Type names → rename to use "onramp" or "transfer"

**Example**:
```typescript
// BAD
const offrampUrl = "...";

// GOOD
const onrampUrl = "...";
```

---

### Step 2: Standardize "Transfer" vs "Onramp" Terminology

**Purpose**: Decide on consistent terms and apply them

**Terminology Guide**:

**Use "Transfer"** for:
- User-facing UI text
- User actions (e.g., "Initiate Transfer", "Transfer Complete")
- General description of the action
- Button labels

**Use "Onramp"** for:
- API endpoints (e.g., `/api/robinhood/generate-onramp-url`)
- Technical function names (e.g., `buildOnrampUrl`)
- Type names (e.g., `OnrampURLParams`)
- File names for technical modules

**Use "Deposit"** for:
- Robinhood-specific context (if Robinhood uses this term)
- When specifically referring to "deposit to external wallet"

**Action**: Review and update

```bash
# Find all uses of these terms
grep -rn "transfer\|onramp\|deposit" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v ".d.ts" > /tmp/terminology-audit.txt

# Review the file
cat /tmp/terminology-audit.txt
```

**For Each Occurrence**:
1. Determine context (user-facing vs technical vs specific)
2. Apply appropriate term from guide above
3. Update if inconsistent

**Example Corrections**:

```typescript
// User-facing (UI)
<Button>Initiate Transfer</Button>  // ✅ GOOD - "transfer" for users

// Technical (API)
const url = await fetch('/api/robinhood/generate-onramp-url')  // ✅ GOOD - "onramp" for technical

// Mixed (should be consistent)
function handleTransferClick() {
  generateOnrampUrl()  // ✅ GOOD - both appropriate for their contexts
}
```

---

### Step 3: Review Component Names

**Purpose**: Ensure component names clearly indicate their purpose

**Current Components to Review**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# List all components
ls -1 components/*.tsx
```

**Expected Components** (after cleanup):
- `asset-selector.tsx` ✅ Clear name
- `asset-card.tsx` ✅ Clear name
- `asset-icon.tsx` ✅ Clear name
- `theme-provider.tsx` ✅ Clear name
- `transaction-history.tsx` ✅ Clear name
- `ui/` components ✅ Clear names

**Check For**:
- Abbreviated names that aren't obvious
- Generic names like "component.tsx"
- Names that don't match their actual purpose

**If Renaming Needed**:
1. Update filename
2. Update component export name
3. Update all imports
4. Run TypeScript compilation to catch missed imports

**Example**:
```bash
# If a component needs renaming
git mv components/old-name.tsx components/new-name.tsx
# Then update all imports
```

---

### Step 4: Review API Endpoint Names

**Purpose**: Ensure API routes are clearly named

**Current API Routes**:
```bash
# List API routes
find app/api -type d -mindepth 2
```

**Expected Routes** (after cleanup):
```
app/api/robinhood/
├── generate-onramp-url/    ✅ Clear - generates onramp URL
└── redeem-deposit-address/ ✅ Clear - redeems deposit address
```

**Check**:
- Route names should describe what they do
- Should use kebab-case (URL-friendly)
- Should be specific, not generic

**Current routes are good** ✅

---

### Step 5: Review File and Directory Names

**Purpose**: Ensure consistent naming conventions

**Action**: Review key directories

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc

# List main directories
ls -1 robinhood-onramp/
```

**Naming Conventions**:
- `kebab-case` for directories and files (e.g., `robinhood-url-builder.ts`)
- `PascalCase` for component files is acceptable (e.g., `AssetSelector.tsx`)
- Descriptive names, not abbreviations

**Check For**:
- Inconsistent casing
- Unclear abbreviations
- Names that don't match content

**Common in robinhood-onramp/**:
- `app/` ✅
- `components/` ✅
- `lib/` ✅
- `types/` ✅
- `docs/` ✅
- `scripts/` ✅

All clear! ✅

---

### Step 6: Review User-Facing Strings

**Purpose**: Ensure consistent terminology in UI text

**Action**: Search for user-facing strings

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Find strings in JSX
grep -rn '"[A-Z].*"' app/ components/ | grep -v node_modules | head -50
```

**Check User-Facing Text**:

**Consistent Terms**:
- "Transfer" (not "onramp" or "deposit" for users)
- "Cryptocurrency" or "Asset" (consistent choice)
- "Network" (not "chain" or "blockchain" mixed)
- "Initiate" vs "Start" vs "Begin" (pick one)

**Examples to Fix**:

```tsx
// BEFORE (inconsistent)
<Button>Start Onramp</Button>
<Button>Begin Transfer</Button>

// AFTER (consistent)
<Button>Initiate Transfer</Button>
<Button>Initiate Transfer</Button>
```

**Review**:
- Dashboard button labels
- Success/error messages
- Loading states
- Tooltips and help text

---

### Step 7: Review Type Names

**Purpose**: Ensure type names are clear and consistent

**File**: `robinhood-onramp/types/robinhood.d.ts`

**Action**: Read all type names

```bash
cat types/robinhood.d.ts | grep "^export.*type\|^export.*interface"
```

**Naming Conventions**:
- `PascalCase` for type and interface names
- Descriptive, not abbreviated
- Match the domain concept

**Check For**:
- Types with "offramp" in the name (should be gone)
- Unclear abbreviations (e.g., `URLParams` vs `UrlParameters`)
- Inconsistent naming patterns

**Example Good Names**:
```typescript
export interface OnrampURLResponse {  // ✅ Clear
export interface AssetConfig {        // ✅ Clear
export interface NetworkAddress {     // ✅ Clear
```

**Example Bad Names** (fix if found):
```typescript
export interface RHRes {     // ❌ Abbreviated
export interface Params {    // ❌ Too generic
```

---

### Step 8: Review Function Names

**Purpose**: Ensure function names are clear and follow conventions

**Action**: Review main function names in key files

**Files to Review**:
- `lib/robinhood-url-builder.ts`
- `lib/robinhood-api.ts`
- `app/dashboard/page.tsx`
- `app/callback/page.tsx`

**Naming Conventions**:
- `camelCase` for functions
- Verb-first for actions (e.g., `generateUrl`, `handleClick`)
- Descriptive, not abbreviated

**Common Patterns**:
```typescript
// Event handlers
handleAssetSelect()     // ✅ GOOD
handleSubmit()          // ✅ GOOD
onBtnClick()            // ❌ Abbreviated

// API functions
generateOnrampUrl()     // ✅ GOOD
buildRobinhoodUrl()     // ✅ GOOD
getRHData()             // ❌ Abbreviated

// Utility functions
formatAssetName()       // ✅ GOOD
validateNetwork()       // ✅ GOOD
```

---

### Step 9: Review Variable Names

**Purpose**: Ensure variable names are clear and consistent

**Action**: Spot check common files

```bash
# Look for short/unclear variable names
grep -rn "\bconst [a-z]\b\|let [a-z]\b" app/ lib/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```

**Naming Conventions**:
- `camelCase` for variables
- Descriptive, spell out words
- Boolean variables start with `is`, `has`, `should`

**Examples**:

```typescript
// GOOD ✅
const selectedAsset = 'ETH';
const isLoading = false;
const hasError = false;
const connectId = '123';

// BAD ❌
const sa = 'ETH';           // Too abbreviated
const loading = false;       // Should be isLoading for boolean
const err = false;           // Should be hasError or isError
const id = '123';            // Too generic (what kind of ID?)
```

**Common Variable Names to Standardize**:
- `connectId` (not `referenceId`, `id`, `cid`)
- `selectedAsset` (not `asset`, `a`, `sel`)
- `selectedNetwork` (not `network`, `net`, `n`)
- `isLoading` (not `loading`, `load`)

---

### Step 10: Create Naming Conventions Document

**Purpose**: Document the naming conventions for future reference

**File**: `robinhood-onramp/docs/NAMING-CONVENTIONS.md` (new file)

**Content**:

```markdown
# Naming Conventions

This document defines the naming conventions used throughout the robinhood-onramp codebase.

## Terminology

### User-Facing Terms

Use these terms in UI text, button labels, and user-facing messages:

- **Transfer**: The action of moving cryptocurrency from Robinhood to external wallet
- **Asset**: The cryptocurrency being transferred (e.g., ETH, USDC)
- **Network**: The blockchain network (e.g., Ethereum, Polygon)

Avoid: "onramp", "deposit" in user-facing text

### Technical Terms

Use these terms in code, APIs, and technical documentation:

- **Onramp**: The technical process/API for deposits to external wallets
- **ConnectId**: The Robinhood Connect ID for tracking transfers
- **Callback**: The redirect endpoint after transfer completion

### Deprecated Terms

DO NOT USE (from removed code):

- **Offramp**: Removed - not supported
- **ReferenceId**: Deprecated - use connectId instead
- **Order Status**: Removed - not needed for onramp

## File Naming

### Directories and Files
- Use `kebab-case` for directories: `my-directory/`
- Use `kebab-case` for utility files: `robinhood-url-builder.ts`
- Use `PascalCase` OR `kebab-case` for components: `AssetSelector.tsx` or `asset-selector.tsx`

### API Routes
- Use `kebab-case`: `generate-onramp-url/`
- Descriptive of action: `generate-X`, `fetch-X`, `create-X`

## Code Naming

### Variables
```typescript
// camelCase, descriptive
const selectedAsset = 'ETH';
const connectId = '123';

// Booleans: is/has/should prefix
const isLoading = false;
const hasError = false;
const shouldRedirect = true;
```

### Functions
```typescript
// camelCase, verb-first
function generateOnrampUrl() { }
function handleAssetSelect() { }
function validateNetwork() { }

// Avoid abbreviations
function generateURL() { }    // ❌ Bad
function generateUrl() { }    // ✅ Good
```

### Components
```typescript
// PascalCase
export function AssetSelector() { }
export function TransactionHistory() { }

// Descriptive, not generic
export function Component() { }    // ❌ Bad
export function AssetCard() { }    // ✅ Good
```

### Types and Interfaces
```typescript
// PascalCase
interface OnrampURLResponse { }
type AssetConfig = { };

// Descriptive
interface Params { }           // ❌ Too generic
interface OnrampParams { }     // ✅ Better
```

### Constants
```typescript
// UPPER_SNAKE_CASE for true constants
const API_BASE_URL = 'https://...';
const MAX_RETRIES = 3;

// camelCase for configuration objects
const assetConfig = { };
```

## UI Text Conventions

### Button Labels
- "Initiate Transfer" (not "Start Onramp" or "Begin Deposit")
- "Select Asset" (not "Choose Crypto")
- "Confirm" / "Cancel" (standard)

### Messages
- Success: "Transfer completed successfully"
- Error: "Transfer failed: [reason]"
- Loading: "Initiating transfer..."

### Consistent Capitalization
- Title Case for headings: "Select Your Asset"
- Sentence case for descriptions: "Choose the cryptocurrency you want to transfer"

## API Naming

### Endpoints
```
POST /api/robinhood/generate-onramp-url
GET  /api/robinhood/redeem-deposit-address
```

### Request/Response Fields
```typescript
// Request
{
  selectedAsset: 'ETH',
  selectedNetwork: 'ETHEREUM'
}

// Response  
{
  url: 'https://...',
  connectId: '...'
}
```

## Comments

### Function Comments
```typescript
/**
 * Generates a Robinhood Connect onramp URL.
 * 
 * @param connectId - The Connect ID from Robinhood API
 * @param selectedAsset - Asset to transfer (e.g., 'ETH')
 * @param selectedNetwork - Network to use (e.g., 'ETHEREUM')
 * @returns The complete Robinhood Connect URL
 */
```

### Inline Comments
```typescript
// Fetch connectId from Robinhood API
const response = await fetch(ROBINHOOD_API_URL);

// Not:
// Get ID from RH  ❌ (too abbreviated)
```

## Examples

### Good Naming ✅
```typescript
const selectedAsset = 'ETH';
const isLoading = false;

function handleAssetSelect(asset: string) {
  generateOnrampUrl(connectId, asset, selectedNetwork);
}

interface OnrampURLResponse {
  url: string;
  connectId: string;
}
```

### Bad Naming ❌
```typescript
const sa = 'ETH';              // Too abbreviated
const loading = false;          // Should be isLoading

function select(a: string) {   // Unclear, abbreviated
  getURL(id, a, n);            // All unclear
}

interface Res {                // Too generic
  url: string;
  id: string;
}
```

---

**Last Updated**: October 24, 2025
```

**Action**: Create this file

---

## Deliverables Checklist

After completing all steps, verify:

- [ ] No "offramp" in variable/function names (only in comments if needed)
- [ ] Consistent use of "transfer" (user-facing) vs "onramp" (technical)
- [ ] Component names are clear and descriptive
- [ ] API endpoint names are appropriate
- [ ] File/directory names follow conventions
- [ ] User-facing strings use consistent terminology
- [ ] Type names are clear (no offramp types remain)
- [ ] Function names follow conventions
- [ ] Variable names are descriptive (no unclear abbreviations)
- [ ] `docs/NAMING-CONVENTIONS.md` created

---

## Validation Steps

### Validation 1: Search for Naming Issues

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Offramp in code
grep -r "offramp" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v "//"

# Should return ZERO results (or only comments)

# Very short variable names (potential issues)
grep -rn "\bconst [a-z]\b" app/ lib/ --include="*.ts" --include="*.tsx" | grep -v node_modules

# Review each for clarity
```

### Validation 2: TypeScript Compilation

```bash
npx tsc --noEmit
```

**Success Criteria**: Zero errors (renaming might have broken something)

### Validation 3: Consistency Check

**Manual Review**:
1. Open dashboard - check button labels for consistency
2. Check API responses - verify field names are consistent
3. Check type definitions - verify naming conventions followed
4. Review a few key files for variable naming consistency

---

## Backward Compatibility Checkpoint

**Purpose**: Verify naming changes didn't break functionality

### Manual Testing:

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Transfer Flow**:
   - Dashboard loads
   - Asset selection works
   - Transfer initiates
   - Callback works

3. **Check Console**:
   - No errors about undefined variables
   - No warnings about missing properties

### Success Criteria:

- ✅ Application works exactly as before
- ✅ No runtime errors
- ✅ Code is more readable with better names

### If Checkpoint Fails:

1. **Error: "X is not defined"**:
   - Missed updating a reference after renaming
   - Search for old name: `grep -r "oldName" .`
   - Update all references

2. **Type Error**:
   - Missed updating a type reference
   - Review Step 7 updates
   - Ensure all imports/exports updated

---

## Common Issues and Solutions

### Issue 1: Renamed variable but missed some references

**Symptom**: Runtime error "X is not defined"

**Solution**:
```bash
# Find all references to old name
grep -rn "oldVariableName" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Update each reference
```

### Issue 2: User-facing text still uses technical terms

**Symptom**: Button says "Start Onramp"

**Solution**: Update to "Initiate Transfer" (user-friendly term)

### Issue 3: Inconsistent naming across files

**Symptom**: Some files use one term, others use another

**Solution**: Follow NAMING-CONVENTIONS.md guide consistently

---

## Integration Points

### Provides to Next Sub-Plans:

- **Sub-Plan 8**: Clean, consistent code easier to validate

### Dependencies from Previous Sub-Plans:

- **Sub-Plans 1-6**: Clean codebase ready for naming pass

---

## Next Steps

After completing this sub-plan:

1. ✅ Create implementation log: `YYYYMMDD-HHMM-SP7-COMPLETE.md`
2. ✅ Commit changes: `git commit -m "SP7: Standardize naming conventions"`
3. ⬜ Proceed to **Sub-Plan 8: Final Validation and Documentation**

---

## Notes for Implementers

### Critical Checkpoints:

- **After renaming**: Search for all references to old name
- **After updating**: Run TypeScript compilation
- **Final check**: Test the application end-to-end

### Common Pitfalls:

- ❌ Renaming but missing some references
- ❌ Being too aggressive (breaking working code)
- ❌ Inconsistent application of conventions
- ❌ Not documenting the conventions

### Time-Saving Tips:

- Use IDE refactoring tools (F2 in VSCode)
- Do global search-replace carefully
- Test after each major rename
- Focus on most visible/important names first

---

**Status**: ⬜ Ready for Implementation  
**Estimated Duration**: 1-2 hours  
**Complexity**: Low-Medium  
**Risk Level**: 🟡 Medium (renaming can break references if not careful)

