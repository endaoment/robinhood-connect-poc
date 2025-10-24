# Robinhood Legacy Code Cleanup

**Status**: All Sub-Plans Created - Ready for Implementation
**Priority**: High
**Estimated Duration**: 2-3 days (11-18 hours)

---

## Quick Links

- **[OVERVIEW.md](./OVERVIEW.md)** - Comprehensive project context and architecture
- **[Sub-Plan 0: Drafting Plan](./sub-plans/sub-plan-0-drafting-plan.md)** - Master planning document
- **[Sub-Plans 1-8](./sub-plans/)** - Detailed implementation plans
- **[Implementation Logs](./implementation-logs/)** - Progress tracking and decisions

---

## What This Project Does

Removes legacy code, deprecated functions, and offramp confusion from the robinhood-onramp project. The asset pre-selection flow is working end-to-end, but the codebase contains remnants from failed approaches and temporary development artifacts.

**Problem**: Codebase has dead code from:

- Non-working balance-first approach
- Offramp/onramp confusion (separate APIs mixed together)
- Deprecated URL builders
- Feature flag system for old vs new flow
- Development test scripts and artifacts

**Solution**: Systematic cleanup to leave only the working code, making the repository clean, understandable, and ready for code review and main branch merge.

---

## Plan Structure

### Phase 0: Planning (Current)

| Document                        | Status      | Purpose                                           |
| ------------------------------- | ----------- | ------------------------------------------------- |
| **sub-plan-0-drafting-plan.md** | Ready       | Master planning document with all phases outlined |
| **OVERVIEW.md**                 | ✅ Complete | Comprehensive project context                     |
| **README.md**                   | ✅ Complete | This navigation document                          |

### Phases 1-8: Implementation (Ready to Begin)

| Sub-Plan                                                                                   | Status     | Priority | Dependencies | Est. Time |
| ------------------------------------------------------------------------------------------ | ---------- | -------- | ------------ | --------- |
| **[Sub-Plan 1](./sub-plans/sub-plan-1-offramp-purge.md)**: Offramp Purge                   | ✅ Planned | High     | None         | 2-3 hours |
| **[Sub-Plan 2](./sub-plans/sub-plan-2-deprecated-url-builders.md)**: Deprecated Builders   | ✅ Planned | High     | SP1          | 1-2 hours |
| **[Sub-Plan 3](./sub-plans/sub-plan-3-feature-flag-removal.md)**: Feature Flag Remove      | ✅ Planned | High     | SP2          | 2-3 hours |
| **[Sub-Plan 4](./sub-plans/sub-plan-4-id-system-consolidation.md)**: ID Consolidation      | ✅ Planned | Medium   | SP3          | 1-2 hours |
| **[Sub-Plan 5](./sub-plans/sub-plan-5-documentation-consolidation.md)**: Doc Consolidation | ✅ Planned | Medium   | SP4          | 2-3 hours |
| **[Sub-Plan 6](./sub-plans/sub-plan-6-test-artifact-cleanup.md)**: Test Cleanup            | ✅ Planned | Low      | None         | 1 hour    |
| **[Sub-Plan 7](./sub-plans/sub-plan-7-naming-consistency.md)**: Naming Consistency         | ✅ Planned | Low      | SP5          | 1-2 hours |
| **[Sub-Plan 8](./sub-plans/sub-plan-8-final-validation.md)**: Final Validation             | ✅ Planned | Critical | All          | 1-2 hours |

---

## Implementation Approach

### Sequential Implementation (Recommended)

Execute sub-plans in order for safest outcome:

```
Sub-Plan 1 (Offramp Purge)
    ↓
Sub-Plan 2 (Deprecated Builders)
    ↓
Sub-Plan 3 (Feature Flag Removal)
    ↓
Sub-Plan 4 (ID Consolidation)
    ↓
Sub-Plan 5 (Documentation)
    ↓
Sub-Plan 6 (Test Cleanup) - Can run parallel with SP1-5
    ↓
Sub-Plan 7 (Naming Consistency)
    ↓
Sub-Plan 8 (Final Validation)
```

**Advantages**:

- Clear dependencies
- Easy to track progress
- Lower risk
- Can pause between phases
- Each commit is atomic

**Timeline**: 2-3 days with focused work

---

## Dependency Graph

```
┌─────────────┐
│  Sub-Plan 0 │  Master Planning Document
│  (Drafting) │
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
┌─────────────┐┌─────────────┐┌─────────────┐┌─────────────┐
│ Sub-Plan 1  ││ Sub-Plan 6  ││Current Branch││Implementation│
│   Offramp   ││Test Cleanup ││   f/presel.  ││    Logs     │
│   Purge     ││(parallel)   ││   (stable)   ││ (preserved) │
└──────┬──────┘└─────────────┘└─────────────┘└─────────────┘
       │
       ▼
┌─────────────┐
│ Sub-Plan 2  │
│ Deprecated  │
│  Builders   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Sub-Plan 3  │
│ Feature Flag│
│  Removal    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Sub-Plan 4  │
│     ID      │
│Consolidation│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Sub-Plan 5  │
│Documentation│
│Consolidation│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Sub-Plan 7  │
│   Naming    │
│ Consistency │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Sub-Plan 8  │
│    Final    │
│ Validation  │
└─────────────┘
```

---

## Success Criteria Checklist

### Phase-by-Phase Completion

**Sub-Plan 1: Offramp Purge**

- [ ] Deleted `/app/api/robinhood/generate-offramp-url/` directory
- [ ] Deleted `/components/order-status.tsx`
- [ ] Deleted `/app/api/robinhood/order-status/route.ts`
- [ ] Removed offramp types from `/types/robinhood.d.ts`
- [ ] No "offramp" references remain except in explanatory docs
- [ ] TypeScript compiles without errors

**Sub-Plan 2: Deprecated URL Builders**

- [ ] Removed `buildOnrampUrl()` function
- [ ] Removed `buildMultiNetworkOnrampUrl()` function
- [ ] Only `buildDaffyStyleOnrampUrl()` remains
- [ ] Updated API route to remove legacy fallback
- [ ] No deprecated warnings in code
- [ ] TypeScript compiles without errors

**Sub-Plan 3: Feature Flag Removal**

- [ ] Deleted `/app/dashboard/page-old-backup.tsx`
- [ ] Removed feature flag check from dashboard
- [ ] Deleted old flow code path (lines ~380-450)
- [ ] Removed `/lib/feature-flags.ts` (if only used for this)
- [ ] Single code path only
- [ ] TypeScript compiles without errors

**Sub-Plan 4: ID Consolidation**

- [ ] Updated callback to use connectId consistently
- [ ] Updated localStorage keys to use connectId
- [ ] API responses use connectId primarily
- [ ] Types clarify connectId vs referenceId relationship
- [ ] Added explanatory comments
- [ ] TypeScript compiles without errors

**Sub-Plan 5: Documentation Consolidation**

- [ ] Updated main README.md
- [ ] Consolidated testing docs into single guide
- [ ] Updated DEVELOPER_GUIDE.md
- [ ] Updated USER_GUIDE.md
- [ ] Removed CHANGES-ORDER-STATUS-REMOVAL.md
- [ ] Created ARCHITECTURE.md

**Sub-Plan 6: Test Artifact Cleanup**

- [ ] Removed development-only test scripts
- [ ] Kept onramp-capability-related scripts
- [ ] Removed old JSON test results
- [ ] Kept all implementation logs (per user request)
- [ ] Verified no production code depends on removed scripts
- [ ] Updated scripts/README.md

**Sub-Plan 7: Naming Consistency**

- [ ] Verified directory name is `robinhood-onramp`
- [ ] No "offramp" variable names in onramp code
- [ ] Standardized "transfer" vs "onramp" terminology
- [ ] Component names are clear
- [ ] API endpoint names are clear

**Sub-Plan 8: Final Validation**

- [ ] Full transfer flow tested (select → Robinhood → callback)
- [ ] Zero linter errors
- [ ] Zero TypeScript errors
- [ ] Created CLEANUP-SUMMARY.md
- [ ] Updated package.json if needed
- [ ] PR description prepared

---

## Key Resources

### Current State Files

**Working Code to Keep**:

```
robinhood-onramp/
├── app/dashboard/page.tsx (cleanup lines 380-450)
├── app/api/robinhood/generate-onramp-url/route.ts
├── app/callback/page.tsx
├── lib/robinhood-url-builder.ts (keep only buildDaffyStyleOnrampUrl)
├── lib/robinhood-asset-config.ts
├── lib/robinhood-asset-metadata.ts
└── lib/robinhood-asset-addresses.ts
```

**Files to Delete**:

```
robinhood-onramp/
├── app/api/robinhood/generate-offramp-url/
├── app/api/robinhood/order-status/route.ts
├── app/dashboard/page-old-backup.tsx
├── components/order-status.tsx
├── lib/feature-flags.ts (if only for asset preselection)
├── CHANGES-ORDER-STATUS-REMOVAL.md
├── scripts/test-url-combinations.py
├── scripts/test-daffy-style-urls.py
├── scripts/test_transfer_no_preselect.py
├── scripts/*_20251020_*.json
└── scripts/*_20251020_*.ts
```

**Scripts to Keep**:

```
robinhood-onramp/scripts/
├── get_all_robinhood_assets.py (onramp capability)
├── get_trading_balance_addresses.py (onramp capability)
├── generate_prime_wallets.py (setup)
├── prime_api_client.py (integration)
├── start-with-ngrok.sh (development)
├── requirements.txt
└── README.md
```

### Implementation Logs (All Preserved)

**Must Read Before Starting**:

- `20251024-1545-POST-ROBINHOOD-CALL-SUMMARY.md` - Current state
- `20251023-2110-POST-ROBINHOOD-CALL-SUMMARY.md` - RH call insights
- `20251022-2025-SP4-COMPLETE.md` - URL builder implementation
- `20251022-2130-CRITICAL-URL-FIX.md` - Critical URL format fix
- `CHANGES-ORDER-STATUS-REMOVAL.md` - Why order status removed

### Working Flow Reference

**Proven Working Pattern** (Oct 24, 2025):

```
1. User selects asset in dashboard
   └─> Asset selector UI (lines 1-380 of dashboard/page.tsx)

2. API generates URL with Robinhood connectId
   └─> /api/robinhood/generate-onramp-url/route.ts
   └─> Calls Robinhood API: POST /catpay/v1/connect_id/

3. buildDaffyStyleOnrampUrl() constructs URL
   └─> Base: https://robinhood.com/connect/amount
   └─> Params: applicationId, connectId, paymentMethod, redirectUrl,
               supportedAssets, supportedNetworks, walletAddress, assetCode, flow

4. User completes transfer in Robinhood

5. Robinhood redirects to callback with params
   └─> asset, network, referenceId, timestamp, orderId

6. Dashboard shows success
   └─> Toast with asset/network/orderId details
```

---

## Testing Strategy

### Pre-Cleanup Testing

1. Test current flow works end-to-end
2. Document exact steps for validation
3. Take screenshots/videos if possible

### During-Cleanup Testing

- After each sub-plan: TypeScript compilation check
- After major changes: Full import validation
- Before commits: Linter check

### Post-Cleanup Testing

1. **Full Flow Test**: Asset select → URL gen → Robinhood → Callback → Success
2. **TypeScript**: `npx tsc --noEmit` (zero errors)
3. **Linter**: Check all files
4. **Import Validation**: All imports resolve
5. **Documentation Review**: Accurate and clear

---

## Critical Warnings

### Before Starting Implementation

**DO NOT**:

- ❌ Delete files without searching for references first
- ❌ Assume @deprecated means unused
- ❌ Remove implementation logs (user wants all preserved)
- ❌ Delete scripts related to onramp capabilities
- ❌ Deploy without full end-to-end test

**MUST DO**:

- ✅ Create cleanup branch from f/preselection
- ✅ Read implementation logs to understand context
- ✅ Search codebase for references before deleting
- ✅ Commit after each sub-plan
- ✅ Test after major changes

### Production Safety Rules

**Before Merge to Main**:

- [ ] Cleanup branch tested end-to-end
- [ ] All success criteria met
- [ ] Zero TypeScript/linter errors
- [ ] Documentation updated
- [ ] Team review completed
- [ ] PR description comprehensive

**Rollback Triggers**:

- Transfer flow breaks
- TypeScript compilation fails
- Critical imports broken
- Working code accidentally deleted

---

## Getting Started

### For Reviewers

1. **Read** [sub-plan-0-drafting-plan.md](./sub-plans/sub-plan-0-drafting-plan.md)
2. **Review** [OVERVIEW.md](./OVERVIEW.md)
3. **Check** implementation logs to understand journey
4. **Verify** files to delete make sense
5. **Approve** to proceed with detailed sub-plans 1-8

### For Implementers (After Approval)

1. **Verify** current branch (f/preselection) works
2. **Create branch**: `cleanup/legacy-code` from `f/preselection`
3. **Read** all implementation logs
4. **Start with Sub-Plan 1**: Offramp Purge
5. **Work sequentially** through sub-plans
6. **Commit** after each sub-plan
7. **Test** after major changes
8. **Document** in implementation-logs/

---

## User Decisions (Confirmed)

✅ **Offramp Code**: Remove completely (no future plans)
✅ **Test Scripts**: Delete development tests, keep onramp-capability scripts
✅ **Implementation Logs**: Preserve ALL logs (complete history)

---

## Support & Questions

### Common Questions

**Q: Why remove offramp code if it might be useful later?**
A: Offramp and onramp are separate APIs. Mixing them causes confusion. If offramp is needed later, start fresh with clear separation.

**Q: Why delete deprecated URL builders?**
A: They don't work. Tested 31 variations, only Daffy-style works. Keeping dead code adds maintenance burden.

**Q: Why remove feature flag system?**
A: New flow is proven working. Old flow never worked. No need for gradual rollout.

**Q: Will this break anything?**
A: No - we're only removing code that's documented as not working or not used.

**Q: How long will this take?**
A: 11-18 hours (2-3 days focused work) across 8 sub-plans.

---

## Version History

| Version | Date         | Changes                            | Author       |
| ------- | ------------ | ---------------------------------- | ------------ |
| 0.1     | Oct 24, 2025 | Initial planning documents created | AI Assistant |
| 0.2     | Oct 24, 2025 | User decisions incorporated        | AI Assistant |

---

## Next Steps

1. ✅ **Review this README**
2. ✅ **Read [sub-plan-0-drafting-plan.md](./sub-plans/sub-plan-0-drafting-plan.md)**
3. ✅ **Review [OVERVIEW.md](./OVERVIEW.md)**
4. ⬜ **Create detailed sub-plans 1-8**
5. ⬜ **Approve plans or provide feedback**
6. ⬜ **Begin implementation** with Sub-Plan 1

---

**Status**: Planning Complete - Ready for Review
**Last Updated**: October 24, 2025
**Next Action**: Review and approve sub-plan-0
