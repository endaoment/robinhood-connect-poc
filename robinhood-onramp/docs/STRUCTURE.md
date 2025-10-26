# Repository Structure - Robinhood Connect Implementation

**Template Origin**: This implementation follows the [blank-poc](https://github.com/endaoment/blank-poc) template pattern  
**Root Documentation**: See [../../TEMPLATE-USAGE.md](../../TEMPLATE-USAGE.md) for template structure

Directory organization for the Robinhood Connect implementation, demonstrating the POC template pattern.

## Template Pattern Overview

This repository uses a **two-level structure**:

**Root Level**: Template-aware documentation and project overview
```
robinhood-connect-poc/
├── README.md                  # Template-originated, Robinhood-customized
├── QUICK-START.md             # Run this implementation
├── TEMPLATE-USAGE.md          # Template pattern guide
└── robinhood-onramp/          # Implementation directory (detailed below)
```

**Implementation Level**: Provider-specific code and documentation (this directory)

**See**: [../../README.md](../../README.md) for root structure and template pattern.

---

## Implementation Directory Layout

```text
robinhood-onramp/              # 📂 IMPLEMENTATION DIRECTORY (template pattern)
├── app/                        # 🎨 FRONTEND: Next.js Application
│   ├── (routes)/              # Page routes (route group - doesn't affect URLs)
│   │   ├── dashboard/         #   → URL: /dashboard (asset selection)
│   │   └── callback/          #   → URL: /callback (completion handling)
│   ├── api/robinhood/         # ⚠️  POC-ONLY: Next.js API routes (demos libs/)
│   │                          #    NOTE: Deleted when migrating to backend!
│   │                          #    Backend uses NestJS controller in libs/ instead
│   ├── components/            # React components (Robinhood-specific)
│   │   └── ui/                # shadcn/ui components (from template)
│   ├── hooks/                 # React hooks (Robinhood-specific)
│   ├── lib/                   # Frontend utilities (cn(), etc. - from template)
│   ├── types/                 # Frontend TypeScript types
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Root page (redirects to dashboard)
│
├── libs/                      # 🔧 BACKEND: API Libraries (template pattern)
│   ├── robinhood/             # 🎯 Robinhood Connect Integration
│   │   ├── src/lib/
│   │   │   ├── robinhood.controller.ts  # NestJS controller (backend-ready)
│   │   │   ├── robinhood.module.ts      # NestJS module (backend-ready)
│   │   │   ├── services/                # Business logic (4 services)
│   │   │   ├── dtos/                    # Validation (5 DTOs)
│   │   │   ├── constants/               # Config (networks, errors)
│   │   │   └── [other directories]      # Assets, backend-integration, etc.
│   │   └── tests/                       # Tests (183+)
│   │
│   ├── coinbase/              # 🏦 Coinbase Prime Support (secondary example)
│   │   └── [similar structure]
│   │
│   └── shared/                # 📦 SHARED UTILITIES (template pattern)
│       ├── src/lib/utils/     # Performance, security utilities
│       └── src/lib/backend-mock/  # POC-only mock services
│
├── public/                    # 📦 Static Assets
├── docs/                      # 📚 Documentation (10 guides)
├── scripts/                   # 🛠️  Development Scripts
└── [config files]             # ⚙️  Configuration (jest, next, tailwind, tsconfig)
```

### Template Pattern Notes

**From Template** (minimal customization):
- `libs/shared/` - Shared utilities library
- `app/components/ui/` - shadcn/ui components
- `app/lib/utils.ts` - Frontend utilities (cn function, etc.)
- Configuration files structure

**Implementation-Specific** (heavy customization):
- `libs/robinhood/` - Complete Robinhood integration
- `libs/coinbase/` - Secondary example
- `app/(routes)/dashboard/` - Asset selection UI
- `app/(routes)/callback/` - Callback handling
- `app/api/robinhood/` - POC-only API routes

**See**: [../../TEMPLATE-USAGE.md](../../TEMPLATE-USAGE.md) for template vs implementation guidance

## Key Principles

### 1. Template Pattern Foundation

**This structure follows the POC template pattern:**

**Separation of Concerns:**
- Root level: Template awareness, project overview
- Implementation directory: Provider-specific code
- Backend libraries: Migration-ready modules

**Standardized Structure:**
- Consistent across all POCs using template
- Predictable file locations
- Clear separation: frontend vs backend
- Documentation co-located with code

**Benefits:**
- Rapid POC development
- Production-ready from day one
- Smooth backend migration
- Team familiarity across POCs

---

### 2. Frontend in `app/`

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
import { AssetCard } from '@/app/components/asset-card'
import { useAssetSelection } from '@/app/hooks/use-asset-selection'
import { cn } from '@/app/lib/utils'
```

### 3. Backend in `libs/`

**Everything for API integration lives in `libs/`**:

- Services (business logic)
- DTOs (data transfer objects)
- Constants
- Types
- Tests
- NestJS Controller (HTTP endpoints)
- NestJS Module (DI configuration)

**Import pattern**:

```typescript
import { RobinhoodClientService, AssetRegistryService, GenerateUrlDto } from '@/libs/robinhood'

// In backend, also import the module:
import { RobinhoodModule } from '@/libs/robinhood'
```

**Key Point**: The `libs/` directory contains a NestJS module. The Next.js routes in `app/api/` are for POC demonstration only.

## Template Pattern Usage

This repository demonstrates the **POC template pattern** structure:

### Two-Level Organization

**Root Level** (Template Context):
- `README.md` - Notes template origin, directs to implementation
- `QUICK-START.md` - Run this specific POC
- `TEMPLATE-USAGE.md` - Complete template pattern guide

**Implementation Level** (Provider-Specific):
- `robinhood-onramp/` - All Robinhood code and documentation
- Follows standardized structure from template
- Heavy customization for provider needs

### Creating New POCs

**Use the blank-poc template** *(coming soon)*:

1. Clone [blank-poc](https://github.com/endaoment/blank-poc)
2. Rename `onramp/` to `{provider}-onramp/`
3. Rename `libs/provider-api/` to `libs/{provider}/`
4. Keep `libs/shared/` as-is
5. Build provider integration
6. Update documentation

**Study this repository as reference implementation:**
- Service architecture patterns
- DTO validation approach
- Test organization
- Documentation structure
- Backend migration design

**Complete Guide**: [../../TEMPLATE-USAGE.md](../../TEMPLATE-USAGE.md)

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
import { Button } from '@/app/components/ui/button'
import { useToast } from '@/app/hooks/use-toast'

// Frontend imports backend (API calls)
import { urlBuilderService } from '@/libs/robinhood'

// Backend imports backend
// (within libs/ files)
import { PrimeApiService } from '@/libs/coinbase'
```

### ❌ DON'T

```typescript
// Backend should NOT import frontend
// (libs/ files should not import from app/)
import { AssetCard } from '@/app/components/asset-card' // ❌ NO!
```

## Migration to Backend

This structure is designed for **seamless backend migration**:

**What Migrates:**
- Copy entire `libs/robinhood/` to `endaoment-backend/libs/api/robinhood/`
- All services, DTOs, constants, tests transfer directly
- Uncomment NestJS decorators
- Wire database and service dependencies

**What Stays in POC:**
- `app/` directory (frontend demonstration)
- `libs/shared/src/lib/backend-mock/` (POC-only mocks)
- POC-specific configuration

**Template Pattern Benefit:**  
All POCs following the template have the same migration process.

**Complete Migration Guide**: [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)

---

## Related Documentation

**Template Pattern:**
- [../../README.md](../../README.md) - Root template overview
- [../../TEMPLATE-USAGE.md](../../TEMPLATE-USAGE.md) - Complete template guide
- [../../QUICK-START.md](../../QUICK-START.md) - Quick start

**Implementation Details:**
- [../README.md](../README.md) - Robinhood implementation guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) - Backend migration
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development workflow

**Planning:**
- [PLANNING-METHODOLOGY.md](./PLANNING-METHODOLOGY.md) - Planning process

---

**Structure Version**: Template Pattern v1.0  
**Last Updated**: October 26, 2025  
**Status**: Reference Implementation
