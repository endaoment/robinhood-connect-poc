# Robinhood Connect Asset Pre-Selection Migration

**Status**: ✅ Planning Complete - Ready for Implementation
**Priority**: 🔴 Critical
**Estimated Duration**: 2-3 days (17-25 hours)

---

## Quick Links

- **📖 [OVERVIEW.md](./OVERVIEW.md)** - Comprehensive project context and architecture
- **📝 [Sub-Plan 0: Drafting Plan](./sub-plans/sub-plan-0-drafting-plan.md)** - Master planning document
- **🧪 Testing Results**: `../../URL-TESTING-TRACKER.md`
- **💻 Test Scripts**: `../../robinhood-offramp/scripts/test_*_urls.py`

---

## What This Project Does

Transitions the Robinhood Connect integration from a **non-working** multi-asset approach to a **proven working** Daffy-style pre-selection flow.

**Problem**: Users cannot complete crypto donations because Robinhood Connect doesn't support balance-first selection for external wallet transfers.

**Solution**: Require users to select which cryptocurrency to donate BEFORE connecting to Robinhood, using the proven Daffy-style URL pattern.

---

## Plan Structure

### ✅ Phase 0: Planning (Current)

| Document                        | Status      | Purpose                                           |
| ------------------------------- | ----------- | ------------------------------------------------- |
| **sub-plan-0-drafting-plan.md** | ✅ Complete | Master planning document with all phases outlined |
| **OVERVIEW.md**                 | ✅ Complete | Comprehensive project context                     |
| **README.md**                   | ✅ Complete | This navigation document                          |

### 📋 Phase 1-6: Implementation (Ready to Begin)

| Sub-Plan                              | Status             | Priority | Dependencies   | Est. Time |
| ------------------------------------- | ------------------ | -------- | -------------- | --------- |
| **Sub-Plan 1**: Asset Metadata        | 📝 Drafted - Ready | High     | None           | 2-3 hours |
| **Sub-Plan 2**: Asset Selector UI     | 📝 Drafted - Ready | High     | Sub-Plan 1     | 4-6 hours |
| **Sub-Plan 3**: Dashboard Integration | 📝 Drafted - Ready | Critical | Sub-Plans 1, 2 | 3-4 hours |
| **Sub-Plan 4**: URL Builder Refactor  | 📝 Drafted - Ready | Critical | Sub-Plan 3     | 2-3 hours |
| **Sub-Plan 5**: Callback Verification | 📝 Drafted - Ready | High     | Sub-Plan 4     | 4-6 hours |
| **Sub-Plan 6**: Testing & Docs        | 📝 Drafted - Ready | Medium   | Sub-Plans 1-5  | 2-3 hours |

---

## Implementation Approach

### Sequential Implementation (Recommended)

Execute sub-plans in order for safest, most predictable outcome:

```
Sub-Plan 1 (Metadata)
    ↓
Sub-Plan 2 (UI Components)
    ↓
Sub-Plan 3 (Dashboard)
    ↓
Sub-Plan 4 (URL Builder)
    ↓
Sub-Plan 5 (Testing)
    ↓
Sub-Plan 6 (Documentation)
```

**Advantages**:

- ✅ Clear dependencies
- ✅ Easier to track progress
- ✅ Lower risk
- ✅ Can pause between phases

**Timeline**: 3 days with focused work

### Parallel Implementation (Advanced)

Experienced teams can parallelize some work:

```
Day 1:
  Sub-Plan 1 (Metadata) → Sub-Plan 2 (UI Components)

Day 2:
  Sub-Plan 3 (Dashboard) → Sub-Plan 4 (URL Builder)

Day 3:
  Sub-Plan 5 (Testing) → Sub-Plan 6 (Documentation)
```

**Advantages**:

- ⚡ Faster completion
- 🔄 Multiple workstreams

**Risks**:

- ⚠️ Coordination needed
- ⚠️ Integration complexity

---

## Dependency Graph

```
┌─────────────┐
│  Sub-Plan 0 │  Master Planning Document
│  (Drafting) │
└──────┬──────┘
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│ Sub-Plan 1  │                    │ Sub-Plan 6  │
│  Metadata   │                    │Testing/Docs │ (runs throughout)
└──────┬──────┘                    └─────────────┘
       │
       ▼
┌─────────────┐
│ Sub-Plan 2  │
│ UI Component│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Sub-Plan 3  │
│  Dashboard  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Sub-Plan 4  │
│ URL Builder │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Sub-Plan 5  │
│  Callback   │
│Verification │
└─────────────┘
```

---

## Success Criteria Checklist

### Phase-by-Phase Completion

**Sub-Plan 1: Asset Metadata**

- [ ] Asset metadata TypeScript types defined
- [ ] All 27+ assets have complete metadata
- [ ] Asset categorization implemented
- [ ] Network mapping validated
- [ ] Metadata exported and importable

**Sub-Plan 2: Asset Selector UI**

- [ ] Asset card component created
- [ ] Asset list component created
- [ ] Search/filter functionality works
- [ ] Responsive on mobile and desktop
- [ ] Accessibility audit passes (>95 score)
- [ ] Loading states implemented

**Sub-Plan 3: Dashboard Integration**

- [ ] Asset selector integrated into dashboard
- [ ] State management working correctly
- [ ] Old "Give with Robinhood" button removed/replaced
- [ ] Navigation flow feels natural
- [ ] Feature flag implemented

**Sub-Plan 4: URL Builder Refactor**

- [ ] `buildDaffyStyleOfframpUrl()` function created
- [ ] Generates correct URL format
- [ ] Validates asset/network compatibility
- [ ] Includes all required parameters
- [ ] Old URL builder code preserved (commented)

**Sub-Plan 5: Callback Verification**

- [ ] Tested with ETH, BTC, SOL, USDC minimum
- [ ] All 27+ assets tested individually
- [ ] Callback receives correct asset info
- [ ] Wallet address mapping works
- [ ] Transfer completes successfully
- [ ] No "Invalid URL" errors
- [ ] No "Sell" flow appears

**Sub-Plan 6: Testing & Documentation**

- [ ] All tests passing
- [ ] Documentation updated
- [ ] User guide created
- [ ] Troubleshooting guide written
- [ ] Testing scripts archived
- [ ] Implementation logs complete

---

## Key Resources

### Current State Files

```
robinhood-offramp/
├── app/dashboard/page.tsx          # Current dashboard (needs update)
├── lib/robinhood-url-builder.ts    # URL generation (needs refactor)
├── lib/robinhood-asset-addresses.ts # Asset addresses (ready to use)
└── app/api/robinhood/
    └── redeem-deposit-address/
        └── route.ts                # Callback endpoint (already working)
```

### Testing Documentation

- **URL Testing Tracker**: `../../URL-TESTING-TRACKER.md`
- **Daffy-Style Results**: `../../robinhood-offramp/daffy_style_url_test_results.json`
- **Transfer No-Preselect**: `../../robinhood-offramp/transfer_no_preselect_results.json`

### Test Scripts

```bash
# Located in: robinhood-offramp/scripts/

test_url_combinations.py        # 15 general URL variations
test_daffy_style_urls.py        # 16 Daffy-style variations (WORKING)
test_transfer_no_preselect.py   # 10 no-preselect variations (FAILING)
```

### Working URL Format (Reference)

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

**Result**: ✅ "Transfer ETH" header → Successful transfer

---

## Testing Strategy

### Development Testing

**Unit Tests** (during implementation):

- Asset metadata validation
- Component rendering
- URL generation with all assets
- State management

**Integration Tests** (before staging):

- Full flow: select → URL → callback
- Each asset individually
- Network/asset compatibility
- Error handling

### Staging Testing

**Smoke Tests**:

- [ ] Asset selector loads and displays all assets
- [ ] Search/filter works
- [ ] URL generation succeeds for popular assets
- [ ] Callback returns correct wallet address

**Full Tests**:

- [ ] ALL 27+ assets work end-to-end
- [ ] Mobile responsiveness verified
- [ ] Accessibility audit passes
- [ ] Performance benchmarks met

### Production Testing

**Gradual Rollout**:

1. Feature flag: 10% of users
2. Monitor for 24 hours
3. If stable → 50% of users
4. Monitor for 24 hours
5. If stable → 100% of users

**Metrics to Monitor**:

- Transfer completion rate
- URL generation errors
- Callback endpoint errors
- User abandonment rate

---

## Critical Warnings

### ⚠️ Before Starting Implementation

**DO NOT**:

- ❌ Delete old URL generation code (keep for rollback)
- ❌ Deploy without feature flag
- ❌ Skip individual asset testing
- ❌ Ignore mobile testing
- ❌ Deploy to production without staging

**MUST DO**:

- ✅ Read all planning documents first
- ✅ Understand why pre-selection is required
- ✅ Review all 31 URL test results
- ✅ Set up feature flag infrastructure
- ✅ Prepare rollback plan

### 🔴 Production Safety Rules

**Deployment Checklist**:

- [ ] Feature flag implemented and tested
- [ ] Rollback procedure documented and tested
- [ ] Staging environment fully tested
- [ ] All 27+ assets verified working
- [ ] Monitoring and alerting configured
- [ ] Team briefed on rollback procedure

**Rollback Triggers**:

- Transfer failure rate > 10%
- "Invalid URL" errors appearing
- Callback endpoint errors spiking
- User complaints about new flow

---

## Getting Started

### For Reviewers

1. **Read** [sub-plan-0-drafting-plan.md](./sub-plans/sub-plan-0-drafting-plan.md)
2. **Review** [OVERVIEW.md](./OVERVIEW.md)
3. **Check** testing documentation (`../../URL-TESTING-TRACKER.md`)
4. **Provide feedback** on approach and estimates
5. **Approve** to proceed with detailed sub-plans 1-6

### For Implementers (After Approval)

1. **Create branch**: `feature/robinhood-asset-preselection`
2. **Start with Sub-Plan 1**: Asset Metadata
3. **Work sequentially** through sub-plans
4. **Document progress** in `implementation-logs/`
5. **Run checkpoints** after each sub-plan
6. **Create completion logs** when done

---

## Support & Questions

### Common Questions

**Q: Why can't we show balances before selection?**
A: Robinhood Connect doesn't support this for external wallet transfers. We tested 31 URL variations to confirm.

**Q: Will this hurt user experience?**
A: Slightly longer flow, but MUCH higher success rate. Trade-off is worth it for reliability.

**Q: What if a new asset is added to Robinhood?**
A: Update asset metadata file, add wallet address, test individually, deploy.

**Q: Can we revert if there are issues?**
A: Yes, feature flag allows instant revert. Old code preserved for full rollback if needed.

**Q: How long will this take?**
A: 2-3 days of focused work. Can parallelize for faster completion if needed.

---

## Version History

| Version | Date         | Changes                              | Author       |
| ------- | ------------ | ------------------------------------ | ------------ |
| 0.1     | Oct 22, 2025 | Initial planning documents created   | AI Assistant |
| 0.2     | Oct 22, 2025 | Added comprehensive testing evidence | AI Assistant |

---

## Next Steps

1. ✅ **Review this README**
2. ✅ **Read [sub-plan-0-drafting-plan.md](./sub-plans/sub-plan-0-drafting-plan.md)**
3. ✅ **Review [OVERVIEW.md](./OVERVIEW.md)**
4. ✅ **Detailed sub-plans 1-6 drafted** - All implementation plans ready
5. ⬜ **Approve or provide feedback** on sub-plans
6. ⬜ **Begin implementation** with Sub-Plan 1

---

**Status**: ✅ Planning Complete - Ready for Implementation
**Last Updated**: October 22, 2025
**Next Action**: Review sub-plans and begin implementation
