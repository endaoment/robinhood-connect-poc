# Sub-Plan 6: Test Script and Artifact Cleanup

**Status**: Ready for Implementation
**Priority**: Low
**Dependencies**: Sub-Plans 1-5
**Estimated Time**: 1 hour

---

## Context Required

### Understanding the Problem

The `scripts/` directory contains a mix of:
- **Production utilities**: Scripts needed for setup and maintenance
- **Development test scripts**: Scripts used during development for testing URL combinations
- **Old test artifacts**: JSON and TypeScript files generated during testing

According to sub-plan-0:

**Files to DELETE** (development only):
- `test-url-combinations.py`
- `test-daffy-style-urls.py`
- `test_transfer_no_preselect.py`
- `*_20251020_*.json` (old test results)
- `*_20251020_*.ts` (old generated configs)

**Files to KEEP** (production utilities):
- `get_all_robinhood_assets.py` (onramp capability)
- `get_trading_balance_addresses.py` (onramp capability)
- `generate_prime_wallets.py` (setup utility)
- `prime_api_client.py` (integration)
- `start-with-ngrok.sh` (development helper)
- `requirements.txt`
- `README.md`

---

## Objectives

1. Delete development test scripts
2. Delete old test result files (JSON/TS from Oct 20, 2025)
3. Keep production utility scripts
4. Update `scripts/README.md` to reflect remaining scripts
5. Verify no production code depends on deleted scripts
6. Clean and organized scripts directory

---

## Precise Implementation Steps

### Step 1: Audit Scripts Directory

**Purpose**: Identify all files in scripts directory

**Commands**:
```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/scripts

# List all files
ls -lah

# Count each type
echo "Python files:"
ls -1 *.py 2>/dev/null | wc -l

echo "JSON files:"
ls -1 *.json 2>/dev/null | wc -l

echo "TypeScript files:"
ls -1 *.ts 2>/dev/null | wc -l
```

**Expected Output**: List of all scripts with sizes and dates

**Document**:
```
Files to DELETE:
- [ ] test-url-combinations.py
- [ ] test-daffy-style-urls.py
- [ ] test_transfer_no_preselect.py
- [ ] [list all *_20251020_*.json files]
- [ ] [list all *_20251020_*.ts files]

Files to KEEP:
- [ ] get_all_robinhood_assets.py
- [ ] get_trading_balance_addresses.py
- [ ] generate_prime_wallets.py
- [ ] prime_api_client.py
- [ ] start-with-ngrok.sh
- [ ] requirements.txt
- [ ] README.md
```

---

### Step 2: Verify No Dependencies on Test Scripts

**Purpose**: Ensure production code doesn't import test scripts

**Commands**:
```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Search for imports of test scripts
grep -r "test-url-combinations\|test-daffy-style-urls\|test_transfer_no_preselect" --include="*.ts" --include="*.tsx" --include="*.py" . | grep -v node_modules

# Search for references in package.json
cat package.json | grep -i "test.*script"
```

**Expected Output**: ZERO results (test scripts should not be imported anywhere)

**If Found**: Review each reference and remove it before deleting scripts

---

### Step 3: Delete Test URL Combinations Script

**File**: `robinhood-onramp/scripts/test-url-combinations.py`

**Purpose**: This script was used to test 31 different URL variations during development

**Pre-Check**:
```bash
# Verify file exists
ls -la scripts/test-url-combinations.py

# Quick check of what it does (optional)
head -20 scripts/test-url-combinations.py
```

**Action**: Delete the file

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
rm scripts/test-url-combinations.py
```

**Validation**:
```bash
ls scripts/test-url-combinations.py 2>&1
# Should output: "No such file or directory"
```

---

### Step 4: Delete Daffy Style URL Test Script

**File**: `robinhood-onramp/scripts/test-daffy-style-urls.py`

**Purpose**: Development script for testing the Daffy-style approach

**Action**: Delete the file

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
rm scripts/test-daffy-style-urls.py
```

**Validation**:
```bash
ls scripts/test-daffy-style-urls.py 2>&1
# Should output: "No such file or directory"
```

---

### Step 5: Delete Transfer No Preselect Test Script

**File**: `robinhood-onramp/scripts/test_transfer_no_preselect.py`

**Purpose**: Development script for testing balance-first approach (which didn't work)

**Action**: Delete the file

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp
rm scripts/test_transfer_no_preselect.py
```

**Validation**:
```bash
ls scripts/test_transfer_no_preselect.py 2>&1
# Should output: "No such file or directory"
```

---

### Step 6: Delete Old Test Result JSON Files

**Files**: `robinhood-onramp/scripts/*_20251020_*.json`

**Purpose**: Remove old test results from October 20, 2025

**Action**: List and delete

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/scripts

# List all matching files
ls -la *_20251020_*.json

# Delete all matching files
rm *_20251020_*.json
```

**Expected Deletions**:
- `robinhood_assets_addresses_20251020_211813.json`
- `robinhood_assets_addresses_20251020_211917.json`
- `robinhood-assets-config_20251020_212546.json`
- `robinhood-assets-config_20251020_212919.json`
- `robinhood-assets-config_20251020_213308.json`
- `robinhood-assets-config_20251020_213357.json`
- `trading_balance_addresses_20251020_211638.json`

**Validation**:
```bash
ls scripts/*_20251020_*.json 2>&1
# Should output "No such file or directory" or similar (no matches)
```

---

### Step 7: Delete Old Generated TypeScript Files

**Files**: `robinhood-onramp/scripts/*_20251020_*.ts`

**Purpose**: Remove old generated config files from October 20, 2025

**Action**: List and delete

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/scripts

# List all matching files
ls -la *_20251020_*.ts

# Delete all matching files
rm *_20251020_*.ts
```

**Expected Deletions**:
- `robinhood_assets_addresses_20251020_211813.ts`
- `robinhood_assets_addresses_20251020_211917.ts`
- `robinhood-assets-config_20251020_212546.ts`
- `robinhood-assets-config_20251020_212919.ts`
- `robinhood-assets-config_20251020_213308.ts`
- `robinhood-assets-config_20251020_213357.ts`

**Validation**:
```bash
ls scripts/*_20251020_*.ts 2>&1
# Should output "No such file or directory" or similar (no matches)
```

---

### Step 8: Review Remaining Files

**Purpose**: Verify we're keeping the right scripts

**Action**: List what remains

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/scripts

ls -lh
```

**Expected Remaining Files**:
- `get_all_robinhood_assets.py` ✅ (onramp capability)
- `get_trading_balance_addresses.py` ✅ (onramp capability)
- `generate_prime_wallets.py` ✅ (setup utility)
- `prime_api_client.py` ✅ (integration)
- `start-with-ngrok.sh` ✅ (development helper)
- `requirements.txt` ✅ (Python dependencies)
- `README.md` ✅ (documentation)
- `robinhood-assets-config.json` ✅ (current config)
- `robinhood-assets-config.ts` ✅ (current config)

**May Also Have** (check if needed):
- `check_api_key.py`
- `check_creds.py`
- `create_final_config.py`
- `list_all_wallets.py`
- `test_prime_api.py`
- `test_robinhood_api_key_only.py`
- `test_single_wallet.py`
- `test_with_sdk.py`
- `verify_api_ready.py`
- `wait_for_activation.py`
- Any `.log` files
- `test-url-generation.ts`
- `validate-asset-config.ts`

**Decision for "test_*" and utility scripts**:
- If it's a one-time check/test that's no longer needed: **DELETE**
- If it's useful for troubleshooting or setup: **KEEP**

**Recommended Approach**: Keep all remaining scripts unless they're clearly obsolete development tests

---

### Step 9: Update scripts/README.md

**File**: `robinhood-onramp/scripts/README.md`

**Purpose**: Document the remaining scripts

**Action**: Read current README

```bash
cat scripts/README.md
```

**Update Content**:

Remove references to deleted scripts:
- Remove `test-url-combinations.py` section
- Remove `test-daffy-style-urls.py` section
- Remove `test_transfer_no_preselect.py` section
- Remove sections about old test result files

Add clear descriptions of remaining scripts:

```markdown
# Scripts Directory

This directory contains utility scripts for Robinhood Connect integration.

## Production Utility Scripts

### get_all_robinhood_assets.py
Fetches the complete list of supported assets from Robinhood API.

**Usage**:
```bash
python3 get_all_robinhood_assets.py
```

### get_trading_balance_addresses.py
Retrieves trading balance addresses for configured wallets.

**Usage**:
```bash
python3 get_trading_balance_addresses.py
```

### generate_prime_wallets.py
Generates Prime wallet configuration for Robinhood integration.

**Usage**:
```bash
python3 generate_prime_wallets.py
```

### prime_api_client.py
Python client for interacting with Coinbase Prime API.

**Usage**: Import and use in other scripts
```python
from prime_api_client import PrimeAPIClient
```

## Development Helpers

### start-with-ngrok.sh
Starts the development server with ngrok for testing callbacks locally.

**Usage**:
```bash
./start-with-ngrok.sh
```

## Configuration Files

- `robinhood-assets-config.json` - Current asset configuration (JSON)
- `robinhood-assets-config.ts` - Current asset configuration (TypeScript)

## Setup

Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Notes

- All Python scripts require Python 3.11+
- Ensure environment variables are set (see main README.md)
- For production use, always use the latest versions of config files (no timestamps in filename)
```

**Validation**:
```bash
# Verify README doesn't reference deleted files
grep -i "test-url-combinations\|test-daffy-style-urls\|test_transfer_no_preselect\|20251020" scripts/README.md
# Should return ZERO results
```

---

### Step 10: Verify Production Code Still Works

**Purpose**: Ensure scripts directory cleanup didn't break anything

**Action**: Run production utilities to verify they still work

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/scripts

# Test Python script (if you have credentials configured)
python3 get_all_robinhood_assets.py --help 2>/dev/null || echo "Script exists and is executable"

# Verify shell script
cat start-with-ngrok.sh | head -5
```

**Validation**:
- Scripts exist
- No import errors
- README accurately describes what's there

---

## Deliverables Checklist

After completing all steps, verify:

- [ ] `test-url-combinations.py` deleted
- [ ] `test-daffy-style-urls.py` deleted
- [ ] `test_transfer_no_preselect.py` deleted
- [ ] All `*_20251020_*.json` files deleted
- [ ] All `*_20251020_*.ts` files deleted
- [ ] Production scripts remain (`get_all_robinhood_assets.py`, etc.)
- [ ] `scripts/README.md` updated
- [ ] No broken imports in codebase
- [ ] No references to deleted scripts in documentation

---

## Validation Steps

### Validation 1: Verify Deletions

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/scripts

# Check for deleted test scripts
ls test-url-combinations.py test-daffy-style-urls.py test_transfer_no_preselect.py 2>&1 | grep "No such file"

# Check for deleted artifacts
ls *_20251020_*.json *_20251020_*.ts 2>&1 | grep "No such file"
```

**Success Criteria**: All deleted files return "No such file or directory"

### Validation 2: Verify Production Scripts Remain

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp/scripts

# List remaining Python scripts
ls -1 *.py

# Should include:
# - get_all_robinhood_assets.py
# - get_trading_balance_addresses.py
# - generate_prime_wallets.py
# - prime_api_client.py
```

### Validation 3: Check for References

```bash
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-onramp

# Search for references to deleted scripts
grep -r "test-url-combinations\|test-daffy-style-urls\|test_transfer_no_preselect\|20251020" --include="*.md" --include="*.json" --include="*.ts" --include="*.tsx" . | grep -v node_modules

# Should return ZERO results
```

### Validation 4: README Accuracy

```bash
# Verify README only describes existing scripts
cat scripts/README.md
# Manually verify each script mentioned exists
```

---

## Backward Compatibility Checkpoint

**Purpose**: Verify application still works after scripts cleanup

### Manual Testing:

1. **Start Development Server**:
   ```bash
   npm run dev
   ```
   - Should start without errors
   - No missing script errors

2. **Test Transfer Flow**:
   - Navigate to dashboard
   - Select asset
   - Initiate transfer
   - Should work normally

3. **Check for Script Import Errors**:
   - Look at browser console
   - Look at server console
   - Should be no errors about missing scripts

### Success Criteria:

- ✅ Application starts successfully
- ✅ No console errors about missing scripts
- ✅ Transfer flow works normally
- ✅ No broken imports

### If Checkpoint Fails:

1. **Error: "Cannot find module './scripts/test-*.py'"**:
   - Search for where it's imported: `grep -r "test-*.py" .`
   - Remove the import

2. **Missing configuration file**:
   - Verify you didn't delete `robinhood-assets-config.json` (should be kept)
   - Restore if needed: `git checkout scripts/robinhood-assets-config.json`

---

## Common Issues and Solutions

### Issue 1: Accidentally deleted production script

**Symptom**: Application fails with "module not found" error

**Solution**:
```bash
# Restore from git
git checkout scripts/[filename].py
```

### Issue 2: Can't tell if script is needed

**Symptom**: Unsure whether to keep a test script

**Solution**:
1. Search for imports: `grep -r "script-name" .`
2. If ZERO results and name contains "test": DELETE
3. If unsure: KEEP (can remove later)

### Issue 3: README still references deleted files

**Symptom**: README mentions test scripts

**Solution**: Review Step 9, update README to remove those sections

---

## Integration Points

### Provides to Next Sub-Plans:

- **Sub-Plan 7**: Cleaner directory structure
- **Sub-Plan 8**: Less clutter for final validation

### Dependencies from Previous Sub-Plans:

- **Sub-Plan 5**: Updated docs don't reference test scripts

---

## Next Steps

After completing this sub-plan:

1. ✅ Create implementation log: `YYYYMMDD-HHMM-SP6-COMPLETE.md`
2. ✅ Commit changes: `git commit -m "SP6: Remove development test scripts and artifacts"`
3. ⬜ Proceed to **Sub-Plan 7: Naming Consistency Pass**

---

## Notes for Implementers

### Critical Checkpoints:

- **Before deleting**: Verify file is not imported anywhere
- **After deleting**: Verify application still starts
- **Double-check**: Don't delete production utility scripts

### Common Pitfalls:

- ❌ Deleting `robinhood-assets-config.json` (should be kept)
- ❌ Deleting production utility scripts
- ❌ Forgetting to update README

### Time-Saving Tips:

- Use wildcard deletion for timestamped files: `rm *_20251020_*.*`
- Keep a list of what you deleted (for rollback if needed)
- Test application immediately after deletions

### Safe Deletion Pattern:

For each file:
1. Verify it's in the DELETE list
2. Search for imports: `grep -r "filename" .`
3. If zero imports, delete
4. Immediately run `npm run dev` to test

---

**Status**: ⬜ Ready for Implementation  
**Estimated Duration**: 1 hour  
**Complexity**: Low  
**Risk Level**: 🟢 Low (test artifacts only)

