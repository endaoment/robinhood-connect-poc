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
        print("\nExpected location: robinhood-onramp/.env.local")
        return False

    load_dotenv(env_path)

    print("Coinbase Prime Credential Check")
    print("=" * 70)
    print(f"Loading from: {env_path}\n")

    # Define required credentials (check both naming conventions)
    required_creds = {
        "ACCESS_KEY": ["COINBASE_PRIME_ACCESS_KEY", "COINBASE_PRIME_API_KEY"],
        "SIGNING_KEY": ["COINBASE_PRIME_SIGNING_KEY"],
        "PASSPHRASE": ["COINBASE_PRIME_PASSPHRASE"],
        "PORTFOLIO_ID": ["COINBASE_PRIME_PORTFOLIO_ID"]
    }

    all_present = True

    for display_name, env_var_list in required_creds.items():
        # Try each possible environment variable name
        value = None
        found_var = None
        for env_var in env_var_list:
            value = os.getenv(env_var)
            if value:
                found_var = env_var
                break

        if value:
            # Mask value for security (show first 8 and last 4 chars)
            if len(value) > 12:
                masked = f"{value[:8]}...{value[-4:]}"
            else:
                masked = f"{value[:4]}..." if len(value) > 4 else "***"

            print(f"✅ {display_name:15} ({found_var})")
            print(f"   Value: {masked} (length: {len(value)})")
        else:
            print(f"❌ {display_name:15} (tried: {', '.join(env_var_list)})")
            print(f"   Status: MISSING")
            all_present = False

    print("\n" + "=" * 70)

    if all_present:
        print("✅ All credentials present and loaded successfully!\n")
        return True
    else:
        print("❌ Some credentials are missing. Please update .env.local\n")
        print("Required format in .env.local:")
        print("COINBASE_PRIME_API_KEY=your_access_key  (or COINBASE_PRIME_ACCESS_KEY)")
        print("COINBASE_PRIME_SIGNING_KEY=your_signing_key")
        print("COINBASE_PRIME_PASSPHRASE=your_passphrase")
        print("COINBASE_PRIME_PORTFOLIO_ID=your_portfolio_id")
        return False

if __name__ == "__main__":
    check_credentials()
