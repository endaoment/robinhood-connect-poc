# POC Template Usage Guide

Use the [blank-poc](https://github.com/endaoment/blank-poc) template to create new integration POCs. This repository (robinhood-connect-poc) is the reference implementation.

## Template Pattern

The template separates concerns into three levels:

**Root Level** - Project orientation
- `README.md` - What this POC is
- `QUICK-START.md` - How to run it
- `TEMPLATE-USAGE.md` - How to replicate it

**Implementation Directory** (`{provider}-onramp/`) - Provider-specific code
- `app/` - Next.js frontend
- `libs/{provider}/` - Backend modules (production-ready)
- `libs/shared/` - Shared utilities
- `docs/` - Implementation guides

**Backend Ready** - Direct migration path
- Copy `libs/{provider}/` to `endaoment-backend/libs/api/{provider}/`
- Wire dependencies and uncomment decorators
- Tests transfer directly

---

## Directory Structure Convention

All POCs following the template pattern use this structure:

```
poc-repository/                 # Root repository
├── README.md                   # Template-aware overview
├── QUICK-START.md              # Run this implementation
├── TEMPLATE-USAGE.md           # This file
│
└── {provider}-onramp/          # Implementation directory
    ├── README.md               # Implementation-specific guide
    │
    ├── app/                    # Next.js Frontend
    │   ├── (routes)/           # Page routes
    │   ├── api/{provider}/     # POC-only API routes
    │   ├── components/         # React components
    │   │   └── ui/             # shadcn/ui components
    │   ├── hooks/              # React hooks
    │   └── lib/                # Frontend utilities
    │
    ├── libs/                   # Backend Libraries
    │   ├── {provider}/         # Provider integration
    │   │   ├── src/lib/
    │   │   │   ├── services/          # Business logic
    │   │   │   ├── dtos/              # Validation
    │   │   │   ├── constants/         # Configuration
    │   │   │   ├── {provider}.controller.ts
    │   │   │   └── {provider}.module.ts
    │   │   └── tests/          # Comprehensive tests
    │   │
    │   └── shared/             # Shared utilities
    │       ├── src/lib/utils/        # Utilities
    │       └── src/lib/backend-mock/ # POC-only mocks
    │
    ├── docs/                   # Comprehensive documentation
    │   ├── STRUCTURE.md
    │   ├── ARCHITECTURE.md
    │   ├── MIGRATION-GUIDE.md
    │   ├── TESTING_GUIDE.md
    │   ├── DEVELOPER_GUIDE.md
    │   └── [other guides]
    │
    └── [configs]               # jest, next, tailwind, tsconfig
```

### Key Principles

1. **Root = Template Context**: High-level docs referencing template pattern
2. **Implementation Directory = Provider-Specific**: All custom code isolated
3. **libs/ = Backend-Ready**: Direct copy to endaoment-backend
4. **docs/ = Comprehensive**: Architecture, migration, testing guides

---

## How This Repository Uses the Pattern

### robinhood-connect-poc Example

This repository is a **reference implementation** of the template pattern:

**Root Level** (Template-Aware):
- `README.md` - Notes template origin, directs to implementation
- `QUICK-START.md` - Run this specific POC
- `TEMPLATE-USAGE.md` - This file

**Implementation Directory** (`robinhood-onramp/`):
- `app/` - Complete Robinhood UI with asset selector
- `libs/robinhood/` - 40+ files, 183+ tests, backend-ready
- `libs/shared/` - Reusable utilities
- `docs/` - 10 comprehensive guides

**Template Pattern Benefits Demonstrated:**
- ✅ Clear separation of concerns
- ✅ Backend migration ready
- ✅ Comprehensive documentation
- ✅ Professional structure
- ✅ Reusable patterns

---

## Understanding libs/shared

The `libs/shared` directory contains utilities used across all provider integrations.

### What's Included

**Utilities** (`libs/shared/src/lib/utils/`):
```
├── performance-utils.ts    # Performance measurement
├── security-utils.ts       # Input sanitization, validation
├── utils.ts                # General utilities
└── index.ts                # Barrel exports
```

**Backend Mocks** (`libs/shared/src/lib/backend-mock/`):
```
├── mock-pledge.service.ts         # Simulates pledge creation
├── mock-token.service.ts          # Simulates token resolution
├── mock-notification.service.ts   # Simulates notifications
├── toast-logger.ts                # POC demonstration helper
└── types.ts                       # Shared types
```

### When to Use libs/shared

**Use libs/shared for:**
- ✅ Utilities needed by multiple providers
- ✅ Common security/validation patterns
- ✅ Performance measurement helpers
- ✅ POC-only mock services (development)

**Keep in provider lib for:**
- ❌ Provider-specific business logic
- ❌ Provider-specific DTOs
- ❌ Provider-specific constants
- ❌ Provider-specific services

### libs/shared in Production

**What Migrates to Backend:**
- ✅ `utils/` - Utilities can be migrated if needed
- ❌ `backend-mock/` - POC-only, DO NOT migrate

**In Backend:**
```bash
# Optional: Copy utilities if needed
cp libs/shared/src/lib/utils/performance-utils.ts \
   endaoment-backend/libs/shared/src/lib/utils/
```

### Adding to libs/shared

**Process:**

1. Identify truly shared functionality (used by 2+ providers)
2. Create utility in `libs/shared/src/lib/utils/`
3. Export from `libs/shared/src/lib/index.ts`
4. Import in provider libs: `import { utility } from '@/libs/shared'`
5. Document in `libs/shared/README.md`

**Example:**

```typescript
// libs/shared/src/lib/utils/network-utils.ts
export function isValidAddress(address: string, network: string): boolean {
  // Shared validation logic
}

// libs/provider/src/lib/services/provider.service.ts
import { isValidAddress } from "@/libs/shared";
```

---

## Creating New POCs from Template

### Using blank-poc Template

**Step 1: Clone Template**

```bash
git clone https://github.com/endaoment/blank-poc your-provider-poc
cd your-provider-poc
```

**Step 2: Customize Root Files**

```bash
# Update README.md
# - Change provider name throughout
# - Update "What This Is" section
# - Maintain template origin reference

# Update QUICK-START.md
# - Update directory name (onramp → your-provider-onramp)
# - Update commands
```

**Step 3: Rename Implementation Directory**

```bash
mv onramp your-provider-onramp
cd your-provider-onramp
```

**Step 4: Customize Provider Library**

```bash
# Rename provider-api to your provider
mv libs/provider-api libs/your-provider

# Update package.json
vim package.json  # Change name

# libs/shared stays as-is (shared utilities)
```

**Step 5: Build Provider Integration**

```bash
# Update services in libs/your-provider/src/lib/services/
# Update DTOs in libs/your-provider/src/lib/dtos/
# Update constants in libs/your-provider/src/lib/constants/
# Update controller: {provider}.controller.ts
# Update module: {provider}.module.ts
```

**Step 6: Build Frontend**

```bash
# Create pages in app/(routes)/
# Build components in app/components/
# Create API routes in app/api/your-provider/
```

**Step 7: Documentation**

```bash
# Update docs/ to reflect your implementation
# Update STRUCTURE.md with your directory names
# Update ARCHITECTURE.md with your architecture
# Update MIGRATION-GUIDE.md with your integration
```

---

## Template Customization Workflow

### Checklist for New POC

**Root Level Updates:**

- [ ] Update README.md with provider name
- [ ] Update QUICK-START.md commands
- [ ] Keep TEMPLATE-USAGE.md as-is (generic guide)
- [ ] Update repository name in package.json

**Implementation Directory:**

- [ ] Rename `onramp/` to `{provider}-onramp/`
- [ ] Update implementation directory README.md
- [ ] Rename `libs/provider-api/` to `libs/{provider}/`
- [ ] Keep `libs/shared/` as-is
- [ ] Update package.json with provider name

**Provider Library (`libs/{provider}/`):**

- [ ] Implement services for provider API
- [ ] Create DTOs with validation
- [ ] Define constants and configurations
- [ ] Update controller with endpoints
- [ ] Update module with dependencies
- [ ] Write comprehensive tests

**Frontend (`app/`):**

- [ ] Build provider-specific UI
- [ ] Create necessary pages/routes
- [ ] Add POC-only API routes
- [ ] Use libs/shared utilities where applicable
- [ ] Style with Tailwind CSS

**Documentation (`docs/`):**

- [ ] Update STRUCTURE.md
- [ ] Update ARCHITECTURE.md
- [ ] Update MIGRATION-GUIDE.md
- [ ] Update other guides as needed
- [ ] Document provider-specific patterns

---

## Template vs Implementation

### Template Files (Minimal Customization)

**Keep Mostly As-Is:**

- `TEMPLATE-USAGE.md` - Generic guide
- `libs/shared/` - Shared utilities
- Basic app structure (layout, styling)
- shadcn/ui components
- Configuration files (jest, tsconfig, etc.)

**Why**: These provide consistent foundation

### Implementation Files (Heavy Customization)

**Customize Heavily:**

- Provider library (`libs/{provider}/`)
- Provider-specific UI components
- API integration services
- DTOs and validation
- Documentation (specific to provider)

**Why**: These are provider-specific

---

## Best Practices

### Directory Naming

**Consistent Pattern:**

- Repository: `{provider}-connect-poc`
- Implementation directory: `{provider}-onramp/`
- Provider library: `libs/{provider}/`
- Shared library: `libs/shared/` (always)

**Examples:**

- `robinhood-connect-poc/robinhood-onramp/libs/robinhood/`
- `stripe-connect-poc/stripe-onramp/libs/stripe/`
- `coinbase-connect-poc/coinbase-onramp/libs/coinbase/`

### Documentation

**Always Include:**

- STRUCTURE.md - Directory organization
- ARCHITECTURE.md - System design
- MIGRATION-GUIDE.md - Backend integration
- TESTING_GUIDE.md - Testing approach
- DEVELOPER_GUIDE.md - Development workflow

**Why**: Enables others to understand and maintain

### Testing

**Template Standard:**

- Unit tests for all services
- DTO validation tests
- Controller endpoint tests
- Integration tests where applicable
- Aim for 95%+ coverage

**Why**: Production-ready from POC stage

### Backend Migration

**Template Promise:**

- Direct copy of `libs/{provider}/` to backend
- Minimal changes required
- Uncomment decorators, wire dependencies
- Tests transfer directly

**Why**: Smooth POC → production transition

---

## Reference Implementation

### Study This Repository

This robinhood-connect-poc serves as the **gold standard** for template usage:

**Learn From:**

- How root docs reference template
- How implementation directory is structured
- How libs/robinhood is organized
- How libs/shared provides utilities
- How documentation is comprehensive
- How backend migration is designed

**Clone Patterns:**

- Service architecture
- DTO validation approach
- Test coverage and organization
- Documentation structure
- Naming conventions

**Adapt For:**

- Your provider's API patterns
- Your provider's authentication
- Your provider's data models
- Your provider's requirements

---

## Getting Help

### Resources

**Template:**

- [blank-poc](https://github.com/endaoment/blank-poc) - Base template
- This repository - Reference implementation

**Documentation:**

- [README.md](./README.md) - Project overview
- [QUICK-START.md](./QUICK-START.md) - Get started
- [robinhood-onramp/docs/](./robinhood-onramp/docs/) - Comprehensive guides

**Planning:**

- [robinhood-onramp/docs/PLANNING-METHODOLOGY.md](./robinhood-onramp/docs/PLANNING-METHODOLOGY.md) - Planning process _(created in SP4)_

### Questions?

**Common Questions:**

**Q: Should I start with blank-poc or this repository?**  
A: Start with blank-poc template, study this as reference implementation.

**Q: What goes in libs/shared vs libs/{provider}?**  
A: Shared = used by multiple providers. Provider = specific to one provider.

**Q: Do I need all the documentation?**  
A: Yes - it enables backend migration and future maintenance.

**Q: Can I skip the test suite?**  
A: No - tests are required for backend migration confidence.

**Q: How long does POC creation take?**  
A: With template: 1-2 days for basic POC, 1-2 weeks for production-ready.

---

## Next Steps

### To Use This Pattern

1. **Study This Repository**

   - Understand structure
   - Review documentation
   - See implementation patterns

2. **Use blank-poc**

   - Clean template repository
   - Ready to clone and customize
   - Generic provider-api example

3. **Create Your POC**

   - Clone blank-poc
   - Follow customization workflow
   - Reference this repo as example

4. **Migrate to Production**
   - Follow MIGRATION-GUIDE.md pattern
   - Copy libs/ to backend
   - Wire dependencies
   - Deploy

---

**Template Pattern Version**: 1.0  
**Last Updated**: October 26, 2025  
**Status**: Reference Implementation Complete

