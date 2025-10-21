# Coinbase Prime Wallet Generation Scripts

## Current Status

✅ API client implemented and tested  
✅ Authentication working (base64 signature fix applied)  
⏳ Waiting for new API key to fully activate (created 8:31 PM EDT)  
⏳ Key has all permissions but needs 15-60 min propagation time

## When API Key is Ready

### Step 1: Check if key is activated

```bash
cd robinhood-offramp/scripts
source .venv/bin/activate
python3 check_api_key.py
```

**Expected output when ready:**

```
✅ API KEY FULLY ACTIVATED AND READY!
```

### Step 2: Generate all wallets

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
7. Generate TypeScript code for network-addresses.ts

### Step 3: Update TypeScript config

Copy the generated TypeScript code into:

```
robinhood-offramp/lib/network-addresses.ts
```

### Step 4: Verify and build

```bash
cd ..
npm run build
```

## Files

- `prime_api_client.py` - Coinbase Prime API wrapper (WORKING ✅)
- `robinhood-assets-config.json` - All 38 Robinhood assets
- `generate_prime_wallets.py` - Main wallet generation script
- `check_api_key.py` - Quick activation checker
- `test_single_wallet.py` - Single wallet CRUD test
- `requirements.txt` - Python dependencies

## API Key Requirements

The API key needs these permissions enabled:

- ✅ Wallets: All 8 permissions (8/8)
  - Especially: "Get Wallet Deposit Instructions"
  - And: "Create Wallet"
- ✅ Portfolios: Read permissions
- ✅ Balances: Read permissions

## Troubleshooting

**"invalid api key" error:**

- New keys take 15-60 minutes to fully activate
- Run `check_api_key.py` every 15 minutes until it passes
- Make sure all 8 wallet permissions are enabled

**"document already exists" error:**

- Wallet for that symbol already exists
- Script will skip and use existing wallet
- This is fine - we'll fetch addresses for all existing wallets

## Next Steps

Once `check_api_key.py` passes:

1. Run `generate_prime_wallets.py`
2. Review the CSV export
3. Copy TypeScript code to network-addresses.ts
4. Build and test the Next.js app




