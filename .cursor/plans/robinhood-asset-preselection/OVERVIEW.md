# Robinhood Connect Asset Pre-Selection Migration - Overview

**Project**: Transition from multi-asset balance-first flow to Daffy-style pre-selection
**Status**: Planning Phase
**Created**: October 22, 2025
**Owner**: Endaoment Engineering Team

---

## Project Context

### Brief Description

Refactor the Robinhood Connect integration to require users to **pre-select** which cryptocurrency asset they want to donate before authenticating with Robinhood. This change is necessary because testing revealed that Robinhood Connect does not support the "balance-first" flow for external wallet transfers.

### Goals

1. **Implement working transfer flow** using proven Daffy-style URL pattern
2. **Eliminate "Invalid URL" and "Sell" errors** in Robinhood Connect
3. **Maintain excellent user experience** despite adding selection step
4. **Support all 27+ crypto assets** with individual testing
5. **Create maintainable, scalable architecture** for future asset additions

### Gold Standard Reference

**Daffy.org** crypto donation flow serves as our reference implementation:

- Users select asset type BEFORE connecting wallet
- Clean, simple UX with clear asset cards
- Successful transfer completion every time
- Proven pattern that works with Robinhood Connect

---

## Current State Snapshot

### Current Architecture (Before Migration)

**User Flow**:

```
User visits dashboard
    ↓
Clicks "Give with Robinhood"
    ↓
Generates multi-network URL (no asset pre-selection)
    ↓
Robinhood Connect opens
    ↓
❌ FAILS: Redirects to /connect/asset
    ↓
After selecting asset → Shows "Sell" instead of "Transfer"
```

**Key Files**:

1. **`robinhood-offramp/app/dashboard/page.tsx`** (lines 1-150)

   - Single "Give with Robinhood" button
   - Calls `buildMultiNetworkOfframpUrl()`
   - No asset selection UI

2. **`robinhood-offramp/lib/robinhood-url-builder.ts`** (lines 310-314)

   - `buildMultiNetworkOfframpUrl()` - current approach
   - Passes all networks but no specific asset
   - Attempts balance-first flow

3. **`robinhood-offramp/lib/robinhood-asset-addresses.ts`** (lines 23-296)

   - 32 assets with wallet addresses
   - 27 assets on supported networks
   - Complete and ready to use

4. **`robinhood-offramp/app/api/robinhood/redeem-deposit-address/route.ts`**
   - Server endpoint for wallet address redemption
   - Returns correct address based on asset
   - ✅ Already working correctly

### Current Problems

1. **❌ Invalid URL Errors**: Multi-network URLs without asset fail
2. **❌ Wrong Flow**: Redirects to "Sell" instead of "Transfer"
3. **❌ User Frustration**: Cannot complete donation
4. **❌ Unclear Requirements**: Robinhood documentation doesn't explain limitation

---

## Architecture Comparison

### Current (Non-Working) Flow

```typescript
// Dashboard generates URL without asset
buildMultiNetworkOfframpUrl([
  'AVALANCHE', 'BITCOIN', 'ETHEREUM', ...
])

// URL Parameters:
{
  offRamp: true,
  supportedNetworks: 'AVALANCHE,BITCOIN,...',
  redirectUrl: 'https://.../callback',
  referenceId: 'uuid'
  // ❌ NO: supportedAssets
  // ❌ NO: walletAddress
}

// Result: Invalid or wrong flow
```

### Target (Working) Flow

```typescript
// User selects ETH first
const selectedAsset = 'ETH'
const selectedNetwork = 'ETHEREUM'
const walletAddress = '0xa22d566f52b303049d27a7169ed17a925b3fdb5e'

// Dashboard generates Daffy-style URL
buildDaffyStyleOfframpUrl({
  asset: selectedAsset,
  network: selectedNetwork,
  walletAddress: walletAddress
})

// URL Parameters:
{
  applicationId: '...',
  walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
  supportedAssets: 'ETH',
  supportedNetworks: 'ETHEREUM',
  connectId: 'uuid',
  paymentMethod: 'crypto_balance',
  redirectUrl: 'https://.../callback'
  // ✅ Asset pre-selected
  // ✅ Wallet address provided
}

// Result: ✅ "Transfer ETH" flow works perfectly
```

---

## Migration Strategy Overview

### High-Level Phases

**Phase 1: Foundation** (Sub-Plans 1-2)

- Create asset metadata structure
- Build reusable UI components
- No user-facing changes yet

**Phase 2: Integration** (Sub-Plans 3-4)

- Update dashboard with asset selector
- Refactor URL generation to Daffy-style
- Feature flag for gradual rollout

**Phase 3: Verification** (Sub-Plan 5)

- Test all 27+ assets individually
- Verify callback flow works
- Fix any edge cases

**Phase 4: Documentation & Release** (Sub-Plan 6)

- Comprehensive testing documentation
- Update user guides
- Production deployment

### Implementation Order

```
Sub-Plan 0: Drafting Plan (COMPLETE)
    ↓
Sub-Plan 1: Asset Metadata & Configuration
    ↓
Sub-Plan 2: Asset Selection UI Component
    ↓
Sub-Plan 3: Dashboard Integration
    ↓
Sub-Plan 4: URL Builder Refactor
    ↓
Sub-Plan 5: Callback Flow Verification
    ↓
Sub-Plan 6: Testing & Documentation
```

---

## Testing Evidence

### Comprehensive URL Testing (October 22, 2025)

**31 URL Variations Tested**:

- 15 scenarios: General parameter combinations
- 16 scenarios: Daffy-style with pre-selection
- 10 scenarios: Transfer flow without pre-selection

**Results**:

✅ **WORKING URLs** (Daffy-style with pre-selection):

```
https://applink.robinhood.com/u/connect?
  applicationId=db2c834a-a740-4dfc-bbaf-06887558185f
  &walletAddress=0xa22d566f52b303049d27a7169ed17a925b3fdb5e
  &supportedAssets=ETH
  &supportedNetworks=ETHEREUM
  &connectId=<uuid>
  &paymentMethod=crypto_balance
  &redirectUrl=https://.../callback
```

- Shows "Transfer ETH" header ✅
- Completes successfully ✅
- No "Sell" option ✅

❌ **FAILING URLs** (Without pre-selection):

```
https://applink.robinhood.com/u/connect?
  applicationId=db2c834a-a740-4dfc-bbaf-06887558185f
  &offRamp=true
  &flow=transfer
  &paymentMethod=crypto_balance
  &supportedNetworks=AVALANCHE,BITCOIN,...
  &redirectUrl=https://.../callback
```

- Redirects to `/connect/asset` ❌
- After selection → Shows "Sell" ❌
- Wrong flow entirely ❌

**Conclusion**: Pre-selection is mandatory for external wallet transfers.

---

## Risk Assessment

### 🔴 HIGH RISK AREAS

**1. Breaking Existing Functionality**

- **Risk**: Changes break current (non-working) flow
- **Impact**: Complete loss of Robinhood donation capability
- **Mitigation**:
  - Feature flag implementation
  - Staging environment testing
  - Rollback plan ready
  - Keep old code for reference

**2. Incomplete Asset Testing**

- **Risk**: Some assets don't work despite appearing to
- **Impact**: User frustration, failed donations
- **Mitigation**:
  - Test EVERY asset individually (27+)
  - Disable assets that fail
  - Monitor for new Robinhood assets
  - Regular validation checks

### 🟡 MEDIUM RISK AREAS

**3. Poor Asset Selection UX**

- **Risk**: Too many options overwhelm users
- **Impact**: Increased abandonment rate
- **Mitigation**:
  - Clean, organized UI design
  - Search and filter capabilities
  - Show popular assets first
  - Clear descriptions

**4. State Management Complexity**

- **Risk**: Asset selection state not properly managed
- **Impact**: Wrong asset selected, URL generation errors
- **Mitigation**:
  - Simple, clear state structure
  - Type-safe TypeScript
  - Validation before URL generation

### 🟢 LOW RISK AREAS

**5. Icon Loading**

- **Risk**: Asset icons fail to load
- **Impact**: Visual degradation but still functional
- **Mitigation**: Text fallbacks, local hosting

**6. Mobile Responsiveness**

- **Risk**: UI issues on small screens
- **Impact**: Poor mobile experience
- **Mitigation**: Mobile-first design, real device testing

---

## Rollback Procedure

### Emergency Rollback (< 5 minutes)

**If critical issues in production**:

```bash
# 1. Disable feature flag
# In .env.local or environment variables
ENABLE_ASSET_PRESELECTION=false

# 2. Restart application
npm run build
npm run start

# 3. Verify old flow restored
```

**Rollback Indicators**:

- Transfer failure rate > 10%
- Widespread "Invalid URL" errors
- User complaints spike
- Callback endpoint errors

### Standard Rollback (30 minutes)

**If issues discovered in staging**:

1. **Revert Code Changes**:

   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Restore Dashboard**:

   - Revert to single "Give with Robinhood" button
   - Restore `buildMultiNetworkOfframpUrl()` calls

3. **Cleanup**:

   - Remove asset selector component calls
   - Clear any cached state
   - Update documentation

4. **Investigate**:
   - Review logs for root cause
   - Fix in development branch
   - Re-test before re-deployment

---

## Success Metrics

### Technical Success Criteria

- ✅ 100% of 27+ assets generate valid Daffy-style URLs
- ✅ 0% callback endpoint errors
- ✅ All TypeScript compilation succeeds with no errors
- ✅ Asset list renders in < 500ms
- ✅ URL generation in < 100ms

### Operational Success Criteria

- ✅ Transfer completion rate > 90%
- ✅ Average flow completion time < 3 minutes
- ✅ "Invalid URL" error rate = 0%
- ✅ "Sell" flow appearance rate = 0%
- ✅ User abandonment rate < 20%

### Quality Success Criteria

- ✅ Code test coverage > 80%
- ✅ Accessibility audit score > 95
- ✅ Mobile responsiveness verified on 3+ devices
- ✅ Load time < 2 seconds on 3G connection
- ✅ Zero critical linter errors

---

## Architecture Decisions

### Decision Record

#### ADR-1: Require Asset Pre-Selection

**Date**: October 22, 2025
**Status**: Accepted

**Context**:

- Tested 31 URL variations
- Robinhood stated Connect is for "funding accounts"
- Balance-first flow doesn't work for external wallets

**Decision**: Implement Daffy-style pre-selection flow

**Consequences**:

- ✅ Reliable, proven solution
- ✅ Works with Robinhood Connect as designed
- ❌ Adds one extra user step
- ❌ Cannot show balances before selection

#### ADR-2: Component-Based UI Architecture

**Date**: October 22, 2025
**Status**: Accepted

**Context**: Need maintainable, reusable asset selection UI

**Decision**: Create standalone asset selector component

**Consequences**:

- ✅ Reusable across application
- ✅ Easier to test and maintain
- ✅ Consistent design patterns
- ✅ Future flexibility

#### ADR-3: Use shadcn/ui Components

**Date**: October 22, 2025
**Status**: Accepted

**Context**: Need UI component library for selector

**Decision**: Leverage existing shadcn/ui installation

**Consequences**:

- ✅ Already in project
- ✅ Consistent design system
- ✅ Accessibility built-in
- ✅ No new dependencies

---

## Notes for Implementers

### Critical Checkpoints

**Before ANY Code Changes**:

- [ ] Read entire sub-plan-0
- [ ] Review all testing documentation
- [ ] Understand current dashboard flow
- [ ] Study working Daffy-style URL format

**Before Dashboard Changes**:

- [ ] Asset metadata complete
- [ ] UI components built and tested
- [ ] State management decided
- [ ] Design approved

**Before Production Deploy**:

- [ ] ALL 27+ assets tested individually
- [ ] Feature flag implemented
- [ ] Rollback plan tested
- [ ] Documentation updated
- [ ] Monitoring configured

### Common Pitfalls

❌ **Pitfall**: Deleting old URL generation code immediately
✅ **Solution**: Keep it commented for reference and rollback

❌ **Pitfall**: Testing only popular assets (ETH, BTC)
✅ **Solution**: Test EVERY asset, including meme coins and stablecoins

❌ **Pitfall**: Hard-coding asset data in multiple places
✅ **Solution**: Single source of truth in metadata file

❌ **Pitfall**: Ignoring mobile users
✅ **Solution**: Test on real mobile devices early

❌ **Pitfall**: Deploying without feature flag
✅ **Solution**: Always use feature flag for gradual rollout

---

## Key Resources

### Documentation

- **Testing Results**: `URL-TESTING-TRACKER.md`
- **Working URLs**: `robinhood-offramp/daffy_style_url_test_results.json`
- **Test Scripts**: `robinhood-offramp/scripts/test_*_urls.py`
- **Email Thread**: Robinhood correspondence (saved in docs)

### Code References

- **Dashboard**: `robinhood-offramp/app/dashboard/page.tsx`
- **URL Builder**: `robinhood-offramp/lib/robinhood-url-builder.ts`
- **Asset Addresses**: `robinhood-offramp/lib/robinhood-asset-addresses.ts`
- **Callback**: `robinhood-offramp/app/api/robinhood/redeem-deposit-address/route.ts`

### External References

- Robinhood Connect Documentation (official)
- Daffy.org (reference implementation)
- shadcn/ui Components (UI library)
- Cryptocurrency Icons (asset icons)

---

## Project Timeline

**Estimated Duration**: 2-3 days of focused development

**Breakdown**:

- Sub-Plan 1: 2-3 hours
- Sub-Plan 2: 4-6 hours
- Sub-Plan 3: 3-4 hours
- Sub-Plan 4: 2-3 hours
- Sub-Plan 5: 4-6 hours
- Sub-Plan 6: 2-3 hours

**Total**: 17-25 hours

**Recommended Schedule**:

- Day 1: Sub-Plans 1-2 (foundation)
- Day 2: Sub-Plans 3-4 (integration)
- Day 3: Sub-Plans 5-6 (verification + docs)

---

## Stakeholder Communication

### Key Messages

**For Users**:

- "We're improving the crypto donation flow"
- "You'll now select which crypto to donate before connecting"
- "This ensures a smoother, more reliable experience"

**For Team**:

- "Robinhood Connect requires asset pre-selection for external transfers"
- "We tested 31 URL variations to confirm this"
- "Daffy-style flow is proven to work"

**For Leadership**:

- "This change makes donations work reliably"
- "One extra user step but much higher success rate"
- "Low risk with feature flag and rollback plan"

---

**Last Updated**: October 22, 2025
**Next Review**: After Sub-Plan 0 approval
