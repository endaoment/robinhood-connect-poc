#!/usr/bin/env python3
"""
List All Coinbase Prime Wallets

Displays all wallets in the portfolio with detailed information.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from prime_api_client import CoinbasePrimeClient


def list_all_wallets():
    """List all wallets with detailed information"""
    
    print("=" * 100)
    print("Coinbase Prime - All Wallets")
    print("=" * 100)
    
    # Load credentials
    env_path = Path(__file__).parent.parent / ".env.local"
    load_dotenv(env_path)
    
    access_key = os.getenv("COINBASE_PRIME_ACCESS_KEY") or os.getenv("COINBASE_PRIME_API_KEY")
    signing_key = os.getenv("COINBASE_PRIME_SIGNING_KEY")
    passphrase = os.getenv("COINBASE_PRIME_PASSPHRASE")
    portfolio_id = os.getenv("COINBASE_PRIME_PORTFOLIO_ID")
    
    # Initialize client
    client = CoinbasePrimeClient(access_key, signing_key, passphrase, portfolio_id)
    
    # Get all wallets (with pagination support)
    all_wallets = []
    cursor = None
    page = 1
    
    print(f"\nFetching wallets from portfolio: {portfolio_id}\n")
    
    while True:
        print(f"Fetching page {page}...", end=" ")
        result = client.list_wallets(cursor=cursor)
        
        wallets = result.get("wallets", [])
        all_wallets.extend(wallets)
        
        print(f"Found {len(wallets)} wallets")
        
        # Check if there are more pages
        pagination = result.get("pagination", {})
        cursor = pagination.get("next_cursor")
        
        if not cursor:
            break
        
        page += 1
    
    print(f"\n{'=' * 100}")
    print(f"Total Wallets Found: {len(all_wallets)}")
    print(f"{'=' * 100}\n")
    
    # Group wallets by type
    wallets_by_type = {}
    for wallet in all_wallets:
        wallet_type = wallet.get("wallet_type", "UNKNOWN")
        if wallet_type not in wallets_by_type:
            wallets_by_type[wallet_type] = []
        wallets_by_type[wallet_type].append(wallet)
    
    # Display summary
    print("Wallet Summary by Type:")
    print("-" * 100)
    for wallet_type, wallets in sorted(wallets_by_type.items()):
        print(f"  {wallet_type:20} {len(wallets):3} wallets")
    print()
    
    # Display detailed wallet list
    print(f"{'=' * 100}")
    print("Detailed Wallet List")
    print(f"{'=' * 100}\n")
    
    # Sort by symbol then name for easier reading
    sorted_wallets = sorted(all_wallets, key=lambda w: (w.get("symbol", ""), w.get("name", "")))
    
    # Print header
    print(f"{'#':<4} {'Symbol':<10} {'Name':<35} {'Type':<15} {'ID':<40}")
    print("-" * 100)
    
    # Print each wallet
    for idx, wallet in enumerate(sorted_wallets, 1):
        symbol = wallet.get("symbol", "???")
        name = wallet.get("name", "Unnamed")
        wallet_type = wallet.get("wallet_type", "???")
        wallet_id = wallet.get("id", "")
        
        # Truncate long names
        if len(name) > 35:
            name = name[:32] + "..."
        
        print(f"{idx:<4} {symbol:<10} {name:<35} {wallet_type:<15} {wallet_id}")
    
    print(f"\n{'=' * 100}")
    
    # Group by symbol to show duplicates
    print("\nWallets Grouped by Symbol:")
    print("-" * 100)
    
    wallets_by_symbol = {}
    for wallet in all_wallets:
        symbol = wallet.get("symbol", "UNKNOWN")
        if symbol not in wallets_by_symbol:
            wallets_by_symbol[symbol] = []
        wallets_by_symbol[symbol].append(wallet)
    
    for symbol, wallets in sorted(wallets_by_symbol.items()):
        print(f"\n{symbol} ({len(wallets)} wallet{'s' if len(wallets) != 1 else ''}):")
        for wallet in wallets:
            name = wallet.get("name", "Unnamed")
            wallet_type = wallet.get("wallet_type", "???")
            wallet_id = wallet.get("id", "")
            print(f"  • {name:<40} [{wallet_type:<15}] {wallet_id}")
    
    print(f"\n{'=' * 100}")
    print("Export Complete")
    print(f"{'=' * 100}\n")
    
    # Return data for potential CSV export
    return all_wallets

if __name__ == "__main__":
    wallets = list_all_wallets()
    
    # Optionally save to CSV
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--csv":
        import csv
        from datetime import datetime
        
        filename = f"coinbase_prime_wallets_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        with open(filename, 'w', newline='') as f:
            if wallets:
                writer = csv.DictWriter(f, fieldnames=wallets[0].keys())
                writer.writeheader()
                writer.writerows(wallets)
        
        print(f"✅ Saved to: {filename}")

