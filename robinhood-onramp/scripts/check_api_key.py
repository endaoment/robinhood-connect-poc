#!/usr/bin/env python3
"""
Check and potentially decrypt Coinbase Prime API Key format

The API keys appear to be in an encrypted format with = as separator.
Let's test different decoding strategies.
"""

import os
import base64
from pathlib import Path
from dotenv import load_dotenv

# Load credentials
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(env_path)

def analyze_api_key():
    """Analyze the API key format"""
    
    api_key_raw = os.getenv("COINBASE_PRIME_API_KEY")
    
    print("=" * 70)
    print("Coinbase Prime API Key Analysis")
    print("=" * 70)
    
    print(f"\nRaw value from .env.local:")
    print(f"  {api_key_raw}")
    print(f"  Length: {len(api_key_raw)}")
    
    # Check if it contains = (might be encrypted with key=value format)
    if "=" in api_key_raw:
        parts = api_key_raw.split("=", 1)
        print(f"\nContains '=' separator:")
        print(f"  Part 1 (encryption key?): {parts[0]}")
        print(f"  Part 2 (encrypted value?): {parts[1]}")
        
        # Try base64 decoding the second part
        try:
            decoded = base64.b64decode(parts[1])
            print(f"\n  Part 2 base64 decoded:")
            print(f"    {decoded}")
            print(f"    Length: {len(decoded)}")
        except Exception as e:
            print(f"\n  Base64 decode failed: {e}")
    
    # Check signing key too
    signing_key_raw = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    print(f"\n" + "=" * 70)
    print("Signing Key Analysis")
    print("=" * 70)
    print(f"\nRaw value from .env.local:")
    print(f"  {signing_key_raw}")
    print(f"  Length: {len(signing_key_raw)}")
    
    if "=" in signing_key_raw:
        parts = signing_key_raw.split("=", 1)
        print(f"\nContains '=' separator:")
        print(f"  Part 1: {parts[0]}")
        print(f"  Part 2: {parts[1]}")
        
        # Try base64 decoding
        try:
            decoded = base64.b64decode(parts[1])
            print(f"\n  Part 2 base64 decoded:")
            print(f"    {decoded}")
            print(f"    Length: {len(decoded)}")
        except Exception as e:
            print(f"\n  Base64 decode failed: {e}")
    
    # Check passphrase
    passphrase_raw = os.getenv("COINBASE_PRIME_PASSPHRASE")
    print(f"\n" + "=" * 70)
    print("Passphrase Analysis")
    print("=" * 70)
    print(f"\nRaw value from .env.local:")
    print(f"  {passphrase_raw}")
    print(f"  Length: {len(passphrase_raw)}")
    
    if "=" in passphrase_raw:
        parts = passphrase_raw.split("=", 1)
        print(f"\nContains '=' separator:")
        print(f"  Part 1: {parts[0]}")
        print(f"  Part 2: {parts[1]}")
        
        # Try base64 decoding
        try:
            decoded = base64.b64decode(parts[1])
            print(f"\n  Part 2 base64 decoded:")
            print(f"    {decoded}")
            print(f"    Length: {len(decoded)}")
        except Exception as e:
            print(f"\n  Base64 decode failed: {e}")
    
    print(f"\n" + "=" * 70)
    print("Recommendation:")
    print("=" * 70)
    print("\nThe credentials appear to be in encrypted format: key=value")
    print("You likely need to use ONLY the part AFTER the '=' sign.")
    print("\nOr these might be encrypted and need proper decryption.")

if __name__ == "__main__":
    analyze_api_key()
