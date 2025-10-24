#!/usr/bin/env python3
"""
Test Coinbase Prime API with different credential interpretations

Try: full string, commented values, etc.
"""

import hashlib
import hmac
import time
import os
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load credentials
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(env_path)

def generate_signature(signing_key: str, timestamp: str, method: str, path: str, body: str = "") -> str:
    """Generate HMAC SHA256 signature"""
    message = f"{timestamp}{method}{path}{body}"
    signature = hmac.new(
        signing_key.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature

def test_with_full_string():
    """Test using the ENTIRE credential string (both parts)"""
    
    print("=" * 70)
    print("Test 1: Using FULL credential string (including both parts)")
    print("=" * 70)
    
    access_key = os.getenv("COINBASE_PRIME_API_KEY")
    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    passphrase = os.getenv("COINBASE_PRIME_PASSPHRASE")
    
    print(f"\nAccess Key (full): {access_key}")
    print(f"Signing Key (full, first 50 chars): {signing_key[:50]}...")
    print(f"Passphrase (full): {passphrase}")
    
    timestamp = str(int(time.time()))
    method = "GET"
    path = "/v1/portfolios"
    body = ""
    
    signature = generate_signature(signing_key, timestamp, method, path, body)
    
    headers = {
        "X-CB-ACCESS-KEY": access_key,
        "X-CB-ACCESS-PASSPHRASE": passphrase,
        "X-CB-ACCESS-SIGNATURE": signature,
        "X-CB-ACCESS-TIMESTAMP": timestamp,
        "Content-Type": "application/json"
    }
    
    url = "https://api.prime.coinbase.com/v1/portfolios"
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"\nStatus: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS!")
            return True
        else:
            print(f"❌ Failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_with_full_string()
    
    if not success:
        print("\n" + "=" * 70)
        print("RECOMMENDATION")
        print("=" * 70)
        print("\nThe credentials appear to be encrypted.")
        print("The format is: encryptionKey=encryptedValue")
        print("\nYou need to provide the ACTUAL unencrypted Coinbase Prime credentials.")
        print("\nPlease check with the team for:")
        print("  1. The real Access Key (not encrypted)")
        print("  2. The real Signing Key (not encrypted)")
        print("  3. The real Passphrase (not encrypted)")
        print("\nThese should be available in Coinbase Prime UI under:")
        print("  Settings → API Keys → [Your API Key] → View Details")
