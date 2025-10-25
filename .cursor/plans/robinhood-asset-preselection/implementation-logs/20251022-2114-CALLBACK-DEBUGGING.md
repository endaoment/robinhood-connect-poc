# Callback Flow Debugging - Investigation & Fix

**Date**: October 22, 2025 20:35
**Status**: 🔧 IN PROGRESS
**Issue**: Callback not being triggered after successful Robinhood transfer

---

## Problem Summary

User reported:

- ✅ Donation **working** - funds hit Coinbase Prime account
- ❌ Callback **not working** - nothing appearing in ngrok inspector
- ❌ Browser **not redirected** back to /callback page after transfer

---

## Root Cause Analysis

### Discovery: Different Callback Flows

The new Daffy-style URL implementation uses a **different callback mechanism** than the old flow:

#### Old Flow (Multi-Network)

```
1. User clicks → Generate URL (no wallet address)
2. User selects asset in Robinhood
3. Robinhood calls /api/robinhood/redeem-deposit-address
4. We return wallet address
5. Robinhood completes transfer
6. Robinhood redirects to /callback?assetCode=ETH&assetAmount=0.5&network=ETHEREUM
```

#### New Flow (Daffy-Style with Pre-Selection)

```
1. User selects asset → Generate URL (includes wallet address!)
2. User confirms in Robinhood
3. Robinhood completes transfer (already has wallet address)
4. Robinhood redirects to /callback?connectId=xxx (????)
   ↑ This is what we needed to verify!
```

### Key Difference

**With asset pre-selection, the wallet address is provided UPFRONT in the URL**, so:

- Robinhood doesn't need to call our API to get the wallet address
- Robinhood might not send the same callback parameters
- The transfer still works because the address was in the initial URL

---

## What We Don't Know Yet

We need to determine what query parameters Robinhood actually sends in the callback with the Daffy-style URL:

**Possibilities:**

1. `connectId` only
2. `depositQuoteId`
3. No redirect at all (transfer completes silently)
4. Different parameters entirely

**The investigation:** We added comprehensive logging to capture ALL query parameters sent to the callback page.

---

## Changes Made

### 1. Enhanced Callback Page Logging

**File**: `robinhood-offramp/app/callback/page.tsx`

Added comprehensive query parameter logging:

```typescript
// Log ALL query parameters for debugging
console.log("🔍 [CALLBACK] Received query parameters:");
const allParams: Record<string, string> = {};
searchParams.forEach((value, key) => {
  allParams[key] = value;
  console.log(`  ${key}: ${value}`);
});
console.log("Full params object:", allParams);
```

This will help us see **exactly** what Robinhood sends back.

### 2. localStorage-Based Asset Recovery

**Files**:

- `robinhood-offramp/app/dashboard/page.tsx` - Store asset info before redirect
- `robinhood-offramp/app/callback/page.tsx` - Retrieve asset info on callback

**Dashboard (before redirect):**

```typescript
// Store transfer info in localStorage for callback recovery
localStorage.setItem("robinhood_selected_asset", selection.asset.symbol);
localStorage.setItem("robinhood_selected_network", selection.asset.network);
localStorage.setItem("robinhood_connect_id", result.data.connectId || "");
```

**Callback page (on return):**

```typescript
// Try to recover asset info from localStorage
const storedAsset = localStorage.getItem("robinhood_selected_asset");
const storedNetwork = localStorage.getItem("robinhood_selected_network");
const storedAmount = localStorage.getItem("robinhood_transfer_amount");

if (storedAsset && storedNetwork) {
  // Reconstruct callback params from stored data
  const reconstructedParams = {
    assetCode: storedAsset,
    assetAmount: storedAmount || "Unknown",
    network: storedNetwork,
  };

  // Show success page with reconstructed data
  const depositAddress = getDepositAddressForAsset(reconstructedParams);
  // ... display to user
}
```

### 3. Support for Multiple Callback Formats

The callback page now handles:

- **Old-style callbacks**: `assetCode`, `assetAmount`, `network` query params
- **New-style callbacks**: `connectId`, `depositQuoteId` query params
- **localStorage fallback**: When callback params are missing, use stored data

---

## Testing Instructions

### Test 1: Check if Callback is Being Triggered

**Setup:**

1. Ensure ngrok is running:

   ```bash
   ngrok http 3000
   ```

2. Update `.env.local` with ngrok URL:

   ```bash
   NEXT_PUBLIC_CALLBACK_URL=https://your-ngrok-url.ngrok-free.dev/callback
   ```

3. Restart dev server:
   ```bash
   npm run dev
   ```

**Test Steps:**

1. Open dashboard: http://localhost:3030/dashboard
2. Select an asset (e.g., ETH)
3. Click "Continue to Robinhood"
4. Complete transfer in Robinhood
5. **Watch for:**
   - Browser console logs showing callback parameters
   - ngrok inspector showing incoming request to `/callback`
   - Redirect back to our callback page

**Expected Results:**

**If redirect happens:**

- ✅ You'll see console logs with all query parameters
- ✅ ngrok inspector will show the request
- ✅ We can identify what params Robinhood sends

**If NO redirect:**

- This might be expected behavior (Robinhood doesn't redirect with pre-selected assets)
- The transfer still works (funds arrive) but no callback occurs

### Test 2: Verify localStorage Recovery Works

**If callback DOES happen (even with different params):**

1. Check browser console for:

   ```
   🔍 [CALLBACK] Received query parameters:
     connectId: xxx-xxx-xxx
     (or other parameters)

   📦 [CALLBACK] Stored transfer info:
     asset: ETH
     network: ETHEREUM

   ✅ [CALLBACK] Reconstructed params from localStorage
   ```

2. Verify the callback page shows:
   - Correct asset name
   - Correct network
   - Correct wallet address
   - Transfer amount (if available)

### Test 3: Check ngrok Traffic Inspector

Visit: http://127.0.0.1:4040/inspect/http

Look for:

- Any requests to `/callback` endpoint
- Query parameters in the request URL
- Timestamp matching your transfer completion

---

## Possible Outcomes

### Outcome A: Callback Happens with Different Params

- ✅ **Good!** We'll see what params Robinhood sends
- **Next step:** Update callback logic to handle those params
- **Evidence:** ngrok shows request, console shows parameters

### Outcome B: No Callback At All

- ⚠️ **Expected with pre-selected assets**
- Robinhood already has the wallet address, no need to call back
- **Next step:** Consider the transfer "complete" when Robinhood tab closes
- **Evidence:** ngrok shows no requests after transfer

### Outcome C: Callback to Different URL

- ⚠️ Robinhood might be using a different redirect mechanism
- Check if Robinhood shows a success page with "Return to App" button
- **Evidence:** Manual redirect instead of automatic

---

## Next Steps Based on Findings

### If We Get Callback with Parameters:

1. Document exact parameters Robinhood sends
2. Update callback page to handle those parameters
3. Test with multiple assets to verify consistency
4. Proceed with Sub-Plan 5 comprehensive testing

### If We Get NO Callback:

1. **Option A: User manually returns to app**

   - Add "Return to Dashboard" button/link in Robinhood flow
   - Use localStorage to show "Transfer in Progress" status
   - Poll for transfer completion

2. **Option B: Webhook/Server-side notification**

   - Check Robinhood API for webhook capabilities
   - Implement server-side transfer status polling
   - Notify user via dashboard update

3. **Option C: Accept the limitation**
   - Document that callback doesn't occur with pre-selected assets
   - Show success message: "Your transfer is being processed"
   - User can check their Coinbase Prime account for confirmation

---

## Files Modified

### Created

- `.cursor/plans/robinhood-asset-preselection/implementation-logs/20251022-2035-CALLBACK-DEBUGGING.md` (this file)

### Modified

- `robinhood-offramp/app/callback/page.tsx`

  - Added comprehensive query parameter logging
  - Added localStorage recovery logic
  - Added support for new-style callback params

- `robinhood-offramp/app/dashboard/page.tsx`
  - Added localStorage storage before redirect
  - Store asset, network, and connectId

---

## Questions to Answer

1. ✅ Does the transfer complete successfully? **YES - funds hit Coinbase Prime**
2. ❓ Does Robinhood redirect back to our callback URL?
3. ❓ If yes, what query parameters does Robinhood send?
4. ❓ If no, is there an alternative notification mechanism?
5. ❓ How does Daffy handle this with their implementation?

---

## References

- **Daffy URL Format**: Uses same style, pre-provides wallet address
- **Robinhood Connect Docs**: Check for callback documentation
- **Sub-Plan 5**: Full callback verification testing plan
- **ngrok Inspector**: http://127.0.0.1:4040/inspect/http

---

**Status**: Ready for Testing
**Next**: Complete a test transfer and document findings
