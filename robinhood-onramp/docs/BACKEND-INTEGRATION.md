# Backend Integration Guide

This document explains how Robinhood Connect transfers are mapped to Endaoment backend `CryptoDonationPledge` entities.

## Overview

When a user completes a transfer via Robinhood Connect, the callback handler:

1. Receives callback parameters (orderId, asset, assetAmount, network)
2. Maps the data to `CryptoPledgeInput` format
3. Validates the mapped data
4. Submits to backend `/v2/donation-pledges/crypto` endpoint

## Data Mapping

### Robinhood → Backend

| Robinhood Field | Backend Field                | Transformation         | Notes                          |
| --------------- | ---------------------------- | ---------------------- | ------------------------------ |
| `orderId`       | `otcDonationTransactionHash` | Direct                 | Robinhood's unique order ID    |
| `asset`         | `cryptoGiven.tokenId`        | Symbol → ID lookup     | Requires token resolution      |
| `assetAmount`   | `cryptoGiven.inputAmount`    | Amount → smallest unit | Converted to bigint string     |
| N/A             | `receivingEntityType`        | From context           | 'fund', 'org', or 'subproject' |
| N/A             | `receivingEntityId`          | From context           | UUID of destination entity     |
| N/A             | `donorName`                  | From user              | Optional display name          |
| N/A             | `donorIdentity`              | From user              | Optional for tax receipt       |

## Token ID Resolution

Before using in production, update `lib/backend-integration/token-resolver.ts`:

```bash
# Fetch current token IDs from backend
curl https://api.endaoment.org/v2/tokens

# Update BACKEND_TOKEN_MAP with actual IDs
```

## Amount Conversion

Amounts are converted from human-readable to smallest unit:

- ETH: `0.5` → `500000000000000000` (wei, 18 decimals)
- BTC: `1.0` → `100000000` (satoshi, 8 decimals)
- USDC: `100` → `100000000` (6 decimals)

## Example Usage

```typescript
import { createPledgeFromCallback } from '@/lib/backend-integration'

// From Robinhood callback
const result = createPledgeFromCallback(
  'RH_ORD_abc123', // orderId
  'ETH', // asset
  '0.5', // assetAmount
  'ETHEREUM', // network
  'fund', // destinationType
  'fund-uuid', // destinationId
  'Jane Doe', // donorName (optional)
)

if (result.success && result.data) {
  // Submit to backend
  await fetch('https://api.endaoment.org/v2/donation-pledges/crypto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.data),
  })
}
```

## Testing

Run validation tests:

```bash
npm test -- backend-integration
```

## Production Checklist

- [ ] Update `BACKEND_TOKEN_MAP` with actual backend token IDs
- [ ] Configure `NEXT_PUBLIC_BACKEND_URL` environment variable
- [ ] Add authentication headers to API requests
- [ ] Test with real Robinhood transfers
- [ ] Verify pledges appear in backend database
- [ ] Test tax receipt generation (if donor identity provided)

## API Reference

### Main Functions

**`createPledgeFromCallback()`** - Simple pledge creation

```typescript
createPledgeFromCallback(
  orderId: string,
  asset: string,
  assetAmount: string,
  network: string,
  destinationType: "fund" | "org" | "subproject",
  destinationId: string,
  donorName?: string
): PledgeMappingResult
```

**`mapRobinhoodToPledge()`** - Advanced mapping with full options

```typescript
mapRobinhoodToPledge(
  robinhoodData: RobinhoodPledgeData
): PledgeMappingResult
```

**`validatePledgeInput()`** - Pre-submission validation

```typescript
validatePledgeInput(input: CryptoPledgeInput): ValidationResult
```

### Token Resolution

**`getBackendToken()`** - Lookup token by symbol

```typescript
getBackendToken(symbol: string): TokenLookup | undefined
```

**`fetchBackendTokens()`** - Fetch tokens from backend API

```typescript
fetchBackendTokens(backendUrl: string): Promise<Record<string, TokenLookup>>
```

### Amount Conversion

**`convertToSmallestUnit()`** - Human → smallest unit

```typescript
convertToSmallestUnit(amount: string, decimals: number): string
```

**`convertFromSmallestUnit()`** - Smallest unit → human

```typescript
convertFromSmallestUnit(smallestUnit: string, decimals: number): string
```

## Error Handling

The mapping functions return a `PledgeMappingResult` with:

```typescript
interface PledgeMappingResult {
  success: boolean
  data?: CryptoPledgeInput
  errors?: string[]
  warnings?: string[]
}
```

Always check `success` before using `data`:

```typescript
const result = createPledgeFromCallback(...);

if (!result.success) {
  console.error("Pledge mapping failed:", result.errors);
  return;
}

// Use result.data safely
```

## Advanced Usage

### Full Donor Information

```typescript
import { mapRobinhoodToPledge } from '@/lib/backend-integration'

const result = mapRobinhoodToPledge({
  orderId: 'RH_ORD_123',
  asset: 'ETH',
  assetAmount: '0.5',
  network: 'ETHEREUM',
  timestamp: new Date().toISOString(),
  destination: {
    type: 'fund',
    id: 'fund-uuid-here',
  },
  donor: {
    name: 'Jane Doe',
    identity: {
      email: 'jane@example.com',
      firstname: 'Jane',
      lastname: 'Doe',
      addressLine1: '123 Main St',
      addressCity: 'New York',
      addressCountry: 'USA',
      addressState: 'NY',
      addressZip: '10001',
    },
    shareEmail: true,
  },
  metadata: {
    recommendationId: 'recommendation-uuid',
    requestRebalance: false,
  },
})
```

### Fetching Backend Tokens

```typescript
import { fetchBackendTokens } from '@/lib/backend-integration'

// Fetch and cache tokens on app startup
const tokens = await fetchBackendTokens(process.env.NEXT_PUBLIC_BACKEND_URL!)

console.log('Available tokens:', Object.keys(tokens))
```

## Troubleshooting

### Token Not Found

**Error**: "Asset ETH not supported in backend"

**Solution**: Update `BACKEND_TOKEN_MAP` in `token-resolver.ts` with actual backend token IDs

### Invalid Amount

**Error**: "Failed to convert amount: Invalid amount"

**Solution**: Ensure `assetAmount` is a valid numeric string (e.g., "0.5", "1.0")

### Validation Errors

**Error**: "receivingEntityId must be a valid UUID"

**Solution**: Ensure destination ID is a properly formatted UUID string

### Backend Rejection

**Error**: 400 Bad Request from backend

**Solution**:

1. Run `validatePledgeInput()` before submission
2. Check backend logs for constraint violations
3. Verify token ID exists in backend database

## Security Considerations

1. **Validate All Inputs**: Always run `validatePledgeInput()` before submitting to backend
2. **Sanitize Data**: Use `sanitizePledgeInput()` to remove undefined values
3. **Use HTTPS**: Ensure `NEXT_PUBLIC_BACKEND_URL` uses HTTPS in production
4. **Authentication**: Add proper authentication headers to API requests
5. **Rate Limiting**: Implement rate limiting for pledge creation

## Performance

The mapping layer is designed to be fast:

- Token lookup: O(1) hash map lookup
- Amount conversion: Simple string manipulation, no floating point math
- Validation: Single pass over input data

Typical mapping time: < 1ms per pledge

## Future Enhancements

Potential improvements for production:

1. **Caching**: Cache fetched backend tokens
2. **Retry Logic**: Automatic retry on backend failures
3. **Batch Processing**: Support multiple pledges at once
4. **Price Quoting**: Fetch USD value at time of transfer
5. **Webhook Integration**: Real-time updates on pledge status
6. **Analytics**: Track mapping success rates and errors

## Related Documentation

- [Robinhood Connect SDK Documentation](https://connect.robinhood.com/docs)
- [Backend API Reference](../../../endaoment-backend/docs/API.md)
- [CryptoDonationPledge Entity](../../../endaoment-backend/libs/api/data-access/src/lib/entities/donations/donation-pledge.entity.ts)
- [Architecture Guide](./ARCHITECTURE.md)
