#!/usr/bin/env python3
"""
Get Deposit Address for Existing Wallet

Uses the "Zora OTC" wallet we saw in the list.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from prime_api_client import CoinbasePrimeClient


def get_deposit_address():
    """Get deposit address for an existing wallet"""
    
    print("=" * 80)
    print("Coinbase Prime - Get Deposit Address for Existing Wallet")
    print("=" * 80)
    
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
    
    # Use the "Zora OTC" wallet we saw in the list
    # Wallet ID from our earlier list: 4d7f0ba8-85e6-4ac7-8ce2-b5f0bae97d4b
    wallet_id = "4d7f0ba8-85e6-4ac7-8ce2-b5f0bae97d4b"
    wallet_name = "Zora OTC"
    symbol = "ZORA"
    
    print(f"\n[2/3] Using existing wallet...")
    print(f"  Name:      {wallet_name}")
    print(f"  Symbol:    {symbol}")
    print(f"  Wallet ID: {wallet_id}")
    
    # Get deposit address
    print(f"\n[3/3] Retrieving deposit address...")
    try:
        address, memo = client.get_wallet_deposit_address(wallet_id)
        
        print("✅ Deposit address retrieved!")
        
        print("\n" + "=" * 80)
        print("DEPOSIT ADDRESS")
        print("=" * 80)
        print(f"\nWallet Details:")
        print(f"  Name:       {wallet_name}")
        print(f"  Symbol:     {symbol}")
        print(f"  Wallet ID:  {wallet_id}")
        
        print(f"\nDeposit Address:")
        print(f"  Address:    {address}")
        if memo:
            print(f"  Memo/Tag:   {memo}")
        else:
            print(f"  Memo/Tag:   (not required for {symbol})")
        
        print("\n" + "=" * 80)
        print("SUCCESS - This proves we can retrieve deposit addresses!")
        print("=" * 80)
        
        return {
            "wallet_id": wallet_id,
            "name": wallet_name,
            "symbol": symbol,
            "address": address,
            "memo": memo
        }
        
    except Exception as e:
        print(f"❌ Failed to get deposit address: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    try:
        wallet_info = get_deposit_address()
        print(f"\n✅ Successfully demonstrated deposit address retrieval!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        exit(1)
