# Repository Structure

This repository follows a clean **Frontend/Backend separation** pattern, making it an ideal template for future API integration POCs.

## Directory Layout

```
robinhood-onramp/
├── app/                    # 🎨 FRONTEND: Next.js Application
│   ├── (routes)/           # Page routes (route group - doesn't affect URLs)
│   │   ├── dashboard/      #   → URL: /dashboard
│   │   └── callback/       #   → URL: /callback
│   ├── api/robinhood/      # ⚠️  POC-ONLY: Next.js API routes (demos libs/)
│   │                       #    NOTE: These are deleted when migrating to backend!
│   │                       #    Backend uses NestJS controller in libs/ instead
│   ├── components/         # React components
│   ├── hooks/              # React hooks  
│   ├── lib/                # Frontend utilities (cn(), etc)
│   ├── types/              # Frontend TypeScript types
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Root page (redirects to dashboard)
│
├── libs/                   # 🔧 BACKEND: API Libraries (100% Backend-Ready!)
│   ├── robinhood/          # Robinhood Connect integration
│   │   ├── src/lib/
│   │   │   ├── robinhood.controller.ts  # ✅ NestJS controller (backend-ready)
│   │   │   ├── robinhood.module.ts      # ✅ NestJS module (backend-ready)
│   │   │   ├── services/                # Business logic
│   │   │   ├── dtos/                    # Validation
│   │   │   └── constants/               # Config
│   │   └── tests/                       # Tests co-located with code
│   ├── coinbase/           # Coinbase Prime support
│   └── shared/             # Shared utilities
│
├── public/                 # 📦 Static Assets
├── docs/                   # 📚 Documentation  
├── scripts/                # 🛠️  Development Scripts
└── [config files]          # ⚙️  Configuration
```

## Key Principles

### 1. Frontend in `app/`

**Everything React/Next.js lives in `app/`**:
- ✅ Components
- ✅ Hooks
- ✅ Pages (organized in route groups)
- ✅ API routes (thin wrappers)
- ✅ Frontend utilities
- ✅ Styles

**Note on Route Groups**: Directories wrapped in parentheses like `(routes)` are route groups in Next.js App Router. They organize code without affecting the URL structure. For example, `app/(routes)/dashboard/page.tsx` maps to URL `/dashboard`, not `/routes/dashboard`.

**Import pattern**:
```typescript
import { AssetCard } from "@/app/components/asset-card";
import { useAssetSelection } from "@/app/hooks/use-asset-selection";
import { cn } from "@/app/lib/utils";
```

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
| Page routes              | `app/(routes)/*/page.tsx`  | Next.js pages (route groups)  |
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

