"""
Test Transfer Flow Without Asset Pre-Selection

Goal: See if we can use flow=transfer + paymentMethod=crypto_balance
WITHOUT pre-selecting an asset, allowing users to see balances first.

Usage:
    python3 scripts/test_transfer_no_preselect.py

Author: Endaoment
Date: October 22, 2025
"""

import json
import urllib.parse
from typing import Any, Dict
from uuid import uuid4

# ============================================================================
# Configuration
# ============================================================================

APP_ID = "db2c834a-a740-4dfc-bbaf-06887558185f"
REDIRECT_URL = "https://unsinfully-microcosmical-pierce.ngrok-free.dev/callback"

# All supported networks
ALL_NETWORKS = [
    "AVALANCHE",
    "BITCOIN",
    "BITCOIN_CASH",
    "DOGECOIN",
    "ETHEREUM",
    "ETHEREUM_CLASSIC",
    "LITECOIN",
    "POLYGON",
    "SOLANA",
    "STELLAR",
    "TEZOS",
]


# ============================================================================
# Helper Functions
# ============================================================================

def generate_reference_id() -> str:
    """Generate a UUID v4 reference ID"""
    return str(uuid4())


def build_url(params: Dict[str, Any]) -> str:
    """Build Robinhood Connect URL with given parameters"""
    base_url = "https://applink.robinhood.com/u/connect"
    
    # Convert all values to strings
    encoded_params = {}
    for key, value in params.items():
        if value is None:
            continue
        if isinstance(value, bool):
            encoded_params[key] = "true" if value else "false"
        elif isinstance(value, list):
            encoded_params[key] = ",".join(str(v) for v in value)
        else:
            encoded_params[key] = str(value)
    
    query_string = urllib.parse.urlencode(encoded_params)
    return f"{base_url}?{query_string}"


def print_scenario(num: int, name: str, description: str, params: Dict[str, Any]):
    """Print a formatted scenario"""
    url = build_url(params)
    
    print(f"\n{'='*80}")
    print(f"SCENARIO {num}: {name}")
    print('-'*80)
    print(f"Description: {description}\n")
    print("Parameters:")
    for key, value in params.items():
        if isinstance(value, list) and len(value) > 3:
            print(f"  {key}: [{value[0]}, {value[1]}, ... ({len(value)} total)]")
        else:
            print(f"  {key}: {value}")
    print(f"\nGenerated URL:\n{url}")
    print('='*80)
    
    return {
        "scenario": num,
        "name": name,
        "description": description,
        "url": url,
        "params": params
    }


# ============================================================================
# Main Test Scenarios
# ============================================================================

def main():
    """Generate transfer flow URLs without asset pre-selection"""
    
    print("="*80)
    print("TRANSFER FLOW - NO ASSET PRE-SELECTION TESTING")
    print("="*80)
    print()
    print("Goal: Use transfer flow but let user select asset after seeing balances")
    print()
    print("Configuration:")
    print(f"  App ID: {APP_ID}")
    print(f"  Redirect: {REDIRECT_URL}")
    print(f"  Networks: {len(ALL_NETWORKS)} supported")
    print()
    print("Key: NO walletAddress, NO supportedAssets, NO assetCode")
    print()
    
    results = []
    scenario_num = 1
    
    # ========================================================================
    # Transfer Flow Variations (No Asset Pre-Selection)
    # ========================================================================
    
    # 1. Basic transfer flow - just flow + paymentMethod + networks
    results.append(print_scenario(
        scenario_num,
        "Transfer Flow - Basic",
        "flow=transfer + paymentMethod + networks (NO asset/wallet)",
        {
            "applicationId": APP_ID,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "supportedNetworks": ALL_NETWORKS,
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 2. Transfer flow + referenceId
    results.append(print_scenario(
        scenario_num,
        "Transfer + Reference ID",
        "Add referenceId for tracking",
        {
            "applicationId": APP_ID,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "supportedNetworks": ALL_NETWORKS,
            "referenceId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 3. Transfer flow + connectId
    results.append(print_scenario(
        scenario_num,
        "Transfer + Connect ID",
        "Use connectId instead of referenceId",
        {
            "applicationId": APP_ID,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "supportedNetworks": ALL_NETWORKS,
            "connectId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 4. Transfer flow + offRamp flag
    results.append(print_scenario(
        scenario_num,
        "Transfer + OffRamp Flag",
        "Add offRamp=true (this was in your working URL)",
        {
            "applicationId": APP_ID,
            "offRamp": True,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "supportedNetworks": ALL_NETWORKS,
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 5. Transfer flow + offRamp + referenceId (Your working URL pattern)
    results.append(print_scenario(
        scenario_num,
        "Working Pattern - No Asset ⭐",
        "Exact pattern from your working URL but WITHOUT asset pre-selection",
        {
            "applicationId": APP_ID,
            "offRamp": True,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "supportedNetworks": ALL_NETWORKS,
            "referenceId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 6. Transfer flow + offRamp + connectId
    results.append(print_scenario(
        scenario_num,
        "Working Pattern + connectId",
        "Same as above but with connectId",
        {
            "applicationId": APP_ID,
            "offRamp": True,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "supportedNetworks": ALL_NETWORKS,
            "connectId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 7. Without offRamp flag
    results.append(print_scenario(
        scenario_num,
        "No OffRamp Flag",
        "flow + paymentMethod + referenceId (NO offRamp)",
        {
            "applicationId": APP_ID,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "supportedNetworks": ALL_NETWORKS,
            "referenceId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 8. Just flow parameter
    results.append(print_scenario(
        scenario_num,
        "Flow Only",
        "Just flow=transfer + networks (minimal)",
        {
            "applicationId": APP_ID,
            "flow": "transfer",
            "supportedNetworks": ALL_NETWORKS,
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 9. Just paymentMethod parameter
    results.append(print_scenario(
        scenario_num,
        "Payment Method Only",
        "Just paymentMethod=crypto_balance + networks",
        {
            "applicationId": APP_ID,
            "paymentMethod": "crypto_balance",
            "supportedNetworks": ALL_NETWORKS,
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 10. OffRamp only (your original approach)
    results.append(print_scenario(
        scenario_num,
        "OffRamp Only",
        "Just offRamp=true + networks (original approach)",
        {
            "applicationId": APP_ID,
            "offRamp": True,
            "supportedNetworks": ALL_NETWORKS,
            "referenceId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # ========================================================================
    # Summary
    # ========================================================================
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    # Save to JSON
    output_file = "transfer_no_preselect_results.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Generated {len(results)} test URLs")
    print(f"📄 Results saved to: {output_file}")
    
    print("\n" + "="*80)
    print("RECOMMENDED TEST ORDER:")
    print("="*80)
    print("\n⭐ SCENARIO 5 - Working Pattern - No Asset")
    print("   → Same as your working URL but WITHOUT asset pre-selection")
    print("\n2. SCENARIO 4 - Transfer + OffRamp Flag")
    print("   → Add offRamp to transfer flow")
    print("\n3. SCENARIO 2 - Transfer + Reference ID")
    print("   → Transfer flow with tracking ID")
    print("\n4. SCENARIO 1 - Transfer Flow - Basic")
    print("   → Simplest transfer approach")
    print("\n5. Try remaining scenarios if needed")
    
    print("\n" + "="*80)
    print("WHAT WE'RE TESTING:")
    print("="*80)
    print("\n❓ Can Robinhood Connect show 'Transfer' flow without pre-selecting asset?")
    print("\nIf YES:")
    print("  ✅ User sees list of assets with balances")
    print("  ✅ User selects asset to transfer")
    print("  ✅ User enters amount")
    print("  ✅ Transfer completes successfully")
    print("\nIf NO:")
    print("  ❌ Shows 'Invalid URL' error")
    print("  ❌ Or requires asset to be pre-selected in URL")
    
    print("\n" + "="*80)
    print("KEY INSIGHT FROM YOUR WORKING URLS:")
    print("="*80)
    print("\nYour working URLs had:")
    print("  • flow=transfer")
    print("  • paymentMethod=crypto_balance")
    print("  • offRamp=true")
    print("  • supportedNetworks=[list]")
    print("  • supportedAssets=ETH (pre-selected)")
    print("  • walletAddress=0x... (destination)")
    print("\nNow testing WITHOUT:")
    print("  • supportedAssets (no pre-selection)")
    print("  • walletAddress (will provide via API callback)")
    print("\n" + "="*80)


if __name__ == "__main__":
    main()

