"""
Test Daffy-Style Pre-Selected Asset Transfer URLs

This script generates permutations of URLs where the asset IS pre-selected
(like Daffy does), focusing on the transfer + paymentMethod approach.

Usage:
    python3 scripts/test_daffy_style_urls.py

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

# Test with ETH on Ethereum (most common case)
TEST_ASSET = "ETH"
TEST_NETWORK = "ETHEREUM"
TEST_WALLET = "0xa22d566f52b303049d27a7169ed17a925b3fdb5e"

# Other asset/network combinations to test
ASSET_NETWORK_COMBOS = [
    {"asset": "ETH", "network": "ETHEREUM", "wallet": "0xa22d566f52b303049d27a7169ed17a925b3fdb5e"},
    {"asset": "BTC", "network": "BITCOIN", "wallet": "3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC"},
    {"asset": "SOL", "network": "SOLANA", "wallet": "DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1"},
    {"asset": "USDC", "network": "ETHEREUM", "wallet": "0xd71a079cb64480334ffb400f017a0dde94f553dd"},
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
# Daffy-Style URL Permutations
# ============================================================================

def main():
    """Generate all Daffy-style URL permutations"""
    
    print("="*80)
    print("DAFFY-STYLE PRE-SELECTED ASSET TRANSFER URL TESTING")
    print("="*80)
    print()
    print("Goal: Test transfer flow with pre-selected asset (like Daffy)")
    print()
    print("Configuration:")
    print(f"  App ID: {APP_ID}")
    print(f"  Redirect: {REDIRECT_URL}")
    print(f"  Primary Test Asset: {TEST_ASSET} on {TEST_NETWORK}")
    print()
    
    results = []
    scenario_num = 1
    
    # ========================================================================
    # Group 1: Basic Daffy Pattern Variations
    # ========================================================================
    print("\n" + "="*80)
    print("GROUP 1: BASIC DAFFY PATTERN (walletAddress + asset + network)")
    print("="*80)
    
    # 1. Minimal Daffy style
    results.append(print_scenario(
        scenario_num, 
        "Minimal Daffy Style",
        "Just wallet, asset, network, no extra params",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 2. Daffy + connectId
    results.append(print_scenario(
        scenario_num,
        "Daffy + connectId",
        "Wallet + asset + network + connectId (from your email)",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "connectId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 3. Daffy + referenceId
    results.append(print_scenario(
        scenario_num,
        "Daffy + referenceId",
        "Wallet + asset + network + referenceId",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "referenceId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # ========================================================================
    # Group 2: Add paymentMethod
    # ========================================================================
    print("\n" + "="*80)
    print("GROUP 2: WITH PAYMENT METHOD")
    print("="*80)
    
    # 4. Daffy + paymentMethod
    results.append(print_scenario(
        scenario_num,
        "Daffy + Payment Method",
        "Add paymentMethod=crypto_balance",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "paymentMethod": "crypto_balance",
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 5. Daffy + paymentMethod + connectId (Your email example)
    results.append(print_scenario(
        scenario_num,
        "Email Example (Exact)",
        "Format from your email to Will (PREFERRED)",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "connectId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
            "paymentMethod": "crypto_balance",
        }
    ))
    scenario_num += 1
    
    # 6. Daffy + paymentMethod + referenceId
    results.append(print_scenario(
        scenario_num,
        "Daffy + Payment + Reference",
        "paymentMethod + referenceId combo",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "referenceId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
            "paymentMethod": "crypto_balance",
        }
    ))
    scenario_num += 1
    
    # ========================================================================
    # Group 3: Add flow=transfer
    # ========================================================================
    print("\n" + "="*80)
    print("GROUP 3: WITH FLOW=TRANSFER")
    print("="*80)
    
    # 7. Daffy + flow
    results.append(print_scenario(
        scenario_num,
        "Daffy + Transfer Flow",
        "Add flow=transfer parameter",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "flow": "transfer",
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 8. Daffy + flow + paymentMethod
    results.append(print_scenario(
        scenario_num,
        "Daffy + Flow + Payment",
        "flow=transfer + paymentMethod=crypto_balance",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 9. Daffy + flow + paymentMethod + connectId
    results.append(print_scenario(
        scenario_num,
        "Full Daffy (connectId)",
        "flow + paymentMethod + connectId",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "connectId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 10. Daffy + flow + paymentMethod + referenceId
    results.append(print_scenario(
        scenario_num,
        "Full Daffy (referenceId)",
        "flow + paymentMethod + referenceId",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "referenceId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # ========================================================================
    # Group 4: Add offRamp flag
    # ========================================================================
    print("\n" + "="*80)
    print("GROUP 4: WITH OFFRAMP FLAG")
    print("="*80)
    
    # 11. Daffy + offRamp
    results.append(print_scenario(
        scenario_num,
        "Daffy + OffRamp Flag",
        "Add offRamp=true",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "offRamp": True,
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 12. Daffy + offRamp + paymentMethod + connectId
    results.append(print_scenario(
        scenario_num,
        "Daffy + OffRamp + Payment",
        "offRamp + paymentMethod + connectId",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "offRamp": True,
            "paymentMethod": "crypto_balance",
            "connectId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # 13. Kitchen sink
    results.append(print_scenario(
        scenario_num,
        "Kitchen Sink",
        "ALL parameters: offRamp + flow + paymentMethod + connectId",
        {
            "applicationId": APP_ID,
            "walletAddress": TEST_WALLET,
            "supportedAssets": TEST_ASSET,
            "supportedNetworks": TEST_NETWORK,
            "offRamp": True,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "connectId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
        }
    ))
    scenario_num += 1
    
    # ========================================================================
    # Group 5: Other Assets (BTC, SOL, USDC)
    # ========================================================================
    print("\n" + "="*80)
    print("GROUP 5: OTHER ASSETS (using best pattern from Group 2, Scenario 5)")
    print("="*80)
    
    for combo in ASSET_NETWORK_COMBOS[1:]:  # Skip ETH since we already tested it
        results.append(print_scenario(
            scenario_num,
            f"Daffy Style - {combo['asset']}",
            f"{combo['asset']} on {combo['network']} (email pattern)",
            {
                "applicationId": APP_ID,
                "walletAddress": combo['wallet'],
                "supportedAssets": combo['asset'],
                "supportedNetworks": combo['network'],
                "connectId": generate_reference_id(),
                "redirectUrl": REDIRECT_URL,
                "paymentMethod": "crypto_balance",
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
    output_file = "daffy_style_url_test_results.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Generated {len(results)} Daffy-style test URLs")
    print(f"📄 Results saved to: {output_file}")
    
    print("\n" + "="*80)
    print("RECOMMENDED TEST ORDER:")
    print("="*80)
    print("\n1. SCENARIO 5 - Email Example (Exact)")
    print("   → This is the format from your email to Will")
    print("\n2. SCENARIO 8 - Daffy + Flow + Payment")
    print("   → Explicit about transfer intent")
    print("\n3. SCENARIO 4 - Daffy + Payment Method")
    print("   → Simpler, just payment method added")
    print("\n4. SCENARIO 1 - Minimal Daffy Style")
    print("   → Absolute minimum parameters")
    print("\n5. Try other scenarios if above don't work")
    
    print("\n" + "="*80)
    print("WHAT SUCCESS LOOKS LIKE:")
    print("="*80)
    print("\n✅ URL opens Robinhood Connect")
    print("✅ Shows ETH as pre-selected")
    print("✅ Can enter amount to transfer")
    print("✅ Shows 'Transfer to Robinhood Crypto Balance' option")
    print("✅ Completes transfer without 'Invalid URL' error")
    
    print("\n" + "="*80)


if __name__ == "__main__":
    main()

