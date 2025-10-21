#!/usr/bin/env python3
"""
Get Trading Balance Addresses for ALL Robinhood-Supported Assets

Maps every asset that Robinhood supports to its Coinbase Prime Trading Balance wallet.
Each asset gets its own unique address, regardless of shared network.

Reference: https://robinhood.com/us/en/support/articles/coin-availability/
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
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# TRANSFER-ELIGIBLE Robinhood crypto assets
# These are the ONLY assets that can be deposited/withdrawn on Robinhood
# Source: https://robinhood.com/us/en/support/articles/crypto-transfers/
# This is the definitive list for Robinhood Connect integration
ROBINHOOD_SUPPORTED_ASSETS = {
    # Major L1s
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'DOGE': 'Dogecoin',
    'LTC': 'Litecoin',
    'BCH': 'Bitcoin Cash',
    'SOL': 'Solana',
    'ADA': 'Cardano',
    'AVAX': 'Avalanche',
    'XRP': 'XRP',
    'XLM': 'Stellar Lumens',
    'SUI': 'Sui',
    'XTZ': 'Tezos',
    'TON': 'Toncoin',
    'ETC': 'Ethereum Classic',
    'HBAR': 'Hedera',
    
    # L2s
    'ARB': 'Arbitrum',
    'OP': 'Optimism',
    'ZORA': 'Zora',
    
    # DeFi tokens (on Ethereum)
    'AAVE': 'Aave',
    'LINK': 'Chainlink',
    'COMP': 'Compound',
    'CRV': 'Curve DAO',
    'UNI': 'Uniswap',
    'ONDO': 'Ondo',
    
    # Stablecoins
    'USDC': 'USD Coin',  # Multi-network: Arbitrum, Base, Ethereum, Optimism, Polygon, Solana
    
    # Meme coins on Ethereum
    'SHIB': 'Shiba Inu',
    'PEPE': 'Pepecoin',
    'FLOKI': 'Floki',
    
    # Meme coins on Solana
    'BONK': 'BONK',
    'MEW': 'cat in a dogs world',
    'WIF': 'Dogwifhat',
    'MOODENG': 'Moo Deng',
    'TRUMP': 'OFFICIAL TRUMP',
    'PNUT': 'Peanut the Squirrel',
    'POPCAT': 'Popcat',
    'PENGU': 'Pudgy Penguins',
    
    # Recent additions
    'VIRTUAL': 'Virtuals Protocol',
    'WLFI': 'World Liberty Financial',
}

def get_all_robinhood_asset_addresses():
    """Get Trading Balance wallet addresses for ALL Robinhood-supported assets"""
    
    print("=" * 100)
    print("Coinbase Prime - ALL Robinhood Asset Deposit Addresses")
    print("=" * 100)
    print(f"\nTarget: {len(ROBINHOOD_SUPPORTED_ASSETS)} Robinhood-supported assets")
    
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
    
    # Get ALL wallets across all pages
    logger.info("Fetching ALL wallets across all pages (this may take a minute)...")
    all_wallets = []
    cursor = None
    page = 1
    
    while True:
        print(f"  Fetching page {page}...", end=" ", flush=True)
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
    
    print(f"\n✅ Fetched {len(all_wallets)} total wallets across {page} pages")
    
    # Create lookup by symbol
    print("\nBuilding wallet lookup by symbol...")
    wallets_by_symbol = {}
    for wallet in all_wallets:
        symbol = wallet.get("symbol")
        if symbol:
            if symbol not in wallets_by_symbol:
                wallets_by_symbol[symbol] = []
            wallets_by_symbol[symbol].append(wallet)
    
    print(f"✅ Found wallets for {len(wallets_by_symbol)} different asset symbols\n")
    
    # Retrieve deposit addresses for Robinhood assets
    print("=" * 100)
    print(f"Retrieving deposit addresses for {len(ROBINHOOD_SUPPORTED_ASSETS)} Robinhood assets...")
    print("=" * 100)
    
    results = []
    found_count = 0
    missing_count = 0
    error_count = 0
    
    for symbol, asset_name in sorted(ROBINHOOD_SUPPORTED_ASSETS.items()):
        print(f"\n{symbol:10} ({asset_name})")
        
        # Check if we have a wallet for this symbol
        if symbol not in wallets_by_symbol:
            print(f"  ⚠️  No wallet found for {symbol}")
            missing_count += 1
            results.append({
                "symbol": symbol,
                "asset_name": asset_name,
                "status": "missing",
                "address": None,
                "memo": None,
                "wallet_id": None,
                "wallet_name": None
            })
            continue
        
        # Look for Trading Balance wallet (preferred)
        wallets = wallets_by_symbol[symbol]
        trading_balance_wallet = None
        
        for w in wallets:
            if "Trading Balance" in w.get("name", ""):
                trading_balance_wallet = w
                break
        
        # If no Trading Balance, use first wallet
        if not trading_balance_wallet:
            trading_balance_wallet = wallets[0]
            print(f"  ℹ️  No 'Trading Balance' wallet, using: {trading_balance_wallet.get('name')}")
        
        wallet_id = trading_balance_wallet.get("id")
        wallet_name = trading_balance_wallet.get("name")
        
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
                "asset_name": asset_name,
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
            error_count += 1
            results.append({
                "symbol": symbol,
                "asset_name": asset_name,
                "status": "error",
                "wallet_name": wallet_name,
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
    print(f"\nRobinhood Supported Assets: {len(ROBINHOOD_SUPPORTED_ASSETS)}")
    print(f"  ✅ Found:     {found_count}")
    print(f"  ⚠️  Missing:   {missing_count}")
    print(f"  ❌ Errors:    {error_count}")
    print(f"\nCoverage: {found_count}/{len(ROBINHOOD_SUPPORTED_ASSETS)} ({100*found_count/len(ROBINHOOD_SUPPORTED_ASSETS):.1f}%)")
    
    return results

if __name__ == "__main__":
    try:
        results = get_all_robinhood_asset_addresses()
        
        # Save comprehensive results
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save JSON
        json_filename = f"robinhood-assets-config_{timestamp}.json"
        with open(json_filename, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n✅ Full results saved to: {json_filename}")
        
        # Save TypeScript config file
        ts_filename = f"robinhood-assets-config_{timestamp}.ts"
        with open(ts_filename, 'w') as f:
            f.write("/**\n")
            f.write(" * Coinbase Prime Trading Balance Deposit Addresses\n")
            f.write(" * for ALL Robinhood-supported assets\n")
            f.write(f" * Generated: {datetime.now().isoformat()}\n")
            f.write(f" * Coverage: {len([r for r in results if r['status'] == 'found'])}/{len(results)} assets\n")
            f.write(" */\n\n")
            
            # Group by status
            found = [r for r in results if r['status'] == 'found']
            missing = [r for r in results if r['status'] == 'missing']
            
            f.write("export const ROBINHOOD_ASSET_ADDRESSES: Record<string, { address: string; memo?: string }> = {\n")
            for r in sorted(found, key=lambda x: x['symbol']):
                if r['memo']:
                    f.write(f"  {r['symbol']}: {{ address: '{r['address']}', memo: '{r['memo']}' }}, // {r['asset_name']}\n")
                else:
                    f.write(f"  {r['symbol']}: {{ address: '{r['address']}' }}, // {r['asset_name']}\n")
            f.write("}\n\n")
            
            if missing:
                f.write("/**\n")
                f.write(" * Missing wallets - need to be created in Coinbase Prime\n")
                f.write(" */\n")
                f.write("export const MISSING_ROBINHOOD_ASSETS = [\n")
                for r in sorted(missing, key=lambda x: x['symbol']):
                    f.write(f"  '{r['symbol']}', // {r['asset_name']}\n")
                f.write("]\n")
        
        print(f"✅ TypeScript config saved to: {ts_filename}")
        
        # Print summary of missing wallets
        missing = [r for r in results if r['status'] == 'missing']
        if missing:
            print(f"\n⚠️  Missing {len(missing)} wallets:")
            for r in sorted(missing, key=lambda x: x['symbol']):
                print(f"    • {r['symbol']:10} - {r['asset_name']}")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

