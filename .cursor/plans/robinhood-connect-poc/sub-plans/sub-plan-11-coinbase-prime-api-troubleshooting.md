# Sub-Plan 11: Coinbase Prime API Authentication Troubleshooting

**Priority**: Critical (Blocking wallet generation)  
**Estimated Complexity**: Medium  
**Dependencies**: Sub-Plan 10 (wallet generation scripts created, credentials configured)  
**Estimated Time**: 60-90 minutes

## Context

This sub-plan addresses authentication issues (401/403 errors) encountered when attempting to interact with the Coinbase Prime REST API. The goal is to methodically diagnose and fix authentication problems by testing incrementally from basic credential loading through full API client functionality.

**Current State**:

- Coinbase Prime API credentials are configured in `.env.local`
- Initial attempts to call the API result in 401/403 authentication errors
- Need to verify correct signature generation and header formatting

**Target State**:

- Successfully authenticate with Coinbase Prime REST API
- List existing wallets via API
- Validated API client ready for wallet generation (Sub-Plan 10)

## Coinbase Prime REST API Documentation References

**Primary Documentation**: https://docs.cdp.coinbase.com/prime/docs/rest-auth

**Key Authentication Requirements**:

1. **Authentication Method**: HMAC SHA256 signature of request components
2. **Required Headers**:
   - `X-CB-ACCESS-KEY`: Your access key
   - `X-CB-ACCESS-PASSPHRASE`: Your passphrase
   - `X-CB-ACCESS-SIGNATURE`: HMAC SHA256 signature
   - `X-CB-ACCESS-TIMESTAMP`: Unix timestamp (seconds)
3. **Signature Components**: `timestamp + method + path + body`
4. **Base URL**: `https://api.prime.coinbase.com`

**Common Endpoints**:

- `GET /v1/portfolios` - List portfolios (simplest authenticated endpoint)
- `GET /v1/portfolios/{portfolio_id}/wallets` - List wallets (our primary need)
- `POST /v1/portfolios/{portfolio_id}/wallets` - Create wallet (for Sub-Plan 10)

## What This Sub-Plan Accomplishes

1. **Credential Validation**: Verify all 4 required credentials are loaded correctly
2. **Signature Testing**: Isolate and validate HMAC SHA256 signature generation
3. **Authentication Testing**: Make minimal API call to verify auth works
4. **Debugging**: Test and fix common authentication issues systematically
5. **API Client Fix**: Apply discovered fixes to `prime_api_client.py`
6. **Verification**: Confirm we can reliably list wallets via API

## Implementation Details

### Phase 1: Credential Validation (5 minutes)

**Purpose**: Ensure all credentials are loaded from `.env.local` before testing API calls.

**File to Create**: `robinhood-offramp/scripts/check_creds.py`

```python
#!/usr/bin/env python3
"""
Coinbase Prime Credential Validation Script

Verifies that all required Coinbase Prime API credentials are loaded from .env.local
and displays masked values for debugging.

Required credentials:
- COINBASE_PRIME_ACCESS_KEY
- COINBASE_PRIME_SIGNING_KEY
- COINBASE_PRIME_PASSPHRASE
- COINBASE_PRIME_PORTFOLIO_ID

Reference: https://docs.cdp.coinbase.com/prime/docs/rest-auth#authentication
"""

import os
from pathlib import Path
from dotenv import load_dotenv

def check_credentials():
    """Load and validate Coinbase Prime credentials"""

    # Load from parent directory's .env.local
    env_path = Path(__file__).parent.parent / ".env.local"

    if not env_path.exists():
        print(f"❌ Error: .env.local not found at {env_path}")
        print("\nExpected location: robinhood-offramp/.env.local")
        return False

    load_dotenv(env_path)

    print("Coinbase Prime Credential Check")
    print("=" * 70)
    print(f"Loading from: {env_path}\n")

    # Define required credentials
    required_creds = {
        "ACCESS_KEY": "COINBASE_PRIME_ACCESS_KEY",
        "SIGNING_KEY": "COINBASE_PRIME_SIGNING_KEY",
        "PASSPHRASE": "COINBASE_PRIME_PASSPHRASE",
        "PORTFOLIO_ID": "COINBASE_PRIME_PORTFOLIO_ID"
    }

    all_present = True

    for display_name, env_var in required_creds.items():
        value = os.getenv(env_var)

        if value:
            # Mask value for security (show first 8 and last 4 chars)
            if len(value) > 12:
                masked = f"{value[:8]}...{value[-4:]}"
            else:
                masked = f"{value[:4]}..." if len(value) > 4 else "***"

            print(f"✅ {display_name:15} ({env_var})")
            print(f"   Value: {masked} (length: {len(value)})")
        else:
            print(f"❌ {display_name:15} ({env_var})")
            print(f"   Status: MISSING")
            all_present = False

    print("\n" + "=" * 70)

    if all_present:
        print("✅ All credentials present and loaded successfully!\n")
        return True
    else:
        print("❌ Some credentials are missing. Please update .env.local\n")
        print("Required format in .env.local:")
        print("COINBASE_PRIME_ACCESS_KEY=your_access_key")
        print("COINBASE_PRIME_SIGNING_KEY=your_signing_key")
        print("COINBASE_PRIME_PASSPHRASE=your_passphrase")
        print("COINBASE_PRIME_PORTFOLIO_ID=your_portfolio_id")
        return False

if __name__ == "__main__":
    check_credentials()
```

**How to Run**:

```bash
cd robinhood-offramp/scripts
source .venv/bin/activate  # Activate Python virtual environment
python3 check_creds.py
```

**Expected Output**:

```
Coinbase Prime Credential Check
======================================================================
Loading from: /path/to/robinhood-offramp/.env.local

✅ ACCESS_KEY      (COINBASE_PRIME_ACCESS_KEY)
   Value: abcd1234...xyz9 (length: 32)
✅ SIGNING_KEY     (COINBASE_PRIME_SIGNING_KEY)
   Value: wxyz9876...abc1 (length: 64)
✅ PASSPHRASE      (COINBASE_PRIME_PASSPHRASE)
   Value: my-pass...word (length: 20)
✅ PORTFOLIO_ID    (COINBASE_PRIME_PORTFOLIO_ID)
   Value: 79cd8066...5bd6 (length: 36)

======================================================================
✅ All credentials present and loaded successfully!
```

**Troubleshooting**:

- If any credential shows "MISSING", add it to `.env.local`
- Verify no extra spaces or quotes around values in `.env.local`
- Ensure `.env.local` is in `robinhood-offramp/` directory (not `scripts/`)

---

### Phase 2: Signature Generation Testing (10 minutes)

**Purpose**: Verify HMAC SHA256 signature generation logic matches Coinbase Prime specification before making actual API calls.

**File to Create**: `robinhood-offramp/scripts/test_prime_api.py`

```python
#!/usr/bin/env python3
"""
Coinbase Prime API Testing Script

Incrementally tests Coinbase Prime REST API authentication from signature
generation through full API calls.

Reference: https://docs.cdp.coinbase.com/prime/docs/rest-auth
"""

import hashlib
import hmac
import time
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Load credentials
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(env_path)

def generate_signature(signing_key: str, timestamp: str, method: str, path: str, body: str = "") -> str:
    """
    Generate HMAC SHA256 signature per Coinbase Prime API specification.

    Per Coinbase Prime docs:
    1. Create a prehash string by concatenating: timestamp + method + path + body
    2. Create HMAC SHA256 signature using signing key
    3. Return hexadecimal digest

    Args:
        signing_key: Your API signing key from Coinbase Prime
        timestamp: Unix timestamp (seconds) as string
        method: HTTP method (GET, POST, etc.)
        path: Request path starting with /v1/...
        body: Request body (empty string for GET requests)

    Returns:
        Hexadecimal HMAC SHA256 signature

    Reference: https://docs.cdp.coinbase.com/prime/docs/rest-auth#signing-requests
    """
    # Step 1: Concatenate components (no separators!)
    message = f"{timestamp}{method}{path}{body}"

    # Step 2: Create HMAC SHA256 signature
    signature = hmac.new(
        signing_key.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    return signature

def test_signature_generation():
    """Test signature generation with sample values"""

    print("\n" + "=" * 70)
    print("PHASE 2: Signature Generation Test")
    print("=" * 70)

    # Load signing key
    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")

    if not signing_key:
        print("❌ Error: COINBASE_PRIME_SIGNING_KEY not found")
        return False

    # Test with sample values
    timestamp = str(int(time.time()))
    method = "GET"
    path = "/v1/portfolios"
    body = ""

    print(f"\nSignature Components:")
    print(f"  Timestamp:  {timestamp}")
    print(f"  Method:     {method}")
    print(f"  Path:       {path}")
    print(f"  Body:       '{body}' (empty for GET)")

    # Generate message (prehash string)
    message = f"{timestamp}{method}{path}{body}"
    print(f"\nPrehash String (concatenated):")
    print(f"  '{message}'")
    print(f"  Length: {len(message)} characters")

    # Generate signature
    signature = generate_signature(signing_key, timestamp, method, path, body)

    print(f"\nGenerated Signature:")
    print(f"  {signature}")
    print(f"  Length: {len(signature)} characters")
    print(f"  Algorithm: HMAC SHA256 (hexdigest)")

    print("\n✅ Signature generation successful!")
    print("\nNext: This signature will be sent in X-CB-ACCESS-SIGNATURE header")

    return True

if __name__ == "__main__":
    test_signature_generation()
```

**How to Run**:

```bash
python3 test_prime_api.py
```

**Expected Output**:

```
======================================================================
PHASE 2: Signature Generation Test
======================================================================

Signature Components:
  Timestamp:  1729450123
  Method:     GET
  Path:       /v1/portfolios
  Body:       '' (empty for GET)

Prehash String (concatenated):
  '1729450123GET/v1/portfolios'
  Length: 28 characters

Generated Signature:
  a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
  Length: 64 characters
  Algorithm: HMAC SHA256 (hexdigest)

✅ Signature generation successful!

Next: This signature will be sent in X-CB-ACCESS-SIGNATURE header
```

**Key Points**:

- Prehash string has NO separators between components
- Signature is 64-character hexadecimal string (SHA256 digest)
- Timestamp must be in seconds (not milliseconds)

---

### Phase 3: Minimal API Authentication Test (15 minutes)

**Purpose**: Make the simplest possible authenticated API call to verify authentication works end-to-end.

**Update File**: `robinhood-offramp/scripts/test_prime_api.py` (add this function)

```python
import requests

def test_list_portfolios():
    """
    Test GET /v1/portfolios - simplest authenticated endpoint

    This endpoint lists all portfolios accessible with the API key.
    It requires authentication but has no parameters, making it ideal
    for testing auth without other complications.

    Reference: https://docs.cdp.coinbase.com/prime/reference/primerestapi_getportfolios
    """

    print("\n" + "=" * 70)
    print("PHASE 3: API Authentication Test - List Portfolios")
    print("=" * 70)

    # Load credentials
    access_key = os.getenv("COINBASE_PRIME_ACCESS_KEY")
    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    passphrase = os.getenv("COINBASE_PRIME_PASSPHRASE")

    if not all([access_key, signing_key, passphrase]):
        print("❌ Error: Missing credentials")
        return False

    # Request parameters
    timestamp = str(int(time.time()))
    method = "GET"
    path = "/v1/portfolios"
    body = ""

    # Generate signature
    signature = generate_signature(signing_key, timestamp, method, path, body)

    # Build headers per Coinbase Prime spec
    headers = {
        "X-CB-ACCESS-KEY": access_key,
        "X-CB-ACCESS-PASSPHRASE": passphrase,
        "X-CB-ACCESS-SIGNATURE": signature,
        "X-CB-ACCESS-TIMESTAMP": timestamp,
        "Content-Type": "application/json"
    }

    # Build URL
    url = f"https://api.prime.coinbase.com{path}"

    print(f"\nRequest Details:")
    print(f"  Method: {method}")
    print(f"  URL:    {url}")
    print(f"\nHeaders:")
    for key, value in headers.items():
        if len(value) > 30:
            display_value = f"{value[:20]}...{value[-8:]}"
        else:
            display_value = value
        print(f"  {key}: {display_value}")

    print(f"\nMaking API request...")

    try:
        response = requests.get(url, headers=headers, timeout=10)

        print(f"\n{'='*70}")
        print(f"Response Status: {response.status_code}")
        print(f"{'='*70}")

        if response.status_code == 200:
            print("✅ Authentication successful!")

            data = response.json()
            portfolios = data.get("portfolios", [])

            print(f"\nFound {len(portfolios)} portfolio(s):")
            for portfolio in portfolios:
                portfolio_id = portfolio.get("id")
                name = portfolio.get("name", "Unnamed")
                print(f"  - {name} (ID: {portfolio_id})")

            return True

        elif response.status_code in [401, 403]:
            print("❌ Authentication failed!")
            print(f"\nResponse: {response.text}")
            print("\nCommon causes:")
            print("  1. Incorrect API key or passphrase")
            print("  2. Wrong signature generation")
            print("  3. Timestamp out of sync")
            print("  4. API key doesn't have required permissions")
            print("\nSee Phase 4 for debugging steps")
            return False

        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"\nResponse: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    test_signature_generation()
    test_list_portfolios()
```

**How to Run**:

```bash
python3 test_prime_api.py
```

**Success Output**:

```
======================================================================
Response Status: 200
======================================================================
✅ Authentication successful!

Found 1 portfolio(s):
  - Endaoment Trading (ID: 79cd8066-b6a8-465b-b6fe-02ba48645bd6)
```

**Failure Output** (401/403):

```
======================================================================
Response Status: 401
======================================================================
❌ Authentication failed!

Response: {"message":"Invalid Signature"}

Common causes:
  1. Incorrect API key or passphrase
  2. Wrong signature generation
  3. Timestamp out of sync
  4. API key doesn't have required permissions

See Phase 4 for debugging steps
```

---

### Phase 4: Debug Common Authentication Issues (20 minutes)

**Purpose**: Systematically test and fix common authentication problems.

**Update File**: `robinhood-offramp/scripts/test_prime_api.py` (add debugging functions)

```python
def test_signature_variations():
    """
    Test common signature generation variations to diagnose auth issues

    Common issues:
    1. Header name typo (X-CB-ACCESS-SIGN vs X-CB-ACCESS-SIGNATURE)
    2. Timestamp in milliseconds instead of seconds
    3. Signing key needs base64 decoding
    4. Extra spaces/newlines in message
    """

    print("\n" + "=" * 70)
    print("PHASE 4: Debugging Authentication Issues")
    print("=" * 70)

    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    timestamp = str(int(time.time()))
    method = "GET"
    path = "/v1/portfolios"
    body = ""

    print("\n=== Test 1: Standard Signature (should be correct) ===")
    sig1 = generate_signature(signing_key, timestamp, method, path, body)
    print(f"Signature: {sig1}")

    print("\n=== Test 2: Base64-Decoded Signing Key ===")
    print("Some APIs require base64 decoding the signing key first")
    try:
        import base64
        signing_key_decoded = base64.b64decode(signing_key)
        message = f"{timestamp}{method}{path}{body}"
        sig2 = hmac.new(
            signing_key_decoded,
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        print(f"Signature: {sig2}")
        print("Try this version if standard signature fails")
    except Exception as e:
        print(f"Base64 decode failed: {e}")
        print("Signing key is probably not base64-encoded")

    print("\n=== Test 3: Timestamp Verification ===")
    current_time = int(time.time())
    print(f"Current Unix timestamp: {current_time}")
    print(f"Human readable: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(current_time))}")
    print("Note: Timestamp must be in seconds, not milliseconds")
    print(f"  Correct:   {current_time}")
    print(f"  Wrong:     {current_time * 1000}")

    print("\n=== Test 4: Message Components ===")
    message = f"{timestamp}{method}{path}{body}"
    print("Verify no extra spaces or separators:")
    print(f"  Message: '{message}'")
    print(f"  Components: timestamp({timestamp}) + method({method}) + path({path}) + body('{body}')")

    print("\n=== Test 5: Header Names ===")
    print("Verify exact header names (case-sensitive):")
    print("  ✅ Correct:   X-CB-ACCESS-SIGNATURE")
    print("  ❌ Wrong:     X-CB-ACCESS-SIGN")
    print("  ❌ Wrong:     x-cb-access-signature")

def test_api_with_variations():
    """Test API call with different signature methods"""

    print("\n" + "=" * 70)
    print("Testing API with signature variations...")
    print("=" * 70)

    access_key = os.getenv("COINBASE_PRIME_ACCESS_KEY")
    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    passphrase = os.getenv("COINBASE_PRIME_PASSPHRASE")

    timestamp = str(int(time.time()))
    method = "GET"
    path = "/v1/portfolios"
    body = ""
    url = f"https://api.prime.coinbase.com{path}"

    # Try standard signature first
    print("\n[Test 1] Standard signature...")
    sig = generate_signature(signing_key, timestamp, method, path, body)
    headers = {
        "X-CB-ACCESS-KEY": access_key,
        "X-CB-ACCESS-PASSPHRASE": passphrase,
        "X-CB-ACCESS-SIGNATURE": sig,
        "X-CB-ACCESS-TIMESTAMP": timestamp,
        "Content-Type": "application/json"
    }

    response = requests.get(url, headers=headers, timeout=10)
    print(f"  Status: {response.status_code}")

    if response.status_code == 200:
        print("  ✅ Success with standard signature!")
        return True

    # Try base64-decoded signing key
    print("\n[Test 2] Base64-decoded signing key...")
    try:
        import base64
        signing_key_decoded = base64.b64decode(signing_key)
        message = f"{timestamp}{method}{path}{body}"
        sig2 = hmac.new(signing_key_decoded, message.encode('utf-8'), hashlib.sha256).hexdigest()

        headers["X-CB-ACCESS-SIGNATURE"] = sig2
        response = requests.get(url, headers=headers, timeout=10)
        print(f"  Status: {response.status_code}")

        if response.status_code == 200:
            print("  ✅ Success with base64-decoded signing key!")
            print("\n  ACTION REQUIRED: Update prime_api_client.py to base64 decode signing key")
            return True
    except:
        print("  Base64 decode failed - skipping this test")

    print("\n❌ All signature variations failed")
    print("Check:")
    print("  1. API key has correct permissions in Coinbase Prime UI")
    print("  2. Credentials match exactly (no extra spaces)")
    print("  3. System time is correct (affects timestamp)")

    return False

if __name__ == "__main__":
    test_signature_generation()
    test_list_portfolios()
    test_signature_variations()
    # Uncomment if needed: test_api_with_variations()
```

**How to Run**:

```bash
python3 test_prime_api.py
```

**What to Check**:

1. **API Key Permissions** (in Coinbase Prime web UI):

   - Navigate to Settings → API Keys
   - Verify key has "View" permission at minimum
   - For wallet creation, need "Trade" permission

2. **Credential Format**:

   - No extra quotes: `COINBASE_PRIME_ACCESS_KEY=abc123` ✅
   - Not: `COINBASE_PRIME_ACCESS_KEY="abc123"` ❌
   - No spaces around `=`

3. **System Time**:
   - Run `date` in terminal
   - Verify time is correct (affects timestamp validation)

---

### Phase 5: Test List Wallets Endpoint (10 minutes)

**Purpose**: Once authentication works, test the actual endpoint needed for Sub-Plan 10.

**Update File**: `robinhood-offramp/scripts/test_prime_api.py` (add this function)

```python
def test_list_wallets():
    """
    Test GET /v1/portfolios/{portfolio_id}/wallets

    Lists all wallets in the portfolio. This is the primary endpoint we'll
    use to check existing wallets before creating new ones.

    Reference: https://docs.cdp.coinbase.com/prime/reference/primerestapi_getwallets
    """

    print("\n" + "=" * 70)
    print("PHASE 5: List Wallets Test")
    print("=" * 70)

    # Load credentials
    access_key = os.getenv("COINBASE_PRIME_ACCESS_KEY")
    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    passphrase = os.getenv("COINBASE_PRIME_PASSPHRASE")
    portfolio_id = os.getenv("COINBASE_PRIME_PORTFOLIO_ID")

    if not all([access_key, signing_key, passphrase, portfolio_id]):
        print("❌ Error: Missing credentials")
        return False

    # Request parameters
    timestamp = str(int(time.time()))
    method = "GET"
    path = f"/v1/portfolios/{portfolio_id}/wallets"
    body = ""

    # Generate signature
    signature = generate_signature(signing_key, timestamp, method, path, body)

    # Build headers
    headers = {
        "X-CB-ACCESS-KEY": access_key,
        "X-CB-ACCESS-PASSPHRASE": passphrase,
        "X-CB-ACCESS-SIGNATURE": signature,
        "X-CB-ACCESS-TIMESTAMP": timestamp,
        "Content-Type": "application/json"
    }

    # Build URL
    url = f"https://api.prime.coinbase.com{path}"

    print(f"\nRequest: {method} {path}")
    print(f"Portfolio ID: {portfolio_id}")

    try:
        response = requests.get(url, headers=headers, timeout=10)

        print(f"\nStatus: {response.status_code}")

        if response.status_code == 200:
            print("✅ Successfully listed wallets!")

            data = response.json()
            wallets = data.get("wallets", [])

            print(f"\nFound {len(wallets)} wallet(s):")

            # Group by wallet type
            trading_wallets = [w for w in wallets if w.get("wallet_type") == "TRADING"]
            vault_wallets = [w for w in wallets if w.get("wallet_type") == "VAULT"]

            if trading_wallets:
                print(f"\n  TRADING wallets ({len(trading_wallets)}):")
                for wallet in trading_wallets[:10]:  # Show first 10
                    symbol = wallet.get("symbol", "???")
                    name = wallet.get("name", "Unnamed")
                    wallet_id = wallet.get("id", "")
                    print(f"    - {symbol:10} {name:30} (ID: {wallet_id[:16]}...)")

            if vault_wallets:
                print(f"\n  VAULT wallets ({len(vault_wallets)}):")
                for wallet in vault_wallets[:10]:  # Show first 10
                    symbol = wallet.get("symbol", "???")
                    name = wallet.get("name", "Unnamed")
                    wallet_id = wallet.get("id", "")
                    print(f"    - {symbol:10} {name:30} (ID: {wallet_id[:16]}...)")

            if len(wallets) > 20:
                print(f"\n  ... and {len(wallets) - 20} more wallets")

            print("\n✅ Ready to proceed with wallet generation (Sub-Plan 10)!")
            return True

        elif response.status_code in [401, 403]:
            print("❌ Authentication failed!")
            print(f"Response: {response.text}")
            return False

        elif response.status_code == 404:
            print("❌ Portfolio not found!")
            print(f"Verify COINBASE_PRIME_PORTFOLIO_ID: {portfolio_id}")
            return False

        else:
            print(f"❌ Unexpected status: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    test_signature_generation()
    test_list_portfolios()
    test_list_wallets()
```

**Success Output**:

```
======================================================================
PHASE 5: List Wallets Test
======================================================================

Request: GET /v1/portfolios/79cd8066-b6a8-465b-b6fe-02ba48645bd6/wallets
Portfolio ID: 79cd8066-b6a8-465b-b6fe-02ba48645bd6

Status: 200
✅ Successfully listed wallets!

Found 12 wallet(s):

  TRADING wallets (8):
    - ETH        RH_ETH_Trading                (ID: abc123def456...)
    - BTC        RH_BTC_Trading                (ID: def789ghi012...)
    - USDC       RH_USDC_Trading               (ID: ghi345jkl678...)
    - SOL        RH_SOL_Trading                (ID: jkl901mno234...)
    ...

  VAULT wallets (4):
    - ETH        Primary ETH Vault             (ID: mno567pqr890...)
    ...

✅ Ready to proceed with wallet generation (Sub-Plan 10)!
```

---

### Phase 6: Fix prime_api_client.py (15 minutes)

**Purpose**: Apply discovered fixes to the API client class.

**File to Update**: `robinhood-offramp/scripts/prime_api_client.py`

Based on test results from Phases 3-5, update the client with correct authentication:

```python
#!/usr/bin/env python3
"""
Coinbase Prime API Client

Wrapper for Coinbase Prime REST API with proper authentication.

Reference: https://docs.cdp.coinbase.com/prime/docs/rest-auth
"""

import hashlib
import hmac
import time
import json
import requests
from typing import Dict, Optional, Tuple

class CoinbasePrimeClient:
    """Coinbase Prime API client with HMAC SHA256 authentication"""

    BASE_URL = "https://api.prime.coinbase.com"

    def __init__(self, access_key: str, signing_key: str, passphrase: str, portfolio_id: str):
        """
        Initialize Coinbase Prime API client

        Args:
            access_key: Your API Access Key from Prime UI
            signing_key: Your API Signing Key (secret) from Prime UI
            passphrase: Your API Passphrase from Prime UI
            portfolio_id: Your Portfolio ID from Prime UI

        Note: Get these from Coinbase Prime UI → Settings → API Keys
        """
        self.access_key = access_key
        self.signing_key = signing_key
        self.passphrase = passphrase
        self.portfolio_id = portfolio_id

    def _generate_signature(self, timestamp: str, method: str, path: str, body: str = "") -> str:
        """
        Generate X-CB-ACCESS-SIGNATURE header per Coinbase Prime API spec

        Per documentation:
        1. Create prehash string: timestamp + method + path + body
        2. Generate HMAC SHA256 signature using signing key
        3. Return hexadecimal digest

        Args:
            timestamp: Unix timestamp in seconds (as string)
            method: HTTP method (GET, POST, etc.)
            path: Request path (e.g., /v1/portfolios)
            body: Request body (empty string for GET)

        Returns:
            64-character hexadecimal signature

        Reference: https://docs.cdp.coinbase.com/prime/docs/rest-auth#signing-requests
        """
        # Concatenate components (no separators!)
        message = f"{timestamp}{method}{path}{body}"

        # Generate HMAC SHA256 signature
        signature = hmac.new(
            self.signing_key.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        return signature

    def _get_headers(self, method: str, path: str, body: str = "") -> Dict[str, str]:
        """
        Generate authentication headers for API request

        Returns headers dict with all required authentication headers:
        - X-CB-ACCESS-KEY: Access key
        - X-CB-ACCESS-PASSPHRASE: Passphrase
        - X-CB-ACCESS-SIGNATURE: HMAC SHA256 signature
        - X-CB-ACCESS-TIMESTAMP: Current Unix timestamp

        Reference: https://docs.cdp.coinbase.com/prime/docs/rest-auth#authentication
        """
        timestamp = str(int(time.time()))
        signature = self._generate_signature(timestamp, method, path, body)

        return {
            "X-CB-ACCESS-KEY": self.access_key,
            "X-CB-ACCESS-PASSPHRASE": self.passphrase,
            "X-CB-ACCESS-SIGNATURE": signature,  # Note: SIGNATURE not SIGN
            "X-CB-ACCESS-TIMESTAMP": timestamp,
            "Content-Type": "application/json"
        }

    def list_wallets(self, symbol: Optional[str] = None, wallet_type: Optional[str] = None) -> Dict:
        """
        List all wallets in portfolio

        Args:
            symbol: Optional filter by asset symbol (e.g., "BTC", "ETH")
            wallet_type: Optional filter by type ("TRADING" or "VAULT")

        Returns:
            Dict with "wallets" list containing wallet objects

        Reference: https://docs.cdp.coinbase.com/prime/reference/primerestapi_getwallets
        """
        path = f"/v1/portfolios/{self.portfolio_id}/wallets"

        # Add query parameters if provided
        params = []
        if symbol:
            params.append(f"symbols={symbol}")
        if wallet_type:
            params.append(f"type={wallet_type}")

        if params:
            path += "?" + "&".join(params)

        url = f"{self.BASE_URL}{path}"
        headers = self._get_headers("GET", path.split("?")[0])  # Path without query params for signature

        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()

    def create_trading_wallet(self, symbol: str, name: str) -> Dict:
        """
        Create a TRADING wallet for specified asset

        Args:
            symbol: Asset symbol (e.g., "BTC", "ETH", "USDC")
            name: Wallet name (e.g., "RH_BTC_Trading")

        Returns:
            Dict with wallet creation details (may include activity_id for async operation)

        Reference: https://docs.cdp.coinbase.com/prime/reference/primerestapi_createwallet
        """
        path = f"/v1/portfolios/{self.portfolio_id}/wallets"
        url = f"{self.BASE_URL}{path}"

        payload = {
            "name": name,
            "symbol": symbol,
            "wallet_type": "TRADING"
        }

        body = json.dumps(payload)
        headers = self._get_headers("POST", path, body)

        response = requests.post(url, headers=headers, data=body, timeout=30)
        response.raise_for_status()
        return response.json()

    def get_wallet_deposit_address(self, wallet_id: str) -> Tuple[str, Optional[str]]:
        """
        Get deposit address and memo (if applicable) for wallet

        Args:
            wallet_id: The wallet ID (UUID)

        Returns:
            Tuple of (address, memo)
            - address: Deposit address (always present)
            - memo: Account identifier/tag/memo (optional, for XLM/XRP/HBAR/etc)

        Reference: https://docs.cdp.coinbase.com/prime/reference/primerestapi_getwalletdepositinstructions
        """
        path = f"/v1/portfolios/{self.portfolio_id}/wallets/{wallet_id}/deposit_instructions"
        url = f"{self.BASE_URL}{path}"

        headers = self._get_headers("GET", path)

        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        data = response.json()
        crypto_instructions = data.get("crypto_instructions", {})

        address = crypto_instructions.get("address")
        memo = crypto_instructions.get("account_identifier")  # For XLM, XRP, HBAR, etc.

        return address, memo
```

**Key Fixes Applied**:

1. ✅ Correct header name: `X-CB-ACCESS-SIGNATURE` (not `X-CB-ACCESS-SIGN`)
2. ✅ Timestamp in seconds: `str(int(time.time()))`
3. ✅ Proper message concatenation (no separators)
4. ✅ Standard signing key encoding (adjust if Phase 4 found otherwise)
5. ✅ Comprehensive docstrings with API references

---

### Phase 7: End-to-End Verification (5 minutes)

**Purpose**: Confirm everything works together.

**File to Create**: `robinhood-offramp/scripts/verify_api_ready.py`

```python
#!/usr/bin/env python3
"""
End-to-End Verification for Coinbase Prime API Integration

Runs all tests to confirm API client is ready for wallet generation.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from prime_api_client import CoinbasePrimeClient

def verify_api_ready():
    """Run comprehensive verification"""

    print("=" * 70)
    print("Coinbase Prime API - End-to-End Verification")
    print("=" * 70)

    # Load credentials
    env_path = Path(__file__).parent.parent / ".env.local"
    load_dotenv(env_path)

    access_key = os.getenv("COINBASE_PRIME_ACCESS_KEY")
    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    passphrase = os.getenv("COINBASE_PRIME_PASSPHRASE")
    portfolio_id = os.getenv("COINBASE_PRIME_PORTFOLIO_ID")

    # Verify credentials
    print("\n[1/3] Checking credentials...")
    if not all([access_key, signing_key, passphrase, portfolio_id]):
        print("❌ Missing credentials")
        return False
    print("✅ All credentials loaded")

    # Initialize client
    print("\n[2/3] Initializing API client...")
    try:
        client = CoinbasePrimeClient(access_key, signing_key, passphrase, portfolio_id)
        print("✅ Client initialized")
    except Exception as e:
        print(f"❌ Client initialization failed: {e}")
        return False

    # Test list wallets
    print("\n[3/3] Testing list wallets API call...")
    try:
        result = client.list_wallets()
        wallets = result.get("wallets", [])
        trading_wallets = [w for w in wallets if w.get("wallet_type") == "TRADING"]

        print(f"✅ Successfully listed {len(wallets)} wallets")
        print(f"   - {len(trading_wallets)} TRADING wallets")
        print(f"   - {len(wallets) - len(trading_wallets)} other wallets")

    except Exception as e:
        print(f"❌ API call failed: {e}")
        return False

    # Success!
    print("\n" + "=" * 70)
    print("✅ All verifications passed!")
    print("=" * 70)
    print("\nAPI client is ready for use.")
    print("Next: Proceed with Sub-Plan 10 (wallet generation)")

    return True

if __name__ == "__main__":
    success = verify_api_ready()
    exit(0 if success else 1)
```

**How to Run**:

```bash
python3 verify_api_ready.py
```

**Expected Output**:

```
======================================================================
Coinbase Prime API - End-to-End Verification
======================================================================

[1/3] Checking credentials...
✅ All credentials loaded

[2/3] Initializing API client...
✅ Client initialized

[3/3] Testing list wallets API call...
✅ Successfully listed 12 wallets
   - 8 TRADING wallets
   - 4 other wallets

======================================================================
✅ All verifications passed!
======================================================================

API client is ready for use.
Next: Proceed with Sub-Plan 10 (wallet generation)
```

---

## Troubleshooting Decision Tree

```
Getting 401/403 errors?
│
├─ Step 1: Verify credentials loaded
│  └─ Run: python3 check_creds.py
│     ├─ Missing? → Update .env.local
│     └─ Present? → Continue to Step 2
│
├─ Step 2: Check API key permissions
│  └─ In Coinbase Prime UI → Settings → API Keys
│     ├─ Need "View" permission minimum
│     └─ For wallet creation, need "Trade" permission
│
├─ Step 3: Test signature generation
│  └─ Run: python3 test_prime_api.py
│     └─ Check Phase 2 output for signature details
│
├─ Step 4: Verify header names
│  └─ Must be: X-CB-ACCESS-SIGNATURE (not X-CB-ACCESS-SIGN)
│
├─ Step 5: Check timestamp format
│  └─ Must be seconds: str(int(time.time()))
│     └─ Not milliseconds: str(int(time.time() * 1000))
│
├─ Step 6: Test signing key encoding
│  └─ Try base64 decoding if standard fails
│     └─ See Phase 4 test_signature_variations()
│
└─ Step 7: Verify system time
   └─ Run: date
      └─ Timestamp must be within ~30 seconds of server time
```

## Common Fixes Reference

### Fix 1: Header Name Typo

```python
# ❌ Wrong
headers = {
    "X-CB-ACCESS-SIGN": signature
}

# ✅ Correct
headers = {
    "X-CB-ACCESS-SIGNATURE": signature
}
```

### Fix 2: Timestamp Format

```python
# ❌ Wrong (milliseconds)
timestamp = str(int(time.time() * 1000))

# ✅ Correct (seconds)
timestamp = str(int(time.time()))
```

### Fix 3: Signing Key Encoding

```python
# Standard approach (try this first)
signature = hmac.new(
    signing_key.encode('utf-8'),
    message.encode('utf-8'),
    hashlib.sha256
).hexdigest()

# If standard fails, try base64 decoding signing key
import base64
signing_key_bytes = base64.b64decode(signing_key)
signature = hmac.new(
    signing_key_bytes,
    message.encode('utf-8'),
    hashlib.sha256
).hexdigest()
```

### Fix 4: Message Concatenation

```python
# ✅ Correct (no separators)
message = f"{timestamp}{method}{path}{body}"

# ❌ Wrong (has separators)
message = f"{timestamp} {method} {path} {body}"
message = f"{timestamp}:{method}:{path}:{body}"
```

---

## Deliverables Checklist

- [ ] `check_creds.py` - Credential validation script created
- [ ] `test_prime_api.py` - API testing script created with all phases
- [ ] `verify_api_ready.py` - End-to-end verification script created
- [ ] `prime_api_client.py` - API client updated with correct authentication
- [ ] All 4 credentials verified in `.env.local`
- [ ] Phase 3: List portfolios returns 200 status
- [ ] Phase 5: List wallets returns 200 status with wallet data
- [ ] Phase 7: End-to-end verification passes
- [ ] Documentation of any fixes applied (in implementation log)

---

## Success Criteria

This sub-plan is complete when:

1. ✅ `python3 check_creds.py` shows all 4 credentials loaded
2. ✅ `python3 test_prime_api.py` successfully lists portfolios (200 status)
3. ✅ `python3 test_prime_api.py` successfully lists wallets (200 status)
4. ✅ `python3 verify_api_ready.py` passes all verifications
5. ✅ `prime_api_client.py` updated with working authentication
6. ✅ Ready to proceed with Sub-Plan 10 wallet generation

---

## Next Steps After Completion

Once authentication is working:

1. **Document fixes** - Create implementation log noting what changes were needed
2. **Proceed to Sub-Plan 10** - Run wallet generation script
3. **Test wallet creation** - Create a test TRADING wallet via API
4. **Test deposit addresses** - Retrieve deposit addresses for test wallet
5. **Generate all wallets** - Create wallets for all Robinhood-supported assets

---

## Additional Resources

**Coinbase Prime API Documentation**:

- Authentication: https://docs.cdp.coinbase.com/prime/docs/rest-auth
- List Portfolios: https://docs.cdp.coinbase.com/prime/reference/primerestapi_getportfolios
- List Wallets: https://docs.cdp.coinbase.com/prime/reference/primerestapi_getwallets
- Create Wallet: https://docs.cdp.coinbase.com/prime/reference/primerestapi_createwallet
- Deposit Instructions: https://docs.cdp.coinbase.com/prime/reference/primerestapi_getwalletdepositinstructions

**Python Libraries**:

- `requests`: HTTP requests
- `hmac`: HMAC signature generation
- `hashlib`: SHA256 hashing
- `python-dotenv`: Environment variable loading

---

**Last Updated**: October 20, 2025  
**Status**: Ready for implementation  
**Blocking**: Sub-Plan 10 (wallet generation)
