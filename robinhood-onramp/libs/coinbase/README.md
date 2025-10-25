# Coinbase Prime Support Library

## Overview

This library provides services for interacting with Coinbase Prime API, specifically for wallet address management used by the Robinhood integration.

## Structure

```
src/
├── lib/
│   ├── services/                    # Prime API services
│   │   ├── prime-api.service.ts
│   │   └── index.ts
│   ├── constants/                   # Prime configuration
│   │   └── prime-config.ts
│   └── index.ts
└── index.ts

tests/
└── services/                        # Service tests
    └── prime-api.service.spec.ts
```

## Usage

### In POC (Next.js)

```typescript
import { PrimeApiService } from '@/libs/coinbase'

const primeApi = new PrimeApiService()

// Fetch wallet addresses
const addresses = await primeApi.fetchWalletAddresses()

// Get address for specific symbol
const btcAddress = primeApi.getAddress('BTC')

// Check if cache is ready
if (primeApi.isCacheReady()) {
  // Use addresses
}
```

### In Backend (NestJS)

This library can be merged into the existing Coinbase module:

```typescript
// Copy service to existing coinbase module
cp libs/coinbase/src/lib/services/prime-api.service.ts \
   endaoment-backend/libs/api/coinbase/src/lib/services/

// Import in coinbase module
import { PrimeApiService } from './services/prime-api.service'

@Module({
  providers: [
    PrimeApiService,
    // ... other coinbase services
  ],
  exports: [
    PrimeApiService,
  ],
})
export class CoinbaseModule {}
```

## Integration with endaoment-backend

To integrate this library into endaoment-backend:

### Step 1: Copy Services

```bash
cp libs/coinbase/src/lib/services/prime-api.service.ts \
   endaoment-backend/libs/api/coinbase/src/lib/services/
```

### Step 2: Merge with Existing Coinbase Module

Update the existing Coinbase module to include the Prime API service:

```typescript
// libs/api/coinbase/src/lib/coinbase.module.ts
import { PrimeApiService } from './services/prime-api.service'

@Module({
  providers: [
    // ... existing services
    PrimeApiService,
  ],
  exports: [
    // ... existing exports
    PrimeApiService,
  ],
})
export class CoinbaseModule {}
```

### Step 3: Update Robinhood Services

Update Robinhood services to import from the backend Coinbase module:

```typescript
// Before (POC):
import { PrimeApiService } from '@/libs/coinbase'

// After (Backend):
import { PrimeApiService } from '@/libs/coinbase'  // Same import!
// NestJS DI will inject the service
```

## Services

### PrimeApiService

Manages wallet address retrieval from Coinbase Prime:

**Methods**:

- `fetchWalletAddresses()` - Fetch all wallet addresses from Prime
- `getAddress(symbol)` - Get cached address for a symbol
- `isCacheReady()` - Check if cache is populated
- `getStats()` - Get fetch statistics for health checks

**Wallet Priority**:

1. Trading account (preferred)
2. Trading Balance (fallback)
3. Other wallet types

**Features**:

- Python script integration for API calls
- Symbol normalization (POL → MATIC)
- Wallet type tracking
- Fetch statistics for monitoring

## Environment Variables

Required:

```bash
COINBASE_PRIME_API_KEY=<your-api-key>
COINBASE_SERVICE_ACCOUNT_ID=<service-account-id>
COINBASE_PRIME_PASSPHRASE=<passphrase>
COINBASE_PRIME_SIGNING_KEY=<signing-key>
COINBASE_PRIME_PORTFOLIO_ID=<portfolio-id>
```

## Python Dependencies

The Prime API service uses a Python script for API calls:

```bash
pip3 install python-dotenv requests
```

Script location: `scripts/generate_prime_wallets.py`

## Testing

Run tests for this library:

```bash
npm run test:coinbase
```

## Architecture

This library provides support services for the Robinhood integration:

- Fetches Prime wallet addresses at startup
- Caches addresses for fast lookup
- Provides health check statistics
- Handles wallet priority logic

The service is used by `AssetRegistryService` in the Robinhood library to populate deposit addresses.

## Note

This library is a **support library** for Robinhood integration. In production backend:

- Merge into existing `libs/api/coinbase` module
- Don't create a separate Coinbase module
- Share Prime API service across integrations

