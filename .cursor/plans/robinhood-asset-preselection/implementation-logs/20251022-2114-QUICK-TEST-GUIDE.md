# Quick Callback Testing Guide

**Goal**: Figure out if/how Robinhood redirects back after a transfer with pre-selected assets

---

## What We Changed

1. **Added logging** to see ALL query parameters sent to callback page
2. **Added localStorage** to preserve asset info across the redirect
3. **Added support** for multiple callback parameter formats

---

## How to Test

### Setup (5 minutes)

```bash
# Terminal 1: Start ngrok
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok-free.dev)

# Terminal 2: Update .env.local
cd robinhood-offramp
# Update NEXT_PUBLIC_CALLBACK_URL to: https://abc123.ngrok-free.dev/callback

# Restart dev server
npm run dev
```

### Test Flow (10 minutes)

1. **Open Dashboard**

   - Visit: http://localhost:3000/dashboard
   - Select an asset (try ETH first)

2. **Initiate Transfer**

   - Click "Continue to Robinhood"
   - Check console for: `[Storage] Saving transfer info to localStorage for callback`
   - This confirms asset info is being stored

3. **Complete Transfer in Robinhood**

   - Complete the transfer flow
   - **Watch carefully**: Does Robinhood redirect your browser back?

4. **Check Console Logs**

   - If you're redirected, browser console should show:
     ```
     🔍 [CALLBACK] Received query parameters:
       <list of all parameters>
     ```
   - This tells us exactly what Robinhood sends!

5. **Check ngrok Inspector**
   - Visit: http://127.0.0.1:4040/inspect/http
   - Look for any requests to `/callback`
   - This confirms if Robinhood contacted our server

---

## What to Look For

### ✅ Success Indicators:

1. **Console shows callback parameters** → We know what Robinhood sends
2. **ngrok shows incoming request** → Robinhood did redirect
3. **Callback page displays correctly** → localStorage recovery worked
4. **You see the transferred asset info** → Full flow working

### ⚠️ Findings to Document:

1. **No console logs** → Robinhood might not redirect with pre-selected assets
2. **No ngrok requests** → Callback not being triggered
3. **Browser stays on Robinhood** → Manual return required
4. **Generic success page** → Robinhood handles completion differently

---

## Report Your Findings

After testing, please report:

1. **Did Robinhood redirect you back?** (Yes/No)

2. **If YES, what query parameters were sent?**

   - Copy the full console output showing parameters

3. **Did ngrok show any requests?** (Yes/No)

   - If yes, screenshot the request details

4. **Did the callback page show correctly?** (Yes/No)
   - Did it display the asset you transferred?

---

## Quick Debug Commands

**Check what's in localStorage:**

```javascript
// Run in browser console
console.log("Asset:", localStorage.getItem("robinhood_selected_asset"));
console.log("Network:", localStorage.getItem("robinhood_selected_network"));
console.log("ConnectId:", localStorage.getItem("robinhood_connect_id"));
```

**Manually test callback page:**

```
# Visit this URL to test callback with old-style params:
http://localhost:3000/callback?assetCode=ETH&assetAmount=0.1&network=ETHEREUM

# Or test with connectId:
http://localhost:3000/callback?connectId=test-123
```

---

## Expected Results

Based on Daffy's implementation and our analysis:

**Most Likely:** Robinhood DOES redirect but with minimal parameters (just `connectId`)

- Our localStorage recovery will handle this
- Callback page will show success with reconstructed asset info

**Possible:** Robinhood doesn't redirect at all with pre-selected assets

- Transfer still completes (you confirmed funds arrived!)
- We'll need to implement a different completion flow

---

**Ready to test!** Start ngrok, update the env var, restart the server, and try a transfer. 🚀
