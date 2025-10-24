# Scripts Directory

This directory contains utility scripts for Robinhood Connect integration.

## Production Utility Scripts

### get_all_robinhood_assets.py

Fetches the complete list of supported assets from Robinhood API.

**Usage**:

```bash
python3 get_all_robinhood_assets.py
```

### get_trading_balance_addresses.py

Retrieves trading balance addresses for configured wallets from Coinbase Prime.

**Usage**:

```bash
python3 get_trading_balance_addresses.py
```

### generate_prime_wallets.py

Generates Prime wallet configuration for Robinhood integration.

**Usage**:

```bash
python3 generate_prime_wallets.py
```

This will:

1. List existing wallets
2. Show which assets need wallets
3. Ask for confirmation before creating
4. Create all wallets with name "robinhood-otc"
5. Fetch deposit addresses
6. Export to CSV

### prime_api_client.py

Python client for interacting with Coinbase Prime API.

**Usage**: Import and use in other scripts

```python
from prime_api_client import PrimeAPIClient
```

## Development Helpers

### start-with-ngrok.sh

Starts the development server with ngrok for testing callbacks locally.

**Usage**:

```bash
./start-with-ngrok.sh
```

## Configuration Files

- `robinhood-assets-config.json` - Current asset configuration (JSON)
- `robinhood-assets-config.ts` - Current asset configuration (TypeScript)

## Setup

Install Python dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Notes

- All Python scripts require Python 3.11+
- Ensure environment variables are set (see main README.md)
- For production use, always use the latest versions of config files (no timestamps in filename)
