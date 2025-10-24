# Robinhood Connect URL Parameter Testing Tracker

**Goal**: Find the URL combination that allows users to see balances BEFORE selecting an asset (no pre-selection required)

**Date**: October 22, 2025

## Testing Instructions

1. Copy each URL from the scenarios below
2. Test in your browser or Robinhood app
3. Mark the result column with your findings
4. Document which scenario works best

## Test Scenarios

### ✅ Priority Tests (Most Likely to Work)

| #      | Scenario Name          | Key Parameters                                                    | Result        | Notes                           |
| ------ | ---------------------- | ----------------------------------------------------------------- | ------------- | ------------------------------- |
| **1**  | Basic Offramp          | `offRamp=true` + networks only                                    | ⬜ Not tested | Simplest - ideal if it works    |
| **6**  | Flow + Payment Method  | `offRamp=true` + `flow=transfer` + `paymentMethod=crypto_balance` | ⬜ Not tested | Most explicit about intent      |
| **7**  | Wallet + Transfer Flow | `walletAddress` + `flow=transfer` + networks                      | ⬜ Not tested | Provides destination explicitly |
| **10** | Email Example Format   | `walletAddress` + `connectId` + `paymentMethod` + single asset    | ⬜ Not tested | Format from your email to Will  |

### 🔬 Experimental Tests

| #      | Scenario Name              | Key Parameters                            | Result        | Notes                      |
| ------ | -------------------------- | ----------------------------------------- | ------------- | -------------------------- |
| **2**  | With Supported Assets List | `supportedAssets=[list]` + networks       | ⬜ Not tested | Explicitly list all assets |
| **3**  | Explicit Transfer Flow     | `flow=transfer` + networks                | ⬜ Not tested | Just flow parameter        |
| **4**  | With Wallet Address        | `walletAddress` + networks                | ⬜ Not tested | Single Ethereum address    |
| **5**  | Payment Method Only        | `paymentMethod=crypto_balance` + networks | ⬜ Not tested | Just payment method        |
| **8**  | Full Combination           | ALL parameters combined                   | ⬜ Not tested | Kitchen sink approach      |
| **9**  | Connect ID Parameter       | `connectId` instead of `referenceId`      | ⬜ Not tested | Parameter name variation   |
| **11** | No OffRamp Flag            | Omit `offRamp` parameter                  | ⬜ Not tested | Maybe it's causing issues? |
| **12** | With Deposit Quote ID      | `depositQuoteId` parameter                | ⬜ Not tested | From your error URL        |
| **13** | Network-Asset Mapping      | JSON mapping of networks→assets           | ⬜ Not tested | Structured data approach   |
| **14** | Action Withdraw            | `action=withdraw` parameter               | ⬜ Not tested | Alternative flow parameter |
| **15** | Minimal Parameters         | Just `applicationId` + `redirectUrl`      | ⬜ Not tested | Minimal viable URL         |

## Result Legend

- ⬜ Not tested
- ✅ Works - allows balance viewing before selection
- ⚠️ Partial - works but requires pre-selection
- ❌ Failed - Invalid URL error
- 🔄 In progress

## Quick Access URLs

Run this command to regenerate fresh URLs:

```bash
cd robinhood-offramp && python3 scripts/test_url_combinations.py
```

View JSON results:

```bash
cat robinhood-offramp/robinhood_url_test_results.json | jq
```

## Expected Flow (If Working)

1. User clicks generated URL
2. Robinhood Connect opens
3. **User sees their balances for all supported assets** ← This is what we want!
4. User selects asset to transfer
5. User enters amount
6. User confirms transfer
7. Robinhood calls `/api/robinhood/redeem-deposit-address` with referenceId
8. Our server returns appropriate wallet address for selected asset
9. Transfer completes to our Coinbase Prime wallet

## Current Issue

When you:

1. Selected ETH
2. Set Amount
3. Selected "Transfer to Robinhood Crypto Balance"
4. Got "Invalid URL"

This suggests the URL parameters aren't properly configured for the transfer flow.

## Key Questions to Answer

1. **Does Robinhood Connect support balance viewing without pre-selection?**

   - If YES: Which URL parameter combination enables it?
   - If NO: We must implement asset pre-selection UI

2. **Is walletAddress required for transfers?**

   - Test scenarios 4, 7, 8, 10 to find out

3. **What's the difference between `referenceId` vs `connectId`?**

   - Compare scenarios with each parameter

4. **Does `offRamp=true` conflict with transfer flow?**
   - Test scenario 11 (no offRamp) vs scenario 1 (with offRamp)

## Robinhood's Expected Response

Based on Will's email, Robinhood Connect is:

> "focused on individuals funding their accounts, not for transfer to external wallets"

This suggests:

- The **deposit address redemption** flow might be the intended path
- We may need to use it differently than documented
- Or they may need to enable "external wallet transfer" mode for our app

## Next Steps After Testing

1. **If a scenario works**: Document it and update our URL builder
2. **If NO scenarios work**: Reply to Robinhood with specific findings and ask:
   - Is external wallet transfer supported without pre-selection?
   - What URL parameters enable "view balances first" flow?
   - Can they provide a working example URL?
3. **If pre-selection is required**: Build asset selection UI in our dashboard

## Testing Notes

**Environment:**

- ngrok URL: `https://unsinfully-microcosmical-pierce.ngrok-free.dev`
- App ID: `db2c834a-a740-4dfc-bbaf-06887558185f`
- Sample wallet: `0xa22d566f52b303049d27a7169ed17a925b3fdb5e` (Ethereum)

**What to Watch For:**

- Does the URL open Robinhood Connect?
- Do you see a balance screen?
- Can you select from multiple assets?
- Does the transfer complete?
- Any error messages?

---

## Results Summary

(Fill this in after testing)

**Working Scenario**: ********\_********

**Parameters Used**:

```
_________________
```

**Notes**:

```
_________________
```
