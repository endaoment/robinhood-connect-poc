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

    # Get access key (support both naming conventions)
    access_key = os.getenv("COINBASE_PRIME_ACCESS_KEY") or os.getenv("COINBASE_PRIME_API_KEY")
    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    passphrase = os.getenv("COINBASE_PRIME_PASSPHRASE")
    portfolio_id = os.getenv("COINBASE_PRIME_PORTFOLIO_ID")

    # Verify credentials
    print("\n[1/3] Checking credentials...")
    if not all([access_key, signing_key, passphrase, portfolio_id]):
        print("❌ Missing credentials")
        missing = []
        if not access_key:
            missing.append("COINBASE_PRIME_API_KEY (or COINBASE_PRIME_ACCESS_KEY)")
        if not signing_key:
            missing.append("COINBASE_PRIME_SIGNING_KEY")
        if not passphrase:
            missing.append("COINBASE_PRIME_PASSPHRASE")
        if not portfolio_id:
            missing.append("COINBASE_PRIME_PORTFOLIO_ID")
        print(f"  Missing: {', '.join(missing)}")
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
        vault_wallets = [w for w in wallets if w.get("wallet_type") == "VAULT"]

        print(f"✅ Successfully listed {len(wallets)} wallets")
        print(f"   - {len(trading_wallets)} TRADING wallets")
        print(f"   - {len(vault_wallets)} VAULT wallets")
        
        # Show first few wallets as example
        if len(wallets) > 0:
            print(f"\n  Example wallets:")
            for wallet in wallets[:5]:
                symbol = wallet.get("symbol", "???")
                name = wallet.get("name", "Unnamed")
                wallet_type = wallet.get("wallet_type", "???")
                print(f"    - {symbol:10} {name:30} ({wallet_type})")
            
            if len(wallets) > 5:
                print(f"    ... and {len(wallets) - 5} more")

    except Exception as e:
        print(f"❌ API call failed: {e}")
        import traceback
        traceback.print_exc()
        return False

    # Success!
    print("\n" + "=" * 70)
    print("✅ All verifications passed!")
    print("=" * 70)
    print("\nAPI client is ready for use.")
    print("\nKey findings:")
    print(f"  • Authentication: WORKING (base64-encoded HMAC-SHA256)")
    print(f"  • Portfolio ID: {portfolio_id}")
    print(f"  • Total wallets: {len(wallets)}")
    print(f"  • TRADING wallets: {len(trading_wallets)}")
    print("\nNext steps:")
    print("  1. Review existing TRADING wallets above")
    print("  2. Determine which wallets need to be created")
    print("  3. Run wallet generation script (Sub-Plan 10)")

    return True

if __name__ == "__main__":
    success = verify_api_ready()
    exit(0 if success else 1)

