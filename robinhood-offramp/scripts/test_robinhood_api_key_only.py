#!/usr/bin/env python3
"""
Test Coinbase Prime API with just the value after = sign

The credentials appear to be in format: key=value
Let's test using ONLY the value part (after =)
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

def extract_credential_value(raw_value):
    """Extract the actual credential from key=value format"""
    if "=" in raw_value:
        return raw_value.split("=", 1)[1]
    return raw_value

def generate_signature(signing_key: str, timestamp: str, method: str, path: str, body: str = "") -> str:
    """Generate HMAC SHA256 signature"""
    message = f"{timestamp}{method}{path}{body}"
    
    signature = hmac.new(
        signing_key.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return signature

def test_with_extracted_values():
    """Test API call with extracted credential values"""
    
    print("=" * 70)
    print("Testing with EXTRACTED credential values (after = sign)")
    print("=" * 70)
    
    # Get raw values
    access_key_raw = os.getenv("COINBASE_PRIME_API_KEY")
    signing_key_raw = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    passphrase_raw = os.getenv("COINBASE_PRIME_PASSPHRASE")
    portfolio_id = os.getenv("COINBASE_PRIME_PORTFOLIO_ID")
    
    # Extract actual values (part after =)
    access_key = extract_credential_value(access_key_raw)
    signing_key = extract_credential_value(signing_key_raw)
    passphrase = extract_credential_value(passphrase_raw)
    
    print(f"\nExtracted Access Key: {access_key[:20]}...{access_key[-8:]}")
    print(f"Extracted Signing Key: {signing_key[:20]}...{signing_key[-8:]}")
    print(f"Extracted Passphrase: {passphrase[:10]}...{passphrase[-6:]}")
    
    # Request parameters
    timestamp = str(int(time.time()))
    method = "GET"
    path = "/v1/portfolios"
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
    
    print(f"\nMaking API request to: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"\n{'='*70}")
        print(f"Response Status: {response.status_code}")
        print(f"{'='*70}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! Authentication worked with extracted values!")
            
            data = response.json()
            portfolios = data.get("portfolios", [])
            
            print(f"\nFound {len(portfolios)} portfolio(s):")
            for portfolio in portfolios:
                portfolio_id = portfolio.get("id")
                name = portfolio.get("name", "Unnamed")
                print(f"  - {name} (ID: {portfolio_id})")
                
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    test_with_extracted_values()
