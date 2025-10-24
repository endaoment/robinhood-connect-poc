#!/usr/bin/env python3
"""
Generate Deposit Addresses for Robinhood-Supported Assets

Priority order for wallet selection:
1. Trading account (preferred for active trading)
2. Trading Balance (fallback)
3. Any other wallet type

Usage:
  python3 generate_prime_wallets.py              # Returns preferred wallets only
  python3 generate_prime_wallets.py --all-wallets # Returns all wallets for prioritization
"""

import argparse
import json
import logging
import os
import sys
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
    
    # ERC-20 Tokens (on Ethereum)
    'USDC': 'ETHEREUM',    # USD Coin
    'AAVE': 'ETHEREUM',    # Aave
    'LINK': 'ETHEREUM',    # Chainlink
    'UNI': 'ETHEREUM',     # Uniswap
    'COMP': 'ETHEREUM',    # Compound
    'CRV': 'ETHEREUM',     # Curve
    'ONDO': 'ETHEREUM',    # Ondo
    
    # Meme coins
    'SHIB': 'ETHEREUM',    # Shiba Inu (ERC-20)
    'PEPE': 'ETHEREUM',    # Pepecoin (ERC-20)
    'FLOKI': 'ETHEREUM',   # Floki (ERC-20)
    'BONK': 'SOLANA',      # BONK (Solana)
    'MOODENG': 'SOLANA',   # Moo Deng (Solana)
    'TRUMP': 'SOLANA',     # TRUMP (Solana)
    
    # Other tokens
    'VIRTUAL': 'ETHEREUM', # Virtuals Protocol
    'WLFI': 'ETHEREUM',    # World Liberty Financial
    
    # TON (low priority - placeholder in config)
    # 'TON': 'TONCOIN',
}

def get_robinhood_wallet_addresses(return_all_wallets=False, json_only=False):
    """
    Get wallet addresses for all Robinhood-supported assets

    Args:
        return_all_wallets: If True, returns ALL wallets per symbol.
                          If False, returns only the preferred wallet (Trading > Trading Balance)
        json_only: If True, suppress all print statements (output only JSON)
    """
    
    # Helper to print progress (goes to stderr in json_only mode)
    def progress(msg):
        if json_only:
            print(msg, file=sys.stderr)
        else:
            print(msg)
    
    if not json_only:
        print("=" * 100)
        print("Coinbase Prime - Robinhood Asset Deposit Addresses")
        if return_all_wallets:
            print("Mode: Returning ALL wallet types for each asset")
        else:
            print("Mode: Returning PREFERRED wallet only (Trading > Trading Balance)")
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
    progress("✅ API client initialized")
    
    # Get all wallets (ALL pages)
    logger.info("Fetching all wallets across all pages...")
    all_wallets = []
    cursor = None
    page = 1
    
    while True:
        progress(f"  Fetching page {page}...")
        result = client.list_wallets(cursor=cursor)
        wallets = result.get("wallets", [])
        all_wallets.extend(wallets)
        progress(f"  ✓ Page {page}: found {len(wallets)} wallets (total: {len(all_wallets)})")
        
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
    
    progress(f"\n[1/2] Found wallets for {len(wallets_by_symbol)} different symbols")
    progress(f"[2/2] Retrieving deposit addresses for {len(ROBINHOOD_ASSETS)} Robinhood assets...")
    
    if not json_only:
        print("=" * 100)
    
    results = []
    found_count = 0
    missing_count = 0
    total_assets = len(ROBINHOOD_ASSETS)
    current_asset = 0
    
    for symbol, network_name in sorted(ROBINHOOD_ASSETS.items()):
        current_asset += 1
        progress(f"[{current_asset}/{total_assets}] Processing {symbol} ({network_name})...")
        
        # Find ALL wallets for this symbol
        if symbol not in wallets_by_symbol:
            if not json_only:
                print(f"  ⚠️  No wallet found for {symbol}")
            missing_count += 1
            results.append({
                "symbol": symbol,
                "network": network_name,
                "status": "missing",
                "address": None,
                "memo": None,
                "wallet_id": None,
                "wallet_name": None
            })
            continue
        
        symbol_wallets = wallets_by_symbol[symbol]
        
        if return_all_wallets:
            # Return ALL wallets for this symbol
            for wallet_idx, wallet in enumerate(symbol_wallets, 1):
                wallet_id = wallet.get("id")
                wallet_name = wallet.get("name")
                
                if not json_only:
                    print(f"  Wallet {wallet_idx}/{len(symbol_wallets)}: {wallet_name}")
                    print(f"  ID:     {wallet_id}")
                
                try:
                    address, memo = client.get_wallet_deposit_address(wallet_id)
                    
                    if not json_only:
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
                    
                    time.sleep(0.05)  # Reduced delay for faster execution (still prevents rate limiting)
                    
                except Exception as e:
                    logger.error(f"Failed to get address for {symbol} ({wallet_name}): {e}")
                    if not json_only:
                        print(f"  ❌ Failed: {e}")
        
        else:
            # Return only PREFERRED wallet (existing priority logic)
            # Priority 1: Trading account (exact match)
            trading_wallet = next(
                (w for w in symbol_wallets if w.get("name") == "Trading"),
                None
            )
            
            # Priority 2: Trading Balance
            if not trading_wallet:
                trading_wallet = next(
                    (w for w in symbol_wallets if "Trading Balance" in w.get("name", "")),
                    None
                )
            
            # Priority 3: Any wallet
            if not trading_wallet:
                trading_wallet = symbol_wallets[0]
                print(f"  ℹ️  Using: {trading_wallet.get('name')} (no Trading/Trading Balance found)")
            
            wallet = trading_wallet
            wallet_id = wallet.get("id")
            wallet_name = wallet.get("name")
            
            print(f"  Wallet: {wallet_name}")
            print(f"  ID:     {wallet_id}")
            
            if len(symbol_wallets) > 1:
                print(f"  📊 Note: {len(symbol_wallets)} wallets available, selected: {wallet_name}")
            
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
                
                time.sleep(0.3)
                
            except Exception as e:
                logger.error(f"Failed to get address for {symbol}: {e}")
                print(f"  ❌ Failed: {e}")
                results.append({
                    "symbol": symbol,
                    "network": network_name,
                    "status": "error",
                    "wallet_id": wallet_id,
                    "wallet_name": wallet_name,
                    "address": None,
                    "memo": None,
                    "error": str(e)
                })
                continue
    
    # Summary
    progress(f"\n✅ Complete! Found {found_count} addresses ({missing_count} missing)")
    
    if not json_only:
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
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Fetch Coinbase Prime wallet addresses")
    parser.add_argument(
        "--all-wallets",
        action="store_true",
        help="Return all wallets per symbol instead of just the preferred one"
    )
    parser.add_argument(
        "--json-only",
        action="store_true",
        help="Output only JSON to stdout (for TypeScript consumption)"
    )
    args = parser.parse_args()
    
    try:
        # Suppress stdout if json_only mode
        if args.json_only:
            import io
            old_stdout = sys.stdout
            sys.stdout = io.StringIO()  # Capture all prints
        
        results = get_robinhood_wallet_addresses(
            return_all_wallets=args.all_wallets,
            json_only=args.json_only
        )
        
        if args.json_only:
            # Restore stdout and output ONLY JSON
            sys.stdout = old_stdout
            print(json.dumps(results, indent=2))
        else:
            # Save to JSON file
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"robinhood_assets_addresses_{timestamp}.json"
            
            with open(filename, 'w') as f:
                json.dump(results, f, indent=2)
            
            print(f"\n✅ Results saved to: {filename}")
            
            # Also create a TypeScript-friendly format
            ts_filename = f"robinhood_assets_addresses_{timestamp}.ts"
            with open(ts_filename, 'w') as f:
                f.write("// Coinbase Prime Deposit Addresses\n")
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
        sys.exit(1)
