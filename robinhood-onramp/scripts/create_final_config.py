#!/usr/bin/env python3
"""
Create Final Robinhood Asset Configuration

Adds fallback Ethereum address for missing EVM-based meme coins.
Creates production-ready configuration file.
"""

import json
from pathlib import Path

# Fallback address for missing Ethereum-based tokens
FALLBACK_ETH_ADDRESS = "0x9D5025B327E6B863E5050141C987d988c07fd8B2"

# Load the generated config
config_file = Path("robinhood-assets-config_20251020_213357.json")
with open(config_file, 'r') as f:
    assets = json.load(f)

# Missing EVM assets that can use fallback address
MISSING_EVM_ASSETS = {
    'FLOKI': 'Ethereum',
    'PEPE': 'Ethereum',
    'TRUMP': 'Ethereum',
    'VIRTUAL': 'Ethereum',
    'WLFI': 'Ethereum',
}

# Missing Solana assets (need their own wallets - can't use fallback)
MISSING_SOLANA_ASSETS = {
    'MEW': 'Solana',
    'PENGU': 'Solana',
    'PNUT': 'Solana',
    'POPCAT': 'Solana',
    'WIF': 'Solana',
}

print("=" * 100)
print("Creating Final Robinhood Asset Configuration")
print("=" * 100)

# Update missing EVM assets with fallback address
updated_count = 0
for asset in assets:
    symbol = asset.get('symbol')
    if symbol in MISSING_EVM_ASSETS and asset.get('status') == 'missing':
        asset['address'] = FALLBACK_ETH_ADDRESS
        asset['status'] = 'fallback'
        asset['note'] = f"Using fallback Ethereum address (no dedicated Trading Balance wallet)"
        asset['chain'] = MISSING_EVM_ASSETS[symbol]
        updated_count += 1
        print(f"✅ {symbol:10} → Using fallback address: {FALLBACK_ETH_ADDRESS}")

# Add chain info for missing Solana assets
for asset in assets:
    symbol = asset.get('symbol')
    if symbol in MISSING_SOLANA_ASSETS and asset.get('status') == 'missing':
        asset['chain'] = MISSING_SOLANA_ASSETS[symbol]
        asset['note'] = "Missing - Solana meme coin (needs Trading Balance wallet or fallback Solana address)"

# Add chain info and clean up found assets
for asset in assets:
    if asset.get('status') == 'found':
        asset.pop('status', None)  # Remove status field for found assets
        # Add memo field even if empty for consistency
        if 'memo' not in asset:
            asset['memo'] = None
        elif asset['memo'] == "":
            asset['memo'] = None

print(f"\n✅ Updated {updated_count} EVM assets with fallback address")

# Count final stats
total = len(assets)
with_address = len([a for a in assets if a.get('address')])
with_dedicated_wallet = len([a for a in assets if a.get('wallet_id')])
missing = len([a for a in assets if not a.get('address')])

print("\n" + "=" * 100)
print("FINAL COVERAGE")
print("=" * 100)
print(f"\nTotal Robinhood Transfer-Eligible Assets: {total}")
print(f"  ✅ With deposit address:        {with_address} ({100*with_address/total:.1f}%)")
print(f"  🎯 With dedicated CB wallet:    {with_dedicated_wallet} ({100*with_dedicated_wallet/total:.1f}%)")
print(f"  🔄 Using fallback address:      {with_address - with_dedicated_wallet}")
print(f"  ⚠️  Still missing:               {missing}")

# Save updated config
output_file = "robinhood-assets-config.json"
with open(output_file, 'w') as f:
    json.dump(assets, f, indent=2)

print(f"\n✅ Final configuration saved to: {output_file}")

# Create TypeScript version
ts_file = "robinhood-assets-config.ts"
with open(ts_file, 'w') as f:
    f.write("/**\n")
    f.write(" * Coinbase Prime Deposit Addresses for ALL Robinhood Transfer-Eligible Assets\n")
    f.write(f" * Total: {total} assets\n")
    f.write(f" * Coverage: {with_address}/{total} ({100*with_address/total:.1f}%)\n")
    f.write(f" * Dedicated wallets: {with_dedicated_wallet}\n")
    f.write(f" * Fallback addresses: {with_address - with_dedicated_wallet}\n")
    f.write(" * \n")
    f.write(" * Reference: https://robinhood.com/us/en/support/articles/crypto-transfers/\n")
    f.write(" */\n\n")
    
    f.write("export const ROBINHOOD_ASSET_ADDRESSES: Record<string, { address: string; memo?: string; note?: string }> = {\n")
    
    for asset in sorted(assets, key=lambda x: x['symbol']):
        symbol = asset['symbol']
        address = asset.get('address')
        memo = asset.get('memo')
        note = asset.get('note', '')
        
        if address:
            if memo:
                f.write(f"  {symbol}: {{ address: '{address}', memo: '{memo}' }},")
            else:
                f.write(f"  {symbol}: {{ address: '{address}' }},")
            
            if note:
                f.write(f" // {note}")
            f.write("\n")
    
    f.write("}\n\n")
    
    # Add missing assets as a separate export
    missing_assets = [a for a in assets if not a.get('address')]
    if missing_assets:
        f.write("/**\n")
        f.write(" * Assets still missing deposit addresses\n")
        f.write(" * These need Trading Balance wallets or fallback addresses\n")
        f.write(" */\n")
        f.write("export const MISSING_ASSETS = [\n")
        for asset in sorted(missing_assets, key=lambda x: x['symbol']):
            chain = asset.get('chain', 'Unknown')
            f.write(f"  {{ symbol: '{asset['symbol']}', name: '{asset['asset_name']}', chain: '{chain}' }},\n")
        f.write("]\n")

print(f"✅ TypeScript config saved to: {ts_file}")

print("\n" + "=" * 100)
print("SUMMARY BY CHAIN")
print("=" * 100)

# Group by chain
by_chain = {}
for asset in assets:
    # Infer chain from address format or explicitly set
    symbol = asset['symbol']
    address = asset.get('address', '')
    
    if not address:
        chain = "Missing"
    elif address.startswith('0x') and len(address) == 42:
        chain = "Ethereum" if symbol in ['ETH', 'AAVE', 'LINK', 'COMP', 'CRV', 'UNI', 'USDC', 'USDT', 'ONDO', 'SHIB', 'FLOKI', 'PEPE', 'TRUMP', 'VIRTUAL', 'WLFI'] else "EVM"
    elif address.startswith('0x') and len(address) > 60:
        chain = "Sui"
    elif address.startswith(('D', 'E', 'F', 'G', 'H', 'B', 'C', '2', '3', '4', '5', '6', '7', '8', '9', 'p')) and len(address) > 40:
        chain = "Solana"
    elif address.startswith('3'):
        chain = "Bitcoin"
    elif address.startswith('q'):
        chain = "Bitcoin Cash"
    elif address.startswith('M'):
        chain = "Litecoin"
    elif address.startswith('addr1'):
        chain = "Cardano"
    elif address.startswith('cosmos'):
        chain = "Cosmos"
    elif address.startswith('sei'):
        chain = "Sei"
    elif address.startswith('celestia'):
        chain = "Celestia"
    elif address.startswith('0.0.'):
        chain = "Hedera"
    elif address.startswith('GB'):
        chain = "Stellar"
    elif address.startswith('r'):
        chain = "XRP"
    elif address.startswith('tz'):
        chain = "Tezos"
    elif address.startswith('t1'):
        chain = "Zcash"
    elif address.startswith('SP'):
        chain = "Stacks"
    elif 'coinbase' in address.lower():
        chain = "EOS"
    else:
        chain = asset.get('chain', 'Other')
    
    if chain not in by_chain:
        by_chain[chain] = []
    by_chain[chain].append(asset['symbol'])

for chain, symbols in sorted(by_chain.items()):
    print(f"\n{chain} ({len(symbols)} assets):")
    for symbol in sorted(symbols):
        print(f"  • {symbol}")

print("\n" + "=" * 100)
print("✅ Configuration complete and ready for production!")
print("=" * 100)

