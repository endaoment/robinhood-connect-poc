# Sub-Plan 6: Update robinhood-onramp/docs/STRUCTURE.md

**Status**: Pending  
**Priority**: High  
**Dependencies**: Sub-Plan 5 (onramp README polished)  
**Estimated Complexity**: Low

---

## Context Required

### Files to Review

**Primary File:**
- `/Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/docs/STRUCTURE.md` (lines 1-149)
  - Directory layout (lines 7-40)
  - Key principles (lines 42-86)
  - Using as template (lines 88-105)
  - What goes where (lines 107-120)
  - Import rules (lines 122-145)
  - Migration reference (lines 147-149)

**Reference Files:**
- Root README.md (updated in SP1) - Template pattern
- TEMPLATE-USAGE.md (created in SP3) - Template documentation  
- robinhood-onramp/README.md (updated in SP5) - Implementation focus

### Understanding Required

**Current State:**
- Technical structure documentation
- No template origin reference
- Generic POC structure description

**Target State:**
- Template-aware structure documentation
- Reference template pattern
- Show how structure follows template
- Keep technical details

---

## Objectives

1. Update STRUCTURE.md to be template-aware
2. Add template pattern context
3. Reference root template documentation
4. Maintain technical structure details
5. Show this as implementation example

---

## Precise Implementation Steps

### Step 1: Update Header Section

**File**: `/Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/docs/STRUCTURE.md`

**Action**: Replace lines 1-5 with template-aware header

**Current** (lines 1-5):
```markdown
# Repository Structure

Directory organization for the Robinhood Connect POC.

## Directory Layout
```

**New**:
```markdown
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
```

**Validation**:
- Template pattern acknowledged
- Two-level structure explained
- Links to root docs

---

### Step 2: Add Template Context to Directory Layout

**File**: `/Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/docs/STRUCTURE.md`

**Action**: Update lines 7-40 with template annotations

**Current** (lines 7-40): Directory tree without template context

**New**:
```markdown

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
```

**Validation**:
- Template pattern annotated
- Shows what came from template vs custom
- Links to template docs

---

### Step 3: Update "Using This as a Template" Section

**File**: `/Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/docs/STRUCTURE.md`

**Action**: Replace lines 88-105 with template pattern reference

**Current** (lines 88-105): Instructions for using as template

**New**:
```markdown
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
```

**Validation**:
- Clear template pattern explanation
- Directs to blank-poc for new POCs
- Shows this as reference implementation

---

### Step 4: Add Template Pattern Section Before "What Goes Where"

**File**: `/Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/docs/STRUCTURE.md`

**Action**: Insert new section before line 107

**Insert Before "What Goes Where?"**:
```markdown

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

```

**Then continue with existing content (adjusted numbering)**

**Validation**:
- Template pattern principles added
- Existing principles renumbered (2, 3 instead of 1, 2)
- Clear foundation explanation

---

### Step 5: Update Footer/Migration Reference

**File**: `/Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/docs/STRUCTURE.md`

**Action**: Replace lines 147-149 with enhanced migration reference

**Current** (lines 147-149):
```markdown
## Migration to Backend

See [docs/MIGRATION-GUIDE.md](./docs/MIGRATION-GUIDE.md) for migration instructions.
```

**New**:
```markdown
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
```

**Validation**:
- Migration benefits clear
- Template pattern noted
- Related docs linked
- Professional footer

---

## Deliverables Checklist

- [ ] Header shows template origin
- [ ] Template pattern overview added
- [ ] Directory layout annotated with template notes
- [ ] Template vs implementation distinctions clear
- [ ] Key principles include template foundation
- [ ] "Using as template" updated to reference blank-poc
- [ ] Migration section shows template benefit
- [ ] Related documentation section added
- [ ] All links work correctly
- [ ] Professional, template-aware appearance

---

## Validation Steps

### Step 1: Render and Review

**Verify**:
- Template pattern clear throughout
- Technical details preserved
- Annotations helpful not overwhelming
- Professional appearance

**Expected**: Template-aware structure documentation

---

### Step 2: Verify All Links

**Links to Check:**
- `../../README.md`
- `../../TEMPLATE-USAGE.md`
- `../../QUICK-START.md`
- `../README.md`
- `./ARCHITECTURE.md`
- `./MIGRATION-GUIDE.md`
- `./DEVELOPER_GUIDE.md`
- `./PLANNING-METHODOLOGY.md`

**Expected**: All links work

---

### Step 3: Consistency Check

**Compare with**:
- SP1 Root README
- SP3 TEMPLATE-USAGE.md
- SP5 onramp README

**Verify**:
- Template language consistent
- Structure descriptions match
- Professional tone maintained

**Expected**: Perfect consistency

---

## Backward Compatibility Checkpoint

**N/A** - This is documentation only, no infrastructure changes

---

## Common Issues and Solutions

### Issue 1: Lost Technical Detail

**Symptom**: Template talk replaces technical content

**Solution**:
- Preserve all technical details
- Add template context, don't replace
- Annotations complement existing content
- Keep import rules, file locations intact

---

### Issue 2: Template Annotations Too Heavy

**Symptom**: Every line has template comment

**Solution**:
- Strategic annotations only
- Template overview at top
- Section on template vs implementation
- Let structure speak for itself

---

## Integration Points

### With Sub-Plan 5 (onramp README)
- onramp README references this doc
- Consistent structure descriptions
- Both template-aware

### With Sub-Plan 3 (TEMPLATE-USAGE.md)
- This doc shows specific implementation
- TEMPLATE-USAGE.md shows general pattern
- Cross-references work both ways

---

## Next Steps

After completing this sub-plan:

1. **Commit Changes**:
   ```bash
   git add robinhood-onramp/docs/STRUCTURE.md
   git commit -m "templatization: SP6 - update STRUCTURE.md with template awareness"
   ```

2. **Create Implementation Log**:
   - File: `implementation-logs/YYYYMMDD-HHMM-SP6-COMPLETE.md`
   - Document template awareness added
   - Verify all links work
   - Note technical details preserved

3. **Proceed to Sub-Plan 7**:
   - Final verification of all changes
   - Check all documentation flows
   - Validate template pattern clarity
   - Prepare for Phase 1 completion

---

## Success Criteria

- [ ] STRUCTURE.md template-aware throughout
- [ ] Technical details preserved
- [ ] Template vs implementation clear
- [ ] All links work
- [ ] Consistent with previous sub-plans
- [ ] Professional appearance
- [ ] Ready for SP7 (final verification)

---

**Estimated Time**: 30-45 minutes  
**Complexity**: Low  
**Risk Level**: 🟢 Low - Documentation only

