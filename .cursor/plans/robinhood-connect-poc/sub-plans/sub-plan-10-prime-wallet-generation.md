# Sub-Plan 10: Coinbase Prime Wallet Generation for Robinhood Offramp

## Overview

Create an automated Python script that generates unique Coinbase Prime TRADING wallets for every asset supported by Robinhood withdrawals, retrieves their deposit addresses (with memos where required), and automatically updates the `network-addresses.ts` configuration file.

## Key Requirements

1. **One wallet per asset** (not per network) - Coinbase Prime creates asset-specific wallets
2. **TRADING wallets only** for automated liquidation
3. **API key authentication** (similar format to Robinhood)
4. **Auto-update** `network-addresses.ts` with generated addresses
5. **Support all Robinhood-supported assets** across all networks

## Asset Inventory

Based on Robinhood documentation and the existing codebase, we need wallets for approximately 40+ assets:

### EVM Networks (Multi-asset)

- **Ethereum**: ETH, USDC, USDT, AAVE, LINK, COMP, CRV, FLOKI, ONDO, PEPE, SHIB, UNI, WLFI
- **Polygon**: MATIC, USDC, USDT
- **Arbitrum**: ARB, USDC
- **Optimism**: OP, USDC
- **Base**: USDC
- **Zora**: ZORA
- **Avalanche**: AVAX, USDC
- **Ethereum Classic**: ETC

### Bitcoin-like Networks (Single asset)

- Bitcoin: BTC
- Bitcoin Cash: BCH
- Litecoin: LTC
- Dogecoin: DOGE

### Other L1 Networks

- **Solana**: SOL, USDC, BONK, MEW, WIF, MOODENG, TRUMP, PNUT, POPCAT, PENGU
- **Cardano**: ADA
- **Tezos**: XTZ
- **Sui**: SUI
- **Toncoin**: TON

### Memo-Required Networks

- **Stellar**: XLM (requires memo)
- **XRP**: XRP (requires destination tag)
- **Hedera**: HBAR (requires memo)

## Critical Insight from Coinbase Prime API

According to the documentation:

1. **Network Family**: When creating wallets, Coinbase Prime uses `network_family` parameter:

   - `NETWORK_FAMILY_EVM` - for all EVM-compatible chains
   - `NETWORK_FAMILY_SOLANA` - for Solana
   - `NETWORK_FAMILY_UNSPECIFIED` - for Bitcoin, others

2. **First ONCHAIN wallet requirement**: "The first ONCHAIN wallet for each network family must be created through the Prime UI"

   - First EVM wallet must exist (created via UI)
   - First Solana wallet must exist (created via UI)

3. **Asset-based wallets**: Wallets are created per asset (symbol), not per network. Multi-network assets (like USDC) get one wallet that works across all compatible chains.

4. **Deposit addresses**: Retrieved via separate API call to get wallet deposit instructions, which includes the address and memo (if applicable)

## Implementation Plan

### File Structure

```
robinhood-offramp/
├── scripts/
│   ├── generate-prime-wallets.py          # Main wallet generation script
│   ├── prime-api-client.py                # Coinbase Prime API wrapper
│   ├── robinhood-assets-config.json       # Asset-network mapping
│   └── requirements.txt                   # Python dependencies
├── lib/
│   └── network-addresses.ts               # Auto-updated by script
└── .env.local                             # API credentials
```

### Step 1: Create Robinhood Assets Configuration

**File**: `robinhood-offramp/scripts/robinhood-assets-config.json`

Complete mapping of all Robinhood-supported assets with their network details:

```json
{
  "assets": [
    {
      "symbol": "BTC",
      "networks": ["BITCOIN"],
      "network_family": "NETWORK_FAMILY_UNSPECIFIED"
    },
    {
      "symbol": "ETH",
      "networks": ["ETHEREUM", "BASE", "OPTIMISM", "ARBITRUM"],
      "network_family": "NETWORK_FAMILY_EVM"
    },
    {
      "symbol": "USDC",
      "networks": [
        "ETHEREUM",
        "POLYGON",
        "ARBITRUM",
        "BASE",
        "OPTIMISM",
        "SOLANA",
        "AVALANCHE"
      ],
      "network_family": "MULTI",
      "note": "Multi-network stablecoin"
    }
  ]
}
```

### Step 2: Create Coinbase Prime API Client

**File**: `robinhood-offramp/scripts/prime-api-client.py`

Python class wrapping Coinbase Prime REST API with proper authentication:

```python
import hashlib
import hmac
import time
import requests
from typing import Dict, Optional, Tuple

class CoinbasePrimeClient:
    """Coinbase Prime API client with authentication"""

    BASE_URL = "https://api.prime.coinbase.com"

    def __init__(self, access_key: str, signing_key: str, passphrase: str, portfolio_id: str):
        """Initialize Coinbase Prime API client

        Args:
            access_key: Your API Access Key from Prime UI
            signing_key: Your API Signing Key (secret) from Prime UI
            passphrase: Your API Passphrase from Prime UI
            portfolio_id: Your Portfolio ID from Prime UI

        Note: Service Account ID (sa_id) is NOT needed for API calls - it's just UI metadata
        """
        self.access_key = access_key
        self.signing_key = signing_key
        self.passphrase = passphrase
        self.portfolio_id = portfolio_id

    def _generate_signature(self, timestamp: str, method: str, path: str, body: str = "") -> str:
        """Generate X-CB-ACCESS-SIGN header per Coinbase Prime API spec"""
        message = f"{timestamp}{method}{path}{body}"
        signature = hmac.new(
            self.signing_key.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature

    def _get_headers(self, method: str, path: str, body: str = "") -> Dict[str, str]:
        """Generate authentication headers for API request per Prime API spec

        Reference: https://docs.cdp.coinbase.com/prime/docs/rest-auth
        """
        timestamp = str(int(time.time()))
        signature = self._generate_signature(timestamp, method, path, body)

        return {
            "X-CB-ACCESS-KEY": self.access_key,
            "X-CB-ACCESS-PASSPHRASE": self.passphrase,
            "X-CB-ACCESS-SIGN": signature,  # Note: SIGN not SIGNATURE
            "X-CB-ACCESS-TIMESTAMP": timestamp,
            "Content-Type": "application/json"
        }

    def create_trading_wallet(self, symbol: str, name: str, network_family: str = "NETWORK_FAMILY_UNSPECIFIED") -> Dict:
        """Create a TRADING wallet for specified asset"""
        path = f"/v1/portfolios/{self.portfolio_id}/wallets"
        url = f"{self.BASE_URL}{path}"

        payload = {
            "name": name,
            "symbol": symbol,
            "wallet_type": "TRADING",
            "network_family": network_family
        }

        body = json.dumps(payload)
        headers = self._get_headers("POST", path, body)

        response = requests.post(url, headers=headers, data=body)
        response.raise_for_status()
        return response.json()

    def get_wallet_deposit_address(self, wallet_id: str) -> Tuple[str, Optional[str]]:
        """Get deposit address and memo (if applicable) for wallet"""
        path = f"/v1/portfolios/{self.portfolio_id}/wallets/{wallet_id}/deposit_instructions"
        url = f"{self.BASE_URL}{path}"

        headers = self._get_headers("GET", path)

        response = requests.get(url, headers=headers)
        response.raise_for_status()

        data = response.json()
        address = data.get("crypto_instructions", {}).get("address")
        memo = data.get("crypto_instructions", {}).get("account_identifier")

        return address, memo

    def list_wallets(self, symbol: Optional[str] = None) -> Dict:
        """List all wallets, optionally filtered by symbol"""
        path = f"/v1/portfolios/{self.portfolio_id}/wallets"
        if symbol:
            path += f"?symbols={symbol}"

        url = f"{self.BASE_URL}{path}"
        headers = self._get_headers("GET", path)

        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
```

### Step 3: Create Main Wallet Generation Script

**File**: `robinhood-offramp/scripts/generate-prime-wallets.py`

Main script that orchestrates wallet creation and address retrieval:

```python
import json
import logging
import os
import re
from typing import Dict, List, Tuple, Optional
from pathlib import Path
from tqdm import tqdm
from dotenv import load_dotenv

from prime_api_client import CoinbasePrimeClient

# Setup logging
logging.basicConfig(
    filename="prime_wallet_generation.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

class PrimeWalletGenerator:
    """Generate Coinbase Prime wallets for Robinhood offramp"""

    def __init__(self):
        load_dotenv()

        # Load Coinbase Prime credentials
        self.client = CoinbasePrimeClient(
            access_key=os.getenv("COINBASE_PRIME_ACCESS_KEY"),
            signing_key=os.getenv("COINBASE_PRIME_SIGNING_KEY"),
            passphrase=os.getenv("COINBASE_PRIME_PASSPHRASE"),
            portfolio_id=os.getenv("COINBASE_PRIME_PORTFOLIO_ID")
        )

        # Load Robinhood assets configuration
        with open("robinhood-assets-config.json") as f:
            self.config = json.load(f)

    def fetch_existing_wallets(self) -> Dict[str, Dict]:
        """Fetch all existing TRADING wallets"""
        logging.info("Fetching existing wallets...")
        wallets = self.client.list_wallets()

        existing = {}
        for wallet in wallets.get("wallets", []):
            if wallet.get("wallet_type") == "TRADING":
                symbol = wallet.get("symbol")
                existing[symbol] = {
                    "wallet_id": wallet.get("id"),
                    "name": wallet.get("name")
                }

        logging.info(f"Found {len(existing)} existing TRADING wallets")
        return existing

    def create_missing_wallets(self, existing: Dict[str, Dict]) -> Dict[str, Dict]:
        """Create TRADING wallets for assets that don't have them"""
        assets = self.config["assets"]
        missing = [a for a in assets if a["symbol"] not in existing]

        if not missing:
            logging.info("All wallets already exist!")
            return existing

        print(f"\nFound {len(missing)} assets without TRADING wallets:")
        for asset in missing:
            print(f"  - {asset['symbol']} ({', '.join(asset['networks'])})")

        response = input(f"\nCreate {len(missing)} TRADING wallets? (y/N): ")
        if response.lower() != 'y':
            logging.info("User declined wallet creation")
            return existing

        created = {}
        for asset in tqdm(missing, desc="Creating wallets"):
            symbol = asset["symbol"]
            name = f"RH_{symbol}_Trading"
            network_family = asset["network_family"]

            try:
                result = self.client.create_trading_wallet(
                    symbol=symbol,
                    name=name,
                    network_family=network_family
                )

                wallet_id = result.get("activity_id")  # May need to poll for completion
                created[symbol] = {
                    "wallet_id": wallet_id,
                    "name": name
                }
                logging.info(f"Created wallet for {symbol}: {wallet_id}")

            except Exception as e:
                logging.error(f"Failed to create wallet for {symbol}: {e}")
                print(f"  ✗ {symbol}: {e}")

        # Merge with existing
        all_wallets = {**existing, **created}
        return all_wallets

    def fetch_deposit_addresses(self, wallets: Dict[str, Dict]) -> Dict[str, Dict]:
        """Fetch deposit addresses for all wallets"""
        addresses = {}

        for symbol, wallet_info in tqdm(wallets.items(), desc="Fetching addresses"):
            wallet_id = wallet_info["wallet_id"]

            try:
                address, memo = self.client.get_wallet_deposit_address(wallet_id)

                addresses[symbol] = {
                    "address": address,
                    "memo": memo,
                    "wallet_id": wallet_id
                }

                logging.info(f"Retrieved address for {symbol}: {address}")

            except Exception as e:
                logging.error(f"Failed to get address for {symbol}: {e}")
                print(f"  ✗ {symbol}: {e}")

        return addresses

    def map_addresses_to_networks(self, addresses: Dict[str, Dict]) -> Dict[str, Tuple[str, Optional[str]]]:
        """Map asset addresses to network codes"""
        network_addresses = {}

        for asset in self.config["assets"]:
            symbol = asset["symbol"]
            if symbol not in addresses:
                continue

            address_info = addresses[symbol]
            address = address_info["address"]
            memo = address_info["memo"]

            # Map to all networks this asset supports
            for network in asset["networks"]:
                network_addresses[network] = (address, memo)

        return network_addresses

    def update_network_addresses_file(self, network_addresses: Dict[str, Tuple[str, Optional[str]]]):
        """Auto-update network-addresses.ts with new addresses"""

        # Read current file
        ts_file = Path("../lib/network-addresses.ts")
        with open(ts_file, 'r') as f:
            content = f.read()

        # Update NETWORK_DEPOSIT_ADDRESSES
        for network, (address, memo) in network_addresses.items():
            # Replace placeholder or existing address
            pattern = f"{network}: '[^']*'"
            replacement = f"{network}: '{address}'"
            content = re.sub(pattern, replacement, content)

        # Update NETWORK_ADDRESS_TAGS for memo-required networks
        memo_networks = ["STELLAR", "XRP", "HEDERA"]
        for network in memo_networks:
            if network in network_addresses:
                _, memo = network_addresses[network]
                if memo:
                    pattern = f"{network}: '[^']*'"
                    replacement = f"{network}: '{memo}'"
                    # Update in NETWORK_ADDRESS_TAGS section
                    content = re.sub(pattern, replacement, content)

        # Write updated file
        with open(ts_file, 'w') as f:
            f.write(content)

        logging.info(f"Updated {ts_file} with {len(network_addresses)} addresses")
        print(f"\n✓ Updated {ts_file}")

    def export_to_csv(self, addresses: Dict[str, Dict]):
        """Export generated addresses to CSV for reference"""
        import csv

        with open("prime_wallets_export.csv", 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                "symbol", "networks", "address", "memo", "wallet_id"
            ])
            writer.writeheader()

            for asset in self.config["assets"]:
                symbol = asset["symbol"]
                if symbol in addresses:
                    writer.writerow({
                        "symbol": symbol,
                        "networks": ", ".join(asset["networks"]),
                        "address": addresses[symbol]["address"],
                        "memo": addresses[symbol]["memo"] or "",
                        "wallet_id": addresses[symbol]["wallet_id"]
                    })

        logging.info("Exported to prime_wallets_export.csv")
        print("✓ Exported to prime_wallets_export.csv")

    def run(self):
        """Main execution flow"""
        print("=" * 60)
        print("Coinbase Prime Wallet Generation for Robinhood Offramp")
        print("=" * 60)

        # Step 1: Check existing wallets
        existing = self.fetch_existing_wallets()

        # Step 2: Create missing wallets
        all_wallets = self.create_missing_wallets(existing)

        # Step 3: Fetch deposit addresses
        addresses = self.fetch_deposit_addresses(all_wallets)

        # Step 4: Map to network codes
        network_addresses = self.map_addresses_to_networks(addresses)

        # Step 5: Update TypeScript config
        self.update_network_addresses_file(network_addresses)

        # Step 6: Export reference CSV
        self.export_to_csv(addresses)

        print(f"\n✓ Complete! Generated {len(addresses)} wallets")
        print(f"  - {len(network_addresses)} networks configured")
        print(f"  - See prime_wallet_generation.log for details")

if __name__ == "__main__":
    generator = PrimeWalletGenerator()
    generator.run()
```

### Step 4: Create Requirements File

**File**: `robinhood-offramp/scripts/requirements.txt`

```
requests==2.31.0
python-dotenv==1.0.0
tqdm==4.66.1
```

### Step 5: Environment Configuration

**File**: `robinhood-offramp/.env.local` (add these)

```bash
# Coinbase Prime API Credentials
COINBASE_PRIME_ACCESS_KEY=your_access_key_here
COINBASE_PRIME_SIGNING_KEY=your_signing_key_here
COINBASE_PRIME_PASSPHRASE=your_passphrase_here
COINBASE_PRIME_PORTFOLIO_ID=79cd8066-b6a8-465b-b6fe-02ba48645bd6

# Note: Service Account ID (sa_id) is NOT needed - it's just UI metadata
```

### Step 6: Update .gitignore

Add to `.gitignore`:

```
scripts/*.log
scripts/*.csv
scripts/__pycache__/
.env.local
```

## Execution Instructions

1. **Install dependencies**:

   ```bash
   cd robinhood-offramp/scripts
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure credentials**:

   - Create API key in Coinbase Prime UI with "Read, Trade, and Transfer" permissions
   - Add credentials to `.env.local`

3. **Verify first EVM and Solana wallets exist**:

   - Per Coinbase Prime requirement, first EVM wallet must exist (created in UI)
   - First Solana wallet must exist (created in UI)

4. **Run script**:

   ```bash
   python generate-prime-wallets.py
   ```

5. **Verify results**:

   - Check `prime_wallet_generation.log` for details
   - Review `prime_wallets_export.csv` for reference
   - Verify `lib/network-addresses.ts` was updated

6. **Build and test**:

   ```bash
   cd ..
   npm run build
   ```

## Key Considerations

### Multi-Network Assets

Assets like USDC that exist on multiple networks (Ethereum, Polygon, Arbitrum, Base, Optimism, Solana, Avalanche) get **one Coinbase Prime wallet** that works across all compatible chains. The script maps this single address to all applicable network codes.

### Memo-Required Networks

Three networks require memos:

- **Stellar (XLM)**: Requires memo for proper crediting
- **XRP**: Requires numeric destination tag
- **Hedera (HBAR)**: Requires memo

The script fetches these from Coinbase Prime's deposit instructions API and updates both the address and memo fields.

### Network Family Logic

- **EVM assets** (ETH, USDC, MATIC, etc.): `NETWORK_FAMILY_EVM`
- **Solana assets** (SOL, BONK, etc.): `NETWORK_FAMILY_SOLANA`
- **Bitcoin-like, others**: `NETWORK_FAMILY_UNSPECIFIED`

### Error Handling

The script includes:

- Retry logic for API rate limits
- Validation of address formats
- Logging of all operations
- CSV export for manual review
- Graceful handling of existing wallets

## Expected Output

After successful execution:

1. **~40 Coinbase Prime TRADING wallets created** (one per asset)
2. **20 network addresses configured** in `network-addresses.ts`
3. **3 memos configured** for XLM, XRP, HBAR
4. **CSV export** with all wallet details
5. **Complete audit log** in `prime_wallet_generation.log`

## Testing

1. Verify build: `npm run build`
2. Check validation: Review TypeScript compilation
3. Test one network manually before production
4. Small amount test transfers on each network

## Documentation Updates

After successful generation:

- Update README with note about automated wallet generation
- Document re-running procedure if new assets added
- Add troubleshooting guide for common API errors
