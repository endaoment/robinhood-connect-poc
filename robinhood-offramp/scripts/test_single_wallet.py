#!/usr/bin/env python3
"""
Test Single Wallet Creation

Creates one test wallet and retrieves its deposit address.
"""

import os
import time
from pathlib import Path

from dotenv import load_dotenv
from prime_api_client import CoinbasePrimeClient


def create_test_wallet():
    """Create a single test wallet and get its deposit address"""
    
    print("=" * 80)
    print("Coinbase Prime - Test Wallet Creation")
    print("=" * 80)
    
    # Load credentials
    env_path = Path(__file__).parent.parent / ".env.local"
    load_dotenv(env_path)
    
    access_key = os.getenv("COINBASE_PRIME_ACCESS_KEY") or os.getenv("COINBASE_PRIME_API_KEY")
    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    passphrase = os.getenv("COINBASE_PRIME_PASSPHRASE")
    portfolio_id = os.getenv("COINBASE_PRIME_PORTFOLIO_ID")
    
    # Initialize client
    print(f"\n[1/4] Initializing API client...")
    client = CoinbasePrimeClient(access_key, signing_key, passphrase, portfolio_id)
    print("✅ Client initialized")
    
    # Create wallet
    import datetime
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    wallet_name = f"RH-Test-{timestamp}"
    symbol = "ETH"  # Using ETH as test asset
    
    print(f"\n[2/4] Creating wallet...")
    print(f"  Name:   {wallet_name}")
    print(f"  Symbol: {symbol}")
    print(f"  Type:   TRADING")
    
    try:
        result = client.create_trading_wallet(symbol=symbol, name=wallet_name)
        print("✅ Wallet creation request submitted")
        
        # The API might return an activity_id for async operations
        if "activity_id" in result:
            activity_id = result.get("activity_id")
            print(f"  Activity ID: {activity_id}")
            print(f"  Note: Wallet creation is asynchronous, checking status...")
        
        wallet_id = result.get("wallet_id") or result.get("id")
        
        if not wallet_id:
            print("\n⚠️  Wallet ID not immediately available (async creation)")
            print("  Searching for newly created wallet...")
            
            # Wait a moment for wallet to be created
            time.sleep(3)
            
            # Search for the wallet by name
            wallets_result = client.list_wallets()
            wallets = wallets_result.get("wallets", [])
            
            # Find wallet with matching name
            matching_wallet = None
            for w in wallets:
                if w.get("name") == wallet_name and w.get("symbol") == symbol:
                    matching_wallet = w
                    break
            
            if matching_wallet:
                wallet_id = matching_wallet.get("id")
                print(f"✅ Found wallet: {wallet_id}")
            else:
                print("❌ Could not find newly created wallet")
                print("   Listing all ETH wallets:")
                for w in wallets:
                    if w.get("symbol") == symbol:
                        print(f"     - {w.get('name')}: {w.get('id')}")
                return
        
        print(f"  Wallet ID: {wallet_id}")
        
    except Exception as e:
        error_msg = str(e)
        # Check for 409 Conflict or "already exists" message
        if "409" in error_msg or "already exists" in error_msg.lower() or "duplicate" in error_msg.lower() or "Conflict" in error_msg:
            print("⚠️  Wallet with this name already exists")
            print("  Searching for existing wallet...")
            
            # Find existing wallet
            wallets_result = client.list_wallets()
            wallets = wallets_result.get("wallets", [])
            
            matching_wallet = None
            for w in wallets:
                if w.get("name") == wallet_name and w.get("symbol") == symbol:
                    matching_wallet = w
                    break
            
            if matching_wallet:
                wallet_id = matching_wallet.get("id")
                print(f"✅ Found existing wallet: {wallet_id}")
            else:
                print("❌ Could not find existing wallet")
                print("\nSearching all ETH wallets:")
                for w in wallets:
                    if w.get("symbol") == symbol:
                        print(f"  - Name: '{w.get('name')}', ID: {w.get('id')}")
                raise
        else:
            print(f"❌ Wallet creation failed: {e}")
            raise
    
    # Wait a moment to ensure wallet is fully active
    print(f"\n[3/4] Waiting for wallet activation...")
    time.sleep(2)
    print("✅ Ready to retrieve deposit address")
    
    # Get deposit address
    print(f"\n[4/4] Retrieving deposit address...")
    try:
        address, memo = client.get_wallet_deposit_address(wallet_id)
        
        print("✅ Deposit address retrieved!")
        
        print("\n" + "=" * 80)
        print("WALLET CREATED SUCCESSFULLY")
        print("=" * 80)
        print(f"\nWallet Details:")
        print(f"  Name:       {wallet_name}")
        print(f"  Symbol:     {symbol}")
        print(f"  Type:       TRADING")
        print(f"  Wallet ID:  {wallet_id}")
        
        print(f"\nDeposit Address:")
        print(f"  Address:    {address}")
        if memo:
            print(f"  Memo/Tag:   {memo}")
        else:
            print(f"  Memo/Tag:   (not required for {symbol})")
        
        print("\n" + "=" * 80)
        print("SUCCESS!")
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
        print(f"\nWallet was created (ID: {wallet_id}) but deposit address retrieval failed.")
        print("This might be because the wallet is still activating. Try again in a moment.")
        raise

if __name__ == "__main__":
    try:
        wallet_info = create_test_wallet()
        print(f"\n✅ All operations completed successfully!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
