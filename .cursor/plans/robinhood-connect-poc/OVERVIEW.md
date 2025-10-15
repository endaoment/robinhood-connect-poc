# Robinhood Connect Offramp Integration - Implementation Overview

## Project Context

The Robinhood Connect integration enables users to transfer crypto FROM their Robinhood accounts TO Endaoment using Robinhood's offramp functionality. This creates a streamlined donation flow where users can leverage their existing Robinhood crypto holdings without needing to manage external wallets or complex transfers.

## Goals

1. **Seamless Offramp Flow**: Enable users to transfer crypto from Robinhood to Endaoment with minimal friction
2. **Security-First Architecture**: Keep API keys on backend only, use referenceId tracking for order management
3. **Mobile-Optimized Experience**: Leverage Robinhood's universal links for native app integration
4. **Robust Error Handling**: Handle network issues, API failures, and user flow interruptions gracefully
5. **Scalable Foundation**: Build patterns that can support future enhancements (market sell, USDC conversion)

## Target User Flow

### Primary Flow (MVP)

```
Dashboard → Select "Transfer from Robinhood" → Choose asset/amount/network →
Generate referenceId → Open Robinhood app → User completes in Robinhood →
Redirect to callback → Redeem deposit address → Display address →
User sends crypto → Monitor order status → Transaction complete
```

### Detailed Step-by-Step

1. **User visits dashboard** - No authentication required on our side
2. **User clicks "Transfer from Robinhood"** - Opens offramp modal
3. **User selects asset, network, amount** - ETH on Ethereum, USDC on Polygon, etc.
4. **System generates referenceId** - UUID v4 created on backend for tracking
5. **System builds Robinhood URL** - Includes all parameters for offramp flow
6. **User clicks link** - Opens Robinhood app (mobile) or web (desktop)
7. **User authenticates in Robinhood** - Uses their existing Robinhood credentials
8. **User confirms transfer details** - Reviews asset, amount, network in Robinhood UI
9. **Robinhood redirects back** - Returns to our callback URL with parameters
10. **System redeems deposit address** - Backend calls Robinhood API with referenceId
11. **System displays deposit address** - Shows address and instructions to user
12. **User completes transfer** - Sends crypto from Robinhood to displayed address
13. **System monitors order status** - Polls Robinhood API for completion

### Bonus/Future Flow

14. **Market sell crypto for USD** - Convert received crypto to fiat
15. **Convert USD to USDC** - Stable coin conversion
16. **Send USDC to wallet** - Transfer to Endaoment-controlled address

## Technical Stack

- **Framework**: Next.js 14+ (React 18+)
- **Styling**: Tailwind CSS (existing from coinbase-oauth)
- **TypeScript**: Strict mode enabled
- **UUID Generation**: uuid library for referenceId creation
- **HTTP Client**: Native fetch API for Robinhood API calls
- **UI Components**: Existing shadcn/ui components from coinbase-oauth

## Architecture Patterns

### Stateless Flow Design

Unlike Coinbase's OAuth-based approach, Robinhood Connect uses a stateless flow:

```typescript
// Coinbase Pattern (Session-based)
session.accessToken → API calls → Direct transaction

// Robinhood Pattern (Stateless)
referenceId → App linking → Callback → Address redemption → User completion
```

### Backend API Security

All Robinhood API interactions happen on the backend:

```typescript
// Environment variables (backend only)
ROBINHOOD_APP_ID=your-app-id
ROBINHOOD_API_KEY=your-api-key

// API headers (never exposed to client)
headers: {
  'x-api-key': process.env.ROBINHOOD_API_KEY,
  'application-id': process.env.ROBINHOOD_APP_ID,
  'Content-Type': 'application/json'
}
```

### ReferenceId Tracking

Each offramp order is tracked by a unique referenceId:

```typescript
interface OfframpOrder {
  referenceId: string; // UUID v4 generated on backend
  assetCode: string; // ETH, USDC, BTC, etc.
  assetAmount: string; // Amount user wants to transfer
  networkCode: string; // ETHEREUM, POLYGON, SOLANA, etc.
  status: OrderStatus; // IN_PROGRESS, SUCCEEDED, FAILED
  depositAddress?: string; // Redeemed after callback
  transactionId?: string; // Blockchain transaction hash
}
```

## File Structure

```
robinhood-offramp/
├── app/
│   ├── api/
│   │   └── robinhood/
│   │       ├── redeem-deposit-address/
│   │       │   └── route.ts              # POST - Redeem deposit address
│   │       ├── order-status/
│   │       │   └── route.ts              # GET - Check order status
│   │       └── price-quote/
│   │           └── route.ts              # GET - Get offramp pricing
│   ├── callback/
│   │   └── page.tsx                      # Handle Robinhood redirect
│   ├── dashboard/
│   │   └── page.tsx                      # Main dashboard (adapted from Coinbase)
│   ├── globals.css                       # Existing styles
│   ├── layout.tsx                        # Root layout (remove NextAuth)
│   └── page.tsx                          # Landing page
├── components/
│   ├── offramp-modal.tsx                 # Main offramp initiation modal
│   ├── order-status.tsx                  # Order tracking component
│   ├── deposit-address-display.tsx       # Show address after redemption
│   └── ui/                               # Existing shadcn/ui components
├── lib/
│   ├── robinhood-api.ts                  # API client functions
│   ├── robinhood-url-builder.ts          # URL generation utilities
│   └── utils.ts                          # Existing utilities
├── types/
│   └── robinhood.d.ts                    # TypeScript definitions
├── .env.local                            # Environment variables
└── package.json                          # Dependencies (add uuid)
```

## Key Components to Create/Modify

### New Components

#### `/app/api/robinhood/redeem-deposit-address/route.ts`

- **Purpose**: Redeem deposit address using referenceId
- **Method**: POST
- **Input**: `{ referenceId: string }`
- **Output**: `{ address: string, addressTag?: string, assetCode: string, assetAmount: string, networkCode: string }`

#### `/app/callback/page.tsx`

- **Purpose**: Handle redirect from Robinhood
- **Functionality**: Parse URL params, trigger address redemption, display results
- **URL Params**: `assetCode`, `assetAmount`, `network`

#### `/components/offramp-modal.tsx`

- **Purpose**: Initiate offramp flow
- **Features**: Asset selection, amount input, network selection, price quotes
- **Actions**: Generate referenceId, build Robinhood URL, open link

#### `/lib/robinhood-api.ts`

- **Purpose**: Backend API client functions
- **Functions**: `redeemDepositAddress()`, `getOrderStatus()`, `getPriceQuote()`

### Modified Components

#### `/app/dashboard/page.tsx`

- **Changes**: Remove NextAuth dependency, add "Transfer from Robinhood" card
- **New Features**: Offramp modal integration, transaction history

#### `/app/layout.tsx`

- **Changes**: Remove NextAuth providers, simplify layout
- **Keep**: Theme provider, toast provider, existing UI structure

## Robinhood API Integration

### Deposit Address Redemption

```typescript
// POST https://api.robinhood.com/catpay/v1/redeem_deposit_address/
const response = await fetch('https://api.robinhood.com/catpay/v1/redeem_deposit_address/', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.ROBINHOOD_API_KEY!,
    'application-id': process.env.ROBINHOOD_APP_ID!,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ referenceId })
});

// Response
{
  "address": "0x8d12A197cB00D4747a1fe03395095ce2A5BC6819",
  "networkCode": "ETHEREUM",
  "assetCode": "ETH",
  "assetAmount": "0.05"
}
```

### Order Status Tracking

```typescript
// GET https://api.robinhood.com/catpay/v1/external/order/?referenceId=...
const response = await fetch(
  `https://api.robinhood.com/catpay/v1/external/order/?referenceId=${referenceId}`,
  {
    headers: {
      'x-api-key': process.env.ROBINHOOD_API_KEY!,
      'application-id': process.env.ROBINHOOD_APP_ID!
    }
  }
);

// Response
{
  "status": "ORDER_STATUS_SUCCEEDED",
  "assetCode": "ETH",
  "assetAmount": "0.05",
  "blockchainTransactionId": "0x...",
  "destinationAddress": "0x8d12A197cB00D4747a1fe03395095ce2A5BC6819"
}
```

### Offramp URL Generation

```typescript
const offrampUrl = new URL("https://applink.robinhood.com/u/connect");
offrampUrl.searchParams.set("offRamp", "true");
offrampUrl.searchParams.set("applicationId", process.env.ROBINHOOD_APP_ID!);
offrampUrl.searchParams.set("referenceId", referenceId);
offrampUrl.searchParams.set("supportedNetworks", "ETHEREUM,POLYGON");
offrampUrl.searchParams.set(
  "redirectUrl",
  `${process.env.NEXTAUTH_URL}/callback`
);
offrampUrl.searchParams.set("assetCode", "ETH");
offrampUrl.searchParams.set("assetAmount", "0.1");
```

## Key Architectural Differences from Coinbase

### Authentication Model

| Aspect                 | Coinbase OAuth                   | Robinhood Connect          |
| ---------------------- | -------------------------------- | -------------------------- |
| **User Auth**          | OAuth 2.0 with NextAuth          | No auth on our side        |
| **Session Management** | Server-side sessions with tokens | Stateless with referenceId |
| **API Access**         | User's access token              | Our API keys only          |
| **Token Refresh**      | Automatic refresh token flow     | Not applicable             |

### Transaction Flow

| Step                | Coinbase                        | Robinhood                   |
| ------------------- | ------------------------------- | --------------------------- |
| **1. User Auth**    | OAuth login required            | No login needed             |
| **2. Balance View** | API call to fetch accounts      | User sees in Robinhood app  |
| **3. Transaction**  | Direct API call with user token | App linking + callback flow |
| **4. Completion**   | Immediate API response          | Async with status polling   |

### Security Model

| Component           | Coinbase                      | Robinhood                    |
| ------------------- | ----------------------------- | ---------------------------- |
| **Sensitive Data**  | User access tokens in session | API keys in environment only |
| **Client Exposure** | Session tokens (encrypted)    | No sensitive data on client  |
| **Backend Calls**   | User-authorized API calls     | App-authorized API calls     |
| **Tracking**        | Session-based                 | referenceId-based            |

## TypeScript Type Definitions

```typescript
// types/robinhood.d.ts

export interface RobinhoodOfframpParams {
  applicationId: string;
  offRamp: boolean;
  supportedNetworks: string;
  redirectUrl: string;
  referenceId: string;
  assetCode?: string;
  assetAmount?: string;
  fiatCode?: string;
  fiatAmount?: string;
}

export interface DepositAddressResponse {
  address: string;
  addressTag?: string;
  assetCode: string;
  assetAmount: string;
  networkCode: string;
}

export interface OrderStatusResponse {
  applicationId: string;
  connectId: string;
  assetCode: string;
  networkCode: string;
  fiatCode: string;
  fiatAmount: string;
  cryptoAmount: string;
  price: string;
  processingFee: PriceItem;
  paymentMethod: string;
  totalAmount: PriceItem;
  blockchainTransactionId?: string;
  destinationAddress: string;
  referenceID: string;
  status:
    | "ORDER_STATUS_IN_PROGRESS"
    | "ORDER_STATUS_SUCCEEDED"
    | "ORDER_STATUS_FAILED";
}

export interface PriceItem {
  type: string;
  fiatAmount: string;
  cryptoQuantity: string;
}

export interface CallbackParams {
  assetCode: string;
  assetAmount: string;
  network: string;
}
```

## Security Considerations

### API Key Protection

```typescript
// ✅ CORRECT - Backend only
const headers = {
  "x-api-key": process.env.ROBINHOOD_API_KEY!,
  "application-id": process.env.ROBINHOOD_APP_ID!,
};

// ❌ NEVER DO - Client exposure
const apiKey = "your-api-key"; // Never hardcode or expose to client
```

### ReferenceId Generation

```typescript
// ✅ CORRECT - Backend generation
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const referenceId = uuidv4(); // Generated on backend
  // ... rest of implementation
}

// ❌ AVOID - Client generation (less secure)
const referenceId = crypto.randomUUID(); // Client-side generation
```

### Redirect URL Validation

```typescript
// Validate callback parameters
function validateCallbackParams(
  params: URLSearchParams
): CallbackParams | null {
  const assetCode = params.get("assetCode");
  const assetAmount = params.get("assetAmount");
  const network = params.get("network");

  if (!assetCode || !assetAmount || !network) {
    return null;
  }

  // Additional validation
  if (!/^[A-Z]{2,10}$/.test(assetCode)) return null;
  if (!/^\d+(\.\d+)?$/.test(assetAmount)) return null;
  if (!/^[A-Z_]+$/.test(network)) return null;

  return { assetCode, assetAmount, network };
}
```

## Error Handling Strategies

### API Error Handling

```typescript
async function redeemDepositAddress(
  referenceId: string
): Promise<DepositAddressResponse> {
  try {
    const response = await fetch(
      "https://api.robinhood.com/catpay/v1/redeem_deposit_address/",
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.ROBINHOOD_API_KEY!,
          "application-id": process.env.ROBINHOOD_APP_ID!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ referenceId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Deposit address redemption failed:", error);
    throw new Error("Failed to redeem deposit address. Please try again.");
  }
}
```

### User Flow Error Handling

```typescript
// Handle missing callback parameters
if (!callbackParams) {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600">Invalid Callback</h1>
      <p className="mt-4 text-gray-600">
        The callback from Robinhood was incomplete. Please try the transfer
        again.
      </p>
      <Button onClick={() => router.push("/dashboard")} className="mt-4">
        Return to Dashboard
      </Button>
    </div>
  );
}
```

## Performance Considerations

### Order Status Polling

```typescript
// Implement exponential backoff for polling
const pollOrderStatus = async (referenceId: string) => {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      const status = await getOrderStatus(referenceId);
      if (status.status !== "ORDER_STATUS_IN_PROGRESS") {
        return status;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, etc.
      const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempts++;
    } catch (error) {
      console.error("Polling error:", error);
      attempts++;
    }
  }

  throw new Error("Order status polling timeout");
};
```

### Client-Side Optimization

```typescript
// Lazy load heavy components
const OfframpModal = lazy(() => import("@/components/offramp-modal"));
const OrderStatus = lazy(() => import("@/components/order-status"));

// Use React.memo for expensive renders
const DepositAddressDisplay = React.memo(
  ({ address, assetCode, networkCode }) => {
    // Component implementation
  }
);
```

## Testing Strategies

### Manual Testing Checklist

1. **Offramp Initiation**

   - [ ] Modal opens with asset selection
   - [ ] Price quotes load correctly
   - [ ] referenceId generates on backend
   - [ ] Robinhood URL builds correctly

2. **Robinhood App Flow**

   - [ ] Universal link opens Robinhood app (mobile)
   - [ ] Web fallback works (desktop)
   - [ ] User can complete flow in Robinhood
   - [ ] Redirect returns to correct callback URL

3. **Callback Handling**

   - [ ] URL parameters parsed correctly
   - [ ] Deposit address redemption succeeds
   - [ ] Address displays with copy functionality
   - [ ] Error states handled gracefully

4. **Order Tracking**
   - [ ] Status polling works
   - [ ] UI updates on status changes
   - [ ] Transaction hash displays when available
   - [ ] Completion state shows correctly

### Error Scenario Testing

- **Invalid referenceId**: Should show clear error message
- **API failures**: Should retry with exponential backoff
- **Network issues**: Should handle timeouts gracefully
- **Malformed callbacks**: Should validate and reject invalid data
- **Expired orders**: Should handle timeout scenarios

## Critical Warnings & Lessons Learned

### API Key Security

⚠️ **CRITICAL**: Robinhood API keys must NEVER be exposed to the client:

- Store in environment variables only
- Use in backend API routes only
- Never log or console.log API keys
- Validate all client inputs before using in API calls

### ReferenceId Management

⚠️ **IMPORTANT**: referenceId is the only way to track orders:

- Generate on backend only (more secure)
- Store temporarily if needed for user experience
- Use UUID v4 for uniqueness
- Validate format before API calls

### Universal Link Behavior

⚠️ **MOBILE CONSIDERATION**: Universal links work differently across platforms:

- iOS: Opens Robinhood app if installed, Safari otherwise
- Android: Opens Robinhood app if installed, Chrome otherwise
- Desktop: Always opens in browser
- Test on actual devices, not just simulators

### Callback URL Validation

⚠️ **SECURITY**: Always validate callback parameters:

- Check parameter presence and format
- Validate asset codes against known list
- Verify amounts are numeric and positive
- Sanitize all inputs before processing

## Notes for AI Agents

When implementing these plans:

1. **Read this OVERVIEW.md first** to understand the complete architecture
2. **Focus on security** - API keys must stay on backend
3. **Test the complete flow** - Don't just test individual components
4. **Handle errors gracefully** - Network issues and API failures will happen
5. **Use TypeScript strictly** - Define proper types for all Robinhood API responses
6. **Follow existing patterns** - Adapt from coinbase-oauth where possible
7. **Document deviations** - Note any changes from the plan in IMPLEMENTATION-LOG.md
8. **Test on mobile** - Universal links are a key part of the user experience

## Future Enhancements

### Bonus Flow Implementation

- Market sell received crypto for USD
- Convert USD to USDC
- Send USDC to Endaoment wallet
- Transaction fee optimization

### User Experience Improvements

- Real-time order status updates (WebSocket)
- Transaction history persistence
- Email notifications for completion
- Multi-asset batch transfers

### Analytics & Monitoring

- Transfer volume tracking
- Success rate monitoring
- Error rate alerting
- Performance metrics
