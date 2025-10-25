# Sub-Plan 9.6: Frontend/Backend Separation & Directory Cleanup

**Status**: Ready for Implementation
**Priority**: High
**Dependencies**: Sub-Plan 9.5 (Directory Restructuring)

## Context Required

### Current State (After SP9.5)

```
robinhood-onramp/
├── app/                    # Next.js app (frontend + API routes)
├── libs/                   # Backend libs (GOOD!)
├── components/             # ❌ Outside app/
├── hooks/                  # ❌ Outside app/
├── styles/                 # ❌ Duplicate of app/globals.css
├── public/                 # ✅ Static assets (OK)
├── docs/                   # ✅ Documentation (OK)
├── scripts/                # ✅ Dev scripts (OK)
├── types/                  # ❌ Should be in libs or app
├── coverage/               # ✅ Test output (OK)
├── instrumentation.ts      # ❌ Next.js file, should be in app/
├── jest.config.ts          # ✅ Root config (OK)
├── next.config.mjs         # ✅ Root config (OK)
├── tsconfig.json           # ✅ Root config (OK)
└── package.json            # ✅ Root config (OK)
```

**Issues**:

1. Frontend code scattered (components, hooks, styles outside app/)
2. `types/` directory unclear ownership
3. `instrumentation.ts` at root instead of proper location
4. Not clear "frontend vs backend" separation

### Target State (Clean Template)

```
robinhood-onramp/
├── app/                            # 🎨 FRONTEND: Everything Next.js
│   ├── api/                        #    API routes (thin wrappers)
│   ├── (routes)/                   #    Pages
│   ├── components/                 #    React components
│   │   ├── ui/                     #    shadcn components
│   │   ├── asset-card.tsx
│   │   ├── asset-selector.tsx
│   │   └── ...
│   ├── hooks/                      #    React hooks
│   ├── types/                      #    Frontend types
│   ├── lib/                        #    Frontend utilities
│   │   └── utils.ts                #    cn() helper, etc
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── libs/                           # 🔧 BACKEND: All API libraries
│   ├── robinhood/                  #    (Future: endaoment-backend/libs/api/robinhood)
│   ├── coinbase/                   #    (Future: endaoment-backend/libs/api/coinbase)
│   └── shared/                     #    (Shared utilities)
│
├── public/                         # 📦 Static assets
├── docs/                           # 📚 Documentation
├── scripts/                        # 🛠️  Dev/build scripts
├── coverage/                       # 📊 Test output
│
├── jest.config.ts                  # ⚙️  Root config files
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── components.json
├── postcss.config.mjs
├── package.json
└── README.md
```

**Benefits**:

- ✅ **Clear separation**: Everything frontend in `app/`, everything backend in `libs/`
- ✅ **Template ready**: Perfect structure for future POC repos
- ✅ **Self-documenting**: Directory names explain purpose
- ✅ **Backend alignment**: `libs/` ready to copy to endaoment-backend
- ✅ **Next.js standard**: Follows App Router conventions

## Objectives

1. Move all React components into `app/components/`
2. Move all React hooks into `app/hooks/`
3. Move frontend types into `app/types/`
4. Create `app/lib/` for frontend utilities
5. Consolidate styles into `app/`
6. Update all import paths
7. Remove duplicate/unused files
8. Create README explaining structure

## Precise Implementation Steps

### Step 1: Move Components into App

**Action**: Move all components into `app/components/`

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Create app/components if it doesn't exist
mkdir -p app/components

# Move all components
mv components/* app/components/

# Remove empty directory
rmdir components
```

**Validation**:

```bash
ls -la app/components/
# Should show: asset-card.tsx, asset-selector.tsx, ui/, etc.

ls -la | grep components
# Should NOT show components/ directory at root
```

### Step 2: Move Hooks into App

**Action**: Move all React hooks into `app/hooks/`

**Commands**:

```bash
# Create app/hooks
mkdir -p app/hooks

# Move hooks
mv hooks/* app/hooks/

# Remove empty directory
rmdir hooks
```

**Note**: `app/hooks/use-toast.ts` might already exist from components/ui. Consolidate if needed.

**Validation**:

```bash
ls -la app/hooks/
# Should show: use-asset-selection.ts, use-mobile.tsx, use-toast.ts

ls -la | grep hooks
# Should NOT show hooks/ directory at root
```

### Step 3: Move Frontend Types into App

**Action**: Move `types/robinhood.d.ts` into `app/types/`

**Commands**:

```bash
# Create app/types
mkdir -p app/types

# Move frontend type definitions
mv types/robinhood.d.ts app/types/

# Remove empty types directory
rmdir types
```

**Note**: Backend types live in `libs/*/src/lib/types/`

**Validation**:

```bash
ls -la app/types/
# Should show: robinhood.d.ts

ls -la | grep "^d" | grep types
# Should NOT show types/ at root
```

### Step 4: Create Frontend Lib Directory

**Action**: Create `app/lib/` for frontend utilities (separate from `libs/` backend)

**Commands**:

```bash
# Create app/lib
mkdir -p app/lib
```

**Create**: `app/lib/utils.ts`

```typescript
/**
 * Frontend Utility Functions
 *
 * NOTE: This is the FRONTEND lib/ directory.
 * Backend libraries are in /libs/ (plural) at the root.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS class name merger
 * Used by shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add other frontend-only utilities here
```

**Note**: If `lib/utils.ts` already exists at root, check if it's just the `cn()` function. If so, move it here.

### Step 5: Consolidate Styles

**Action**: Remove duplicate `styles/globals.css`

**Commands**:

```bash
# Check if styles/globals.css is identical to app/globals.css
diff styles/globals.css app/globals.css

# If identical, remove styles directory
rm -rf styles/

# If different, merge important parts into app/globals.css
# then remove styles/
```

**Validation**:

```bash
ls -la | grep styles
# Should NOT show styles/ directory

ls -la app/globals.css
# Should exist
```

### Step 6: Handle Instrumentation File

**Action**: Move or remove `instrumentation.ts`

**Check**: Is instrumentation.ts being used?

```bash
grep -r "instrumentation" robinhood-onramp/ --include="*.ts" --include="*.tsx" --include="*.json"
```

**If used by Next.js observability**:

- Leave at root (Next.js convention for instrumentation)
- Add comment explaining it

**If not used**:

```bash
rm instrumentation.ts
```

**Update** (if keeping): Add comment at top

```typescript
/**
 * Next.js Instrumentation
 *
 * This file must stay at the root of the app directory.
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

// ... existing code
```

### Step 7: Update Import Paths - Components

**Action**: Update all component imports from `@/components/*` to `@/app/components/*`

**Files to Update**:

- All pages: `app/**/*.tsx`
- All components: `app/components/**/*.tsx`

**Search and Replace**:

```bash
# Update component imports
find app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/|@/app/components/|g' {} +
```

**Validation**:

```bash
# Should find nothing
grep -r "from '@/components/" app/ || echo "✅ No old component imports"
grep -r "from \"@/components/" app/ || echo "✅ No old component imports"
```

### Step 8: Update Import Paths - Hooks

**Action**: Update all hook imports from `@/hooks/*` to `@/app/hooks/*`

**Search and Replace**:

```bash
# Update hook imports
find app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/hooks/|@/app/hooks/|g' {} +
```

**Validation**:

```bash
grep -r "from '@/hooks/" app/ || echo "✅ No old hook imports"
```

### Step 9: Update Import Paths - Frontend Lib

**Action**: Update imports from `@/lib/utils` to `@/app/lib/utils`

**Note**: This only applies to the `cn()` utility function used by shadcn

**Search and Replace**:

```bash
# Update frontend lib imports (NOT backend libs!)
# Only update single @/lib/utils, not @/libs/ (backend)
find app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/lib/utils|@/app/lib/utils|g' {} +
```

**Validation**:

```bash
# Should find nothing
grep -r 'from "@/lib/utils"' app/ || echo "✅ No old lib/utils imports"

# Should still find backend libs imports (these are correct)
grep -r 'from "@/libs/' app/ && echo "✅ Backend lib imports present (correct)"
```

### Step 10: Update TypeScript Path Aliases

**File**: `tsconfig.json`

**Update** the `paths` configuration:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/app/*": ["./app/*"],
      "@/libs/robinhood": ["./libs/robinhood/src"],
      "@/libs/coinbase": ["./libs/coinbase/src"],
      "@/libs/shared": ["./libs/shared/src"]
    }
  }
}
```

**Note**: We're keeping both `@/*` for backwards compatibility and specific paths for clarity.

### Step 11: Update components.json

**File**: `components.json`

**Update** the aliases to point to new locations:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/app/components",
    "utils": "@/app/lib/utils",
    "ui": "@/app/components/ui",
    "lib": "@/app/lib",
    "hooks": "@/app/hooks"
  }
}
```

**Note**: This ensures `npx shadcn@latest add` puts new components in the right place.

### Step 12: Create Structure Documentation

**Create**: `robinhood-onramp/STRUCTURE.md`

```markdown
# Repository Structure

This repository follows a clean **Frontend/Backend separation** pattern, making it an ideal template for future API integration POCs.

## Directory Layout
```

robinhood-onramp/
├── app/ # 🎨 FRONTEND: Next.js Application
│ ├── api/robinhood/ # ⚠️ POC-ONLY: Next.js API routes (demos libs/)
│ │ # NOTE: These are deleted when migrating to backend!
│ │ # Backend uses NestJS controller in libs/ instead
│ ├── (routes)/ # Page routes
│ ├── components/ # React components
│ ├── hooks/ # React hooks  
│ ├── lib/ # Frontend utilities (cn(), etc)
│ ├── types/ # Frontend TypeScript types
│ └── globals.css # Global styles
│
├── libs/ # 🔧 BACKEND: API Libraries (100% Backend-Ready!)
│ ├── robinhood/ # Robinhood Connect integration
│ │ ├── src/lib/
│ │ │ ├── robinhood.controller.ts # ✅ NestJS controller (backend-ready)
│ │ │ ├── robinhood.module.ts # ✅ NestJS module (backend-ready)
│ │ │ ├── services/ # Business logic
│ │ │ ├── dtos/ # Validation
│ │ │ └── constants/ # Config
│ │ └── tests/ # Tests co-located with code
│ ├── coinbase/ # Coinbase Prime support
│ └── shared/ # Shared utilities
│
├── public/ # 📦 Static Assets
├── docs/ # 📚 Documentation  
├── scripts/ # 🛠️ Development Scripts
└── [config files] # ⚙️ Configuration

````

## Key Principles

### 1. Frontend in `app/`

**Everything React/Next.js lives in `app/`**:
- ✅ Components
- ✅ Hooks
- ✅ Pages
- ✅ API routes (thin wrappers)
- ✅ Frontend utilities
- ✅ Styles

**Import pattern**:
```typescript
import { AssetCard } from "@/app/components/asset-card";
import { useAssetSelection } from "@/app/hooks/use-asset-selection";
import { cn } from "@/app/lib/utils";
````

### 2. Backend in `libs/`

**Everything for API integration lives in `libs/`**:

- ✅ Services (business logic)
- ✅ DTOs (data transfer objects)
- ✅ Constants
- ✅ Types
- ✅ Tests
- ✅ **NestJS Controller** (backend-ready HTTP endpoints)
- ✅ **NestJS Module** (backend-ready DI configuration)

**Import pattern**:

```typescript
import {
  RobinhoodClientService,
  AssetRegistryService,
  GenerateUrlDto,
} from "@/libs/robinhood";

// In backend, also import the module:
import { RobinhoodModule } from "@/libs/robinhood";
```

**Key Point**: The `libs/` directory contains a **complete NestJS module** that's ready to use in the backend. The Next.js routes in `app/api/` are just for POC demonstration and won't be migrated.

### 3. Backend Migration Ready

The `libs/` directory is structured to mirror `endaoment-backend/libs/api/` and includes a complete NestJS module:

```bash
# Migration is literally just copying the folder:
cp -r robinhood-onramp/libs/robinhood \
      endaoment-backend/libs/api/robinhood

# Import in app.module.ts:
# import { RobinhoodModule } from '@/libs/robinhood';

# Done! Controller, services, DTOs, tests all work as-is.
```

**What gets migrated**:

- ✅ `libs/robinhood/` → Complete NestJS module with controller
- ❌ `app/api/robinhood/` → Deleted (Next.js specific, not needed)

## Using This as a Template

When creating a new API integration POC:

1. **Clone this repo's structure**
2. **Replace `robinhood/` with your integration name**:

   ```bash
   mkdir libs/your-integration
   mkdir libs/your-integration/src/lib/{services,dtos,constants}
   mkdir libs/your-integration/tests
   ```

3. **Build your services** following the same patterns
4. **Add frontend UI** in `app/` to demonstrate
5. **Write tests** co-located with code
6. **When ready**, copy `libs/your-integration/` to backend

## What Goes Where?

| Item                     | Location                   | Reason                        |
| ------------------------ | -------------------------- | ----------------------------- |
| React component          | `app/components/`          | Frontend UI                   |
| React hook               | `app/hooks/`               | Frontend logic                |
| API service              | `libs/*/src/lib/services/` | Backend business logic        |
| DTO (validation)         | `libs/*/src/lib/dtos/`     | Backend data contracts        |
| shadcn/ui components     | `app/components/ui/`       | Reusable UI components        |
| Service tests            | `libs/*/tests/`            | Co-located with services      |
| Frontend utils (cn, etc) | `app/lib/utils.ts`         | Frontend-only utilities       |
| Backend utils            | `libs/shared/src/lib/`     | Shared backend utilities      |
| API routes               | `app/api/`                 | Thin wrappers calling `libs/` |

## Import Rules

### ✅ DO

```typescript
// Frontend imports frontend
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/hooks/use-toast";

// Frontend imports backend (API calls)
import { urlBuilderService } from "@/libs/robinhood";

// Backend imports backend
// (within libs/ files)
import { PrimeApiService } from "@/libs/coinbase";
```

### ❌ DON'T

```typescript
// Backend should NOT import frontend
// (libs/ files should not import from app/)
import { AssetCard } from "@/app/components/asset-card"; // ❌ NO!
```

## Benefits of This Structure

1. **Clear Boundaries**: Frontend vs Backend code is obvious
2. **Backend Ready**: `libs/` can be copied directly to endaoment-backend
3. **Template Ready**: Perfect starting point for future POCs
4. **Scalable**: Add more `libs/integration-name/` as needed
5. **Testable**: Each library has its own tests
6. **Maintainable**: Clear ownership and organization

## Migration to Backend

See [docs/MIGRATION-GUIDE.md](./docs/MIGRATION-GUIDE.md) for complete instructions on migrating `libs/` to endaoment-backend.

---

**This structure makes the POC repo a living template for future API integrations.**

````

### Step 13: Update Root README

**File**: `robinhood-onramp/README.md`

**Add** a section at the top:

```markdown
# Robinhood Connect POC

> **Note**: This POC follows a clean Frontend/Backend separation pattern. See [STRUCTURE.md](./STRUCTURE.md) for the complete directory layout guide.

## Quick Navigation

- **Frontend Code**: [`app/`](./app/) - Next.js application
- **Backend Code**: [`libs/`](./libs/) - API libraries (backend-ready)
- **Documentation**: [`docs/`](./docs/) - Architecture and guides
- **Structure Guide**: [STRUCTURE.md](./STRUCTURE.md) - Directory organization

[... rest of existing README ...]
````

## Deliverables Checklist

- [ ] `components/` moved to `app/components/`
- [ ] `hooks/` moved to `app/hooks/`
- [ ] `types/` moved to `app/types/`
- [ ] `app/lib/` created with `utils.ts`
- [ ] `styles/` directory removed (if duplicate)
- [ ] All component imports updated (`@/app/components/*`)
- [ ] All hook imports updated (`@/app/hooks/*`)
- [ ] All frontend lib imports updated (`@/app/lib/*`)
- [ ] TypeScript path aliases updated in `tsconfig.json`
- [ ] `components.json` updated with new paths
- [ ] `STRUCTURE.md` created
- [ ] `README.md` updated with navigation
- [ ] No frontend code at root level (except app/)
- [ ] All imports working correctly
- [ ] App runs successfully
- [ ] Tests still pass

## Validation Steps

### 1. Verify Directory Structure

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Check top-level directories
ls -la

# Should see:
# ✅ app/          (frontend)
# ✅ libs/         (backend)
# ✅ public/       (static)
# ✅ docs/         (docs)
# ✅ scripts/      (dev scripts)
# ✅ coverage/     (test output)
# ❌ components/   (should NOT exist)
# ❌ hooks/        (should NOT exist)
# ❌ types/        (should NOT exist)
# ❌ styles/       (should NOT exist)
```

### 2. Verify App Structure

```bash
tree -L 2 app/

# Should show:
# app/
# ├── api/
# ├── callback/
# ├── dashboard/
# ├── components/    ← NEW
# ├── hooks/         ← NEW
# ├── lib/           ← NEW
# ├── types/         ← NEW
# ├── globals.css
# ├── layout.tsx
# └── page.tsx
```

### 3. Verify No Old Imports

```bash
# Check for old component imports
grep -r "from '@/components/" app/ && echo "❌ Found old imports" || echo "✅ No old imports"

# Check for old hook imports
grep -r "from '@/hooks/" app/ && echo "❌ Found old imports" || echo "✅ No old imports"

# Check for old lib/utils imports (should be app/lib/utils)
grep -r 'from "@/lib/utils"' app/ && echo "❌ Found old imports" || echo "✅ No old imports"

# Backend libs imports should still exist
grep -r "from '@/libs/" app/ && echo "✅ Backend imports found" || echo "❌ Missing backend imports"
```

### 4. Verify TypeScript Compilation

```bash
npx tsc --noEmit
```

**Expected**: Exit code 0, no errors

### 5. Run Tests

```bash
npm test
```

**Expected**: All tests passing (183+ tests)

### 6. Run App

```bash
npm run dev
```

**Expected**:

- App starts successfully
- No console errors
- Can navigate to dashboard
- Can select asset
- Components render correctly

### 7. Verify shadcn/ui Still Works

```bash
# Try adding a new component
npx shadcn@latest add badge

# Should install to app/components/ui/badge.tsx
ls app/components/ui/badge.tsx
```

## Backward Compatibility Checkpoint

**Purpose**: Verify restructuring doesn't break functionality

**Commands**:

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# 1. TypeScript check
npx tsc --noEmit

# 2. Run all tests
npm test

# 3. Build app
npm run build

# 4. Start app
npm run dev
```

**Success Criteria**:

- ✅ TypeScript compilation: 0 errors
- ✅ All tests: PASS (183+ tests)
- ✅ Build: SUCCESS
- ✅ App runs: No console errors
- ✅ Manual test: Dashboard loads, asset selection works
- ✅ Components render: UI looks identical
- ✅ Imports work: No import errors

**If Checkpoint Fails**:

1. **Import Errors**: Check sed commands, may need manual fixes
2. **Missing Components**: Verify all files moved correctly
3. **Type Errors**: Check tsconfig.json paths
4. **Runtime Errors**: Check browser console for import issues

**Rollback Procedure**:

```bash
git checkout -- .
git clean -fd app/components app/hooks app/lib app/types
```

## Common Issues and Solutions

### Issue 1: "Cannot find module '@/app/components/...'"

**Cause**: TypeScript path aliases not updated

**Solution**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/app/*": ["./app/*"]
    }
  }
}
```

### Issue 2: shadcn add command fails

**Cause**: `components.json` not updated

**Solution**: Update aliases in `components.json`:

```json
{
  "aliases": {
    "components": "@/app/components",
    "utils": "@/app/lib/utils"
  }
}
```

### Issue 3: Duplicate files after move

**Cause**: Move instead of remove, or existing files

**Solution**: Check for duplicates and consolidate:

```bash
# Find duplicate utils
find . -name "utils.ts" -not -path "./node_modules/*"

# If found at root and in app/lib/, compare and keep app/lib/ version
```

### Issue 4: Styles not loading

**Cause**: CSS import path outdated

**Solution**: Check `app/layout.tsx`:

```typescript
import "./globals.css"; // Should be relative path
```

## Integration Points

**Provides to SP10-13**:

- Clean structure for frontend development
- Clear separation for backend migration guide
- Template pattern for architecture documentation

**After SP9.6 Completion**:

- Frontend: Everything in `app/`
- Backend: Everything in `libs/`
- Template: Ready for future POCs
- Migration: `libs/` ready to copy to backend

## Next Steps

After completing SP9.6:

1. **Update SP13**: Architecture docs should reference new structure
2. **Proceed to SP10**: Backend Integration Demo
3. **Use as Template**: For future API integration POCs

## Migration Instructions (Future Use)

**Creating a New API Integration POC**:

```bash
# 1. Clone structure
git clone robinhood-connect-poc new-integration-poc
cd new-integration-poc/robinhood-onramp

# 2. Rename integration
mv libs/robinhood libs/new-api
mv libs/coinbase libs/support-api  # If needed

# 3. Update package.json name

# 4. Build your integration following the same patterns

# 5. Frontend in app/, backend in libs/

# 6. When ready, copy libs/ to endaoment-backend
```

**Benefits for Future POCs**:

- ✅ Clear template to follow
- ✅ Proven structure
- ✅ Backend-ready from day 1
- ✅ No messy directory cleanup needed
- ✅ Consistent across all POCs

---

**After this sub-plan, the POC will be a perfect template for future API integration projects, with crystal-clear Frontend/Backend separation.**
