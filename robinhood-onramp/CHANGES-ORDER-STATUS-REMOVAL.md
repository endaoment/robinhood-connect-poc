# Order Status API Removal for Onramp

## Summary

Removed the order status fetching functionality from the onramp flow because:

1. The Robinhood order status API (`/catpay/v1/external/order/`) does NOT work for onramp flows - it's for offramp only
2. It was causing 404 errors and unnecessary polling/retries
3. All necessary data is already available in the callback URL from Robinhood

## Changes Made

### 1. `/app/callback/page.tsx`

**Removed:**

- Extensive polling logic (lines 207-289) that tried to fetch order details from Robinhood API
- Retry/backoff mechanism with up to 10 attempts
- Error handling for 404 responses

**Replaced with:**

- Simple approach that uses data from URL parameters and localStorage
- Status is set to "COMPLETED" when orderId is present (indicating successful transfer initiation)
- No API calls needed - transfer data already available

**Benefits:**

- Faster callback processing (no polling delays)
- No more 404 errors in console
- Simpler, more reliable code

### 2. `/app/api/robinhood/order-status/route.ts`

**Added warning:**

- Documentation noting this endpoint is for OFFRAMP use only
- Explanation that onramp doesn't need this API
- Kept the endpoint for potential future offramp implementation

### 3. `/components/order-status.tsx`

**Added warning:**

- Documentation noting this component is for OFFRAMP use only
- Explanation that it won't work for onramp flows
- Component kept for potential future offramp implementation

## Data Flow for Onramp (After Changes)

1. **User initiates transfer** → Dashboard stores transfer details in localStorage (asset, network, amount, connectId, timestamp)
2. **Robinhood URL generated** → redirectUrl includes transfer data as query params
3. **User completes transfer on Robinhood** → Robinhood redirects to callback with orderId + original query params
4. **Callback receives:**
   - `orderId` - from Robinhood (indicates successful transfer initiation)
   - `asset`, `network`, `referenceId`, `timestamp` - from redirectUrl query params (data we encoded)
   - Fallback to localStorage if query params missing
5. **Callback stores order details** → localStorage for dashboard to display
6. **Dashboard shows success** → Toast notification with transfer details

## What Was NOT Changed

- Order status API endpoint (`/api/robinhood/order-status/route.ts`) - kept for future offramp use
- OrderStatusComponent (`/components/order-status.tsx`) - kept for future offramp use
- Transaction history component - still references OrderStatusComponent but won't work until offramp is implemented

## Testing

After these changes:

1. ✅ Callback processing should be faster
2. ✅ No more 404 errors for order status
3. ✅ Transfer details still captured correctly
4. ✅ Dashboard still shows transfer success

## Future Work (Offramp)

When implementing offramp:

- The order status API should work correctly for offramp flows
- OrderStatusComponent can be used to display withdrawal status
- Transaction history will be able to show real-time status updates
