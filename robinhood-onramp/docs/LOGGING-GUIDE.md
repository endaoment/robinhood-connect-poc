# Enhanced Logging Guide

## Overview

The application now features comprehensive, structured logging throughout every step of the Robinhood Connect integration. All logs use emoji icons and clear labels to make them easy to identify and follow.

## Logging Conventions

### Log Levels

- ✅ `[SUCCESS]` - Operation completed successfully
- ❌ `[ERROR]` - Operation failed
- ✓ `[VALIDATION]` - Validation step passed
- 📥 `[REQUEST]` - Incoming request received
- 📤 `[HTTP]` - Outgoing HTTP request
- 🔑 `[AUTH]` - Authentication information
- ⏱️ `[TIMING]` - Performance timing information
- 🌐 `[ROBINHOOD-API]` - Robinhood API interaction
- 🔨 `[BUILD-URL]` - URL building process
- 🏗️ `[BUILD-URL]` - URL generation details
- 💎 `[REDEEM-DEPOSIT-ADDRESS]` - Deposit address redemption
- 📊 `[ORDER-STATUS]` - Order status checking
- 🎯 `[CLIENT]` - Client-side browser logs

### Log Format

All server logs follow this structure:

```
================================================================================
🚀 [ENDPOINT-NAME] Starting request
================================================================================
📥 [REQUEST] Received body: { ... }
✓ [VALIDATION] Check passed
...
⏱️  [TIMING] Request completed in XXms
================================================================================
```

## Enhanced Components

### 1. Client-Side (Dashboard)

**File:** `app/(routes)/dashboard/page.tsx`

**What's logged:**

- User button clicks
- Request preparation (networks, counts)
- API call timing
- Response status and data
- URL opening
- Total flow duration
- Errors with context

**Example output:**

```
================================================================================
🎯 [CLIENT] User clicked "Give with Robinhood"
================================================================================
📊 [CLIENT] Preparing request:
   Networks: ethereum, base, arbitrum, polygon, optimism, solana, bitcoin
   Networks count: 7

📤 [CLIENT] Calling API: /api/robinhood/generate-offramp-url
📥 [CLIENT] API response received in 23ms
   Status: 200 OK
✅ [CLIENT] URL generated successfully
   📋 Reference ID: 12345678-1234-4234-8234-123456789abc
   🔗 URL: https://applink.robinhood.com/u/connect?...

🌐 [CLIENT] Opening Robinhood Connect in new tab...

✅ [CLIENT] Flow completed successfully in 45ms
================================================================================
```

### 2. Generate Offramp URL API

**File:** `app/api/robinhood/generate-offramp-url/route.ts`

**What's logged:**

- Request body validation
- Network count and list
- Asset code validation (if provided)
- URL generation process
- Generated reference ID
- Final URL (truncated)
- Request timing

**Example output:**

```
================================================================================
🚀 [GENERATE-OFFRAMP-URL] Starting request
================================================================================
📥 [REQUEST] Received body:
{
  "supportedNetworks": ["ethereum", "base", "arbitrum"],
  "assetCode": "none",
  "assetAmount": "none",
  "fiatAmount": "none"
}
✓ [VALIDATION] Networks count: 3
✓ [VALIDATION] All networks valid: ethereum, base, arbitrum
🔨 [BUILD-URL] Generating Robinhood offramp URL...
✅ [BUILD-URL] URL generated successfully
   📋 Reference ID: 12345678-1234-4234-8234-123456789abc
   🔗 URL: https://applink.robinhood.com/u/connect?applicationId=...
   ⚙️  Params: {"applicationId":"...","offRamp":true,...}

⏱️  [TIMING] Request completed in 15ms
================================================================================
```

### 3. URL Builder

**File:** `lib/robinhood-url-builder.ts`

**What's logged:**

- Input parameters
- Environment variable validation
- Network validation
- Asset code/amount validation
- Reference ID generation
- Redirect URL
- URL parameters
- Final generated URL
- Reference ID storage

**Example output:**

```
  🏗️  [BUILD-URL] Starting URL generation
     Input params: { supportedNetworks: [...], ... }
  ✓ [VALIDATION] App ID present: db2c834a-a...
  ✓ [VALIDATION] Networks provided: 7
  ✓ [VALIDATION] All networks valid: ethereum, base, arbitrum, polygon, optimism, solana, bitcoin
  🆔 [REFERENCE-ID] Generated: 12345678-1234-4234-8234-123456789abc
  ✓ [VALIDATION] Reference ID format valid
  🔄 [REDIRECT] URL: http://localhost:3030/callback
  📋 [URL-PARAMS] Generated parameters:
{
  "applicationId": "db2c834a-a740-4dfc-bbaf-06887558185f",
  "offRamp": true,
  "supportedNetworks": "ethereum,base,arbitrum,polygon,optimism,solana,bitcoin",
  "redirectUrl": "http://localhost:3030/callback",
  "referenceId": "12345678-1234-4234-8234-123456789abc"
}
  🔗 [URL] Final URL generated
     https://applink.robinhood.com/u/connect?applicationId=...
  💾 [STORAGE] Storing reference ID for callback
  ✅ [BUILD-URL] URL generation complete
```

### 4. Redeem Deposit Address API

**File:** `app/api/robinhood/redeem-deposit-address/route.ts`

**What's logged:**

- Reference ID validation
- UUID format validation
- Robinhood API call
- Response details (asset, network, address)
- Address tag/memo (if applicable)
- Amount (if applicable)
- Request timing

**Example output:**

```
================================================================================
💎 [REDEEM-DEPOSIT-ADDRESS] Starting request
================================================================================
📥 [REQUEST] Received body:
   Reference ID: 12345678-1234-4234-8234-123456789abc
✓ [VALIDATION] Reference ID present
✓ [VALIDATION] UUID format valid

🌐 [ROBINHOOD-API] Calling redeem deposit address...
   Reference ID: 12345678-1234-4234-8234-123456789abc
✅ [ROBINHOOD-API] Deposit address redeemed successfully
   Asset: ETH
   Network: ethereum
   Address: 0x1234567890abcdef...
   Amount: 0.1

⏱️  [TIMING] Request completed in 287ms
================================================================================
```

### 5. Robinhood API Client

**File:** `lib/robinhood-api.ts`

**What's logged:**

- Authentication credentials (masked)
- HTTP request method and URL
- Request body
- Response timing
- Response status
- Response body (full JSON)
- Response validation
- Error details with status codes

**Example output:**

```
  🔑 [AUTH] Using credentials:
     API Key: 9S84gTfSBW...
     App ID: db2c834a-a...

  📤 [HTTP] Making POST request to Robinhood API
     URL: https://api.robinhood.com/catpay/v1/redeem_deposit_address/
     Body: { referenceId: "12345678-1234-4234-8234-123456789abc" }

  📥 [HTTP] Response received in 145ms
     Status: 200 OK

  ✅ [HTTP] Success response:
{
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "assetCode": "ETH",
  "networkCode": "ethereum",
  "assetAmount": "0.1"
}
  ✓ [VALIDATION] Response format valid
```

### 6. Order Status API

**File:** `app/api/robinhood/order-status/route.ts`

**What's logged:**

- Query parameters
- Reference ID validation
- Robinhood API call
- Order status details
- Asset and amount information
- Request timing

**Example output:**

```
================================================================================
📊 [ORDER-STATUS] Starting request
================================================================================
📥 [REQUEST] Query params:
   Reference ID: 12345678-1234-4234-8234-123456789abc
✓ [VALIDATION] Reference ID present
✓ [VALIDATION] UUID format valid

🌐 [ROBINHOOD-API] Fetching order status...
   Reference ID: 12345678-1234-4234-8234-123456789abc
✅ [ROBINHOOD-API] Order status retrieved successfully
   Status: completed
   Asset: ETH
   Reference ID: 12345678-1234-4234-8234-123456789abc
   Amount: 0.1

⏱️  [TIMING] Request completed in 156ms
================================================================================
```

## Error Logging

All errors include:

- Error code
- Error message
- HTTP status (if applicable)
- Request duration
- Full stack trace (for server errors)

**Example error output:**

```
❌ [ERROR] Failed to redeem deposit address
   Error Code: INVALID_REFERENCE_ID
   Message: ReferenceId not found or expired
   HTTP Status: 404
⏱️  [TIMING] Request failed after 234ms
================================================================================
```

## Viewing Logs

### Server Logs (Terminal)

All server-side logs appear in your terminal where you run `npm run dev`:

- API route logs
- Robinhood API interactions
- URL generation
- Validation steps
- Timing information

### Client Logs (Browser Console)

Open your browser's Developer Tools (F12) and check the Console tab for:

- User interactions
- API calls from the client
- Response data
- Timing information
- Any client-side errors

## Benefits

1. **Easy Debugging**: Every step is logged with clear labels
2. **Performance Monitoring**: Timing logs show exactly where time is spent
3. **Security**: Credentials are masked but still visible for verification
4. **Error Tracking**: Full context for any failures
5. **Request Tracing**: Follow a request through the entire flow
6. **Production Ready**: Structured logs are easy to aggregate and analyze

## Example: Full Flow Trace

When a user clicks "Give with Robinhood", you'll see logs like this:

**Browser Console:**

```
🎯 [CLIENT] User clicked "Give with Robinhood"
📤 [CLIENT] Calling API: /api/robinhood/generate-offramp-url
📥 [CLIENT] API response received in 23ms
✅ [CLIENT] URL generated successfully
🌐 [CLIENT] Opening Robinhood Connect in new tab...
✅ [CLIENT] Flow completed successfully in 45ms
```

**Terminal (Server):**

```
🚀 [GENERATE-OFFRAMP-URL] Starting request
📥 [REQUEST] Received body: {...}
✓ [VALIDATION] Networks count: 7
🔨 [BUILD-URL] Generating Robinhood offramp URL...
  🏗️  [BUILD-URL] Starting URL generation
  ✓ [VALIDATION] App ID present
  ✓ [VALIDATION] All networks valid
  🆔 [REFERENCE-ID] Generated: abc-123
  ✅ [BUILD-URL] URL generation complete
✅ [BUILD-URL] URL generated successfully
⏱️  [TIMING] Request completed in 18ms
```

## Next Steps

This logging infrastructure makes it easy to:

- Debug issues quickly
- Monitor performance
- Track user flows
- Audit API calls
- Optimize slow operations
- Add more detailed logging where needed

All logs are production-ready and can be easily shipped to log aggregation services like Datadog, CloudWatch, or Splunk.
