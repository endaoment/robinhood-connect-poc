# Templatization Preparation Plan

**Goal**: Polish robinhood-connect-poc to appear template-generated, then fork to create blank-poc template repository.

**Status**: Ready for Implementation  
**Created**: 2025-10-26

---

## Quick Links

- **[OVERVIEW.md](./OVERVIEW.md)** - Comprehensive project context and architecture
- **[Sub-Plan 0: Drafting Plan](./sub-plans/sub-plan-0-drafting-plan.md)** - Complete planning document
- **[Implementation Logs](./implementation-logs/)** - Progress tracking

---

## Plan Structure

### Phase 1: Polish robinhood-connect-poc (Sub-Plans 1-7)

Work in this repository to make it appear professionally template-generated.

| # | Sub-Plan | Status | Priority | Dependencies |
|---|----------|--------|----------|--------------|
| 1 | Root README - Template Origin Style | Pending | Critical | None |
| 2 | Root QUICK-START - Implementation Focus | Pending | High | SP1 |
| 3 | Create Root TEMPLATE-USAGE.md | Pending | Critical | SP1 |
| 4 | Move Migration Plans to Docs | Pending | Medium | SP3 |
| 5 | Polish robinhood-onramp/README.md | Pending | High | SP4 |
| 6 | Update robinhood-onramp/docs/STRUCTURE.md | Pending | High | SP5 |
| 7 | Final Polish and Verification | Pending | Critical | SP6 |

### Phase 2: Create blank-poc Template (Sub-Plans 8-12)

Work in new blank-poc repository to create clean template.

| # | Sub-Plan | Status | Priority | Dependencies |
|---|----------|--------|----------|--------------|
| 8 | Fork to blank-poc Repository | Pending | Critical | SP7 |
| 9 | [blank-poc] Remove Robinhood Content | Pending | Critical | SP8 |
| 10 | [blank-poc] Simplify to Hello World | Pending | High | SP8 |
| 11 | [blank-poc] Finalize Template Documentation | Pending | Critical | SP9, SP10 |
| 12 | [blank-poc] Verification and Publishing | Pending | Critical | SP11 |

**Note**: Sub-plans 9-12 will be created in the blank-poc repository.

---

## Implementation Approach

### Sequential Implementation (Recommended)

Execute sub-plans in order for Phase 1:

```bash
# Phase 1: Polish robinhood-connect-poc
SP1 → SP2 → SP3 → SP4 → SP5 → SP6 → SP7 → SP8

# Phase 2: Create blank-poc (in new repo)
SP9 → SP10 → SP11 → SP12
```

**Rationale**:
- Documentation updates build on each other
- Clear progression of template pattern
- Easy to verify at each step
- Natural flow from planning to implementation

### Parallel Work (Advanced)

Some sub-plans can be done in parallel if needed:

**Group 1** (can be parallel):
- SP1, SP2, SP3 - Root documentation updates
  
**Group 2** (after Group 1):
- SP4, SP5 - onramp documentation updates

**Group 3** (after Group 2):
- SP6 - Structure documentation

**Group 4** (after all):
- SP7 - Final verification

**Not recommended unless urgent** - sequential is clearer.

---

## Dependency Graph

### Phase 1 Dependencies

```
SP1 (Root README)
 ├─→ SP2 (QUICK-START)
 └─→ SP3 (TEMPLATE-USAGE.md)
      └─→ SP4 (Migration Plans)
           └─→ SP5 (onramp README)
                └─→ SP6 (STRUCTURE.md)
                     └─→ SP7 (Verification)
                          └─→ SP8 (Fork)
```

### Phase 2 Dependencies

```
SP8 (Fork to blank-poc)
 ├─→ SP9 (Remove Robinhood)
 └─→ SP10 (Hello World)
      └─→ SP11 (Finalize Docs)
           └─→ SP12 (Verification)
```

---

## Success Criteria Checklist

### Phase 1: robinhood-connect-poc Polish

#### Documentation Quality
- [ ] Root README clearly shows template origin
- [ ] QUICK-START is implementation-focused
- [ ] TEMPLATE-USAGE.md is comprehensive
- [ ] Migration plans referenced in docs/PLANNING-METHODOLOGY.md
- [ ] All cross-references work correctly

#### Structure Quality
- [ ] Template → implementation pattern is clear
- [ ] Professional, polished appearance
- [ ] Clear separation: root (template-aware) vs onramp (implementation)
- [ ] Ready to fork as template source

#### Technical Quality
- [ ] All documentation renders correctly
- [ ] No broken links
- [ ] Consistent formatting throughout
- [ ] Clear navigation paths

### Phase 2: blank-poc Template Creation

#### Template Quality
- [ ] Clean, generic provider-api example
- [ ] Hello world app demonstrates structure
- [ ] No Robinhood-specific content
- [ ] libs/shared documented and usable

#### Documentation Quality
- [ ] Template-focused documentation
- [ ] Clear usage instructions
- [ ] Generic pattern examples
- [ ] Ready for customization

#### Usability
- [ ] New user can understand template quickly
- [ ] Clear path from template to implementation
- [ ] Examples demonstrate best practices
- [ ] Template is reusable for future POCs

---

## Key Resources

### Current State
- [Current README.md](../../README.md)
- [Current QUICK-START.md](../../QUICK-START.md)
- [robinhood-onramp/README.md](../../robinhood-onramp/README.md)
- [robinhood-onramp/docs/](../../robinhood-onramp/docs/)

### Gold Standards
- [robinhood-backend-alignment Plan](../robinhood-backend-alignment/) - Example of completed planning
- [Planning Methodology](../../.cursor/rules/endaoment-workflow/planning-methodology.mdc) - Planning standards

### Reference Documentation
- [OVERVIEW.md](./OVERVIEW.md) - Complete project context
- [Sub-Plan 0](./sub-plans/sub-plan-0-drafting-plan.md) - Detailed planning

---

## Testing Strategy

### Validation After Each Sub-Plan

**Documentation Validation:**
```bash
# Check markdown rendering
# (Use markdown preview in editor)

# Check for broken links
# (Click through all links in updated files)

# Verify cross-references
# (Ensure relative paths work)
```

**Structure Validation:**
- Read through updated docs as new user
- Verify template pattern is clear
- Check professional appearance
- Ensure consistency

### Pre-Fork Validation (After SP7)

**Complete Review:**
- [ ] All Phase 1 sub-plans complete
- [ ] All documentation updated
- [ ] All links working
- [ ] Template pattern obvious
- [ ] Professional appearance
- [ ] Ready to fork

**Git Validation:**
```bash
# Ensure clean state
git status

# Verify all commits
git log --oneline --grep="templatization"

# Check for uncommitted changes
git diff
```

### Post-Fork Validation (After SP8)

**Verify Fork:**
- [ ] All files transferred
- [ ] Git history intact
- [ ] README reflects new repo
- [ ] Can clone blank-poc
- [ ] Ready for Phase 2 work

---

## Critical Warnings

### ⚠️ CRITICAL: Work in Feature Branch (Phase 1)

**DO NOT work directly on main branch**

```bash
# Start Phase 1
git checkout -b feature/templatization-prep
git push -u origin feature/templatization-prep
```

**Before merging to main:**
- Complete all Phase 1 sub-plans
- Verify all success criteria
- Get team review
- Test documentation thoroughly

### ⚠️ CRITICAL: Preserve .cursor/plans/

**DO NOT delete or modify existing plans**

Keep these intact:
- `.cursor/plans/robinhood-backend-alignment/`
- `.cursor/plans/robinhood-asset-preselection/`
- `.cursor/plans/robinhood-legacy-cleanup/`
- `.cursor/plans/robinhood-connect-poc/`

**Only add references to them in docs**

### ⚠️ CRITICAL: No Code Changes in Phase 1

**Phase 1 is documentation only**

DO NOT change:
- Code in `robinhood-onramp/app/`
- Code in `robinhood-onramp/libs/`
- Test files
- Config files (except if needed for clarity)

ONLY change:
- Documentation files (*.md)
- Create new documentation
- Update cross-references

### ⚠️ CRITICAL: Fork Process (SP8)

**Before forking:**
- [ ] Complete Phase 1
- [ ] Merge to main
- [ ] Verify clean state
- [ ] Document current commit hash

**During fork:**
- Verify all files transfer
- Check .gitignore hasn't excluded needed files
- Test clone of blank-poc
- Document fork in implementation log

---

## Progress Tracking

### Phase 1 Progress

Track completion with implementation logs:

```bash
# After completing each sub-plan
cd implementation-logs/
# Create log with actual file creation timestamp
touch YYYYMMDD-HHMM-SP{N}-COMPLETE.md
```

**Log Format**: See [Planning Methodology](../../.cursor/rules/endaoment-workflow/planning-methodology.mdc)

### Commit Pattern

```bash
# After each sub-plan
git add .
git commit -m "templatization: SP{N} - {brief description}"

# Example:
git commit -m "templatization: SP1 - root README template origin style"
git commit -m "templatization: SP3 - create TEMPLATE-USAGE.md"
```

---

## Common Issues and Solutions

### Issue: Template Pattern Not Clear

**Symptom**: After SP1-3, template origin not obvious

**Solution**:
- Add clearer headers indicating template origin
- Strengthen TEMPLATE-USAGE.md
- Add more cross-references
- Include directory structure diagrams
- Get feedback from someone unfamiliar

**Check**: Can new person understand template pattern in < 2 minutes?

### Issue: Broken Links After Updates

**Symptom**: Links don't work after restructuring

**Solution**:
- Use relative paths consistently
- Update all references when moving content
- Test links after each change
- Keep checklist of common link locations

**Prevention**: Check links after every sub-plan

### Issue: Documentation Duplication

**Symptom**: Same content in multiple places

**Solution**:
- Create single source of truth
- Use cross-references instead of copying
- Link rather than duplicate
- Keep root docs high-level, onramp docs detailed

**Pattern**: Root = overview → onramp = details

### Issue: Fork Missing Files

**Symptom**: Some files not in blank-poc after fork

**Solution**:
- Check .gitignore before forking
- Verify git status is clean
- Use git status after fork
- Document all expected files

**Prevention**: Create file inventory before fork

---

## Agent Implementation Prompts

### Starting Phase 1

```
I need to implement the templatization-prep plan for robinhood-connect-poc.

Context:
- Read sub-plan-0-drafting-plan.md completely
- Review OVERVIEW.md for project context
- Understand two-phase approach

Starting with Sub-Plan 1:
- Read current README.md (root)
- Understand template origin goal
- Update to show template-generated pattern
- Create implementation log when complete

Please confirm you've reviewed the context before we begin.
```

### Checkpoint After SP3

```
Checkpoint: Verify template pattern clarity after SP1-3.

Review:
- Root README.md
- QUICK-START.md
- TEMPLATE-USAGE.md

Questions:
1. Is template origin obvious to new reader?
2. Does TEMPLATE-USAGE.md comprehensively explain pattern?
3. Are cross-references working?
4. Is professional appearance maintained?

If any issues, address before proceeding to SP4.
```

### Pre-Fork Checkpoint (After SP7)

```
Critical checkpoint before forking to blank-poc.

Verification:
1. Complete Phase 1 success criteria checklist
2. Verify all links work
3. Check git state is clean
4. Review all updated documentation
5. Get team feedback if possible

Do NOT proceed to SP8 (fork) until all checks pass.

Please confirm readiness to fork.
```

---

## Rollback Information

### Quick Rollback (Single Sub-Plan)

```bash
# If sub-plan creates issues
git log --oneline -10
git reset --hard <commit-before-subplan>
```

### Full Rollback (Entire Phase 1)

```bash
# Reset entire feature branch
git checkout main
git branch -D feature/templatization-prep
# Start over if needed
```

### Phase 2 Rollback

```bash
# Simply delete blank-poc repository
# Fix issues in robinhood-connect-poc
# Re-fork when ready
```

**See [OVERVIEW.md](./OVERVIEW.md#rollback-procedure) for detailed procedures**

---

## Next Steps

### To Begin Implementation

1. **Read Planning Documents**:
   - [ ] Read this README completely
   - [ ] Read [OVERVIEW.md](./OVERVIEW.md)
   - [ ] Read [Sub-Plan 0](./sub-plans/sub-plan-0-drafting-plan.md)

2. **Prepare Environment**:
   ```bash
   cd /Users/rheeger/Code/endaoment/robinhood-connect-poc
   git checkout -b feature/templatization-prep
   git push -u origin feature/templatization-prep
   ```

3. **Start Sub-Plan 1**:
   - Create detailed sub-plan-1 document in `sub-plans/`
   - Follow planning methodology
   - Execute sub-plan
   - Create implementation log
   - Commit changes

4. **Continue Through Phase 1**:
   - Complete sub-plans 2-7 sequentially
   - Create implementation logs
   - Verify after each sub-plan
   - Commit with clear messages

5. **Fork to blank-poc (SP8)**:
   - Complete Phase 1 verification
   - Execute fork process
   - Create implementation log
   - Begin Phase 2 in new repo

### After Completion

**Phase 1 Complete**:
- Merge feature branch to main
- Update team documentation
- Reference as example

**Phase 2 Complete**:
- Publish blank-poc template
- Create usage documentation
- Share with team
- Document in endaoment docs

---

## Documentation

### Files in This Plan

- **[README.md](./README.md)** (this file) - Navigation and quick reference
- **[OVERVIEW.md](./OVERVIEW.md)** - Comprehensive project context
- **[sub-plans/sub-plan-0-drafting-plan.md](./sub-plans/sub-plan-0-drafting-plan.md)** - Complete planning document
- **[implementation-logs/](./implementation-logs/)** - Progress tracking logs

### Files to Create

**Sub-Plans**:
- `sub-plans/sub-plan-1-root-readme-template-origin.md`
- `sub-plans/sub-plan-2-root-quickstart-implementation.md`
- `sub-plans/sub-plan-3-create-template-usage.md`
- `sub-plans/sub-plan-4-move-migration-plans.md`
- `sub-plans/sub-plan-5-polish-onramp-readme.md`
- `sub-plans/sub-plan-6-update-structure-doc.md`
- `sub-plans/sub-plan-7-final-verification.md`
- `sub-plans/sub-plan-8-fork-to-blank-poc.md`

**Implementation Logs** (as work progresses):
- `implementation-logs/YYYYMMDD-HHMM-PLANNING-COMPLETE.md`
- `implementation-logs/YYYYMMDD-HHMM-SP1-COMPLETE.md`
- `implementation-logs/YYYYMMDD-HHMM-SP2-COMPLETE.md`
- ... (one per sub-plan)
- `implementation-logs/YYYYMMDD-HHMM-PHASE-1-COMPLETE.md`

---

**Last Updated**: 2025-10-26  
**Status**: Ready for Implementation  
**Next Action**: Begin Sub-Plan 1 - Root README Template Origin Style

