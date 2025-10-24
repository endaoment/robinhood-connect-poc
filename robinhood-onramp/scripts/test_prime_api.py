#!/usr/bin/env python3
"""
Coinbase Prime API Testing Script

Incrementally tests Coinbase Prime REST API authentication from signature
generation through full API calls.

Reference: https://docs.cdp.coinbase.com/prime/docs/rest-auth
"""

import base64
import hashlib
import hmac
import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load credentials
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(env_path)

def get_access_key():
    """Get access key (try both naming conventions)"""
    return os.getenv("COINBASE_PRIME_ACCESS_KEY") or os.getenv("COINBASE_PRIME_API_KEY")

def generate_signature(signing_key: str, timestamp: str, method: str, path: str, body: str = "") -> str:
    """
    Generate HMAC SHA256 signature per Coinbase Prime API specification.

    Per Coinbase Prime docs:
    1. Create a prehash string by concatenating: timestamp + method + path + body
    2. Create HMAC SHA256 signature using signing key
    3. Return base64 encoded digest (NOT hexdigest!)
        
        Args:
        signing_key: Your API signing key from Coinbase Prime
        timestamp: Unix timestamp (seconds) as string
        method: HTTP method (GET, POST, etc.)
        path: Request path starting with /v1/...
        body: Request body (empty string for GET requests)

    Returns:
        Base64 encoded HMAC SHA256 signature

    Reference: https://docs.cdp.coinbase.com/prime/docs/rest-auth#signing-requests
    """
    # Step 1: Concatenate components (no separators!)
    message = f"{timestamp}{method}{path}{body}"

    # Step 2: Create HMAC SHA256 signature with BASE64 encoding
    signature = hmac.new(
        signing_key.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).digest()  # Get binary digest

    # Step 3: Encode to base64
    return base64.b64encode(signature).decode('utf-8')


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
    print(f"  Algorithm: HMAC SHA256 (base64 encoded)")

    print("\n✅ Signature generation successful!")
    print("\nNext: This signature will be sent in X-CB-ACCESS-SIGNATURE header")

    return True

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
    access_key = get_access_key()
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
    access_key = get_access_key()
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
