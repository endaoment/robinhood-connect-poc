# Sub-Plan 9: Remove Robinhood-Specific Content

**Status**: Pending  
**Priority**: Critical  
**Dependencies**: Sub-Plan 8 (Forked to blank-poc)  
**Estimated Complexity**: Medium  
**Location**: blank-poc repository

---

## Context Required

**Note**: This sub-plan is executed in the **blank-poc repository** after forking.

### Files to Review

**Directories to Transform:**
- `robinhood-onramp/` → Will become `onramp/`
- `robinhood-onramp/libs/robinhood/` → Will become `libs/provider-api/`
- `robinhood-onramp/libs/coinbase/` → Will be removed
- `robinhood-onramp/libs/shared/` → Keep as-is

**Reference Files:**
- TEMPLATE-USAGE.md - Template structure guide
- sub-plan-0-drafting-plan.md - Target structure

### Understanding Required

**Goal**: Transform Robinhood-specific implementation into generic provider template

**Approach**:
1. Rename directories to generic names
2. Remove secondary examples (coinbase)
3. Convert Robinhood terminology to provider terminology
4. Keep structure and patterns as examples
5. Maintain code quality as template example

---

## Objectives

1. Rename `robinhood-onramp/` to `onramp/`
2. Remove `libs/coinbase/` directory
3. Convert `libs/robinhood/` to `libs/provider-api/`
4. Replace Robinhood terminology with generic provider patterns
5. Update all import paths and references
6. Maintain structure as template example

---

## Precise Implementation Steps

### Step 1: Rename Root Implementation Directory

**Action**: Rename `robinhood-onramp/` to `onramp/`

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc

# Rename directory
git mv robinhood-onramp onramp

# Verify
ls -la | grep onramp
```

**Validation:**
- [ ] `onramp/` directory exists
- [ ] `robinhood-onramp/` no longer exists
- [ ] Git recognizes rename

---

### Step 2: Remove Coinbase Library

**Action**: Delete `libs/coinbase/` directory (secondary example not needed in template)

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp

# Remove coinbase directory
git rm -r libs/coinbase/

# Verify
ls -la libs/
```

**Validation:**
- [ ] `libs/coinbase/` removed
- [ ] Only `libs/robinhood/` and `libs/shared/` remain

---

### Step 3: Rename Robinhood Library to Provider-API

**Action**: Rename `libs/robinhood/` to `libs/provider-api/`

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp

# Rename directory
git mv libs/robinhood libs/provider-api

# Verify
ls -la libs/
```

**Expected Structure:**
```
libs/
├── provider-api/    # Generic provider example (was robinhood)
└── shared/          # Shared utilities
```

**Validation:**
- [ ] `libs/provider-api/` exists
- [ ] `libs/robinhood/` no longer exists
- [ ] Git recognizes rename

---

### Step 4: Update Provider-API File Names

**Action**: Rename Robinhood-specific file names to generic provider names

**Files to Rename:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp/libs/provider-api/src/lib

# Rename controller
git mv robinhood.controller.ts provider.controller.ts

# Rename module
git mv robinhood.module.ts provider.module.ts

# Check for other robinhood-named files
find . -name "*robinhood*"
# Rename any found files to use "provider" instead
```

**Validation:**
- [ ] `provider.controller.ts` exists
- [ ] `provider.module.ts` exists
- [ ] No files with "robinhood" in name

---

### Step 5: Update Class Names and Exports

**Action**: Replace Robinhood class names with Provider names

**Files to Update:**

**`libs/provider-api/src/lib/provider.controller.ts`:**
```typescript
// Find and replace:
// RobinhoodController → ProviderController
// robinhood → provider (in routes)

@Controller('provider')  // Was: @Controller('robinhood')
export class ProviderController {
  // ... rest of implementation
}
```

**`libs/provider-api/src/lib/provider.module.ts`:**
```typescript
// Find and replace:
// RobinhoodModule → ProviderModule
// RobinhoodController → ProviderController
// RobinhoodClientService → ProviderClientService

@Module({
  controllers: [ProviderController],
  providers: [ProviderClientService, AssetRegistryService, UrlBuilderService, PledgeService],
  exports: [ProviderClientService, AssetRegistryService, UrlBuilderService, PledgeService],
})
export class ProviderModule {}
```

**Services:**
```bash
cd libs/provider-api/src/lib/services

# Update class names in:
# - robinhood-client.service.ts → provider-client.service.ts (rename file)
# - Update class: RobinhoodClientService → ProviderClientService
```

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp/libs/provider-api/src/lib/services

# Rename service file
git mv robinhood-client.service.ts provider-client.service.ts

# Update class name inside file (will do in next step)
```

**Validation:**
- [ ] File renamed to `provider-client.service.ts`
- [ ] Class name will be updated in content changes

---

### Step 6: Update Service Class Names and Content

**Action**: Update all Robinhood references to Provider in code

**Files to Update - Use Find/Replace:**

**Pattern for all files in `libs/provider-api/`:**

Find and Replace:
```
Find: Robinhood
Replace: Provider

Find: robinhood
Replace: provider (except in comments explaining "this was Robinhood")

Find: ROBINHOOD
Replace: PROVIDER
```

**Key Files:**
- `src/lib/provider.controller.ts` - Controller class and routes
- `src/lib/provider.module.ts` - Module class
- `src/lib/services/provider-client.service.ts` - Service class
- `src/lib/services/url-builder.service.ts` - References to Robinhood
- `src/lib/services/pledge.service.ts` - References
- `src/lib/dtos/*.ts` - DTO names if Robinhood-specific
- `src/lib/constants/*.ts` - Constant names
- `tests/**/*.spec.ts` - Test descriptions and class references

**Commands to help:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp/libs/provider-api

# Find all Robinhood references
grep -r "Robinhood" src/
grep -r "robinhood" src/

# Use editor find/replace or sed for bulk updates
# Example with sed (be careful):
# find src -type f -name "*.ts" -exec sed -i '' 's/Robinhood/Provider/g' {} +
# find src -type f -name "*.ts" -exec sed -i '' 's/robinhood/provider/g' {} +
```

**Special Cases to Preserve:**
```typescript
// Keep in comments for context:
// Example: "This service integrates with the Robinhood Connect API (example provider)"
// Template note: "Replace 'provider' with your actual provider name (e.g., 'robinhood', 'stripe')"
```

**Validation:**
- [ ] All class names use "Provider"
- [ ] All imports use provider paths
- [ ] Comments explain this is example
- [ ] Routes use `/provider/`

---

### Step 7: Update Environment Variable Names

**Action**: Update environment variable names to be generic

**Files to Update:**

**`.env.example`:**
```bash
# Before:
ROBINHOOD_APP_ID=your-app-id
ROBINHOOD_API_KEY=your-api-key
ROBINHOOD_BASE_URL=https://trading.robinhood.com

# After:
PROVIDER_APP_ID=your-provider-app-id
PROVIDER_API_KEY=your-provider-api-key
PROVIDER_BASE_URL=https://api.provider.com
```

**Code References:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp/libs/provider-api

# Find environment variable references
grep -r "ROBINHOOD_" src/

# Update to PROVIDER_*
# Example in provider-client.service.ts:
# process.env.ROBINHOOD_APP_ID → process.env.PROVIDER_APP_ID
```

**Validation:**
- [ ] `.env.example` uses `PROVIDER_*`
- [ ] Code references `PROVIDER_*`
- [ ] No `ROBINHOOD_*` references remain

---

### Step 8: Update Package.json Names

**Action**: Update package names to reflect template

**File**: `onramp/package.json`

**Changes:**
```json
{
  "name": "blank-poc-onramp",  // Was: robinhood-onramp
  "version": "1.0.0",
  "description": "POC template onramp application",  // Updated
  // ... rest
}
```

**Validation:**
- [ ] Package name updated
- [ ] Description generic

---

### Step 9: Update Import Paths

**Action**: Update all imports to use new paths

**Pattern Changes:**
```typescript
// Before:
import { RobinhoodClientService } from '@/libs/robinhood'

// After:
import { ProviderClientService } from '@/libs/provider-api'
```

**Files to Check:**
- `onramp/app/api/` - Next.js API routes (if any remain)
- `onramp/libs/provider-api/src/` - Internal imports
- `onramp/libs/provider-api/tests/` - Test imports

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp

# Find Robinhood import paths
grep -r "@/libs/robinhood" .
grep -r "from '@/libs/robinhood'" .

# Update to provider-api
# Use editor find/replace
```

**Validation:**
- [ ] No `@/libs/robinhood` imports
- [ ] All use `@/libs/provider-api`
- [ ] Tests import correctly

---

### Step 10: Update TypeScript Paths

**Action**: Update tsconfig path mappings

**File**: `onramp/tsconfig.json`

**Changes:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/libs/provider-api": ["./libs/provider-api/src"],  // Was: @/libs/robinhood
      "@/libs/shared": ["./libs/shared/src"],
      "@/app/*": ["./app/*"]
    }
  }
}
```

**Validation:**
- [ ] Path mapping updated
- [ ] No robinhood paths remain

---

### Step 11: Update Test Files

**Action**: Update test descriptions and references

**Files**: `onramp/libs/provider-api/tests/**/*.spec.ts`

**Changes:**
```typescript
// Before:
describe('RobinhoodClientService', () => {
  it('should generate Robinhood connect ID', () => {
    // ...
  });
});

// After:
describe('ProviderClientService', () => {
  it('should generate provider connect ID', () => {
    // Note: Example using generic provider pattern
  });
});
```

**Validation:**
- [ ] Test descriptions generic
- [ ] Class references updated
- [ ] Tests still pass (run after all changes)

---

### Step 12: Add Template Context Comments

**Action**: Add comments indicating this is template example

**Key Files to Annotate:**

**`libs/provider-api/src/lib/provider.controller.ts`:**
```typescript
/**
 * Provider API Controller
 * 
 * Template Example: This demonstrates a generic provider integration pattern.
 * When creating your POC, replace 'provider' with your actual provider name.
 * 
 * Example: ProviderController → StripeController
 */
@Controller('provider')
export class ProviderController {
  // ...
}
```

**`libs/provider-api/src/lib/provider.module.ts`:**
```typescript
/**
 * Provider Module
 * 
 * Template Pattern: Wire your provider services here.
 * Update imports to match your provider's actual services.
 */
@Module({
  // ...
})
export class ProviderModule {}
```

**Validation:**
- [ ] Key files have template context
- [ ] Instructions clear for customization

---

## Deliverables Checklist

- [ ] `robinhood-onramp/` renamed to `onramp/`
- [ ] `libs/coinbase/` removed
- [ ] `libs/robinhood/` renamed to `libs/provider-api/`
- [ ] All file names use generic provider names
- [ ] All class names use Provider instead of Robinhood
- [ ] All imports updated to new paths
- [ ] Environment variables generic
- [ ] Package.json updated
- [ ] TypeScript paths updated
- [ ] Tests updated and passing
- [ ] Template context comments added
- [ ] No Robinhood-specific references remain (except in context comments)

---

## Validation Steps

### Step 1: Search for Robinhood References

```bash
cd /Users/rheeger/Code/endaoment/blank-poc

# Search for Robinhood (should only be in comments/explanations)
grep -r "Robinhood" onramp/ --exclude-dir=node_modules

# Search for robinhood paths
grep -r "libs/robinhood" onramp/ --exclude-dir=node_modules

# Search for env vars
grep -r "ROBINHOOD_" onramp/ --exclude-dir=node_modules
```

**Expected**: Only in explanatory comments, not in actual code

---

### Step 2: Verify Directory Structure

```bash
cd /Users/rheeger/Code/endaoment/blank-poc

# Check structure
tree -L 3 -I 'node_modules'
```

**Expected Structure:**
```
blank-poc/
├── onramp/                    # Was robinhood-onramp
│   ├── libs/
│   │   ├── provider-api/      # Was robinhood
│   │   └── shared/            # Unchanged
│   └── ...
```

---

### Step 3: Run Tests

```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp

# Install dependencies if needed
npm install

# Run tests
npm test
```

**Expected**: Tests pass (may need minor adjustments)

---

### Step 4: Type Check

```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp

# Type check
npx tsc --noEmit
```

**Expected**: No type errors

---

## Backward Compatibility Checkpoint

**N/A** - This is template creation in new repository, no production impact

---

## Common Issues and Solutions

### Issue 1: Import Paths Broken

**Symptom**: TypeScript errors about missing modules

**Solution**:
```bash
# Check tsconfig paths
cat onramp/tsconfig.json | grep -A 5 paths

# Update any missed paths
# Verify all imports use @/libs/provider-api
```

---

### Issue 2: Tests Failing

**Symptom**: Tests reference old class names

**Solution**:
```bash
# Find test files still using Robinhood
grep -r "Robinhood" onramp/libs/provider-api/tests/

# Update class references in tests
# Update mock names
# Update descriptions
```

---

### Issue 3: Missed Robinhood References

**Symptom**: Grep finds Robinhood in code (not comments)

**Solution**:
- Review each occurrence
- Update to generic provider
- Add explanatory comment if keeping reference for context

---

## Integration Points

### With Sub-Plan 10

SP10 will simplify the app/ directory. This sub-plan focuses on libs/ transformation.

**Handoff**:
- `libs/provider-api/` ready as generic example
- `libs/shared/` unchanged
- `onramp/` directory ready for app simplification

### With Sub-Plan 11

SP11 will update documentation. This sub-plan prepares the code.

**Handoff**:
- Generic provider structure established
- Template patterns in place
- Ready for doc updates

---

## Next Steps

After completing this sub-plan:

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "templatization: SP9 - remove Robinhood content, create provider-api

   - Renamed robinhood-onramp/ to onramp/
   - Removed libs/coinbase/
   - Renamed libs/robinhood/ to libs/provider-api/
   - Updated all class names to Provider
   - Updated imports and paths
   - Added template context comments
   
   Structure now generic and ready for customization"
   ```

2. **Create Implementation Log**:
   - File: `implementation-logs/YYYYMMDD-HHMM-SP9-COMPLETE.md`
   - Document transformation
   - List all changes
   - Note any issues

3. **Verify Clean State**:
   - Run tests
   - Check types
   - Search for missed references

4. **Proceed to Sub-Plan 10**:
   - Simplify app/ directory
   - Create hello world landing
   - Remove Robinhood UI

---

## Success Criteria

- [ ] All directories renamed appropriately
- [ ] Coinbase example removed
- [ ] Provider terminology throughout
- [ ] No Robinhood code references (except explanatory comments)
- [ ] All imports work
- [ ] Tests pass
- [ ] Type checking passes
- [ ] Template context clear
- [ ] Ready for app simplification (SP10)

---

**Estimated Time**: 60-90 minutes  
**Complexity**: Medium  
**Risk Level**: 🟢 Low - New repository, reversible changes

