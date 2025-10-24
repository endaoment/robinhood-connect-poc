# Robinhood Connect - Developer Guide

## Architecture Overview

This integration uses Robinhood's **Connect API** to enable cryptocurrency transfers from Robinhood accounts to external wallet addresses. The system uses an asset pre-selection flow with connectId tracking from the Robinhood API.

**Important**: This integration handles **onramp only** (deposits to external wallets). Offramp (withdrawals from external wallets to Robinhood) is a separate API and is not supported by this codebase.

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React hooks (useState, useEffect)
- **API Client**: Native fetch API
- **UUID Generation**: uuid v4

## Key Components

### 1. URL Generation (`lib/robinhood-url-builder.ts`)

Generates Robinhood Connect URLs for initiating onramp transfers with asset pre-selection.

**Key Functions**:

- `buildDaffyStyleOnrampUrl()` - Constructs Robinhood Connect URL with pre-selected asset
- `generateConnectId()` - Creates UUID v4 (for testing only - production should use Robinhood API)
- `getAssetsForNetwork()` - Returns compatible assets for a network
- `getNetworksForAsset()` - Returns compatible networks for an asset  
- `isAssetNetworkCompatible()` - Validates asset/network combinations
- `isValidWalletAddress()` - Validates wallet address format per network

**Usage**:

```typescript
import { buildDaffyStyleOnrampUrl } from '@/lib/robinhood-url-builder'

const result = buildDaffyStyleOnrampUrl({
  connectId: 'abc-123-from-robinhood-api', // Must come from Robinhood /connect_id/ API
  asset: 'ETH',
  network: 'ETHEREUM',
  walletAddress: '0x...',
})

// Redirect to Robinhood
window.location.href = result.url
```

### 2. API Routes (`app/api/robinhood/`)

Backend API endpoints for Robinhood integration.

#### Generate Onramp URL (`/api/robinhood/generate-onramp-url`)

- **Method**: POST
- **Purpose**: Generate Robinhood Connect URL with valid connectId
- **Input**: `{ selectedAsset, selectedNetwork }`
- **Output**: `{ success, url, connectId, referenceId }`

**Process**:
1. Validates asset and network
2. Calls Robinhood `/catpay/v1/connect_id/` API to get valid connectId
3. Retrieves wallet address for selected network
4. Builds URL using `buildDaffyStyleOnrampUrl()`
5. Returns URL and connectId to frontend

**Note**: connectId must come from Robinhood API, not generated locally.

### 3. UI Components

#### Dashboard (`app/dashboard/page.tsx`)

- Asset search and selection interface
- Displays ~120 supported assets across 20 networks
- Shows wallet address for selected asset's network
- Initiates transfer with Robinhood

**Key Features**:
- Real-time search and filtering
- Asset icons and network badges
- Pre-configured wallet addresses
- Transfer success toast notifications

#### Callback (`app/callback/page.tsx`)

- Receives redirect from Robinhood after transfer
- Displays transfer confirmation
- Shows asset, network, amount, and orderId
- Stores order details in localStorage for dashboard display

### 4. Configuration Libraries

#### Asset Metadata (`lib/robinhood-asset-metadata.ts`)

- Complete asset metadata for ~120 supported assets
- Asset icons, names, symbols, networks
- Search and filtering functionality
- Enable/disable flags per asset

#### Network Addresses (`lib/network-addresses.ts`)

- Pre-configured wallet addresses for 19 networks
- Organized by network type (EVM, Bitcoin-like, memo-required)
- Includes memos/destination tags where needed

#### Asset Addresses (`lib/robinhood-asset-addresses.ts`)

- Maps assets to their network-specific wallet addresses
- Helper functions for address retrieval
- Asset/network compatibility validation

### 5. Utility Libraries

#### Security Utils (`lib/security-utils.ts`)

- Input validation and sanitization
- Rate limiting (in-memory)
- Environment variable validation
- UUID validation

#### Performance Utils (`lib/performance-utils.ts`)

- API response caching
- Debouncing and throttling
- Performance monitoring
- Retry with exponential backoff

#### Error Messages (`lib/error-messages.ts`)

- User-friendly error constants
- Error response formatting
- Error logging utilities

## Environment Variables

Create a `.env.local` file in the `robinhood-onramp` directory:

```bash
# Robinhood API Configuration
ROBINHOOD_APP_ID=your-app-id-from-robinhood
ROBINHOOD_API_KEY=your-api-key-from-robinhood

# Application URL (for redirect callback)
NEXTAUTH_URL=http://localhost:3030  # or your production domain
```

### Security Note

⚠️ **Critical**: API keys must NEVER be exposed to the client

- Store in `.env.local` (not committed to git)
- Access only in API routes (server-side)
- Never log or console.log API keys
- Validate environment variables on server startup

## User Flow

### Complete Asset Pre-Selection Flow

```
1. Dashboard
   ↓ User searches or browses assets
   ↓ User selects cryptocurrency (e.g., ETH, SOL, USDC)
   ↓ System shows wallet address for asset's network

2. Transfer Initiation
   ↓ User clicks "Initiate Transfer with Robinhood"
   ↓ Frontend calls /api/robinhood/generate-onramp-url

3. URL Generation (Backend)
   ↓ Backend calls Robinhood API: POST /catpay/v1/connect_id/
   ↓ Backend receives valid connectId
   ↓ Backend retrieves wallet address for network
   ↓ Backend builds URL with buildDaffyStyleOnrampUrl()
   ↓ Backend returns URL and connectId

4. Redirect to Robinhood
   ↓ Frontend redirects to Robinhood Connect URL
   ↓ Asset is pre-selected in Robinhood

5. Robinhood App/Web
   ↓ User authenticates in Robinhood
   ↓ User sees pre-selected asset
   ↓ User enters amount and confirms transfer

6. Redirect to Callback
   ↓ Robinhood redirects with parameters (asset, network, amount, orderId, connectId)
   ↓ Callback page displays success message
   ↓ Order details stored in localStorage

7. Dashboard
   ↓ User returns to dashboard
   ↓ Success toast displays with transfer details
```

**Key Differences from Balance-First Approach**:
- Asset is pre-selected before Robinhood opens
- No balance browsing in our UI
- Clearer user experience with less confusion
- Proven to work reliably with external wallet transfers

## API Integration Details

### Robinhood API Endpoints

**Base URL**: `https://api.robinhood.com/catpay/v1`

#### Connect ID API (Required for Onramp)

```typescript
POST https://api.robinhood.com/catpay/v1/connect_id/

Headers:
  x-api-key: <ROBINHOOD_API_KEY>
  application-id: <ROBINHOOD_APP_ID>
  Content-Type: application/json

Body:
  {} // Empty object

Response:
  {
    "connectId": "abc-123-def-456-uuid-format"
  }
```

**Critical**: The connectId must be obtained from this API before building the Robinhood Connect URL. Do not use randomly generated UUIDs in production.

#### Robinhood Connect URL Format (Onramp)

```
https://robinhood.com/connect/amount
  ?applicationId=<ROBINHOOD_APP_ID>
  &connectId=<FROM_CONNECT_ID_API>
  &paymentMethod=crypto_balance
  &supportedAssets=ETH
  &supportedNetworks=ETHEREUM
  &walletAddress=0x...
  &assetCode=ETH
  &flow=transfer
  &redirectUrl=<ENCODED_CALLBACK_URL>
```

**Required Parameters**:
- `applicationId` - Your Robinhood app ID
- `connectId` - From `/connect_id/` API (not random UUID)
- `paymentMethod` - Must be `crypto_balance` for onramp
- `supportedAssets` - Single asset code
- `supportedNetworks` - Single network
- `walletAddress` - Destination wallet address
- `assetCode` - Asset being transferred
- `flow` - Must be `transfer` for callback parameters
- `redirectUrl` - URL-encoded callback URL

**Base URL Note**: Use `https://robinhood.com/connect/amount` (NOT `/applink/connect`)

## TypeScript Type Definitions

All types are defined in `types/robinhood.d.ts`:

```typescript
// Offramp URL parameters
export interface RobinhoodOfframpParams {
  applicationId: string
  offRamp: boolean
  supportedNetworks: string
  redirectUrl: string
  referenceId: string
  assetCode?: string
  assetAmount?: string
  fiatCode?: string
  fiatAmount?: string
}

// Deposit address response
export interface DepositAddressResponse {
  address: string
  addressTag?: string
  assetCode: string
  assetAmount: string
  networkCode: string
}

// Order status response
export interface OrderStatusResponse {
  status: 'ORDER_STATUS_IN_PROGRESS' | 'ORDER_STATUS_SUCCEEDED' | 'ORDER_STATUS_FAILED'
  assetCode: string
  cryptoAmount: string
  networkCode: string
  fiatAmount: string
  blockchainTransactionId?: string
  destinationAddress: string
  referenceID: string
}
```

## Testing

For comprehensive testing documentation, see [TESTING_GUIDE.md](./TESTING_GUIDE.md).

### Quick API Test

Test the URL generation endpoint:

```bash
# Generate onramp URL
curl -X POST http://localhost:3030/api/robinhood/generate-onramp-url \
  -H "Content-Type: application/json" \
  -d '{"selectedAsset":"ETH","selectedNetwork":"ETHEREUM"}'
```

### Build & Type Check

```bash
# Type check
npx tsc --noEmit

# Build for production
npm run build

# Start development server
npm run dev
```

### Manual Testing

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3030/dashboard`
3. Search for an asset (e.g., "ETH")
4. Select the asset
5. Verify wallet address displays
6. Click "Initiate Transfer with Robinhood"
7. Complete flow in Robinhood (if using real credentials)

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed test scenarios.

## Deployment

### Environment Setup

1. **Set Production Environment Variables**:

   ```bash
   ROBINHOOD_APP_ID=production-app-id
   ROBINHOOD_API_KEY=production-api-key
   NEXTAUTH_URL=https://your-production-domain.com
   ```

2. **Configure Redirect URL with Robinhood**:
   - Contact Robinhood team
   - Provide production callback URL: `https://your-domain.com/callback`
   - Wait for approval and configuration

3. **Build for Production**:

   ```bash
   npm run build
   ```

4. **Deploy to Hosting Platform**:
   - Vercel (recommended for Next.js)
   - AWS Amplify
   - Netlify
   - Or any Node.js hosting

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Or via CLI:
vercel env add ROBINHOOD_APP_ID
vercel env add ROBINHOOD_API_KEY
vercel env add NEXTAUTH_URL
```

### Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Redirect URL registered with Robinhood
- [ ] SSL certificate active
- [ ] Test complete offramp flow
- [ ] Monitor error logs
- [ ] Set up analytics tracking
- [ ] Configure error monitoring (Sentry, etc.)

## Security Considerations

### API Key Protection

✅ **Do**:

- Store API keys in environment variables
- Access keys only in API routes (server-side)
- Validate environment variables on startup
- Use proper error handling without exposing keys

❌ **Don't**:

- Hardcode API keys in code
- Expose keys in client-side code
- Log API keys in console or logs
- Commit keys to version control

### Input Validation

All user inputs must be validated:

```typescript
import { isValidUUID, isValidAssetCode, isValidAmount, sanitizeCallbackParams } from '@/lib/security-utils'

// Validate referenceId
if (!isValidUUID(referenceId)) {
  return error('Invalid referenceId format')
}

// Sanitize callback parameters
const params = sanitizeCallbackParams({
  assetCode: searchParams.get('assetCode'),
  assetAmount: searchParams.get('assetAmount'),
  network: searchParams.get('network'),
})

if (!params) {
  return error('Invalid callback parameters')
}
```

### Rate Limiting

Implement rate limiting on API endpoints:

```typescript
import { checkRateLimit } from '@/lib/security-utils'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  if (!checkRateLimit(ip, 10, 60000)) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 })
  }

  // Process request...
}
```

## Performance Optimization

### Caching

Use the built-in cache for API responses:

```typescript
import { apiCache } from '@/lib/performance-utils'

export async function GET(request: Request) {
  const cacheKey = `order-status-${referenceId}`
  const cached = apiCache.get(cacheKey)

  if (cached) {
    return NextResponse.json({ success: true, data: cached })
  }

  const orderStatus = await getOrderStatus(referenceId)
  apiCache.set(cacheKey, orderStatus, 30000) // 30 second cache

  return NextResponse.json({ success: true, data: orderStatus })
}
```

### Debouncing

Debounce expensive operations:

```typescript
import { debounce } from '@/lib/performance-utils'

const debouncedFetchQuote = debounce(async (amount: string) => {
  const quote = await fetchPriceQuote(assetCode, amount)
  setQuote(quote)
}, 500)
```

## Common Issues & Solutions

### Issue: TypeScript Compilation Errors

**Solution**: Run type check and fix errors

```bash
npx tsc --noEmit
```

### Issue: Environment Variables Not Loading

**Solution**:

- Ensure `.env.local` is in the correct directory
- Restart development server after changing env vars
- Check spelling and format of variable names

### Issue: CORS Errors

**Solution**:

- API routes automatically handle CORS in Next.js
- Ensure you're not making client-side calls to Robinhood API
- All Robinhood calls should go through your API routes

### Issue: Build Failures

**Solution**:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Contributing

When making changes:

1. **Create a Feature Branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow Code Style**:
   - Use TypeScript strict mode
   - Follow existing naming conventions
   - Add JSDoc comments for public functions
   - No semicolons (project convention)

3. **Test Thoroughly**:
   - Manual testing of changes
   - Type check with `npx tsc --noEmit`
   - Build with `npm run build`

4. **Update Documentation**:
   - Update this guide if adding new features
   - Update type definitions if changing interfaces
   - Add comments for complex logic

5. **Commit and Push**:
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push origin feature/your-feature-name
   ```

## Support & Resources

- **Robinhood Connect Documentation**: Contact Robinhood team
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **TypeScript Documentation**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0  
**Maintainer**: Endaoment Development Team
