# API Testing Guide

> ⚠️ **DEPRECATED**: This document contains legacy offramp testing instructions.
> Offramp has been removed from this codebase. This integration only supports **onramp** (deposits to external wallets).
>
> For current onramp testing, see the dashboard UI at `/dashboard`.

Quick reference for testing Robinhood API endpoints (legacy offramp documentation).

## Prerequisites

1. Add your `ROBINHOOD_APP_ID` to `.env.local`:

   ```bash
   ROBINHOOD_APP_ID=your-app-id-from-robinhood
   ROBINHOOD_API_KEY=your-api-key-from-robinhood
   NEXTAUTH_URL=http://localhost:3030
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Generate Offramp URL

### Basic ETH Transfer

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-offramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "supportedNetworks": ["ETHEREUM"],
    "assetCode": "ETH",
    "assetAmount": "0.1"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://applink.robinhood.com/u/connect?applicationId=your-app-id&offRamp=true&supportedNetworks=ETHEREUM&redirectUrl=http%3A%2F%2Flocalhost%3A3000%2Fcallback&referenceId=UUID&assetCode=ETH&assetAmount=0.1",
    "referenceId": "f2056f4c-93c7-422b-bd59-fbfb5b05b6ad",
    "params": {
      "applicationId": "your-app-id",
      "offRamp": true,
      "supportedNetworks": "ETHEREUM",
      "redirectUrl": "http://localhost:3030/callback",
      "referenceId": "f2056f4c-93c7-422b-bd59-fbfb5b05b6ad",
      "assetCode": "ETH",
      "assetAmount": "0.1"
    }
  }
}
```

### USDC on Polygon

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-offramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "supportedNetworks": ["POLYGON"],
    "assetCode": "USDC",
    "assetAmount": "100"
  }'
```

### Multi-Network (User Chooses)

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-offramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "supportedNetworks": ["ETHEREUM", "POLYGON", "SOLANA"]
  }'
```

### Fiat Amount Specification

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-offramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "supportedNetworks": ["ETHEREUM"],
    "assetCode": "ETH",
    "fiatAmount": "50"
  }'
```

## Error Cases

### Invalid Network

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-offramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "supportedNetworks": ["INVALID_NETWORK"]
  }'
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Invalid networks: INVALID_NETWORK"
}
```

### Invalid Asset Code

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-offramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "supportedNetworks": ["ETHEREUM"],
    "assetCode": "invalid"
  }'
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Invalid asset code: invalid"
}
```

### Missing Networks

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-offramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "assetCode": "ETH"
  }'
```

**Expected Response:**

```json
{
  "success": false,
  "error": "supportedNetworks array is required and must not be empty"
}
```

## Redeem Deposit Address

### Basic Test

```bash
curl -X POST http://localhost:3030/api/robinhood/redeem-deposit-address \
  -H "Content-Type: application/json" \
  -d '{
    "referenceId": "f2056f4c-93c7-422b-bd59-fbfb5b05b6ad"
  }'
```

**Note:** This will only work with a valid referenceId from an actual Robinhood offramp flow.

## Supported Networks

- `ETHEREUM`
- `POLYGON`
- `SOLANA`
- `BITCOIN`
- `LITECOIN`
- `DOGECOIN`
- `AVALANCHE`
- `BITCOIN_CASH`
- `ETHEREUM_CLASSIC`
- `STELLAR`
- `TEZOS`

## Common Asset Codes

- `ETH` - Ethereum
- `BTC` - Bitcoin
- `USDC` - USD Coin
- `USDT` - Tether
- `SOL` - Solana
- `MATIC` - Polygon
- `LTC` - Litecoin
- `DOGE` - Dogecoin
- `AVAX` - Avalanche
- `ADA` - Cardano

## Network-Asset Compatibility

| Network   | Supported Assets  |
| --------- | ----------------- |
| ETHEREUM  | ETH, USDC, USDT   |
| POLYGON   | MATIC, USDC, USDT |
| SOLANA    | SOL, USDC         |
| BITCOIN   | BTC               |
| LITECOIN  | LTC               |
| DOGECOIN  | DOGE              |
| AVALANCHE | AVAX, USDC        |

## Complete Flow Test

1. Generate URL:

   ```bash
   curl -X POST http://localhost:3030/api/robinhood/generate-offramp-url \
     -H "Content-Type: application/json" \
     -d '{"supportedNetworks": ["ETHEREUM"], "assetCode": "ETH", "assetAmount": "0.1"}'
   ```

2. Copy the generated URL and referenceId from the response

3. Open the URL in a browser (or on a mobile device with Robinhood app installed)

4. Complete the offramp flow in Robinhood

5. After redirect, use the referenceId to redeem the deposit address:
   ```bash
   curl -X POST http://localhost:3030/api/robinhood/redeem-deposit-address \
     -H "Content-Type: application/json" \
     -d '{"referenceId": "your-reference-id-here"}'
   ```

## Notes

- All URLs are automatically URL-encoded
- referenceId is generated as UUID v4 on the backend
- redirectUrl is automatically set based on NEXTAUTH_URL environment variable
- Generated URLs work with both Robinhood mobile app (via universal links) and web browser
