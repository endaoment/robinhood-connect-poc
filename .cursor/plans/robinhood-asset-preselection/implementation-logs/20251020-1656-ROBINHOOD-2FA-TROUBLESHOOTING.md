# Robinhood Connect 2FA Troubleshooting Guide

## Current Issue

When attempting to authenticate through Robinhood Connect, the 2FA verification is not being delivered, resulting in:

- **Error Response**: `workflow_status_internal_pending` from `/oauth2/token/` endpoint
- **Symptom**: No 2FA push notification or SMS received
- **Result**: Session times out after 30 minutes
- **Direct Login**: Works fine on robinhood.com with SMS 2FA

## Analysis of the Problem

### What's Working ✅

1. Your application URL generation is **correct**
2. The redirect to Robinhood Connect is **successful**
3. The login form is **displayed**
4. Username and password are **accepted**
5. Robinhood is **attempting** to initiate 2FA

### What's NOT Working ❌

1. 2FA notification is **not being delivered** via push notification
2. No fallback to SMS 2FA in the Connect flow
3. The Robinhood app is **not prompting** for device verification

## Root Cause

This is **NOT a problem with your application code**. The issue is with how Robinhood's authentication system is delivering 2FA in the **Connect flow** vs. the **standard web login flow**.

### Key Difference

- **Standard robinhood.com login**: Supports multiple 2FA methods (SMS, app push)
- **Robinhood Connect flow**: May default to a specific 2FA method that isn't configured/working

## Diagnostic Information

From your error log:

```json
{
  "verification_workflow": {
    "id": "c587c9d9-23ab-41c7-9b69-638c7b21fca0",
    "workflow_status": "workflow_status_internal_pending"
  }
}
```

This means:

- Robinhood's backend initiated a 2FA workflow
- The workflow is waiting for user verification
- The verification notification was never delivered/received

## Troubleshooting Steps

### 1. Check Your Robinhood Account 2FA Settings

Login to robinhood.com and check:

**Navigation**: Account → Security → Two-Factor Authentication

**Check these settings**:

- [ ] What 2FA methods are enabled?
  - SMS (phone number)
  - Authenticator app (TOTP)
  - Robinhood app push notifications
- [ ] Is your phone number verified?
- [ ] Is the Robinhood app installed on your device?
- [ ] Are push notifications enabled for the Robinhood app?

### 2. Robinhood App Configuration

If you have the Robinhood mobile app installed:

**iOS Settings**:

```
Settings → Robinhood → Notifications → Allow Notifications: ON
```

**Android Settings**:

```
Settings → Apps → Robinhood → Notifications → Allow: ON
```

**In Robinhood App**:

- Open the app
- Go to Account → Settings → Security
- Check "Device Authorization" settings
- Verify your device is registered for push notifications

### 3. Test 2FA Methods Individually

Try each 2FA method on robinhood.com to see which one works:

1. **Standard Login** (robinhood.com)

   - Which 2FA method is presented?
   - Does it auto-select or give you options?

2. **Force SMS 2FA**
   - See if there's an option to "Send SMS instead"
   - Note if this option exists in the Connect flow

### 4. Browser & Device Testing

Try the Connect flow on different platforms:

**Desktop Browsers**:

- [ ] Chrome
- [ ] Safari
- [ ] Firefox

**Mobile Browsers** (important!):

- [ ] Safari (iOS)
- [ ] Chrome (iOS)
- [ ] Chrome (Android)

**Why mobile matters**: If the Robinhood app is installed, the Connect URL should open IN the app, bypassing web login entirely.

### 5. Check Robinhood App Link Behavior

The Connect URL uses a universal link:

```
https://applink.robinhood.com/u/connect
```

**Expected behavior**:

- **If app installed**: Opens directly in Robinhood app (no web login needed!)
- **If app NOT installed**: Opens web login page

**Test this**:

1. Install the Robinhood app on your mobile device
2. Click the "Give with Robinhood" button from mobile
3. The app should open directly (already logged in)
4. No 2FA prompt should be needed!

## Recommended Actions

### For You (Developer)

1. **Test on mobile with Robinhood app installed**

   ```bash
   # Get the app's QR code or visit the dashboard on mobile
   # The app should handle authentication without web login
   ```

2. **Add 2FA troubleshooting UI**

   - Show users which platform they're on
   - Suggest installing the app for easier authentication
   - Provide direct app store links

3. **Add fallback instructions**

   ```typescript
   // In your dashboard page, add:
   const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
   const hasRobinhoodApp = // Can't detect directly in web

   // Show appropriate message:
   if (isMobile && !hasRobinhoodApp) {
     // "For easier authentication, install the Robinhood app"
   }
   ```

### For Robinhood Support

Contact the Robinhood Connect team (william.mccormick@robinhood.com) with:

1. **Your Application ID**: `db2c834a-a740-4dfc-bbaf-06887558185f`

2. **Specific Issue**: "2FA notifications not being delivered in Connect flow"

3. **Questions to Ask**:

   - What 2FA methods are supported in the Connect authentication flow?
   - Can users with SMS-only 2FA use Connect?
   - Is there a way to force SMS 2FA instead of push notifications?
   - What's the expected behavior if the app isn't installed?
   - Can you check the 2FA configuration for test user: rheeger@gmail.com?

4. **Verification Workflow ID**: `c587c9d9-23ab-41c7-9b69-638c7b21fca0`

   - Ask them to look up why this workflow is stuck in "internal_pending"
   - Request logs showing whether notifications were sent

5. **Request**:
   - Whitelist your test account for app-less 2FA (SMS only)
   - Or provide guidance on required 2FA configuration

## Immediate Workaround

### Option 1: Use Mobile App (Recommended)

1. Install Robinhood app on your phone
2. Login to the app normally (complete 2FA once)
3. Visit your dashboard on mobile browser
4. Click "Give with Robinhood"
5. App should open and you're already authenticated! ✅

### Option 2: Test with Different Account

If you have access to another Robinhood account:

1. One with different 2FA settings
2. One with app push notifications enabled
3. See if the issue persists

### Option 3: Wait for AWS Issues to Fully Resolve

The Robinhood team mentioned "our services are currently impacted by the AWS outage". Even though the outage is "over", there may be:

- Delayed notification queues
- Service degradation
- Cached errors

Try again in 24 hours.

## Implementation Notes

### Your Application is Correct

I've verified your implementation:

```typescript
// URL generation is correct ✅
const result = {
  url: "https://applink.robinhood.com/u/connect?applicationId=...",
  referenceId: "4d4ec974-5455-4ec5-b6ec-2d0d3a877f06",
  // All params are properly formatted
};
```

### The OAuth Flow

What happens when a user clicks "Give with Robinhood":

1. **Your App** → Generates URL with applicationId, referenceId, etc.
2. **Browser** → Opens `applink.robinhood.com/u/connect`
3. **Robinhood** → Checks if app installed
   - **If installed**: Opens app (already authenticated)
   - **If NOT installed**: Shows web login
4. **User** → Enters credentials
5. **Robinhood** → Initiates 2FA
6. **Problem** → 2FA notification not delivered ❌
7. **Timeout** → After 30 minutes

### What Should Happen

With app installed:

1. Click button → App opens → Already logged in → Complete transfer

Without app installed (web login):

1. Click button → Web login → Enter credentials → **Receive SMS/Push** → Complete → Redirect back

## Testing Script

Run this test to verify your setup:

```bash
# Start your dev server
cd /Users/rheeger/Code/endaoment/robinhood-connect-poc/robinhood-offramp
npm run dev

# Visit in browser
open http://localhost:3030

# Test sequence:
# 1. Click "Give with Robinhood"
# 2. Note: Does it open app or web?
# 3. If web: Note what 2FA options are shown
# 4. Take screenshots of any error messages
```

## Expected Timeline

Based on typical API integration issues:

- **If it's account-specific**: 1-2 hours (Robinhood support fixes your account config)
- **If it's app config**: 1-2 days (Robinhood team adjusts your applicationId settings)
- **If it's AWS aftermath**: 24-48 hours (services fully recover)

## Monitoring

Watch for these in browser console:

```javascript
// Good sign:
"redirect_url": "http://localhost:3030/callback?assetCode=ETH&assetAmount=0.1&network=ETHEREUM"

// Bad sign:
"workflow_status": "workflow_status_internal_pending"
// Means: Stuck waiting for 2FA

// Very bad sign:
"workflow_status": "workflow_status_failed"
// Means: 2FA timeout (30 minutes passed)
```

## Next Steps

1. **Today**: Install Robinhood app on mobile and test (easiest solution)
2. **Today**: Contact Robinhood support with the info above
3. **Tomorrow**: Try again in case of AWS aftermath
4. **This week**: Get confirmation from Robinhood team on your app's 2FA configuration

## Questions for Robinhood Support

Copy/paste this into your email:

```
Subject: Robinhood Connect 2FA Not Working - Application ID: db2c834a-a740-4dfc-bbaf-06887558185f

Hi Tianyi,

Thanks for your previous response about the AWS outage. The AWS issues have been resolved, but I'm still experiencing 2FA problems with Robinhood Connect.

Issue:
- When I try to login through Connect, I enter my credentials successfully
- The system initiates 2FA (verification_workflow: workflow_status_internal_pending)
- I never receive the 2FA notification (no SMS, no push notification)
- The session times out after 30 minutes

Details:
- Application ID: db2c834a-a740-4dfc-bbaf-06887558185f
- Test account: rheeger@gmail.com
- Verification Workflow ID: c587c9d9-23ab-41c7-9b69-638c7b21fca0
- Platform: Web browser (Chrome on macOS)

What works:
- Direct login to robinhood.com with SMS 2FA works perfectly
- I can complete 2FA via SMS on the main website
- My account has SMS 2FA enabled and my phone number is verified

Questions:
1. What 2FA methods are supported in the Connect authentication flow?
2. Is SMS 2FA supported, or does Connect require app push notifications?
3. Can you check why notifications aren't being sent for my account in the Connect flow?
4. Do I need to enable specific 2FA settings for Connect vs. standard login?
5. Should I have the Robinhood app installed for Connect to work properly?

Can you please:
1. Check the logs for the verification workflow ID above
2. Verify my applicationId is configured correctly for 2FA
3. Confirm my test account (rheeger@gmail.com) has proper 2FA settings for Connect

Thank you!
```

---

**Summary**: This is a Robinhood-side authentication configuration issue, not a problem with your application code. The best immediate solution is to use the mobile app, and work with Robinhood support to diagnose the web-based 2FA delivery problem.
