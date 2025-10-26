# Sub-Plan 0: Templatization Preparation - Drafting Plan

**Status**: Complete  
**Priority**: Critical  
**Dependencies**: None  
**Phase**: Planning

---

## Context Required

This plan restructures the robinhood-connect-poc repository to appear as if it was generated from a template, then forks it to create the actual blank-poc template repository.

### File References

**Current Documentation:**
- `/Users/rheeger/Code/endaoment/robinhood-connect-poc/README.md` (lines 1-84)
- `/Users/rheeger/Code/endaoment/robinhood-connect-poc/QUICK-START.md` (lines 1-106)
- `/Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/README.md` (lines 1-107)
- `/Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/docs/*.md` (9 documentation files)

**Planning Methodology:**
- `.cursor/rules/endaoment-workflow/planning-methodology.mdc`

**Existing Plans for Reference:**
- `.cursor/plans/robinhood-backend-alignment/` (completed migration)
- `.cursor/plans/robinhood-asset-preselection/` (completed feature)
- `.cursor/plans/robinhood-legacy-cleanup/` (completed cleanup)

### Understanding Required

1. **Template Pattern Philosophy**: The goal is to make robinhood-connect-poc look like a completed, polished example of using a hypothetical blank-poc template
2. **Two-Phase Approach**: 
   - Phase 1: Polish this repo to show template origin
   - Phase 2: Fork and strip to create actual template
3. **Documentation Hierarchy**:
   - Root level: Template-aware, project overview
   - `robinhood-onramp/`: Implementation-specific details
   - `.cursor/plans/`: Historical planning artifacts

---

## Objectives

### Primary Goal
Transform robinhood-connect-poc into a professionally polished repository that demonstrates the template pattern, then fork to create blank-poc template.

### Specific Objectives

**Phase 1 - Polish robinhood-connect-poc (Sub-Plans 1-7):**
1. Make root documentation appear template-originated
2. Add template usage documentation
3. Move migration plan references into `robinhood-onramp/docs/`
4. Polish `robinhood-onramp/` as implementation example
5. Create clear template → implementation pattern

**Phase 2 - Create blank-poc Template (Sub-Plans 8-12):**
6. Fork to new blank-poc repository
7. Remove Robinhood-specific content
8. Convert to hello world + generic provider-api
9. Finalize template documentation
10. Prepare for future POC projects

---

## Phase Outline

### PHASE 1: POLISH ROBINHOOD-CONNECT-POC

#### Sub-Plan 1: Root README - Template Origin Style
**Purpose**: Make root README appear as if it came from blank-poc template and was customized for Robinhood

**Deliverables:**
- Updated `README.md` with template origin indicator
- Clear directory structure showing customization
- Links to robinhood-onramp for implementation details
- Brief mention of template reusability

**Key Sections:**
- Header: "Robinhood Connect POC - Based on blank-poc Template"
- What This Is: Template-originated implementation
- Directory Structure: Shows onramp directory pattern
- Quick Links: Points to implementation docs
- Template Usage: Brief mention with link to TEMPLATE-USAGE.md

---

#### Sub-Plan 2: Root QUICK-START - Implementation Focus
**Purpose**: Make QUICK-START specific to running this Robinhood POC

**Deliverables:**
- Implementation-focused quick start
- Clear steps to run THIS POC
- Reference to template pattern
- Links to detailed docs in robinhood-onramp/

**Key Changes:**
- Focus on "Run the Robinhood POC"
- Keep it concise and actionable
- Reference template briefly
- Direct to robinhood-onramp/ for details

---

#### Sub-Plan 3: Create Root TEMPLATE-USAGE.md
**Purpose**: Document the POC template pattern used in this repository

**Deliverables:**
- New `TEMPLATE-USAGE.md` file
- Template pattern explanation
- Directory structure conventions
- libs/shared documentation and usage
- Reference to future blank-poc template

**Key Sections:**
1. POC Template Pattern Overview
2. Directory Structure Convention
3. How This Repository Uses the Pattern
4. Using libs/shared in Your POC
5. Creating New POC from Template
6. Reference to blank-poc Template (coming soon)

---

#### Sub-Plan 4: Move Migration Plans to Docs
**Purpose**: Reference migration planning work in implementation docs

**Deliverables:**
- New `robinhood-onramp/docs/PLANNING-METHODOLOGY.md`
- References to completed backend alignment
- Links to `.cursor/plans/` for full details
- Keep cursor plans intact

**Key Content:**
- Overview of planning approach used
- Reference to robinhood-backend-alignment plan
- Link to planning methodology rule
- Note that `.cursor/plans/` has full historical details

---

#### Sub-Plan 5: Polish robinhood-onramp/README.md
**Purpose**: Make onramp README clearly implementation-specific

**Deliverables:**
- Updated README focused on Robinhood Connect
- Template origin reference
- Links to comprehensive docs/
- Shows completed implementation example

**Key Changes:**
- Header: "Robinhood Connect - Onramp Application"
- Note: "Implementation based on blank-poc template"
- Clear implementation focus
- Comprehensive doc links

---

#### Sub-Plan 6: Update robinhood-onramp/docs/STRUCTURE.md
**Purpose**: Document structure as template-aware implementation

**Deliverables:**
- Updated STRUCTURE.md showing template pattern
- Reference to root template documentation
- Implementation-specific structure details
- Clear separation of concerns

**Key Updates:**
- Add section on template origin
- Reference root TEMPLATE-USAGE.md
- Show how structure follows template
- Keep Robinhood-specific details

---

#### Sub-Plan 7: Final Polish and Verification
**Purpose**: Ensure all documentation flows correctly and appears professional

**Deliverables:**
- Verified documentation flow
- Checked all cross-references
- Validated template pattern clarity
- Final commit with clean message

**Verification Checklist:**
- [ ] Root README shows template origin
- [ ] QUICK-START is implementation-focused
- [ ] TEMPLATE-USAGE.md is comprehensive
- [ ] Migration plans referenced in docs
- [ ] robinhood-onramp/README.md is polished
- [ ] STRUCTURE.md shows template awareness
- [ ] All links work correctly
- [ ] Professional appearance throughout

---

### PHASE 2: CREATE BLANK-POC TEMPLATE (New Repository)

#### Sub-Plan 8: Fork to blank-poc Repository
**Purpose**: Create new blank-poc repository from polished robinhood-connect-poc

**Deliverables:**
- New GitHub repository: blank-poc
- Complete copy of current state
- Clean initial commit
- Implementation log documenting fork

**Steps:**
1. Create new GitHub repository
2. Copy/fork robinhood-connect-poc
3. Verify all files transferred
4. Initialize with clean commit
5. Document forking process

---

#### Sub-Plan 9: Remove Robinhood-Specific Content (blank-poc)
**Purpose**: Strip Robinhood content to reveal generic provider pattern

**Note**: This sub-plan will be created in blank-poc repository

**High-Level Tasks:**
- Remove `libs/coinbase/` directory
- Rename `libs/robinhood/` to `libs/provider-api/`
- Replace Robinhood terminology with generic provider
- Update service names to be generic
- Keep structure and quality

---

#### Sub-Plan 10: Simplify to Hello World (blank-poc)
**Purpose**: Create minimal hello world app with shared components

**Note**: This sub-plan will be created in blank-poc repository

**High-Level Tasks:**
- Simplify `app/` to hello world landing
- Keep shared UI components (shadcn/ui)
- Remove Robinhood dashboard and selectors
- Remove provider-specific API routes
- Keep basic layout structure

---

#### Sub-Plan 11: Finalize Template Documentation (blank-poc)
**Purpose**: Make all documentation template-focused

**Note**: This sub-plan will be created in blank-poc repository

**High-Level Tasks:**
- Update root README to be template-focused
- Complete TEMPLATE-USAGE.md guide
- Update all docs/ to generic patterns
- Remove implementation specifics
- Polish for template usage

---

#### Sub-Plan 12: Verification and Publishing (blank-poc)
**Purpose**: Verify template is ready for use

**Note**: This sub-plan will be created in blank-poc repository

**High-Level Tasks:**
- Verify template is clean
- Test structure makes sense
- Validate all documentation
- Create release/tag
- Document usage examples

---

## Directory Structure

### Current State
```
robinhood-connect-poc/
├── README.md                          # Generic POC description
├── QUICK-START.md                     # Mixed template/implementation
├── robinhood-onramp/
│   ├── README.md                      # Implementation README
│   ├── docs/                          # Implementation docs
│   ├── app/                           # Full Robinhood UI
│   ├── libs/
│   │   ├── robinhood/                 # Robinhood integration
│   │   ├── coinbase/                  # Secondary example
│   │   └── shared/                    # Shared utilities
│   └── [configs]
└── .cursor/plans/
    ├── robinhood-backend-alignment/
    ├── robinhood-asset-preselection/
    ├── robinhood-legacy-cleanup/
    └── robinhood-connect-poc/
```

### Target State - After Phase 1 (robinhood-connect-poc)
```
robinhood-connect-poc/                 # 🎯 Appears template-generated
├── README.md                          # Template-originated, Robinhood-customized
├── QUICK-START.md                     # Run this Robinhood POC
├── TEMPLATE-USAGE.md                  # 📘 Template pattern documentation
│
├── robinhood-onramp/                  # Implementation directory
│   ├── README.md                      # Robinhood-specific
│   ├── app/                           # Full implementation
│   ├── libs/
│   │   ├── robinhood/                 # Robinhood integration
│   │   ├── coinbase/                  # Secondary example
│   │   └── shared/                    # Shared utilities
│   ├── docs/                          # Comprehensive docs
│   │   ├── PLANNING-METHODOLOGY.md    # 📋 Migration plans reference
│   │   ├── STRUCTURE.md               # Template-aware structure
│   │   ├── ARCHITECTURE.md
│   │   ├── MIGRATION-GUIDE.md
│   │   └── [other guides]
│   └── [configs]
│
└── .cursor/plans/                     # Unchanged
    ├── robinhood-backend-alignment/
    ├── robinhood-asset-preselection/
    ├── robinhood-legacy-cleanup/
    ├── robinhood-connect-poc/
    └── templatization-prep/           # 📍 This plan
```

### Target State - After Phase 2 (blank-poc - new repo)
```
blank-poc/                             # 🎯 Clean template
├── README.md                          # Template-focused
├── QUICK-START.md                     # Template quick start
├── TEMPLATE-USAGE.md                  # Complete usage guide
│
├── onramp/                            # Template POC directory
│   ├── README.md                      # Template POC guide
│   ├── app/                           # Hello world + shared components
│   ├── libs/
│   │   ├── provider-api/              # Generic provider example
│   │   └── shared/                    # 📦 Shared utilities (with docs)
│   ├── docs/                          # Generic pattern docs
│   │   ├── STRUCTURE.md
│   │   ├── ARCHITECTURE.md
│   │   ├── MIGRATION-GUIDE.md
│   │   ├── TEMPLATE-CUSTOMIZATION.md
│   │   └── [other guides]
│   └── [configs]
│
└── .cursor/                           # Template planning examples
    └── plans/
        └── template-creation/         # How template was created
```

---

## Dependencies

### Technical Dependencies
- Git repository access for forking
- Node.js environment (optional, for validation)
- No new package installations

### Prerequisite Knowledge
- Understanding of template pattern
- Familiarity with robinhood-connect-poc structure
- Understanding of planning methodology

### Dependent Systems
- None - this is documentation and structure work

---

## Success Criteria

### Phase 1 Success Criteria (robinhood-connect-poc)

**Documentation Quality:**
- [ ] Root README clearly shows template origin
- [ ] QUICK-START is implementation-focused
- [ ] TEMPLATE-USAGE.md is comprehensive
- [ ] Migration plans referenced in docs/PLANNING-METHODOLOGY.md
- [ ] All cross-references work correctly

**Structure Quality:**
- [ ] Template → implementation pattern is clear
- [ ] Professional, polished appearance
- [ ] Clear separation: root (template-aware) vs onramp (implementation)
- [ ] Ready to fork as template source

**Technical Quality:**
- [ ] All documentation renders correctly
- [ ] No broken links
- [ ] Consistent formatting throughout
- [ ] Clear navigation paths

### Phase 2 Success Criteria (blank-poc)

**Template Quality:**
- [ ] Clean, generic provider-api example
- [ ] Hello world app demonstrates structure
- [ ] No Robinhood-specific content
- [ ] libs/shared documented and usable

**Documentation Quality:**
- [ ] Template-focused documentation
- [ ] Clear usage instructions
- [ ] Generic pattern examples
- [ ] Ready for customization

**Usability:**
- [ ] New user can understand template quickly
- [ ] Clear path from template to implementation
- [ ] Examples demonstrate best practices
- [ ] Template is reusable for future POCs

---

## Risk Assessment

### 🟢 LOW RISK

**Documentation Updates:**
- Creating new documentation files
- Updating existing docs
- Adding cross-references

**Mitigation**: Work in feature branch, review before merge

### 🟡 MEDIUM RISK

**Template Pattern Clarity:**
- Risk: Pattern not obvious to new users
- Impact: Confusion about template vs implementation

**Mitigation**: 
- Clear headers and indicators
- Comprehensive TEMPLATE-USAGE.md
- Consistent naming conventions
- Review by someone unfamiliar with project

**Fork Process:**
- Risk: Issues during repository fork
- Impact: Incomplete file transfer

**Mitigation**:
- Verify all files after fork
- Document fork process
- Create implementation log

### 🔴 HIGH RISK

None identified - this is documentation and structure work

---

## Rollback Procedure

### If Issues During Phase 1
1. Checkout previous commit: `git checkout <previous-commit>`
2. Review what went wrong
3. Adjust plan if needed
4. Resume from last good state

### If Issues During Phase 2
1. Delete blank-poc repository
2. Fix issues in robinhood-connect-poc
3. Re-fork when ready
4. No impact on original repository

### Emergency Rollback
```bash
# Phase 1 - robinhood-connect-poc
git checkout main
git reset --hard <commit-before-changes>

# Phase 2 - blank-poc  
# Just delete repository and start fresh
```

---

## Notes for Implementers

### General Guidelines

1. **Work in Feature Branch** for Phase 1
   ```bash
   git checkout -b feature/templatization-prep
   ```

2. **Commit After Each Sub-Plan**
   ```bash
   git add .
   git commit -m "templatization: SP1 - root README template origin style"
   ```

3. **Create Implementation Logs**
   - Use actual file creation timestamp in filename
   - Document in `implementation-logs/`
   - Format: `YYYYMMDD-HHMM-DESCRIPTION.md`

4. **Validate Frequently**
   - Check links after each change
   - Render markdown to verify formatting
   - Review cross-references

### Phase 1 Specific Notes

**Goal**: Make it look professionally template-generated
- Keep all Robinhood implementation intact
- Add template-awareness to documentation
- Polish, don't rebuild
- Focus on documentation and structure

**Template Language to Use:**
- "Based on blank-poc template"
- "Template-originated implementation"
- "Following POC template pattern"
- "Customized from template for Robinhood"

**What NOT to Change:**
- Code functionality
- Library implementations
- Test suites
- `.cursor/plans/` content (only reference it)

### Phase 2 Specific Notes

**Goal**: Create clean, reusable template

**Work Location**: New blank-poc repository
- Sub-plans 9-12 created there
- Separate implementation logs
- No dependency on robinhood-connect-poc

**Focus Areas:**
- Reusability and clarity
- Generic patterns
- Easy customization
- Clear documentation

### libs/shared Documentation

**Must Document:**
- Purpose of shared utilities
- What's included (performance-utils, security-utils, etc.)
- When to use shared vs provider-specific
- How to add new shared utilities
- backend-mock/ is POC-only (not for template)

**Template Usage Pattern:**
```
libs/
├── provider-api/        # Your specific integration
├── another-provider/    # Additional integrations
└── shared/             # Utilities used by all providers
```

---

## Common Issues and Solutions

### Issue: Template Pattern Not Clear
**Symptom**: Confusion about what's template vs implementation

**Solution**:
- Add clear headers indicating template origin
- Use consistent "based on template" language
- Reference TEMPLATE-USAGE.md prominently
- Show directory structure with annotations

### Issue: Documentation Duplication
**Symptom**: Same content in multiple places

**Solution**:
- Use cross-references instead of duplication
- Create single source of truth
- Link rather than copy
- Keep root docs high-level, onramp docs detailed

### Issue: Broken Links After Restructure
**Symptom**: Links don't work after moving content

**Solution**:
- Use relative paths consistently
- Update all references when moving files
- Test links after each change
- Keep a checklist of common link locations

### Issue: Fork Missing Files
**Symptom**: Some files not in blank-poc after fork

**Solution**:
- Verify .gitignore not excluding needed files
- Check for large files that might fail transfer
- Use `git status` to verify clean state before fork
- Document all files that should transfer

---

## Integration Points

### With Existing Plans

**robinhood-backend-alignment:**
- Reference in PLANNING-METHODOLOGY.md
- Show as example of planning process
- Link to specific sub-plans as examples

**robinhood-asset-preselection:**
- Another example of completed planning
- Shows feature addition pattern

**robinhood-legacy-cleanup:**
- Example of cleanup and refactoring planning

### With Future Work

**After Phase 1:**
- Repository ready for fork
- Can serve as example for others
- Documentation can be referenced

**After Phase 2:**
- blank-poc becomes reusable template
- Future POCs can clone blank-poc
- This plan serves as template creation guide

---

## Next Steps After Completion

### After Sub-Plan 7 (Phase 1 Complete)
1. Review entire documentation flow
2. Get feedback from team
3. Merge feature branch to main
4. Proceed to Sub-Plan 8 (fork)

### After Sub-Plan 8 (Fork Complete)
1. Switch to blank-poc repository
2. Create new planning directory in blank-poc
3. Create Sub-Plans 9-12 in new repo
4. Begin template cleanup work

### After Sub-Plan 12 (Phase 2 Complete)
1. Publish blank-poc template
2. Create usage examples
3. Document template in endaoment docs
4. Share with team for future POCs

---

## Appendix: File Inventory

### Files to Create in Phase 1
- `TEMPLATE-USAGE.md` (root)
- `robinhood-onramp/docs/PLANNING-METHODOLOGY.md`
- Implementation logs as work progresses

### Files to Update in Phase 1
- `README.md` (root)
- `QUICK-START.md` (root)
- `robinhood-onramp/README.md`
- `robinhood-onramp/docs/STRUCTURE.md`

### Files to Keep Unchanged
- All code in `robinhood-onramp/app/`
- All code in `robinhood-onramp/libs/`
- All tests
- All config files
- `.cursor/plans/` content

### Directories to Create
- `.cursor/plans/templatization-prep/sub-plans/`
- `.cursor/plans/templatization-prep/implementation-logs/`

---

**Last Updated**: 2025-10-26
**Status**: Complete - Ready for Implementation

