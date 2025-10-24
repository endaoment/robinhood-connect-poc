#!/usr/bin/env python3
"""
Get Deposit Addresses for Trading Balance Wallets

Retrieves deposit addresses for all "Trading Balance" wallets.
"""

import os
import time
from pathlib import Path

from dotenv import load_dotenv
from prime_api_client import CoinbasePrimeClient


def get_trading_balance_addresses():
    """Get deposit addresses for all Trading Balance wallets"""
    
    print("=" * 100)
    print("Coinbase Prime - Trading Balance Wallet Deposit Addresses")
    print("=" * 100)
    
    # Load credentials
    env_path = Path(__file__).parent.parent / ".env.local"
    load_dotenv(env_path)
    
    access_key = os.getenv("COINBASE_PRIME_ACCESS_KEY") or os.getenv("COINBASE_PRIME_API_KEY")
    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    passphrase = os.getenv("COINBASE_PRIME_PASSPHRASE")
    portfolio_id = os.getenv("COINBASE_PRIME_PORTFOLIO_ID")
    
    # Initialize client
    print(f"\n[1/3] Initializing API client...")
    client = CoinbasePrimeClient(access_key, signing_key, passphrase, portfolio_id)
    print("✅ Client initialized")
    
    # Get first page of wallets
    print(f"\n[2/3] Fetching Trading Balance wallets...")
    result = client.list_wallets()
    all_wallets = result.get("wallets", [])
    
    # Filter for Trading Balance wallets
    trading_balance_wallets = [
        w for w in all_wallets 
        if "Trading Balance" in w.get("name", "")
    ]
    
    print(f"✅ Found {len(trading_balance_wallets)} Trading Balance wallets (from first page)")
    
    # Get deposit addresses for first 10 as a sample
    print(f"\n[3/3] Retrieving deposit addresses (first 10 as sample)...")
    print("\n" + "=" * 100)
    
    results = []
    for idx, wallet in enumerate(trading_balance_wallets[:10], 1):
        wallet_id = wallet.get("id")
        name = wallet.get("name")
        symbol = wallet.get("symbol")
        
        print(f"\n[{idx}/10] {symbol} - {name}")
        print(f"  Wallet ID: {wallet_id}")
        
        try:
            address, memo = client.get_wallet_deposit_address(wallet_id)
            
            print(f"  ✅ Address:  {address}")
            if memo:
                print(f"  📝 Memo:     {memo}")
            
            results.append({
                "symbol": symbol,
                "name": name,
                "wallet_id": wallet_id,
                "address": address,
                "memo": memo
            })
            
            # Small delay to avoid rate limiting
            time.sleep(0.5)
            
        except Exception as e:
            print(f"  ❌ Failed: {e}")
            continue
    
    # Summary
    print("\n" + "=" * 100)
    print("SUMMARY - Trading Balance Deposit Addresses")
    print("=" * 100)
    
    for r in results:
        print(f"\n{r['symbol']:10} ({r['name']})")
        print(f"  Address: {r['address']}")
        if r['memo']:
            print(f"  Memo:    {r['memo']}")
    
    print("\n" + "=" * 100)
    print(f"Retrieved {len(results)} deposit addresses successfully!")
    print("=" * 100)
    
    return results

if __name__ == "__main__":
    try:
        results = get_trading_balance_addresses()
        
        # Optionally save to file
        import json
        from datetime import datetime
        
        filename = f"trading_balance_addresses_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n✅ Results saved to: {filename}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

