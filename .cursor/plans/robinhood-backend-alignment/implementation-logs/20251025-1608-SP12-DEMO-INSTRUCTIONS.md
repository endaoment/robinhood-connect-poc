# Sub-Plan 12: Backend Integration Demo - Testing Instructions

**Date**: 2025-10-25 16:06
**Purpose**: How to see the backend integration demonstration in action

## What Was Implemented

Sub-Plan 12 integrated the `PledgeService` into the callback page to demonstrate the complete backend integration flow. When a user completes a Robinhood transfer, the callback page now:

1. Uses `pledgeService.createFromCallback()` to create a pledge
2. Shows **toast notifications** for each backend API call
3. Demonstrates the complete data flow from Robinhood → Backend

## How to Test

### Option 1: Simulated Callback (Quickest)

1. **Start dev server**:

   ```bash
   cd robinhood-onramp
   npm run dev
   ```

2. **Navigate to callback URL with test params**:

   ```
   http://localhost:3030/callback?orderId=TEST123&connectId=abc-def-ghi&asset=BTC&network=BITCOIN&amount=0.5&timestamp=1698765432000
   ```

3. **Watch the toast sequence**:

   - Toast 1: "Resolving token from backend..."
   - Toast 2: "Token resolved successfully"
   - Toast 3: "Creating pledge in backend..."
   - Toast 4: "Pledge created successfully"
   - Toast 5: "Discord notification sent"

4. **Observe the redirect** to dashboard with success message

### Option 2: Full Flow (Most Realistic)

1. **Start dev server**: `npm run dev`

2. **Go to home page**: `http://localhost:3030`

3. **Select an asset** (e.g., BTC)

4. **Click "Generate Onramp URL"**

5. **Copy the generated URL**

6. **Extract the connectId** from the URL

7. **Simulate callback** by navigating to:

   ```
   http://localhost:3030/callback?orderId=TEST123&connectId={EXTRACTED_CONNECT_ID}&asset=BTC&network=BITCOIN&amount=0.5
   ```

8. **Watch toasts** demonstrate backend integration

## What Each Toast Shows

### Toast 1: Token Resolution

**Title**: 🔍 Resolving token from backend...

**Body**:

```
Backend API Call: POST /v1/tokens/resolve

Request:
{
  "symbol": "BTC",
  "network": "BITCOIN"
}

Expected Response:
{
  "id": "uuid-...",
  "symbol": "BTC",
  "network": "BITCOIN",
  "decimals": 8,
  "contract": null
}
```

**What it demonstrates**: The backend TokenService resolving the asset symbol + network to a Token entity with decimals needed for amount conversion.

### Toast 2: Token Resolved

**Title**: ✅ Token resolved successfully

**Body**:

```
Token Details:
- ID: uuid-...
- Symbol: BTC
- Network: BITCOIN
- Decimals: 8
```

**What it demonstrates**: Successful token resolution with all necessary metadata.

### Toast 3: Creating Pledge

**Title**: 💾 Creating pledge in backend...

**Body**:

```
Backend API Call: POST /v1/pledges/create

Request (CreatePledgeDto):
{
  "otcTransactionHash": "robinhood:abc-def-ghi",
  "inputToken": "uuid-...",
  "inputAmount": "50000000",
  "destinationOrgId": "fund-uuid",
  "status": "PendingLiquidation",
  "centralizedExchangeDonationStatus": "Completed",
  "centralizedExchangeTransactionId": "TEST123"
}
```

**What it demonstrates**: The backend PledgeService receiving structured pledge data ready for database insertion.

### Toast 4: Pledge Created

**Title**: ✅ Pledge created successfully

**Body**:

```
Pledge Details:
- ID: uuid-...
- Status: PendingLiquidation
- Transaction Hash: robinhood:abc-def-ghi
- Amount: 50000000 (0.5 BTC)
- Created At: 2025-10-25T16:06:00Z
```

**What it demonstrates**: Successfully created CryptoDonationPledge entity in the backend database.

### Toast 5: Discord Notification

**Title**: 📢 Sending Discord notification...

**Body**:

```
Webhook Call: POST https://discord.com/api/webhooks/...

Message:
🎉 New Crypto Donation!
Asset: BTC
Amount: 0.5
Network: BITCOIN
Status: Completed
```

**What it demonstrates**: Backend NotificationService sending donation alert to Discord.

## Console Output

In addition to toasts, check the browser console for detailed logs:

```
🔄 [CALLBACK] Creating pledge via PledgeService...
📊 [CALLBACK] Pledge Creation Result:
  success: true
  pledgeId: "uuid-..."
  warnings: []
✅ [CALLBACK] Pledge created successfully:
{
  "id": "uuid-...",
  "otcTransactionHash": "robinhood:abc-def-ghi",
  "inputToken": "uuid-...",
  "inputAmount": "50000000",
  ...
}
✅ [CALLBACK] Complete order details: {...}
🎉 [CALLBACK] Redirecting to dashboard with order details
```

## What This Demonstrates for Backend Team

1. **Complete Data Flow**:

   - Robinhood callback → PledgeService → Backend APIs
   - All required data properly formatted
   - No missing fields or incorrect types

2. **Service Integration**:

   - TokenService for asset resolution
   - PledgeService for pledge creation
   - NotificationService for alerts
   - All services working together

3. **Copy/Paste Ready**:

   - Exact DTO structures shown
   - Field mappings demonstrated
   - API endpoints documented
   - Response formats displayed

4. **Error Handling**:
   - Token not found → error shown
   - Invalid amount → conversion fails
   - Missing required fields → validation errors
   - All errors properly caught and displayed

## Mock vs Real Backend

**Current (POC - Mock)**:

- MockTokenService returns hardcoded token data
- MockPledgeService simulates database insert
- Toast notifications show what would happen
- No actual database writes

**Future (Backend - Real)**:
When migrating to endaoment-backend:

1. Replace `mockTokenService` with real `TokenService` from `@api/token`
2. Replace `mockPledgeService` with real `PledgeService` from `@api/pledge`
3. Replace `mockNotificationService` with real `NotificationService`
4. Remove toast demonstrations (optional - keep for dev mode)
5. Add actual database transactions
6. Add actual Discord webhook calls

**Migration is trivial** because:

- Same method signatures
- Same parameter structures
- Same return types
- Same error handling patterns

## Files Involved

**Callback Page**:

- `app/(routes)/callback/page.tsx` - Uses PledgeService

**Services**:

- `libs/robinhood/src/lib/services/pledge.service.ts` - Orchestrates pledge creation
- `libs/shared/src/lib/backend-mock/mock-token.service.ts` - Mock token resolution
- `libs/shared/src/lib/backend-mock/mock-pledge.service.ts` - Mock pledge creation
- `libs/shared/src/lib/backend-mock/mock-notification.service.ts` - Mock notifications

**DTOs**:

- `libs/robinhood/src/lib/dtos/create-pledge.dto.ts` - Pledge structure
- `libs/robinhood/src/lib/dtos/callback.dto.ts` - Callback parameters

## Troubleshooting

**No toasts appear**:

- Check browser console for errors
- Verify dev server is running
- Confirm toast component is mounted (check `app/layout.tsx`)

**Toasts show but no data**:

- Verify callback URL has required parameters
- Check console for validation errors
- Ensure amount is a valid number

**"Token not found" error**:

- Asset/network combination not in mock registry
- Check `mock-token.service.ts` for supported tokens
- Add new tokens to MOCK_TOKENS array if needed

**Redirect doesn't happen**:

- Check for JavaScript errors in console
- Verify localStorage is accessible
- Ensure router is available (Next.js App Router)

## Next Steps

After seeing the demonstration:

1. **Review toast content** - Understand each backend call
2. **Check console logs** - See detailed pledge structure
3. **Inspect localStorage** - See what's stored for dashboard
4. **Read migration guide** - Understand backend integration steps

---

**Demo successfully shows**: Complete backend integration flow from Robinhood callback to pledge creation with visual demonstration of all API calls.
