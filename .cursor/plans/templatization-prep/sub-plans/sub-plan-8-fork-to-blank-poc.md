# Sub-Plan 8: Fork to blank-poc Repository

**Status**: Pending  
**Priority**: Critical  
**Dependencies**: Sub-Plan 7 (Phase 1 verification complete)  
**Estimated Complexity**: Medium

---

## Context Required

### Prerequisites

**Completed Work:**
- Sub-Plans 1-7 complete (Phase 1)
- All documentation polished
- Template pattern established
- Repository ready to fork

**Current Repository:**
- Location: `/Users/rheeger/Code/endaoment/robinhood-connect-poc`
- Status: Template-generated appearance
- Branch: `feature/templatization-prep` or `main`

**Target Repository:**
- Name: `blank-poc`
- Purpose: Clean template for future POCs
- Location: TBD (GitHub organization)

### Understanding Required

**Fork Process:**
- Create new blank-poc repository
- Copy all current state
- Verify complete file transfer
- Initialize with clean commit
- Document forking process

**Phase 2 Note:**
- Sub-Plans 9-12 will be created in blank-poc repository
- Work continues in new repo
- robinhood-connect-poc remains as reference implementation

---

## Objectives

1. Create new blank-poc GitHub repository
2. Fork/copy robinhood-connect-poc current state
3. Verify all files transferred correctly
4. Initialize blank-poc with clean commits
5. Document forking process
6. Prepare for Phase 2 work in blank-poc

---

## Precise Implementation Steps

### Step 1: Prepare Source Repository

**Action**: Ensure robinhood-connect-poc is in clean state

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc

# Verify clean state
git status

# If on feature branch, optionally merge to main
git checkout main
git merge feature/templatization-prep  # If desired

# Pull latest changes
git pull origin main

# Verify all commits
git log --oneline -20
```

**Checklist:**
- [ ] Working directory clean
- [ ] All Phase 1 changes committed
- [ ] On appropriate branch (main or feature branch)
- [ ] No uncommitted changes
- [ ] Ready to fork

**Expected**: Clean repository state

---

### Step 2: Create blank-poc Repository on GitHub

**Action**: Create new repository in appropriate organization

**GitHub UI Steps:**
1. Navigate to GitHub organization/account
2. Click "New repository"
3. Name: `blank-poc`
4. Description: "POC template for rapid API integration development with backend migration readiness"
5. Visibility: Private or Public (as appropriate)
6. Do NOT initialize with README (we'll push existing)
7. Click "Create repository"

**Checklist:**
- [ ] Repository created on GitHub
- [ ] Correct name: `blank-poc`
- [ ] Appropriate visibility
- [ ] No initialization (empty repo)
- [ ] Repository URL copied

**Repository URL Format**: `https://github.com/{org}/blank-poc.git`

---

### Step 3: Clone and Push to blank-poc

**Action**: Clone robinhood-connect-poc and push to blank-poc

**Commands:**
```bash
# Navigate to parent directory
cd /Users/rheeger/Code/endaoment

# Clone robinhood-connect-poc to blank-poc directory
git clone robinhood-connect-poc blank-poc

# Navigate to new directory
cd blank-poc

# Update remote to blank-poc
git remote remove origin
git remote add origin https://github.com/{org}/blank-poc.git

# Verify remote
git remote -v

# Push to blank-poc
git push -u origin main

# If on feature branch instead:
# git push -u origin feature/templatization-prep
```

**Validation:**
```bash
# Verify push succeeded
git log --oneline -5

# Check remote tracking
git branch -vv
```

**Checklist:**
- [ ] blank-poc directory created
- [ ] All files present
- [ ] Remote updated to blank-poc
- [ ] Pushed to blank-poc repository
- [ ] Verify on GitHub UI

---

### Step 4: Verify Complete File Transfer

**Action**: Ensure all files transferred to blank-poc

**File Inventory Check:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc

# Count files in source and target
find /Users/rheeger/Code/endaoment/robinhood-connect-poc -type f | wc -l
find . -type f | wc -l

# Check specific important files
ls -la README.md
ls -la QUICK-START.md
ls -la TEMPLATE-USAGE.md
ls -la robinhood-onramp/README.md
ls -la robinhood-onramp/docs/PLANNING-METHODOLOGY.md
ls -la robinhood-onramp/docs/STRUCTURE.md

# Check planning directory
ls -la .cursor/plans/templatization-prep/
```

**Critical Files Checklist:**
- [ ] Root README.md
- [ ] Root QUICK-START.md
- [ ] Root TEMPLATE-USAGE.md
- [ ] robinhood-onramp/ directory
- [ ] robinhood-onramp/app/
- [ ] robinhood-onramp/libs/
- [ ] robinhood-onramp/docs/
- [ ] .cursor/plans/
- [ ] All config files
- [ ] All tests

**Expected**: All files present in blank-poc

---

### Step 5: Verify Git History

**Action**: Ensure complete git history transferred

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc

# Check commit history
git log --oneline --all --graph -20

# Verify Phase 1 commits present
git log --grep="templatization"

# Check branches
git branch -a

# Verify tags (if any)
git tag
```

**Checklist:**
- [ ] Full commit history present
- [ ] All Phase 1 commits visible
- [ ] Branches transferred correctly
- [ ] Git history intact

---

### Step 6: Update blank-poc README Reference

**Action**: Add note to blank-poc README about Phase 2 work

**File**: `/Users/rheeger/Code/endaoment/blank-poc/README.md`

**Add at Top (after header):**
```markdown

> ⚠️ **Phase 2 In Progress**: This repository is being transformed into the blank-poc template. See `.cursor/plans/templatization-prep/` for the transformation plan. Sub-Plans 9-12 will complete the template creation.

```

**Commit:**
```bash
git add README.md
git commit -m "templatization: note Phase 2 work in progress"
git push origin main
```

**Validation**: Note visible on GitHub

---

### Step 7: Create Phase 2 Planning Structure

**Action**: Set up planning structure for Phase 2 work

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/.cursor/plans/templatization-prep

# Create note about Phase 2
cat > PHASE-2-WORK.md << 'EOF'
# Phase 2: Template Creation Work

This file marks the beginning of Phase 2 work in the blank-poc repository.

## Phase 2 Sub-Plans (To Be Created)

**Sub-Plan 9**: Remove Robinhood-Specific Content
- Remove `libs/coinbase/`
- Convert `libs/robinhood/` to `libs/provider-api/`
- Update all Robinhood references to generic provider

**Sub-Plan 10**: Simplify to Hello World
- Create hello world landing page
- Keep shared UI components
- Remove Robinhood dashboard and logic
- Remove provider-specific API routes

**Sub-Plan 11**: Finalize Template Documentation
- Update root README to template-focus
- Complete TEMPLATE-USAGE.md
- Update all docs/ to generic patterns
- Remove implementation specifics

**Sub-Plan 12**: Verification and Publishing
- Verify template is clean
- Test template usage
- Validate all documentation
- Create release

## Creating Phase 2 Sub-Plans

These detailed sub-plans will be created in blank-poc repository following the same methodology as Phase 1.

See `.cursor/plans/templatization-prep/sub-plans/sub-plan-0-drafting-plan.md` for Phase 2 outlines.

---

**Created**: [Date]  
**Location**: blank-poc repository  
**Next Step**: Create detailed sub-plan-9.md
EOF

git add PHASE-2-WORK.md
git commit -m "templatization: Phase 2 planning structure"
git push origin main
```

**Validation**: Phase 2 planning directory ready

---

### Step 8: Create Comprehensive Fork Log

**Action**: Document forking process

**File**: `implementation-logs/YYYYMMDD-HHMM-SP8-FORK-COMPLETE.md`

**Content Template:**
```markdown
# Sub-Plan 8 Complete - Fork to blank-poc

**Date**: YYYY-MM-DD HH:MM  
**Duration**: [time taken]  
**Status**: ✅ COMPLETE

---

## Summary

Successfully forked robinhood-connect-poc to blank-poc repository. Phase 1 complete, Phase 2 begins in blank-poc.

## Fork Details

**Source Repository**: robinhood-connect-poc  
**Source Location**: `/Users/rheeger/Code/endaoment/robinhood-connect-poc`  
**Source Commit**: [commit hash]

**Target Repository**: blank-poc  
**Target Location**: `/Users/rheeger/Code/endaoment/blank-poc`  
**GitHub URL**: https://github.com/{org}/blank-poc  
**Initial Commit**: [commit hash]

## Files Transferred

**Total Files**: [count]  
**Total Size**: [size]

**Key Directories:**
- `robinhood-onramp/` - Complete implementation
- `.cursor/plans/` - Planning artifacts
- Root documentation (3 files)

## Verification Results

**File Transfer**: ✅ COMPLETE  
[All files verified present]

**Git History**: ✅ INTACT  
[All commits preserved]

**GitHub Push**: ✅ SUCCESS  
[Repository visible on GitHub]

**Phase 2 Structure**: ✅ READY  
[Planning directory prepared]

## Fork Process Steps

1. ✅ Prepared source repository (clean state)
2. ✅ Created blank-poc repository on GitHub
3. ✅ Cloned and pushed to blank-poc
4. ✅ Verified complete file transfer
5. ✅ Verified git history
6. ✅ Updated README with Phase 2 note
7. ✅ Created Phase 2 planning structure
8. ✅ Documented fork process

## Issues Encountered

[List any issues, or "None"]

## Deviations from Plan

[List any deviations, or "None - followed plan exactly"]

## Repository Status

**robinhood-connect-poc**:
- Status: Reference implementation complete
- Purpose: Example of template usage
- Maintains: All Robinhood implementation

**blank-poc**:
- Status: Ready for Phase 2 transformation
- Purpose: Template for future POCs
- Next: Sub-Plans 9-12 (template creation)

## Next Steps

1. Switch to blank-poc repository
2. Create Sub-Plan 9: Remove Robinhood Content
3. Create Sub-Plan 10: Simplify to Hello World
4. Create Sub-Plan 11: Finalize Template Docs
5. Create Sub-Plan 12: Verification
6. Execute Phase 2 sub-plans

## Phase 1 Completion

With SP8 complete, Phase 1 is finished:
- ✅ robinhood-connect-poc polished
- ✅ Template pattern established
- ✅ Documentation comprehensive
- ✅ Repository forked
- ✅ Ready for Phase 2

## Time Summary

**Phase 1 Total**: [total time SP1-SP8]
- SP1: [time]
- SP2: [time]
- SP3: [time]
- SP4: [time]
- SP5: [time]
- SP6: [time]
- SP7: [time]
- SP8: [time]

---

**Sub-Plan 8 Status**: COMPLETE  
**Phase 1 Status**: COMPLETE  
**Phase 2 Location**: blank-poc repository  
**Next Work**: Create SP9-SP12 in blank-poc
```

**Commit in robinhood-connect-poc:**
```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc
git add .cursor/plans/templatization-prep/implementation-logs/YYYYMMDD-HHMM-SP8-FORK-COMPLETE.md
git commit -m "templatization: SP8 complete - forked to blank-poc"
git push origin main  # or feature branch
```

**Validation**: Fork process documented

---

## Deliverables Checklist

- [ ] Source repository in clean state
- [ ] blank-poc repository created on GitHub
- [ ] All files transferred to blank-poc
- [ ] Git history intact
- [ ] blank-poc pushed to GitHub
- [ ] README updated with Phase 2 note
- [ ] Phase 2 planning structure created
- [ ] Fork completion log created
- [ ] robinhood-connect-poc log committed

---

## Validation Steps

### Step 1: Source Repository Clean

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc
git status
```

**Expected**: No uncommitted changes

---

### Step 2: blank-poc Repository Exists

**Check**:
- Visit https://github.com/{org}/blank-poc
- Repository visible
- Initial commit present
- Files visible

**Expected**: Repository accessible on GitHub

---

### Step 3: File Transfer Complete

```bash
cd /Users/rheeger/Code/endaoment/blank-poc

# Critical files present?
test -f README.md && echo "✅ README.md"
test -f TEMPLATE-USAGE.md && echo "✅ TEMPLATE-USAGE.md"
test -d robinhood-onramp && echo "✅ robinhood-onramp/"
test -d .cursor/plans && echo "✅ .cursor/plans/"
```

**Expected**: All checks pass

---

### Step 4: Git History Intact

```bash
cd /Users/rheeger/Code/endaoment/blank-poc
git log --oneline --grep="templatization" | wc -l
```

**Expected**: 7+ commits (SP1-SP7 plus SP8 README update)

---

### Step 5: Ready for Phase 2

**Checklist:**
- [ ] blank-poc repository accessible
- [ ] All files present
- [ ] Git history complete
- [ ] Planning structure ready
- [ ] Documentation indicates Phase 2 work

**Expected**: Ready to begin Phase 2

---

## Backward Compatibility Checkpoint

**N/A** - This creates new repository, no infrastructure changes

---

## Common Issues and Solutions

### Issue 1: Repository Creation Fails

**Solution**:
- Check organization permissions
- Verify repository name available
- Try different visibility setting
- Contact organization admin if needed

---

### Issue 2: Push to blank-poc Fails

**Solution**:
```bash
# Verify remote
git remote -v

# Check authentication
git config --list | grep user

# Try re-adding remote
git remote remove origin
git remote add origin https://github.com/{org}/blank-poc.git
git push -u origin main
```

---

### Issue 3: File Transfer Incomplete

**Solution**:
```bash
# Re-clone from source
cd /Users/rheeger/Code/endaoment
rm -rf blank-poc
git clone robinhood-connect-poc blank-poc

# Repeat fork process
cd blank-poc
git remote remove origin
git remote add origin https://github.com/{org}/blank-poc.git
git push -u origin main
```

---

### Issue 4: Git History Missing

**Solution**:
- Ensure using `git clone` not copy
- Check that source repository has full history
- Verify `.git` directory transferred
- Re-clone if necessary

---

## Integration Points

### Completion of Phase 1

This sub-plan completes Phase 1:
- All documentation polished
- Template pattern established
- Repository forked
- Ready for Phase 2

### Beginning of Phase 2

After SP8:
- Work continues in blank-poc
- Sub-Plans 9-12 created there
- Robinhood content removed
- Template finalized

---

## Next Steps

After completing this sub-plan:

1. **Verify Fork Success**:
   - Check GitHub UI
   - Clone blank-poc locally
   - Verify all files

2. **Switch to blank-poc**:
   ```bash
   cd /Users/rheeger/Code/endaoment/blank-poc
   ```

3. **Create Phase 2 Sub-Plans**:
   - Sub-Plan 9: Remove Robinhood Content
   - Sub-Plan 10: Simplify to Hello World
   - Sub-Plan 11: Finalize Template Docs
   - Sub-Plan 12: Verification

4. **Begin Phase 2 Work**:
   - Execute SP9-SP12 in blank-poc
   - Transform to template
   - Complete templatization

5. **Final Status**:
   - robinhood-connect-poc: Reference implementation (complete)
   - blank-poc: Template repository (Phase 2 work)

---

## Success Criteria

- [ ] blank-poc repository created on GitHub
- [ ] All files transferred completely
- [ ] Git history intact
- [ ] Repository accessible
- [ ] Phase 2 structure ready
- [ ] Fork documented
- [ ] robinhood-connect-poc unchanged
- [ ] Ready for Phase 2 (SP9-SP12)

---

**Estimated Time**: 30-45 minutes  
**Complexity**: Medium  
**Risk Level**: 🟡 Medium - Repository operations, but reversible

---

## Notes

**Post-Fork Status**:

**robinhood-connect-poc** (This Repository):
- ✅ Phase 1 complete
- ✅ Template pattern established
- ✅ Serves as reference implementation
- ✅ Ready for use as example
- No further changes (unless bugs found)

**blank-poc** (New Repository):
- 📍 Phase 2 begins here
- Sub-Plans 9-12 to be created
- Template transformation work
- Will become clean template
- For future POC creation

**This is the handoff point between Phase 1 and Phase 2.**

