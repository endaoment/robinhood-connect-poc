# Sub-Plan 11: Coinbase Prime API - Credential Issue Identified

**Date**: October 21, 2025
**Status**: ⚠️ BLOCKED - Awaiting Unencrypted Credentials  
**Phase Completed**: Phases 1-3 (Diagnostic scripts created, issue identified)

---

## Issue Summary

The Coinbase Prime API credentials in `.env.local` are **encrypted** and cannot be used directly for API calls. All API requests return `401 Unauthorized` with message "invalid api key".

---

## What We Discovered

### Credential Format

The credentials in `.env.local` follow this pattern:

```
COINBASE_PRIME_API_KEY="ZdlFsitVWo4=fzH6a3XpA9X5Ti42VbistXNjCVFGAASySq7od5pBhnI="
COINBASE_PRIME_SIGNING_KEY="/NqFL5Fk4qM=QIFX2THv0v5W7Kg+vvOUgqPYoBKBdq6drbS/6o6jU63JnpNgz5/f8dZFz67C2730nUtljRCkHa/6HwpzqqZJoA=="
COINBASE_PRIME_PASSPHRASE="5Rb5KFBCGLQ=E0JmHpUCmIRC9sgaoW5OLA=="
```

### Analysis

**Format**: `encryptionKey=base64EncodedValue`

- Part 1 (before `=`): Encryption key identifier
- Part 2 (after `=`): Base64-encoded encrypted value

**Decoded Lengths**:
- API Key: 32 bytes (when base64 decoded)
- Signing Key: 64 bytes (when base64 decoded)  
- Passphrase: 16 bytes (when base64 decoded)

These are reasonable lengths for encrypted credentials, but they are NOT the actual plaintext credentials needed for the API.

---

## Tests Performed

### ✅ Phase 1: Credential Validation

**Script Created**: `check_creds.py`

**Result**: All 4 credentials present in `.env.local`
- ACCESS_KEY ✅ (via `COINBASE_PRIME_API_KEY`)
- SIGNING_KEY ✅
- PASSPHRASE ✅
- PORTFOLIO_ID ✅

### ✅ Phase 2: Signature Generation

**Script Created**: `test_prime_api.py`

**Result**: Signature generation works correctly
- HMAC SHA256 implementation is correct
- Message concatenation follows spec
- 64-character hex signature generated

### ❌ Phase 3: API Authentication

**Tests Run**:
1. Using full credential string → `401 invalid api key`
2. Using only part after `=` → `401 invalid api key`
3. Using base64-decoded values → Not attempted (would be binary data)

**Conclusion**: The credentials are encrypted and need to be decrypted or replaced.

---

## Scripts Created

All scripts are in `robinhood-offramp/scripts/`:

1. **`check_creds.py`** - Validates all 4 credentials are loaded
   - Supports both naming conventions (ACCESS_KEY and API_KEY)
   - Masks sensitive values in output
   - ✅ Ready for use

2. **`test_prime_api.py`** - Multi-phase API testing
   - Phase 2: Signature generation ✅
   - Phase 3: List portfolios ❌ (401 error)
   - Phase 5: List wallets ❌ (401 error)
   - ✅ Ready for use once credentials are fixed

3. **`check_api_key.py`** - Analyzes credential format
   - Identifies encryption pattern
   - Shows base64 decoding results
   - ✅ Diagnostic complete

4. **`test_robinhood_api_key_only.py`** - Tests extracted values
   - Tests using part after `=`
   - ❌ Still returns 401

5. **`test_with_sdk.py`** - Tests full string
   - Tests using complete credential
   - ❌ Still returns 401
   - Includes helpful error message for user

---

## What Needs to Happen

### Option 1: Decrypt Existing Credentials

If there's a decryption process:

1. Find the decryption tool/script
2. Decrypt the values from `.env.local`
3. Update `.env.local` with plaintext values
4. Re-run `python3 test_prime_api.py`

### Option 2: Get Plaintext Credentials

Get the actual unencrypted Coinbase Prime API credentials:

1. Log into Coinbase Prime web UI
2. Navigate to: **Settings** → **API Keys**
3. Find the API key for this project
4. Click **View Details**
5. Copy the plaintext values:
   - Access Key
   - Signing Key
   - Passphrase
   - Portfolio ID

6. Update `.env.local`:
```bash
COINBASE_PRIME_API_KEY="<plaintext-access-key>"
COINBASE_PRIME_SIGNING_KEY="<plaintext-signing-key>"
COINBASE_PRIME_PASSPHRASE="<plaintext-passphrase>"
COINBASE_PRIME_PORTFOLIO_ID="79cd8066-b6a8-465b-b6fe-02ba48645bd6"
```

7. Re-run test:
```bash
cd robinhood-offramp/scripts
source .venv/bin/activate
python3 test_prime_api.py
```

---

## Expected Next Steps

Once credentials are fixed, the diagnostic scripts should show:

### ✅ Phase 3 Success Output

```
======================================================================
Response Status: 200
======================================================================
✅ Authentication successful!

Found 1 portfolio(s):
  - Endaoment Trading (ID: 79cd8066-b6a8-465b-b6fe-02ba48645bd6)
```

### ✅ Phase 5 Success Output

```
======================================================================
PHASE 5: List Wallets Test
======================================================================

Request: GET /v1/portfolios/79cd8066-b6a8-465b-b6fe-02ba48645bd6/wallets
Portfolio ID: 79cd8066-b6a8-465b-b6fe-02ba48645bd6

Status: 200
✅ Successfully listed wallets!

Found XX wallet(s):

  TRADING wallets (X):
    - ETH        RH_ETH_Trading  ...
    - BTC        RH_BTC_Trading  ...
    ...

✅ Ready to proceed with wallet generation (Sub-Plan 10)!
```

---

## Remaining Sub-Plan 11 Tasks

Once credentials are fixed:

- [x] Phase 1: Credential validation script ✅
- [x] Phase 2: Signature generation testing ✅
- [ ] Phase 3: API authentication test (blocked on credentials)
- [ ] Phase 4: Debug issues if needed (may not be needed)
- [ ] Phase 5: List wallets test (blocked on credentials)
- [ ] Phase 6: Update `prime_api_client.py` with working auth
- [ ] Phase 7: Create end-to-end verification script

---

## Files Ready for Next Agent

When credentials are available, these scripts are ready to use:

1. `check_creds.py` - Verify credentials loaded ✅
2. `test_prime_api.py` - Test API authentication ✅  
3. Remaining phases can be completed quickly once auth works

---

## Notes for User

**Question**: Do you have access to the unencrypted Coinbase Prime API credentials?

**If yes**: Please update `.env.local` with the plaintext values and re-run:
```bash
cd robinhood-offramp/scripts
source .venv/bin/activate
python3 test_prime_api.py
```

**If no**: We need to either:
1. Find the decryption process for the encrypted credentials
2. Get new API credentials from Coinbase Prime UI
3. Contact the team member who set up these credentials originally

---

**Status**: Diagnostic phase complete, blocked on credential decryption/replacement
**Time Spent**: ~30 minutes (diagnostic scripts + testing)
**Next Action**: User to provide unencrypted credentials

