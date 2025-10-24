# Robinhood Connect Testing Guide

This guide covers how to test the Robinhood Connect integration end-to-end.

---

## Prerequisites

- Development server running (`npm run dev`)
- Valid Robinhood API credentials configured in `.env.local`
- ngrok or similar for local callback testing (optional but recommended)

---

## Test Environment Setup

### Local Development

1. Start the development server:

```bash
cd robinhood-onramp
npm run dev
```

2. Navigate to: `http://localhost:3030/dashboard`

### With ngrok (Recommended for Testing Callbacks)

ngrok enables testing the complete callback flow locally:

1. Start ngrok:

```bash
./scripts/start-with-ngrok.sh
```

or manually:

```bash
ngrok http 3030
```

2. Update `.env.local` with ngrok URL:

```bash
NEXT_PUBLIC_BASE_URL=https://your-ngrok-id.ngrok.io
```

3. Restart development server

4. Navigate to: `https://your-ngrok-id.ngrok.io/dashboard`

---

## End-to-End Testing

### Test 1: Complete Transfer Flow

**Steps**:

1. Navigate to dashboard: `http://localhost:3030/dashboard`
2. Use search or browse to select an asset (e.g., "Ethereum" or "ETH")
3. Click on the asset to select it
4. Review the asset details and wallet address shown
5. Click "Initiate Transfer with Robinhood"
6. Verify redirect to Robinhood
7. Complete transfer in Robinhood (sandbox/test mode)
8. Verify redirect back to `/callback`
9. Verify success message displays with transfer details
10. Return to dashboard and verify success toast appears

**Expected Results**:

- ✅ Asset search works and filters correctly
- ✅ Asset selection highlights the chosen asset
- ✅ Wallet address displays for the asset's network
- ✅ URL generated without errors
- ✅ Robinhood URL includes correct parameters
- ✅ Callback receives transfer data
- ✅ Success message shows asset, network, amount, orderId
- ✅ Dashboard success toast displays with transfer details

**Common Issues**:

- **Redirect doesn't happen**: Check browser console for errors
- **Robinhood shows error**: Verify connectId is valid (check API response)
- **No callback parameters**: Verify URL includes `flow=transfer` parameter
- **Asset not found**: Ensure asset is enabled in `robinhood-asset-metadata.ts`

---

### Test 2: API Endpoint Testing

#### Test Generate URL API

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "selectedAsset": "ETH",
    "selectedNetwork": "ETHEREUM"
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "url": "https://robinhood.com/connect/amount?applicationId=...&connectId=...",
  "connectId": "abc123-...",
  "referenceId": "abc123-..."
}
```

**Verify**:

- Response status: 200
- URL starts with `https://robinhood.com/connect/amount`
- connectId is present and looks valid (UUID v4 format)
- referenceId equals connectId
- URL includes all required parameters:
  - `applicationId`
  - `connectId`
  - `paymentMethod=crypto_balance`
  - `supportedAssets=ETH`
  - `supportedNetworks=ETHEREUM`
  - `walletAddress=0x...`
  - `assetCode=ETH`
  - `flow=transfer`
  - `redirectUrl` (encoded)

#### Test with Different Assets

**USDC on Polygon**:

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "selectedAsset": "USDC",
    "selectedNetwork": "POLYGON"
  }'
```

**Solana**:

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "selectedAsset": "SOL",
    "selectedNetwork": "SOLANA"
  }'
```

**Bitcoin**:

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "selectedAsset": "BTC",
    "selectedNetwork": "BITCOIN"
  }'
```

---

### Test 3: Error Handling

#### Test Invalid Asset

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "selectedAsset": "INVALID_ASSET",
    "selectedNetwork": "ETHEREUM"
  }'
```

**Expected Response**: 400 error with message about invalid or unsupported asset

#### Test Missing Parameters

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response**: 400 error with message about missing required parameters

#### Test Invalid Network

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "selectedAsset": "ETH",
    "selectedNetwork": "INVALID_NETWORK"
  }'
```

**Expected Response**: 400 error with message about invalid network

#### Test Asset/Network Mismatch

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "selectedAsset": "BTC",
    "selectedNetwork": "ETHEREUM"
  }'
```

**Expected Response**: 400 error explaining asset is not supported on that network

---

### Test 4: Callback Parameters

#### Simulate Callback Manually

Navigate to (replace with actual values):

```
http://localhost:3030/callback?asset=ETH&network=ETHEREUM&connectId=abc-123-uuid&timestamp=2025-10-24T12:00:00Z&orderId=ORDER123
```

**Expected Results**:

- Success message displays
- Asset name shown correctly (Ethereum)
- Network name shown correctly (ETHEREUM)
- Transfer details visible
- Order ID displayed

**Verify**:

- No console errors
- Page renders success state
- Parameters extracted correctly
- Can navigate back to dashboard

---

## Component Testing

### Test Asset Selector

1. Navigate to dashboard
2. Click in the search box
3. Type "eth" - verify Ethereum and other ETH-related assets appear
4. Type "usdc" - verify USDC on different networks appears
5. Clear search - verify all enabled assets appear
6. Click on an asset - verify it becomes selected
7. Verify wallet address for that asset's network displays
8. Verify "Initiate Transfer" button is enabled

**Expected Behavior**:

- Search filters assets by symbol and name
- Asset list shows icons and network badges
- Selected asset is highlighted
- Wallet address updates based on selected asset's network
- Button is only enabled when asset is selected

### Test URL Builder

**Manual Test**:

```typescript
import { buildDaffyStyleOnrampUrl } from '@/lib/robinhood-url-builder'

const result = buildDaffyStyleOnrampUrl({
  connectId: 'test-connect-id-123',
  asset: 'ETH',
  network: 'ETHEREUM',
  walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
})

console.log(result.url)
```

**Expected URL Structure**:

```
https://robinhood.com/connect/amount?
  applicationId=YOUR_APP_ID&
  connectId=test-connect-id-123&
  paymentMethod=crypto_balance&
  supportedAssets=ETH&
  supportedNetworks=ETHEREUM&
  walletAddress=0xa22d566f52b303049d27a7169ed17a925b3fdb5e&
  assetCode=ETH&
  flow=transfer&
  redirectUrl=...
```

**Verify**:

- Correct base URL (`https://robinhood.com/connect/amount`)
- All required parameters present
- Parameter values are correct
- redirectUrl is properly URL-encoded
- No deprecated parameters

---

## Browser Testing

### Desktop Browsers

Test in:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)

### Mobile Browsers

Test in:

- [ ] iOS Safari
- [ ] Chrome Mobile (Android)
- [ ] Chrome Mobile (iOS)

**Mobile-Specific Tests**:

- [ ] Search input works on mobile keyboard
- [ ] Asset selection is easy to tap
- [ ] Transfer button is easy to tap
- [ ] Robinhood app opens (if installed)
- [ ] Callback works when returning from Robinhood app
- [ ] Success toast is readable and dismissible

---

## Production Testing Checklist

Before deploying to production:

- [ ] End-to-end flow works in production environment
- [ ] Callback URL uses production domain (not localhost)
- [ ] HTTPS enabled for callback
- [ ] All API credentials are production credentials
- [ ] Error handling works correctly
- [ ] Success states display properly
- [ ] No console errors in production build
- [ ] TypeScript compilation succeeds (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Test with real Robinhood credentials
- [ ] Test on actual mobile devices
- [ ] Verify wallet addresses are correct on blockchain explorers

---

## Debugging Tips

### Enable Detailed Logging

Check your browser console for detailed logs:

- API request/response data
- URL generation details
- Callback parameter parsing
- Asset selection events

### Check Network Tab

Open DevTools Network tab and verify:

- API calls return 200 status
- Response bodies contain expected data
- No 404s or 500s
- Request payloads are correct

### Check Console

Look for:

- URL generation logs
- Asset selection logs
- Error messages
- Warning messages about missing/invalid data

### Common Issues and Solutions

#### Issue: "connectId invalid" error from Robinhood

**Cause**: Not calling `/catpay/v1/connect_id/` API, or using a random UUID

**Solution**: Verify your API route is calling Robinhood's Connect ID API before building the URL

---

#### Issue: Callback doesn't receive parameters

**Causes**:

- Missing `flow=transfer` parameter in URL
- Wrong base URL used
- RedirectUrl not properly encoded

**Solution**:

- Verify URL includes `&flow=transfer`
- Ensure base URL is `https://robinhood.com/connect/amount`
- Check redirectUrl is URL-encoded in the Robinhood URL

---

#### Issue: Transfer succeeds but callback shows error

**Causes**:

- Callback URL not accessible (firewalls, localhost)
- RedirectUrl parameter malformed
- Missing required parameters

**Solution**:

- Use ngrok for local testing
- Verify callback URL is publicly accessible
- Check redirectUrl encoding and format

---

#### Issue: Asset not found or not selectable

**Cause**: Asset disabled in metadata or not configured

**Solution**: Check `robinhood-asset-metadata.ts` and ensure asset has `enabled: true`

---

#### Issue: Wallet address not displaying

**Cause**: Address not configured for asset's network

**Solution**: Verify address exists in `network-addresses.ts` for the network

---

## Network-Specific Testing

### EVM Networks (Ethereum, Polygon, etc.)

- Verify address format: `0x` followed by 40 hex characters
- Test on Ethereum, Polygon, Arbitrum, Optimism, Base
- Verify address is the same for all EVM networks (if using same address)

### Bitcoin-Like Networks

- Verify address format appropriate for each network:
  - Bitcoin: bc1... or 1... or 3...
  - Litecoin: L... or M... or ltc1...
  - Dogecoin: D...
  - Bitcoin Cash: bitcoincash:q... or legacy format

### Solana

- Verify address is base58 encoded, 32-44 characters

### Memo-Required Networks

**Stellar (XLM)**:

- Verify address format: G... (56 characters)
- Verify memo is displayed
- Test copying memo separately from address

**XRP**:

- Verify address format: r... (25-35 characters)
- Verify destination tag is displayed
- Test copying destination tag

**Hedera (HBAR)**:

- Verify address format: 0.0.xxxxx
- Verify memo is displayed

---

## Automated Testing (Future)

### Unit Tests (To Add)

- URL builder functions
- Asset/network validation
- Wallet address format validation
- Parameter sanitization

### Integration Tests (To Add)

- API endpoint responses
- Error handling
- Asset selection logic
- Callback parameter parsing

### E2E Tests (To Add)

- Complete transfer flow
- Error scenarios
- Mobile responsiveness

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development setup
- [FLOW-DIAGRAMS.md](./FLOW-DIAGRAMS.md) - Visual flow diagrams

---

**Last Updated**: October 24, 2025
**Version**: 1.0 (Asset Pre-Selection Flow)

