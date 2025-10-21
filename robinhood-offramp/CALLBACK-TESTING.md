# Callback Page Testing Guide

This guide explains how to test the callback handling functionality once you have your Robinhood API keys configured.

---

## Prerequisites

1. **Robinhood API Keys**: Set up in `.env.local`

   ```bash
   ROBINHOOD_APP_ID=your-app-id
   ROBINHOOD_API_KEY=your-api-key
   NEXTAUTH_URL=http://localhost:3030
   ```

2. **Development Server Running**:
   ```bash
   npm run dev
   ```

---

## Testing Approach

Since the callback page requires URL parameters from Robinhood, there are two ways to test:

### Option 1: Manual URL Testing (Quick Test)

Test the callback page by manually constructing a URL with parameters:

```
http://localhost:3030/callback?assetCode=ETH&assetAmount=0.05&network=ETHEREUM
```

**What to expect:**

- ✅ Loading state appears briefly
- ⚠️ Error: "Missing reference ID" (expected, since no referenceId in localStorage)

**Testing parameter validation:**

Valid parameters:

```
http://localhost:3030/callback?assetCode=USDC&assetAmount=100&network=POLYGON
```

Missing parameters:

```
http://localhost:3030/callback?assetCode=ETH
# Should show: "Invalid callback parameters"
```

Invalid formats:

```
http://localhost:3030/callback?assetCode=eth&assetAmount=0.05&network=ETHEREUM
# Should show: "Invalid callback parameters" (lowercase assetCode)
```

```
http://localhost:3030/callback?assetCode=ETH&assetAmount=-10&network=ETHEREUM
# Should show: "Invalid callback parameters" (negative amount)
```

### Option 2: End-to-End Flow (Complete Test)

**Step 1: Generate Offramp URL**

Call the URL generation API:

```bash
curl -X POST http://localhost:3030/api/robinhood/generate-offramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "supportedNetworks": ["ETHEREUM"],
    "assetCode": "ETH",
    "assetAmount": "0.05"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://applink.robinhood.com/u/connect?...",
    "referenceId": "550e8400-e29b-41d4-a716-446655440000",
    "params": { ... }
  }
}
```

**Step 2: Store ReferenceId**

Open browser console on `http://localhost:3030` and manually store the referenceId:

```javascript
localStorage.setItem('robinhood_reference_id', '550e8400-e29b-41d4-a716-446655440000')
```

**Step 3: Navigate to Callback URL**

Visit the callback URL with the same parameters:

```
http://localhost:3030/callback?assetCode=ETH&assetAmount=0.05&network=ETHEREUM
```

**What to expect:**

- ✅ Loading state appears
- ⚠️ API call to Robinhood with the referenceId
- ⚠️ Error: "ReferenceId not found or expired" (expected, as this referenceId wasn't created through actual Robinhood flow)

---

## Testing Checklist

### Parameter Validation Tests

- [ ] **Valid parameters**: Should attempt redemption

  ```
  /callback?assetCode=ETH&assetAmount=0.05&network=ETHEREUM
  ```

- [ ] **Missing assetCode**: Should show "Invalid callback parameters"

  ```
  /callback?assetAmount=0.05&network=ETHEREUM
  ```

- [ ] **Missing assetAmount**: Should show "Invalid callback parameters"

  ```
  /callback?assetCode=ETH&network=ETHEREUM
  ```

- [ ] **Missing network**: Should show "Invalid callback parameters"

  ```
  /callback?assetCode=ETH&assetAmount=0.05
  ```

- [ ] **Invalid assetCode format** (lowercase): Should show "Invalid callback parameters"

  ```
  /callback?assetCode=eth&assetAmount=0.05&network=ETHEREUM
  ```

- [ ] **Invalid assetCode format** (too long): Should show "Invalid callback parameters"

  ```
  /callback?assetCode=ETHEREUMCOIN&assetAmount=0.05&network=ETHEREUM
  ```

- [ ] **Invalid assetAmount** (negative): Should show "Invalid callback parameters"

  ```
  /callback?assetCode=ETH&assetAmount=-0.05&network=ETHEREUM
  ```

- [ ] **Invalid assetAmount** (zero): Should show "Invalid callback parameters"

  ```
  /callback?assetCode=ETH&assetAmount=0&network=ETHEREUM
  ```

- [ ] **Invalid assetAmount** (non-numeric): Should show "Invalid callback parameters"

  ```
  /callback?assetCode=ETH&assetAmount=abc&network=ETHEREUM
  ```

- [ ] **Invalid network format** (lowercase): Should show "Invalid callback parameters"
  ```
  /callback?assetCode=ETH&assetAmount=0.05&network=ethereum
  ```

### LocalStorage Tests

- [ ] **No referenceId in localStorage**: Should show "Missing reference ID"
- [ ] **Valid referenceId in localStorage**: Should attempt API redemption
- [ ] **ReferenceId cleaned up after success**: localStorage should be empty after successful redemption

### UI State Tests

- [ ] **Loading state**: Displays spinner and "Processing your transfer..."
- [ ] **Error state**: Shows error icon, error message, and action buttons
- [ ] **Success state**: Shows deposit address, transfer summary, and copy button

### Copy Functionality Tests

- [ ] **Copy address button**: Copies address to clipboard and shows toast
- [ ] **Copy memo/tag button** (if present): Copies memo to clipboard

### Navigation Tests

- [ ] **"Return to Dashboard" button** (error state): Navigates to /dashboard
- [ ] **"Try Again" button** (error state): Reloads the page
- [ ] **"Back to Dashboard" button** (success state): Navigates to /dashboard
- [ ] **"View Dashboard" button** (success state): Navigates to /dashboard

### Blockchain Explorer Tests

- [ ] **Explorer link for Ethereum**: Opens Etherscan in new tab
- [ ] **Explorer link for Polygon**: Opens Polygonscan in new tab
- [ ] **Explorer link for Solana**: Opens Solscan in new tab
- [ ] **No explorer link for unsupported network**: Link not shown

---

## Common Test Scenarios

### Scenario 1: Happy Path (Will work with real Robinhood flow)

1. User generates offramp URL via API
2. ReferenceId stored in localStorage
3. User completes flow in Robinhood
4. Robinhood redirects to callback URL
5. Callback page redeems deposit address
6. User sees deposit address with instructions

### Scenario 2: Missing Parameters

1. Navigate to `/callback` (no parameters)
2. Should show: "Invalid callback parameters"
3. User can click "Return to Dashboard"

### Scenario 3: Missing ReferenceId

1. Navigate to `/callback?assetCode=ETH&assetAmount=0.05&network=ETHEREUM`
2. No referenceId in localStorage
3. Should show: "Missing reference ID. Please start the transfer process again."

### Scenario 4: Invalid ReferenceId

1. Store invalid referenceId: `localStorage.setItem('robinhood_reference_id', 'invalid')`
2. Navigate to callback with valid parameters
3. Should show API error from redemption endpoint

---

## Visual Testing

### Loading State

- Centered card with spinner
- "Processing your transfer..." heading
- Brief description text
- Emerald green spinner animation

### Error State

- Red alert icon
- "Transfer Error" title
- Clear error message in red alert box
- Two action buttons (Return to Dashboard, Try Again)

### Success State

- Green checkmark icon
- "Transfer Ready!" title
- Transfer Summary section with 4 fields (Asset, Amount, Network, Status)
- Deposit Address section with copy button
- Memo/Tag section (if applicable)
- Important Instructions alert
- Two action buttons (View Dashboard, Copy Address)

---

## Mobile Testing

Test responsiveness on mobile devices:

- [ ] Layout adapts to mobile viewport
- [ ] Touch targets are appropriately sized
- [ ] Copy button works on mobile browsers
- [ ] Navigation buttons are easily tappable
- [ ] Long addresses wrap properly
- [ ] Text is readable without zooming

---

## Browser Compatibility

Test in multiple browsers:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Real Robinhood Flow Testing

Once you have valid Robinhood API keys and want to test the complete flow:

1. **Generate Real Offramp URL**: Use the API to generate a URL
2. **Open Robinhood**: Click the generated URL (will open Robinhood app or web)
3. **Complete Flow**: Select asset, amount, and confirm in Robinhood
4. **Verify Callback**: Robinhood should redirect back with parameters
5. **Check Address**: Deposit address should be displayed correctly
6. **Verify Redemption**: ReferenceId should work with Robinhood API

**Expected result**: Complete successful flow with real deposit address from Robinhood.

---

## Debugging Tips

### Console Logs

The callback page logs useful debugging information:

```javascript
console.log('Callback params:', callbackParams)
console.log('ReferenceId from storage:', referenceId)
console.error('Callback processing failed:', error)
```

### Network Tab

Check the Network tab in DevTools:

1. **API call to `/api/robinhood/redeem-deposit-address`**
   - Should be POST request
   - Request body should contain referenceId
   - Check response status and data

2. **Error responses**
   - 400: Invalid request (check referenceId format)
   - 404: ReferenceId not found
   - 500: Server error

### LocalStorage Inspection

Check localStorage in DevTools → Application → Local Storage:

```javascript
// Get stored referenceId
localStorage.getItem('robinhood_reference_id')

// Manually set for testing
localStorage.setItem('robinhood_reference_id', 'your-uuid-here')

// Clear for fresh test
localStorage.removeItem('robinhood_reference_id')
```

---

## Next Steps

After testing the callback page:

1. **Proceed to Sub-Plan 5**: Implement order status tracking
2. **Proceed to Sub-Plan 6**: Create dashboard UI with offramp modal
3. **End-to-End Testing**: Test complete flow with real Robinhood keys

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify environment variables are set
3. Check that development server is running
4. Review IMPLEMENTATION-LOG.md for known issues
5. Refer to sub-plan-4-callback-handling.md for detailed implementation notes
