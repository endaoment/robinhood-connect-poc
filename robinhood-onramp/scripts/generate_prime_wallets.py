#!/usr/bin/env python3
"""
Generate Deposit Addresses for Robinhood-Supported Assets

Retrieves Trading Balance wallet addresses for all assets that Robinhood supports.
Maps asset symbols to their Coinbase Prime deposit addresses.
"""

import json
import logging
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from prime_api_client import CoinbasePrimeClient

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Robinhood-supported assets mapped to their symbols in Coinbase Prime
# Based on the network-addresses.ts configuration
ROBINHOOD_ASSETS = {
    # EVM Networks (main native tokens)
    'ETH': 'ETHEREUM',           # Ethereum
    'POL': 'POLYGON',            # Polygon (formerly MATIC)
    'ARB': 'ARBITRUM',           # Arbitrum
    'ETH_BASE': 'BASE',          # Base (uses ETH)
    'OP': 'OPTIMISM',            # Optimism
    'ZORA': 'ZORA',              # Zora
    'AVAX': 'AVALANCHE',         # Avalanche
    'ETC': 'ETHEREUM_CLASSIC',   # Ethereum Classic
    
    # Bitcoin-like
    'BTC': 'BITCOIN',
    'BCH': 'BITCOIN_CASH',
    'LTC': 'LITECOIN',
    'DOGE': 'DOGECOIN',
    
    # Other L1s
    'SOL': 'SOLANA',
    'ADA': 'CARDANO',
    'XTZ': 'TEZOS',
    'SUI': 'SUI',
    
    # Networks requiring memos
    'XLM': 'STELLAR',
    'XRP': 'XRP',
    'HBAR': 'HEDERA',
    
    # TON (low priority - placeholder in config)
    # 'TON': 'TONCOIN',
}

def get_robinhood_wallet_addresses():
    """Get Trading Balance wallet addresses for all Robinhood-supported assets"""
    
    print("=" * 100)
    print("Coinbase Prime - Robinhood Asset Deposit Addresses")
    print("=" * 100)
    
    # Load credentials
    env_path = Path(__file__).parent.parent / ".env.local"
    load_dotenv(env_path)
    
    access_key = os.getenv("COINBASE_PRIME_ACCESS_KEY") or os.getenv("COINBASE_PRIME_API_KEY")
    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    passphrase = os.getenv("COINBASE_PRIME_PASSPHRASE")
    portfolio_id = os.getenv("COINBASE_PRIME_PORTFOLIO_ID")
    
    # Initialize client
    logger.info("Initializing API client...")
    client = CoinbasePrimeClient(access_key, signing_key, passphrase, portfolio_id)
    print("✅ API client initialized\n")
    
    # Get all wallets (ALL pages)
    logger.info("Fetching all wallets across all pages...")
    all_wallets = []
    cursor = None
    page = 1
    
    while True:
        print(f"  Fetching page {page}...", end=" ")
        result = client.list_wallets(cursor=cursor)
        wallets = result.get("wallets", [])
        all_wallets.extend(wallets)
        print(f"found {len(wallets)} wallets (total: {len(all_wallets)})")
        
        # Check for next page
        pagination = result.get("pagination", {})
        has_next = pagination.get("has_next", False)
        
        if not has_next:
            break
        
        cursor = pagination.get("next_cursor")
        if not cursor:
            break
        
        page += 1
        time.sleep(0.2)  # Small delay between pages
    
    logger.info(f"Found {len(all_wallets)} total wallets across {page} pages")
    
    # Create lookup by symbol
    wallets_by_symbol = {}
    for wallet in all_wallets:
        symbol = wallet.get("symbol")
        if symbol:
            if symbol not in wallets_by_symbol:
                wallets_by_symbol[symbol] = []
            wallets_by_symbol[symbol].append(wallet)
    
    print(f"[1/2] Found wallets for {len(wallets_by_symbol)} different symbols")
    print(f"[2/2] Retrieving deposit addresses for Robinhood assets...\n")
    
    print("=" * 100)
    
    results = []
    found_count = 0
    missing_count = 0
    
    for symbol, network_name in sorted(ROBINHOOD_ASSETS.items()):
        print(f"\n{symbol:10} ({network_name})")
        
        # Find Trading Balance wallet for this symbol
        if symbol not in wallets_by_symbol:
            print(f"  ⚠️  No wallet found for {symbol}")
            missing_count += 1
            results.append({
                "symbol": symbol,
                "network": network_name,
                "status": "missing",
                "address": None,
                "memo": None,
                "wallet_id": None
            })
            continue
        
        # Look for Trading Balance wallet
        trading_wallets = [
            w for w in wallets_by_symbol[symbol]
            if "Trading Balance" in w.get("name", "")
        ]
        
        if not trading_wallets:
            # Try any wallet with this symbol
            trading_wallets = wallets_by_symbol[symbol]
            print(f"  ℹ️  No 'Trading Balance' wallet, using: {trading_wallets[0].get('name')}")
        
        wallet = trading_wallets[0]
        wallet_id = wallet.get("id")
        wallet_name = wallet.get("name")
        
        print(f"  Wallet: {wallet_name}")
        print(f"  ID:     {wallet_id}")
        
        try:
            address, memo = client.get_wallet_deposit_address(wallet_id)
            
            print(f"  ✅ Address: {address}")
            if memo:
                print(f"  📝 Memo:    {memo}")
            
            found_count += 1
            results.append({
                "symbol": symbol,
                "network": network_name,
                "status": "found",
                "wallet_name": wallet_name,
                "wallet_id": wallet_id,
                "address": address,
                "memo": memo
            })
            
            # Small delay to avoid rate limiting
            time.sleep(0.3)
            
        except Exception as e:
            logger.error(f"Failed to get address for {symbol}: {e}")
            print(f"  ❌ Failed: {e}")
            results.append({
                "symbol": symbol,
                "network": network_name,
                "status": "error",
                "wallet_id": wallet_id,
                "address": None,
                "memo": None,
                "error": str(e)
            })
            continue
    
    # Summary
    print("\n" + "=" * 100)
    print("SUMMARY")
    print("=" * 100)
    print(f"\nRobinhood Assets: {len(ROBINHOOD_ASSETS)}")
    print(f"  ✅ Found:     {found_count}")
    print(f"  ⚠️  Missing:   {missing_count}")
    print(f"  ❌ Errors:    {len(results) - found_count - missing_count}")
    
    # Show addresses
    print("\n" + "=" * 100)
    print("DEPOSIT ADDRESSES FOR ROBINHOOD INTEGRATION")
    print("=" * 100)
    
    for r in results:
        if r['status'] == 'found':
            print(f"\n{r['symbol']:10} → {r['network']}")
            print(f"  Address: {r['address']}")
            if r['memo']:
                print(f"  Memo:    {r['memo']}")
    
    # Missing wallets
    if missing_count > 0:
        print("\n" + "=" * 100)
        print("MISSING WALLETS (need to be created)")
        print("=" * 100)
        for r in results:
            if r['status'] == 'missing':
                print(f"  • {r['symbol']:10} ({r['network']})")
    
    print("\n" + "=" * 100)
    
    return results

if __name__ == "__main__":
    try:
        results = get_robinhood_wallet_addresses()
        
        # Save to JSON
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"robinhood_assets_addresses_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n✅ Results saved to: {filename}")
        
        # Also create a TypeScript-friendly format
        ts_filename = f"robinhood_assets_addresses_{timestamp}.ts"
        with open(ts_filename, 'w') as f:
            f.write("// Coinbase Prime Trading Balance Deposit Addresses\n")
            f.write("// Generated: " + datetime.now().isoformat() + "\n\n")
            f.write("export const PRIME_DEPOSIT_ADDRESSES = {\n")
            
            for r in results:
                if r['status'] == 'found':
                    f.write(f"  {r['network']}: '{r['address']}',")
                    if r['memo']:
                        f.write(f" // Memo: {r['memo']}")
                    f.write("\n")
            
            f.write("}\n\n")
            
            f.write("export const PRIME_DEPOSIT_MEMOS = {\n")
            for r in results:
                if r['status'] == 'found' and r['memo']:
                    f.write(f"  {r['network']}: '{r['memo']}',\n")
            f.write("}\n")
        
        print(f"✅ TypeScript format saved to: {ts_filename}")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
