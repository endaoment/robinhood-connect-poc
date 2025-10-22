# Sub-Plan 0: Robinhood Connect Asset Pre-Selection Migration - Drafting Plan

**Status**: Ready for Implementation
**Priority**: Critical
**Dependencies**: None (master planning document)
**Estimated Time**: 2-3 hours for planning phase

---

## Context Required

### Current State Analysis

**File**: `robinhood-offramp/app/dashboard/page.tsx`

- Current implementation: Single "Give with Robinhood" button
- Generates multi-network URL without asset pre-selection
- Attempts to let user see balances before choosing asset

**File**: `robinhood-offramp/lib/robinhood-url-builder.ts`

- Lines 159-290: Current `buildOfframpUrl()` function
- Lines 310-314: `buildMultiNetworkOfframpUrl()` - current approach
- Supports optional asset pre-selection but doesn't require it

**File**: `robinhood-offramp/lib/robinhood-asset-addresses.ts`

- Lines 23-89: Complete asset-to-wallet address mapping (32 assets)
- Lines 272-296: `buildAssetAddressMapping()` - ready for use

**File**: `robinhood-offramp/app/api/robinhood/redeem-deposit-address/route.ts`

- Server endpoint that returns wallet addresses based on selected asset
- Currently implemented and working

### Research & Testing Results

**Testing Documentation**:

- `URL-TESTING-TRACKER.md` - Comprehensive URL testing results
- `robinhood-offramp/scripts/test_url_combinations.py` - 15 URL variations tested
- `robinhood-offramp/scripts/test_daffy_style_urls.py` - 16 Daffy-style variations tested
- `robinhood-offramp/scripts/test_transfer_no_preselect.py` - 10 non-preselect variations tested

**Key Findings**:

1. ✅ **Pre-selected asset URLs WORK**:

   - Format: `walletAddress` + `supportedAssets=ETH` + `supportedNetworks=ETHEREUM` + `connectId` + `paymentMethod=crypto_balance`
   - Shows "Transfer ETH" header
   - Completes transfer flow successfully

2. ❌ **Non-preselected URLs FAIL**:

   - Redirect to `/connect/asset`
   - After selecting asset, shows "Sell" instead of "Transfer"
   - Does not support the balance-first flow for external wallet transfers

3. 🔍 **Robinhood Connect Architecture**:
   - Designed for "funding accounts" not "external wallet transfers"
   - Requires asset to be specified in URL for transfer flow
   - The `depositQuoteId` redemption flow requires pre-selection

### Gold Standards

**Reference Implementation**: Daffy.org crypto donation flow

- Users pre-select asset type before authenticating
- URL generated with specific asset + network + destination wallet
- Clean, simple UX: "Select asset → Connect wallet → Transfer"

**User Email to Robinhood** (October 22, 2025):

> "We'd like to do this without the user having to pre-select the asset they're looking to give, by passing supported networks and assets for every supported asset type. This would eliminate a click and allow for the user to select the asset for contribution after seeing their available balance in the Robinhood Connect UI."

**Robinhood Response**:

> "RH Connect is focused on individuals funding their accounts, not for transfer to external wallets."

**Conclusion**: Robinhood Connect does not support balance-first selection for external transfers. Pre-selection is required.

---

## Objectives

### Primary Goals

1. **Implement Asset Pre-Selection UI**

   - Add asset selection interface to dashboard
   - Display all 27+ supported assets with icons/metadata
   - Allow users to choose which crypto to donate

2. **Refactor URL Generation**

   - Transition from multi-network approach to Daffy-style single-asset URLs
   - Generate transfer-specific URLs with pre-selected asset
   - Maintain all working parameters from testing

3. **Enhance User Experience**

   - Create clean, intuitive asset selection interface
   - Show asset metadata (name, symbol, network)
   - Provide visual feedback during selection

4. **Preserve Existing Functionality**

   - Keep callback handling intact
   - Maintain wallet address mapping
   - Preserve ngrok tunnel setup for development

5. **Document Architecture Decision**
   - Record why pre-selection is necessary
   - Capture testing results for future reference
   - Create implementation logs

### Success Criteria

- [ ] User can select from all supported assets before connecting Robinhood
- [ ] URL generation produces working Daffy-style transfer URLs
- [ ] Transfer flow completes successfully with "Transfer [ASSET]" header
- [ ] No "Sell" or liquidation options appear in Robinhood UI
- [ ] Callback endpoint correctly receives asset selection
- [ ] All 27+ assets work with the new flow
- [ ] Code is well-documented and maintainable

---

## Phase Outline

### Sub-Plan 1: Asset Metadata & Configuration

**Goal**: Create comprehensive asset metadata structure

- Asset display names, symbols, descriptions
- Network information for each asset
- Icon/image references
- Categorization (Layer 1, Layer 2, Stablecoins, DeFi, Meme Coins)
- Integration with existing `ROBINHOOD_ASSET_ADDRESSES`

### Sub-Plan 2: Asset Selection UI Component

**Goal**: Build reusable asset selector component

- Visual asset cards/list with icons
- Search/filter functionality
- Network badge display
- Responsive design for mobile/desktop
- Accessibility considerations
- Loading states

### Sub-Plan 3: Dashboard Integration

**Goal**: Update dashboard to use asset selector

- Remove/replace single "Give with Robinhood" button
- Add asset selection step
- Implement state management for selected asset
- Add "Continue with [ASSET]" confirmation
- Handle navigation flow

### Sub-Plan 4: URL Builder Refactor

**Goal**: Update URL generation to use Daffy-style pattern

- Create `buildDaffyStyleOfframpUrl()` function
- Update to require asset parameter
- Use working parameter combination from testing
- Remove multi-network approach
- Add validation for asset/network compatibility

### Sub-Plan 5: Callback Flow Verification

**Goal**: Ensure callback works with pre-selection

- Test with multiple assets (ETH, BTC, SOL, USDC)
- Verify wallet address mapping
- Confirm transfer completion
- Handle edge cases (missing assets, network mismatches)

### Sub-Plan 6: Testing & Documentation

**Goal**: Comprehensive testing and documentation

- Test all 27+ assets
- Document new user flow
- Update README files
- Create troubleshooting guide
- Archive testing scripts and results

---

## Directory Structure

```
robinhood-offramp/
├── app/
│   ├── dashboard/
│   │   └── page.tsx                    # UPDATE: Add asset selection
│   ├── select-asset/
│   │   └── page.tsx                    # NEW: Dedicated asset selection page (optional)
│   └── api/
│       └── robinhood/
│           └── redeem-deposit-address/
│               └── route.ts            # VERIFY: Works with pre-selection
├── components/
│   ├── asset-selector.tsx              # NEW: Asset selection component
│   ├── asset-card.tsx                  # NEW: Individual asset display
│   └── ui/
│       └── ...                         # Existing shadcn/ui components
├── lib/
│   ├── robinhood-asset-metadata.ts     # NEW: Asset display metadata
│   ├── robinhood-url-builder.ts        # UPDATE: Add Daffy-style builder
│   ├── robinhood-asset-addresses.ts    # EXISTING: Keep as-is
│   └── robinhood-api.ts                # VERIFY: Callback handling
├── types/
│   └── robinhood.d.ts                  # UPDATE: Add metadata types
├── public/
│   └── assets/
│       └── crypto-icons/               # NEW: Asset icon images
│           ├── eth.svg
│           ├── btc.svg
│           └── ...
└── docs/
    └── USER_GUIDE.md                   # UPDATE: New flow documentation

.cursor/plans/robinhood-asset-preselection/
├── sub-plans/
│   ├── sub-plan-0-drafting-plan.md     # THIS FILE
│   ├── sub-plan-1-asset-metadata.md
│   ├── sub-plan-2-asset-selector-ui.md
│   ├── sub-plan-3-dashboard-integration.md
│   ├── sub-plan-4-url-builder-refactor.md
│   ├── sub-plan-5-callback-verification.md
│   └── sub-plan-6-testing-documentation.md
├── implementation-logs/
│   └── (timestamped logs will be added during implementation)
├── OVERVIEW.md
└── README.md
```

---

## Dependencies

### External Dependencies

**Already Available**:

- ✅ Next.js 14+ with App Router
- ✅ shadcn/ui component library
- ✅ Tailwind CSS for styling
- ✅ TypeScript for type safety
- ✅ Robinhood Connect API access
- ✅ ngrok tunnel for development

**Need to Add**:

- Asset icon library (cryptocurrency icons)
  - Option 1: cryptocurrency-icons npm package
  - Option 2: Manual SVG collection
  - Option 3: Remote CDN (e.g., CryptoCompare)

### Internal Dependencies

**Completed**:

- ✅ Wallet address mapping (`robinhood-asset-addresses.ts`)
- ✅ Callback endpoint (`/api/robinhood/redeem-deposit-address`)
- ✅ Base URL builder (`robinhood-url-builder.ts`)
- ✅ Comprehensive URL testing (scripts + results)

**Must Complete in Order**:

1. Asset metadata structure (Sub-Plan 1)
2. UI components (Sub-Plan 2)
3. Dashboard integration (Sub-Plan 3)
4. URL generation (Sub-Plan 4)
5. Testing (Sub-Plans 5-6)

### Data Dependencies

**Asset Information Sources**:

- `ROBINHOOD_ASSET_ADDRESSES` - wallet addresses
- `SUPPORTED_NETWORKS` - network list
- `ASSET_NETWORK_MAP` - asset-to-network mapping
- Testing results - working URL parameters

---

## Risk Assessment

### 🔴 CRITICAL RISKS

**Risk**: Breaking existing functionality

- **Impact**: Users cannot complete donations
- **Mitigation**:
  - Feature flag to toggle between old/new flow
  - Deploy to staging first
  - Keep old code commented/archived for rollback
  - Comprehensive testing before production

**Risk**: Incomplete asset coverage

- **Impact**: Some assets don't work, user frustration
- **Mitigation**:
  - Test ALL 27+ assets individually
  - Disable assets that don't work
  - Clear messaging for unsupported assets
  - Monitor Robinhood for new asset additions

### 🟡 MEDIUM RISKS

**Risk**: Poor UX with too many assets

- **Impact**: User overwhelmed, abandons flow
- **Mitigation**:
  - Implement search/filter
  - Categorize assets logically
  - Show popular assets first
  - Add helpful descriptions

**Risk**: Asset metadata becomes stale

- **Impact**: Incorrect info shown to users
- **Mitigation**:
  - Single source of truth for metadata
  - Regular reviews of asset list
  - Version asset metadata
  - Document update process

### 🟢 LOW RISKS

**Risk**: Icon loading failures

- **Impact**: Missing visuals, still functional
- **Mitigation**:
  - Fallback to text symbols
  - Local icon hosting
  - Graceful degradation

**Risk**: Mobile responsiveness issues

- **Impact**: Poor experience on small screens
- **Mitigation**:
  - Mobile-first design
  - Test on real devices
  - Use responsive components

---

## Implementation Strategy

### Phased Rollout

**Phase 1: Foundation** (Sub-Plans 1-2)

- Build metadata structure
- Create UI components
- No user-facing changes yet
- Can be developed in parallel with testing

**Phase 2: Integration** (Sub-Plans 3-4)

- Update dashboard
- Refactor URL generation
- Feature flag enabled for testing only
- Staging deployment

**Phase 3: Verification** (Sub-Plan 5)

- Test all assets end-to-end
- Verify callback flow
- Collect metrics
- Bug fixes

**Phase 4: Release** (Sub-Plan 6)

- Documentation complete
- Production deployment
- Monitor for issues
- Gather user feedback

### Rollback Plan

**If issues arise**:

1. Disable feature flag (immediate)
2. Revert dashboard to single button
3. Restore multi-network URL generation
4. Investigate and fix in development
5. Re-test before re-deployment

**Rollback Indicators**:

- Transfer failure rate > 5%
- Callback errors increasing
- User complaints about new flow
- Asset selection errors

---

## Testing Strategy

### Unit Testing

- Asset metadata validation
- URL generation with all assets
- Component rendering
- State management

### Integration Testing

- Full flow: select asset → generate URL → callback
- Each of 27+ assets individually
- Network/asset compatibility
- Error handling

### User Acceptance Testing

- Real users test flow
- Gather feedback on UX
- Identify pain points
- Measure completion rate

### Performance Testing

- Asset list render time
- Icon loading speed
- URL generation latency
- Overall page load

---

## Success Metrics

### Technical Metrics

- ✅ 100% of supported assets generate valid URLs
- ✅ 0% callback errors
- ✅ < 500ms asset list render time
- ✅ All tests passing

### Operational Metrics

- ✅ Transfer completion rate > 90%
- ✅ Average time to complete flow < 2 minutes
- ✅ No "Invalid URL" errors
- ✅ No "Sell" flow appearing

### Quality Metrics

- ✅ Code coverage > 80%
- ✅ Zero TypeScript errors
- ✅ Accessibility score > 95
- ✅ Mobile responsiveness verified

---

## Architecture Decisions

### Decision 1: Asset Pre-Selection is Required

**Context**: Testing revealed Robinhood Connect doesn't support balance-first selection for external wallet transfers.

**Options Considered**:

1. Continue trying to find URL parameter combination
2. Contact Robinhood to enable balance-first flow
3. Implement Daffy-style pre-selection

**Decision**: Implement pre-selection (Option 3)

**Rationale**:

- 31 URL variations tested, none work without pre-selection
- Robinhood explicitly stated Connect is for "funding accounts"
- Daffy-style URLs proven to work
- Reduces uncertainty and implementation risk

**Consequences**:

- Positive: Reliable, working solution immediately
- Positive: Follows proven pattern (Daffy)
- Negative: Adds one extra user step
- Negative: Cannot show balances before selection

**Mitigation**: Make asset selection UX excellent to minimize friction

### Decision 2: Component-Based Architecture

**Context**: Need reusable, maintainable asset selection UI

**Options Considered**:

1. Inline asset selection in dashboard
2. Dedicated asset selection component
3. Separate page for asset selection

**Decision**: Component-based with optional separate page (Options 2 + 3)

**Rationale**:

- Components are reusable
- Easier to test and maintain
- Can use inline OR as separate page
- Flexibility for future use cases

### Decision 3: Use Existing shadcn/ui Components

**Context**: Need UI components for asset selector

**Options Considered**:

1. Build from scratch
2. Use shadcn/ui components
3. Add new UI library

**Decision**: Leverage shadcn/ui (Option 2)

**Rationale**:

- Already in project
- Well-tested components
- Consistent design system
- Accessibility built-in

---

## Notes for Implementers

### Critical Checkpoints

**Before Starting Sub-Plan 1**:

- [ ] Read all testing documentation
- [ ] Review working Daffy-style URLs
- [ ] Understand asset-to-network mapping
- [ ] Check current dashboard implementation

**Before Starting Sub-Plan 3**:

- [ ] Asset metadata complete and validated
- [ ] UI components built and tested
- [ ] Design approved
- [ ] State management strategy decided

**Before Starting Sub-Plan 4**:

- [ ] Review test results from `test_daffy_style_urls.py`
- [ ] Confirm working parameter combination
- [ ] Understand callback flow
- [ ] Plan URL generation refactor

**Before Production Deploy**:

- [ ] ALL 27+ assets tested
- [ ] Documentation updated
- [ ] Rollback plan ready
- [ ] Feature flag implemented
- [ ] Monitoring in place

### Common Pitfalls

❌ **Don't**: Remove old URL generation code immediately
✅ **Do**: Keep it commented for reference and rollback

❌ **Don't**: Assume all assets work the same way
✅ **Do**: Test each asset individually

❌ **Don't**: Hard-code asset metadata
✅ **Do**: Use centralized, versioned data structure

❌ **Don't**: Skip mobile testing
✅ **Do**: Test on real mobile devices

❌ **Don't**: Deploy to production without staging
✅ **Do**: Full staging environment testing first

### Time Estimates

**Sub-Plan 1**: 2-3 hours (metadata structure)
**Sub-Plan 2**: 4-6 hours (UI components)
**Sub-Plan 3**: 3-4 hours (dashboard integration)
**Sub-Plan 4**: 2-3 hours (URL builder)
**Sub-Plan 5**: 4-6 hours (testing all assets)
**Sub-Plan 6**: 2-3 hours (documentation)

**Total**: 17-25 hours (2-3 days of focused work)

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Create detailed sub-plans** (1 through 6)
3. **Set up feature flag** for gradual rollout
4. **Begin Sub-Plan 1** (Asset Metadata)
5. **Document progress** in implementation-logs/

---

## References

- Testing Results: `URL-TESTING-TRACKER.md`
- Working URLs: `robinhood-offramp/daffy_style_url_test_results.json`
- Current Implementation: `robinhood-offramp/app/dashboard/page.tsx`
- Asset Addresses: `robinhood-offramp/lib/robinhood-asset-addresses.ts`
- Robinhood Email Thread: Saved in project documentation
