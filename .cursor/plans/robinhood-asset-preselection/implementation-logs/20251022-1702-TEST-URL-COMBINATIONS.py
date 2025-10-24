"""
Test URL Parameter Combinations for Robinhood Connect

Goal: Find the correct URL parameter combination that allows users to:
1. NOT pre-select an asset
2. See their balances in Robinhood Connect UI
3. Select the asset AFTER seeing balances
4. Complete transfer to our wallet address

This script generates many URL combinations to test different approaches.

Usage:
    python3 scripts/test_url_combinations.py

Author: Endaoment
Date: October 22, 2025
"""

import json
import urllib.parse
from typing import Any, Dict, List, Optional
from uuid import uuid4

# ============================================================================
# Configuration
# ============================================================================

APP_ID = "db2c834a-a740-4dfc-bbaf-06887558185f"
REDIRECT_URL = "https://unsinfully-microcosmical-pierce.ngrok-free.dev/callback"

# Networks supported by Robinhood Connect (confirmed Oct 22, 2025)
SUPPORTED_NETWORKS = [
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

# Common assets available on Robinhood
SUPPORTED_ASSETS = [
    "BTC", "ETH", "USDC", "SOL", "MATIC", "LTC", "DOGE", "AVAX",
    "ADA", "XLM", "XTZ", "ETC", "BCH", "AAVE", "LINK", "COMP",
    "CRV", "UNI", "ONDO", "SHIB", "PEPE", "BONK"
]

# Sample wallet address (Ethereum)
SAMPLE_WALLET_ADDRESS = "0xa22d566f52b303049d27a7169ed17a925b3fdb5e"


# ============================================================================
# URL Builder Functions
# ============================================================================

def generate_reference_id() -> str:
    """Generate a UUID v4 reference ID"""
    return str(uuid4())


def build_url(params: Dict[str, Any]) -> str:
    """
    Build Robinhood Connect URL with given parameters
    
    Args:
        params: Dictionary of URL parameters
        
    Returns:
        Complete URL string
    """
    base_url = "https://applink.robinhood.com/u/connect"
    
    # Convert all values to strings and handle lists
    encoded_params = {}
    for key, value in params.items():
        if value is None:
            continue
        if isinstance(value, list):
            encoded_params[key] = ",".join(str(v) for v in value)
        elif isinstance(value, bool):
            encoded_params[key] = "true" if value else "false"
        else:
            encoded_params[key] = str(value)
    
    query_string = urllib.parse.urlencode(encoded_params)
    return f"{base_url}?{query_string}"


# ============================================================================
# Test Scenarios
# ============================================================================

def scenario_1_basic_offramp() -> Dict[str, Any]:
    """
    Scenario 1: Basic offramp - just networks, no asset pre-selection
    
    This is the ideal: user sees all their balances and selects
    """
    return {
        "name": "Basic Offramp - No Asset Pre-selection",
        "description": "Simplest approach: just networks + offramp flag",
        "params": {
            "applicationId": APP_ID,
            "offRamp": True,
            "supportedNetworks": SUPPORTED_NETWORKS,
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
        }
    }


def scenario_2_with_asset_list() -> Dict[str, Any]:
    """
    Scenario 2: Include supportedAssets parameter with list of all assets
    
    Hypothesis: Maybe we need to list supported assets explicitly
    """
    return {
        "name": "With Supported Assets List",
        "description": "Add supportedAssets parameter listing all assets we accept",
        "params": {
            "applicationId": APP_ID,
            "offRamp": True,
            "supportedNetworks": SUPPORTED_NETWORKS,
            "supportedAssets": SUPPORTED_ASSETS,
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
        }
    }


def scenario_3_flow_parameter() -> Dict[str, Any]:
    """
    Scenario 3: Add explicit flow=transfer parameter
    
    Hypothesis: Maybe we need to specify the flow type
    """
    return {
        "name": "Explicit Transfer Flow",
        "description": "Add flow=transfer to indicate transfer intent",
        "params": {
            "applicationId": APP_ID,
            "offRamp": True,
            "flow": "transfer",
            "supportedNetworks": SUPPORTED_NETWORKS,
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
        }
    }


def scenario_4_wallet_address() -> Dict[str, Any]:
    """
    Scenario 4: Include walletAddress parameter
    
    Hypothesis: Maybe we provide ONE wallet address and they handle routing
    """
    return {
        "name": "With Wallet Address",
        "description": "Provide a single wallet address (Ethereum)",
        "params": {
            "applicationId": APP_ID,
            "offRamp": True,
            "walletAddress": SAMPLE_WALLET_ADDRESS,
            "supportedNetworks": SUPPORTED_NETWORKS,
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
        }
    }


def scenario_5_payment_method() -> Dict[str, Any]:
    """
    Scenario 5: Specify paymentMethod=crypto_balance
    
    Hypothesis: This tells Robinhood we want to transfer from crypto balance
    """
    return {
        "name": "Payment Method - Crypto Balance",
        "description": "Specify paymentMethod=crypto_balance for transfers",
        "params": {
            "applicationId": APP_ID,
            "offRamp": True,
            "paymentMethod": "crypto_balance",
            "supportedNetworks": SUPPORTED_NETWORKS,
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
        }
    }


def scenario_6_combined_approach() -> Dict[str, Any]:
    """
    Scenario 6: Combine flow + paymentMethod
    
    Hypothesis: Both flow and paymentMethod might be needed
    """
    return {
        "name": "Combined Flow + Payment Method",
        "description": "flow=transfer + paymentMethod=crypto_balance",
        "params": {
            "applicationId": APP_ID,
            "offRamp": True,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "supportedNetworks": SUPPORTED_NETWORKS,
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
        }
    }


def scenario_7_wallet_plus_flow() -> Dict[str, Any]:
    """
    Scenario 7: Wallet address + flow=transfer
    
    Hypothesis: Provide destination and flow type
    """
    return {
        "name": "Wallet + Transfer Flow",
        "description": "walletAddress + flow=transfer",
        "params": {
            "applicationId": APP_ID,
            "offRamp": True,
            "walletAddress": SAMPLE_WALLET_ADDRESS,
            "flow": "transfer",
            "supportedNetworks": SUPPORTED_NETWORKS,
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
        }
    }


def scenario_8_full_combination() -> Dict[str, Any]:
    """
    Scenario 8: Everything combined
    
    Hypothesis: Maybe we need all parameters
    """
    return {
        "name": "Full Combination",
        "description": "All parameters: wallet, flow, paymentMethod, assets",
        "params": {
            "applicationId": APP_ID,
            "offRamp": True,
            "walletAddress": SAMPLE_WALLET_ADDRESS,
            "flow": "transfer",
            "paymentMethod": "crypto_balance",
            "supportedNetworks": SUPPORTED_NETWORKS,
            "supportedAssets": SUPPORTED_ASSETS,
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
        }
    }


def scenario_9_connect_id() -> Dict[str, Any]:
    """
    Scenario 9: Use connectId instead of referenceId
    
    Hypothesis: Maybe the parameter name matters
    """
    return {
        "name": "Connect ID Parameter",
        "description": "Use connectId instead of referenceId",
        "params": {
            "applicationId": APP_ID,
            "offRamp": True,
            "supportedNetworks": SUPPORTED_NETWORKS,
            "redirectUrl": REDIRECT_URL,
            "connectId": generate_reference_id(),
        }
    }


def scenario_10_wallet_with_connect_id() -> Dict[str, Any]:
    """
    Scenario 10: Wallet + connectId (from user's email example)
    
    This is the format from the user's email to Robinhood
    """
    return {
        "name": "Email Example Format",
        "description": "Format from user's email to Will (walletAddress + connectId)",
        "params": {
            "applicationId": APP_ID,
            "walletAddress": SAMPLE_WALLET_ADDRESS,
            "supportedAssets": "ETH",  # Single asset for comparison
            "supportedNetworks": "ETHEREUM",  # Single network
            "connectId": generate_reference_id(),
            "redirectUrl": REDIRECT_URL,
            "paymentMethod": "crypto_balance",
        }
    }


def scenario_11_no_offramp_flag() -> Dict[str, Any]:
    """
    Scenario 11: Try WITHOUT offRamp flag
    
    Hypothesis: Maybe offRamp=true is causing issues for transfer flow
    """
    return {
        "name": "No OffRamp Flag",
        "description": "Omit offRamp parameter entirely",
        "params": {
            "applicationId": APP_ID,
            "flow": "transfer",
            "supportedNetworks": SUPPORTED_NETWORKS,
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
        }
    }


def scenario_12_deposit_quote() -> Dict[str, Any]:
    """
    Scenario 12: Include depositQuoteId (from error URL user shared)
    
    The user's error URL had depositQuoteId parameter
    """
    return {
        "name": "With Deposit Quote ID",
        "description": "Include depositQuoteId parameter",
        "params": {
            "applicationId": APP_ID,
            "offRamp": True,
            "supportedNetworks": SUPPORTED_NETWORKS,
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
            "depositQuoteId": generate_reference_id(),
        }
    }


def scenario_13_multi_asset_per_network() -> Dict[str, Any]:
    """
    Scenario 13: Group assets by network
    
    Hypothesis: Maybe format matters - list assets available per network
    """
    # Build network-asset pairs
    network_assets = {
        "ETHEREUM": ["ETH", "USDC", "AAVE", "LINK", "COMP", "UNI"],
        "BITCOIN": ["BTC"],
        "SOLANA": ["SOL", "BONK"],
        "POLYGON": ["MATIC", "USDC"],
        "AVALANCHE": ["AVAX", "USDC"],
    }
    
    return {
        "name": "Network-Asset Mapping",
        "description": "Try structured network-to-assets mapping (if supported)",
        "params": {
            "applicationId": APP_ID,
            "offRamp": True,
            "supportedNetworks": list(network_assets.keys()),
            "networkAssets": json.dumps(network_assets),  # Try JSON format
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
        }
    }


def scenario_14_action_parameter() -> Dict[str, Any]:
    """
    Scenario 14: Try action=withdraw parameter
    
    Hypothesis: Maybe there's an action parameter for the flow type
    """
    return {
        "name": "Action Withdraw",
        "description": "Use action=withdraw parameter",
        "params": {
            "applicationId": APP_ID,
            "action": "withdraw",
            "supportedNetworks": SUPPORTED_NETWORKS,
            "redirectUrl": REDIRECT_URL,
            "referenceId": generate_reference_id(),
        }
    }


def scenario_15_minimal_params() -> Dict[str, Any]:
    """
    Scenario 15: Absolute minimal parameters
    
    Hypothesis: Maybe we're over-specifying and it's confusing Robinhood
    """
    return {
        "name": "Minimal Parameters",
        "description": "Just applicationId + redirectUrl",
        "params": {
            "applicationId": APP_ID,
            "redirectUrl": REDIRECT_URL,
        }
    }


# ============================================================================
# Main Test Runner
# ============================================================================

def main():
    """Run all test scenarios and output URLs"""
    
    print("=" * 80)
    print("ROBINHOOD CONNECT URL PARAMETER TESTING")
    print("=" * 80)
    print()
    print("Goal: Find URL combination that allows asset selection AFTER seeing balances")
    print()
    print("Configuration:")
    print(f"  App ID: {APP_ID}")
    print(f"  Redirect: {REDIRECT_URL}")
    print(f"  Networks: {len(SUPPORTED_NETWORKS)} supported")
    print(f"  Assets: {len(SUPPORTED_ASSETS)} supported")
    print()
    print("=" * 80)
    print()
    
    # Collect all scenarios
    scenarios = [
        scenario_1_basic_offramp(),
        scenario_2_with_asset_list(),
        scenario_3_flow_parameter(),
        scenario_4_wallet_address(),
        scenario_5_payment_method(),
        scenario_6_combined_approach(),
        scenario_7_wallet_plus_flow(),
        scenario_8_full_combination(),
        scenario_9_connect_id(),
        scenario_10_wallet_with_connect_id(),
        scenario_11_no_offramp_flag(),
        scenario_12_deposit_quote(),
        scenario_13_multi_asset_per_network(),
        scenario_14_action_parameter(),
        scenario_15_minimal_params(),
    ]
    
    # Output each scenario
    results = []
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"SCENARIO {i}: {scenario['name']}")
        print("-" * 80)
        print(f"Description: {scenario['description']}")
        print()
        print("Parameters:")
        for key, value in scenario['params'].items():
            if isinstance(value, list) and len(value) > 3:
                print(f"  {key}: [{value[0]}, {value[1]}, ... ({len(value)} total)]")
            else:
                print(f"  {key}: {value}")
        print()
        
        url = build_url(scenario['params'])
        print("Generated URL:")
        print(url)
        print()
        
        # Also show a shortened version for readability
        if len(url) > 150:
            print("Shortened for readability:")
            parsed = urllib.parse.urlparse(url)
            params = urllib.parse.parse_qs(parsed.query)
            print(f"{parsed.scheme}://{parsed.netloc}{parsed.path}?")
            for key in params:
                value = params[key][0]
                if len(value) > 60:
                    print(f"  {key}={value[:60]}...")
                else:
                    print(f"  {key}={value}")
            print()
        
        results.append({
            "scenario": i,
            "name": scenario['name'],
            "url": url,
            "params": scenario['params']
        })
        
        print("=" * 80)
        print()
    
    # Save results to file
    output_file = "robinhood_url_test_results.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"✅ Generated {len(results)} test URLs")
    print(f"📄 Results saved to: {output_file}")
    print()
    print("TESTING INSTRUCTIONS:")
    print("-" * 80)
    print("1. Copy each URL above and test in your browser or Robinhood app")
    print("2. Note which scenarios:")
    print("   ✅ Allow you to see balances before selecting asset")
    print("   ✅ Complete transfer successfully")
    print("   ❌ Show 'Invalid URL' error")
    print("   ❌ Require asset pre-selection")
    print("3. Document successful scenario number")
    print()
    print("HYPOTHESIS TO TEST:")
    print("-" * 80)
    print("Based on your email conversation, Robinhood may:")
    print("• Require walletAddress for transfers (Scenario 4, 7, 8, 10)")
    print("• Need flow=transfer or paymentMethod parameters (Scenario 3, 5, 6)")
    print("• Support connectId vs referenceId (Scenario 9, 10)")
    print("• NOT support multi-asset without pre-selection")
    print()
    print("If none work, this suggests Robinhood Connect doesn't support")
    print("the 'see balances first' flow and REQUIRES asset pre-selection.")
    print()


if __name__ == "__main__":
    main()

