# Robinhood Connect - Developer Guide

## Architecture Overview

This integration uses Robinhood's offramp API to enable crypto transfers from Robinhood accounts to external addresses. The system uses a stateless, redirect-based flow with referenceId tracking for order management.

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

Generates Robinhood Connect URLs for initiating offramp flows.

**Key Functions**:

- `generateReferenceId()` - Creates UUID v4 for order tracking
- `buildOfframpUrl()` - Constructs complete Robinhood Connect URL
- `storeReferenceId()` - Saves referenceId to localStorage
- `getAssetsForNetwork()` - Returns compatible assets for a network
- `isAssetNetworkCompatible()` - Validates asset/network combinations

**Usage**:

```typescript
import { buildOfframpUrl } from '@/lib/robinhood-url-builder'

const result = buildOfframpUrl({
  supportedNetworks: ['ETHEREUM'],
  assetCode: 'ETH',
  assetAmount: '0.1',
})

// Opens Robinhood app/web
window.open(result.url, '_blank')
```

### 2. API Routes (`app/api/robinhood/`)

Backend API endpoints for Robinhood integration.

#### Generate Offramp URL (`/api/robinhood/generate-offramp-url`)

- **Method**: POST
- **Purpose**: Server-side URL generation
- **Input**: `{ supportedNetworks, assetCode?, assetAmount?, fiatAmount? }`
- **Output**: `{ success, data: { url, referenceId, params } }`

#### Redeem Deposit Address (`/api/robinhood/redeem-deposit-address`)

- **Method**: POST
- **Purpose**: Get deposit address using referenceId
- **Input**: `{ referenceId }`
- **Output**: `{ success, data: { address, assetCode, assetAmount, networkCode } }`

#### Order Status (`/api/robinhood/order-status`)

- **Method**: GET
- **Purpose**: Check order status and completion
- **Query**: `?referenceId=<uuid>`
- **Output**: `{ success, data: { status, assetCode, blockchainTransactionId, ... } }`

### 3. UI Components (`components/`)

#### Offramp Modal (`offramp-modal.tsx`)

- Transfer initiation interface
- Network and asset selection
- Amount input (crypto or fiat)
- Price quote display
- Opens Robinhood URL

#### Order Status (`order-status.tsx`)

- Real-time status tracking
- Auto-refresh with exponential backoff
- Transaction details display
- Blockchain explorer integration

#### Transaction History (`transaction-history.tsx`)

- List of all transfers
- Status badges and metadata
- Click-through to order status

### 4. Robinhood API Client (`lib/robinhood-api.ts`)

Backend functions for Robinhood API calls.

**Functions**:

```typescript
// Redeem deposit address
async function redeemDepositAddress(referenceId: string): Promise<DepositAddressResponse>

// Get order status
async function getOrderStatus(referenceId: string): Promise<OrderStatusResponse>

// Get price quote (ready for implementation)
async function getPriceQuote(assetCode: string, amount: string): Promise<PriceQuoteResponse>
```

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

Create a `.env.local` file in the `robinhood-offramp` directory:

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

### Complete Offramp Flow

```
1. Dashboard
   ↓ User clicks "Start Transfer"

2. Offramp Modal
   ↓ User selects network, asset, amount
   ↓ Click "Open Robinhood"

3. URL Generation
   ↓ Generate referenceId (UUID v4)
   ↓ Store in localStorage
   ↓ Build Robinhood Connect URL
   ↓ Open in new tab/window

4. Robinhood App/Web
   ↓ User authenticates (in Robinhood)
   ↓ User confirms transfer details
   ↓ User authorizes transfer

5. Redirect to Callback
   ↓ Parse URL parameters (assetCode, assetAmount, network)
   ↓ Retrieve referenceId from localStorage

6. Redeem Deposit Address
   ↓ Call /api/robinhood/redeem-deposit-address
   ↓ Display deposit address to user

7. User Completes Transfer
   ↓ Send crypto to deposit address in Robinhood

8. Order Status Tracking
   ↓ Poll /api/robinhood/order-status
   ↓ Update UI with status changes
   ↓ Show blockchain transaction ID when complete
```

## API Integration Details

### Robinhood API Endpoints

**Base URL**: `https://api.robinhood.com/catpay/v1`

#### 1. Redeem Deposit Address

```typescript
POST https://api.robinhood.com/catpay/v1/redeem_deposit_address/

Headers:
  x-api-key: <ROBINHOOD_API_KEY>
  application-id: <ROBINHOOD_APP_ID>
  Content-Type: application/json

Body:
  { "referenceId": "f2056f4c-93c7-422b-bd59-fbfb5b05b6ad" }

Response:
  {
    "address": "0x8d12A197cB00D4747a1fe03395095ce2A5BC6819",
    "addressTag": "memo-if-required",
    "networkCode": "ETHEREUM",
    "assetCode": "ETH",
    "assetAmount": "0.05"
  }
```

#### 2. Get Order Status

```typescript
GET https://api.robinhood.com/catpay/v1/external/order/?referenceId=<uuid>

Headers:
  x-api-key: <ROBINHOOD_API_KEY>
  application-id: <ROBINHOOD_APP_ID>

Response:
  {
    "status": "ORDER_STATUS_SUCCEEDED",
    "assetCode": "ETH",
    "cryptoAmount": "0.05",
    "networkCode": "ETHEREUM",
    "fiatAmount": "150.00",
    "blockchainTransactionId": "0x...",
    "destinationAddress": "0x8d12A197cB00D4747a1fe03395095ce2A5BC6819",
    "referenceID": "f2056f4c-93c7-422b-bd59-fbfb5b05b6ad"
  }
```

#### 3. Offramp URL Format

```
https://applink.robinhood.com/u/connect
  ?offRamp=true
  &applicationId=<ROBINHOOD_APP_ID>
  &referenceId=<UUID_V4>
  &supportedNetworks=ETHEREUM,POLYGON
  &redirectUrl=<ENCODED_CALLBACK_URL>
  &assetCode=ETH
  &assetAmount=0.1
```

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

### Manual Testing

See `sub-plan-7-testing-polish.md` for comprehensive manual testing checklist.

### API Testing

Test API endpoints with curl:

```bash
# Generate offramp URL
curl -X POST http://localhost:3030/api/robinhood/generate-offramp-url \
  -H "Content-Type: application/json" \
  -d '{"supportedNetworks":["ETHEREUM"],"assetCode":"ETH","assetAmount":"0.1"}'

# Redeem deposit address
curl -X POST http://localhost:3030/api/robinhood/redeem-deposit-address \
  -H "Content-Type: application/json" \
  -d '{"referenceId":"f2056f4c-93c7-422b-bd59-fbfb5b05b6ad"}'

# Get order status
curl "http://localhost:3030/api/robinhood/order-status?referenceId=f2056f4c-93c7-422b-bd59-fbfb5b05b6ad"
```

### Build & Type Check

```bash
# Type check
npm run build

# TypeScript check without build
npx tsc --noEmit

# Start development server
npm run dev
```

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
