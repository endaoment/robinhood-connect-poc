# Sub-Plan 3: Dashboard Integration

**Status**: Ready for Implementation
**Priority**: Critical
**Dependencies**: Sub-Plan 1 (Asset Metadata), Sub-Plan 2 (Asset Selector UI)
**Estimated Time**: 3-4 hours

---

## Context Required

### Files to Review

**File**: `robinhood-offramp/app/dashboard/page.tsx` (entire file)

- **Purpose**: Current dashboard implementation
- **Critical**: Current "Give with Robinhood" button implementation
- **Critical**: Understand current state management and layout
- **What to change**: Replace single button with asset selection flow

**File**: `robinhood-offramp/components/asset-selector.tsx` (from Sub-Plan 2)

- **Purpose**: Asset selector component to integrate
- **What to understand**: Props, callbacks, variants

**File**: `robinhood-offramp/lib/robinhood-url-builder.ts` (lines 310-314)

- **Purpose**: Current URL generation (will be updated in Sub-Plan 4)
- **What to understand**: How URL generation is currently triggered

### Understanding Required

1. **Current Dashboard Flow**: How users currently initiate Robinhood donation
2. **State Management**: Where to store selected asset
3. **Navigation**: How to guide user through selection → confirmation → transfer
4. **Layout**: How asset selector fits into existing dashboard design
5. **Feature Flags**: How to implement gradual rollout

---

## Objectives

1. **Replace Single Button with Asset Selection**

   - Remove or modify "Give with Robinhood" button
   - Add asset selector interface
   - Maintain visual design consistency

2. **Implement Asset Selection State Management**

   - Store selected asset in component state
   - Pass selected asset to URL generation
   - Clear selection when needed

3. **Create Confirmation Step**

   - Show selected asset before proceeding
   - Allow user to change selection
   - Clear call-to-action to continue

4. **Add Feature Flag Support**

   - Toggle between old and new flow
   - Easy rollback mechanism
   - Environment-based configuration

5. **Maintain Existing Functionality**
   - Keep transaction history
   - Preserve other dashboard features
   - Don't break existing components

---

## Precise Implementation Steps

### Step 1: Add Feature Flag Configuration

**File**: `robinhood-offramp/.env.local`

**Action**: Add feature flag (create file if doesn't exist)

**Code**:

```bash
# Feature Flags
NEXT_PUBLIC_ENABLE_ASSET_PRESELECTION=true

# For rollback: set to false
# NEXT_PUBLIC_ENABLE_ASSET_PRESELECTION=false
```

**File**: `robinhood-offramp/lib/feature-flags.ts` (NEW)

**Action**: Create feature flag helper

**Code**:

```typescript
/**
 * Feature flag configuration
 */

/**
 * Check if asset pre-selection is enabled
 */
export function isAssetPreselectionEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ASSET_PRESELECTION === "true";
}

/**
 * All feature flags
 */
export const FEATURE_FLAGS = {
  assetPreselection: isAssetPreselectionEnabled(),
} as const;
```

**Validation**:

```bash
npx tsc --noEmit
```

**Expected Output**: No errors

---

### Step 2: Create Asset Selection State Hook

**File**: `robinhood-offramp/hooks/use-asset-selection.ts` (NEW)

**Action**: Create custom hook for asset selection state

**Code**:

```typescript
"use client";

import { useState, useCallback } from "react";
import { AssetMetadata } from "@/types/robinhood";
import { getAssetConfig } from "@/lib/robinhood-asset-config";

export interface AssetSelection {
  /** Selected asset metadata */
  asset: AssetMetadata;
  /** Wallet address for this asset */
  walletAddress: string;
}

/**
 * Hook for managing asset selection state
 */
export function useAssetSelection() {
  const [selection, setSelection] = useState<AssetSelection | null>(null);

  /**
   * Select an asset
   */
  const selectAsset = useCallback((asset: AssetMetadata) => {
    const config = getAssetConfig(asset.symbol);

    if (!config) {
      console.error(`No configuration found for asset: ${asset.symbol}`);
      return;
    }

    setSelection({
      asset,
      walletAddress: config.walletAddress,
    });
  }, []);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  /**
   * Check if an asset is selected
   */
  const isSelected = useCallback(
    (symbol: string) => {
      return selection?.asset.symbol === symbol;
    },
    [selection]
  );

  return {
    selection,
    selectAsset,
    clearSelection,
    isSelected,
  };
}
```

**Validation**:

```bash
npx tsc --noEmit
```

**Expected Output**: No errors

---

### Step 3: Update Dashboard Page - Add Asset Selection

**File**: `robinhood-offramp/app/dashboard/page.tsx`

**Action**: Integrate asset selector into dashboard

**Code** (add to existing dashboard):

```typescript
"use client";

import { useState } from "react";
import { AssetMetadata } from "@/types/robinhood";
import { AssetSelector } from "@/components/asset-selector";
import { useAssetSelection } from "@/hooks/use-asset-selection";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { buildDaffyStyleOfframpUrl } from "@/lib/robinhood-url-builder"; // Will be added in Sub-Plan 4
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const { selection, selectAsset, clearSelection, isSelected } =
    useAssetSelection();
  const [step, setStep] = useState<"select" | "confirm">("select");

  /**
   * Handle asset selection
   */
  const handleAssetSelect = (asset: AssetMetadata) => {
    selectAsset(asset);
    setStep("confirm");
  };

  /**
   * Handle going back to selection
   */
  const handleBack = () => {
    setStep("select");
  };

  /**
   * Handle continue to Robinhood
   */
  const handleContinue = () => {
    if (!selection) return;

    // Generate Daffy-style URL (Sub-Plan 4 will implement this)
    const url = buildDaffyStyleOfframpUrl({
      asset: selection.asset.symbol,
      network: selection.asset.network,
      walletAddress: selection.walletAddress,
    });

    // Redirect to Robinhood Connect
    window.location.href = url;
  };

  // OLD FLOW (for feature flag fallback)
  if (!FEATURE_FLAGS.assetPreselection) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Old single button approach */}
        <Card>
          <CardHeader>
            <CardTitle>Give with Robinhood</CardTitle>
            <CardDescription>
              Connect your Robinhood account to donate cryptocurrency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                // Old multi-network URL generation
                const url = buildMultiNetworkOfframpUrl([
                  /* networks */
                ]);
                window.location.href = url;
              }}
              size="lg"
            >
              Connect Robinhood Account
            </Button>
          </CardContent>
        </Card>

        {/* Other dashboard content... */}
      </div>
    );
  }

  // NEW FLOW (with asset pre-selection)
  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Donate cryptocurrency from your Robinhood account
      </p>

      {/* Asset Selection Step */}
      {step === "select" && (
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Asset to Donate</CardTitle>
              <CardDescription>
                Choose which cryptocurrency you&apos;d like to contribute from
                your Robinhood account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetSelector
                selectedAsset={selection?.asset.symbol}
                onSelect={handleAssetSelect}
                variant="grid"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Step */}
      {step === "confirm" && selection && (
        <div>
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to asset selection
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Ready to Connect Robinhood</CardTitle>
              <CardDescription>
                You&apos;ve selected {selection.asset.name} (
                {selection.asset.symbol})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Selected Asset Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selection.asset.symbol.slice(0, 3)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {selection.asset.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {selection.asset.symbol} on {selection.asset.network}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selection.asset.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">What happens next:</h4>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                      1
                    </span>
                    <span>
                      You&apos;ll be redirected to Robinhood to authenticate
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                      2
                    </span>
                    <span>
                      Review and confirm your {selection.asset.symbol} transfer
                      amount
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                      3
                    </span>
                    <span>Complete the transfer in the Robinhood app</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                      4
                    </span>
                    <span>Return here to see your donation confirmed</span>
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleContinue} size="lg" className="flex-1">
                  Continue to Robinhood
                </Button>
                <Button onClick={handleBack} variant="outline" size="lg">
                  Change Asset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction History (existing component) */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Recent Donations</h2>
        {/* Existing transaction history component */}
      </div>
    </div>
  );
}
```

**Validation**:

```bash
npx tsc --noEmit
```

**Expected Output**: No errors (may have warning about `buildDaffyStyleOfframpUrl` - will be fixed in Sub-Plan 4)

---

### Step 4: Add Loading and Error States

**File**: `robinhood-offramp/app/dashboard/page.tsx`

**Action**: Add loading and error handling

**Code** (add to component):

```typescript
// Add to component state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Update handleContinue
const handleContinue = async () => {
  if (!selection) return;

  try {
    setIsLoading(true);
    setError(null);

    // Generate URL
    const url = buildDaffyStyleOfframpUrl({
      asset: selection.asset.symbol,
      network: selection.asset.network,
      walletAddress: selection.walletAddress,
    });

    if (!url) {
      throw new Error("Failed to generate transfer URL");
    }

    // Redirect
    window.location.href = url;
  } catch (err) {
    setError(err instanceof Error ? err.message : "An error occurred");
    setIsLoading(false);
  }
};

// Add error display in confirmation step
{
  error && (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
      <p className="font-semibold">Error</p>
      <p className="text-sm">{error}</p>
    </div>
  );
}

// Update button with loading state
<Button
  onClick={handleContinue}
  size="lg"
  className="flex-1"
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <span className="mr-2">⏳</span>
      Connecting...
    </>
  ) : (
    "Continue to Robinhood"
  )}
</Button>;
```

**Validation**: Visual check in browser

---

### Step 5: Add Analytics/Logging (Optional)

**File**: `robinhood-offramp/app/dashboard/page.tsx`

**Action**: Add event tracking for asset selection

**Code**:

```typescript
// Add to handleAssetSelect
const handleAssetSelect = (asset: AssetMetadata) => {
  selectAsset(asset);
  setStep("confirm");

  // Log asset selection
  console.log("[Analytics] Asset selected:", {
    symbol: asset.symbol,
    name: asset.name,
    network: asset.network,
    category: asset.category,
  });

  // If you have analytics service:
  // analytics.track('asset_selected', { asset: asset.symbol });
};

// Add to handleContinue
const handleContinue = async () => {
  // ... existing code ...

  console.log("[Analytics] Proceeding to Robinhood:", {
    asset: selection.asset.symbol,
    network: selection.asset.network,
  });

  // analytics.track('robinhood_redirect', { asset: selection.asset.symbol });
};
```

---

### Step 6: Preserve Old Dashboard Code

**File**: `robinhood-offramp/app/dashboard/page-old-backup.tsx` (NEW)

**Action**: Create backup of old dashboard for reference

**Code**:

```bash
# Copy current dashboard to backup
cp robinhood-offramp/app/dashboard/page.tsx robinhood-offramp/app/dashboard/page-old-backup.tsx
```

**Note**: Add comment at top of backup file:

```typescript
/**
 * BACKUP - Old dashboard implementation before asset pre-selection
 * Preserved for reference and potential rollback
 * Date: October 22, 2025
 */
```

---

## Deliverables Checklist

- [ ] Feature flag configuration

  - [ ] `.env.local` has `NEXT_PUBLIC_ENABLE_ASSET_PRESELECTION`
  - [ ] `lib/feature-flags.ts` created
  - [ ] Feature flag helper functions work

- [ ] Asset selection hook created: `hooks/use-asset-selection.ts`

  - [ ] State management for selected asset
  - [ ] `selectAsset` function
  - [ ] `clearSelection` function
  - [ ] `isSelected` helper

- [ ] Dashboard updated: `app/dashboard/page.tsx`

  - [ ] Asset selector integrated
  - [ ] Two-step flow: select → confirm
  - [ ] Feature flag support (old vs new flow)
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Back navigation

- [ ] Old dashboard backed up

  - [ ] `page-old-backup.tsx` created
  - [ ] Commented for reference

- [ ] All TypeScript compilation succeeds

---

## Validation Steps

### 1. TypeScript Compilation

```bash
cd robinhood-offramp
npx tsc --noEmit
```

**Expected**: No errors (may have warning about `buildDaffyStyleOfframpUrl` until Sub-Plan 4)

### 2. Start Development Server

```bash
npm run dev
```

**Expected**: Server starts on port 3000

### 3. Test Feature Flag OFF

```bash
# In .env.local
NEXT_PUBLIC_ENABLE_ASSET_PRESELECTION=false

# Restart server and visit http://localhost:3000/dashboard
```

**Verify**:

- [ ] Old dashboard flow appears
- [ ] Single "Give with Robinhood" button shows
- [ ] No asset selector visible

### 4. Test Feature Flag ON

```bash
# In .env.local
NEXT_PUBLIC_ENABLE_ASSET_PRESELECTION=true

# Restart server and visit http://localhost:3000/dashboard
```

**Verify**:

- [ ] New asset selection flow appears
- [ ] Asset selector displays all assets
- [ ] Search works
- [ ] Category filtering works

### 5. Test Asset Selection Flow

```
1. Select an asset (e.g., ETH)
2. Verify confirmation screen shows
3. Verify selected asset details display
4. Click "Back to asset selection"
5. Verify returns to selector with selection preserved
6. Select different asset
7. Verify confirmation updates
```

**Verify**:

- [ ] Selection state persists
- [ ] Confirmation shows correct asset
- [ ] Back navigation works
- [ ] Can change selection

### 6. Test Continue Button

```
1. Select an asset
2. Click "Continue to Robinhood"
3. Check browser console for logs
```

**Verify**:

- [ ] Loading state shows
- [ ] Console shows analytics events
- [ ] (Will redirect once URL builder is implemented in Sub-Plan 4)

### 7. Mobile Responsiveness

```
Test at viewport sizes:
- 375px (mobile)
- 768px (tablet)
- 1024px (desktop)
```

**Verify**:

- [ ] Asset grid responds appropriately
- [ ] Confirmation screen readable
- [ ] Buttons accessible
- [ ] No horizontal scroll

---

## Backward Compatibility Checkpoint

**Purpose**: Verify dashboard changes don't break existing functionality

### Commands

```bash
cd robinhood-offramp

# 1. Feature flag OFF - test old flow
NEXT_PUBLIC_ENABLE_ASSET_PRESELECTION=false npm run dev

# Visit http://localhost:3000/dashboard
# Verify old flow works

# 2. Feature flag ON - test new flow
NEXT_PUBLIC_ENABLE_ASSET_PRESELECTION=true npm run dev

# Visit http://localhost:3000/dashboard
# Verify new flow works

# 3. TypeScript compilation
npx tsc --noEmit
```

### Success Criteria

- ✅ Old flow works with feature flag OFF
- ✅ New flow works with feature flag ON
- ✅ No TypeScript errors
- ✅ No console errors in browser
- ✅ Other dashboard features unaffected (transaction history, etc.)
- ✅ Page loads in < 2 seconds
- ✅ No visual regressions

### If Checkpoint Fails

1. **Feature Flag Not Working**:

   - Check `.env.local` syntax
   - Restart development server
   - Verify `NEXT_PUBLIC_` prefix

2. **Component Not Rendering**:

   - Check import paths
   - Verify 'use client' directive
   - Check browser console for errors

3. **State Management Issues**:
   - Verify hook usage follows React rules
   - Check for missing dependencies in useCallback

### Rollback Procedure

```bash
# Restore old dashboard
cp robinhood-offramp/app/dashboard/page-old-backup.tsx robinhood-offramp/app/dashboard/page.tsx

# Or git revert
git checkout robinhood-offramp/app/dashboard/page.tsx
git checkout robinhood-offramp/hooks/use-asset-selection.ts
git checkout robinhood-offramp/lib/feature-flags.ts
```

---

## Common Issues and Solutions

### Issue 1: Feature Flag Not Updating

**Symptom**: Changes to `.env.local` don't take effect

**Solution**:

- Restart development server (environment variables loaded at startup)
- Clear Next.js cache: `rm -rf .next`
- Verify `NEXT_PUBLIC_` prefix present

### Issue 2: Asset Selection State Not Persisting

**Symptom**: Selected asset lost when navigating back

**Solution**:

- Check `useAssetSelection` hook implementation
- Verify state not being reset accidentally
- Consider using session storage for persistence

### Issue 3: Infinite Re-renders

**Symptom**: Page freezes, React warns about too many renders

**Solution**:

- Check useCallback dependencies
- Ensure no state updates in render
- Verify no circular dependencies in effects

### Issue 4: Confirmation Step Not Showing

**Symptom**: Stays on selection step after choosing asset

**Solution**:

- Verify `setStep('confirm')` is called
- Check `step` state value in React DevTools
- Ensure no errors preventing state update

### Issue 5: Missing Icons

**Symptom**: Asset icons don't display

**Solution**:

- This is expected until icons added (Sub-Plan 2 has fallback)
- Verify fallback text displays
- Check console for image load errors

---

## Integration Points

### Receives from Sub-Plan 1

- ✅ Asset configuration helper
- ✅ Asset metadata structure

### Receives from Sub-Plan 2

- ✅ AssetSelector component
- ✅ Asset selection callbacks

### Provides to Sub-Plan 4 (URL Builder)

- ✅ Selected asset data
- ✅ Wallet address for URL generation
- ✅ Network information

### Provides to Sub-Plan 5 (Callback Verification)

- ✅ Complete user flow to test
- ✅ Asset selection integration

---

## Next Steps

After completing this sub-plan:

1. ✅ **Verify all deliverables** complete
2. ✅ **Run all validation steps** successfully
3. ✅ **Test both old and new flows** with feature flag
4. ✅ **Verify mobile responsiveness**
5. ✅ **Commit changes** with descriptive message
6. ⏭️ **Proceed to Sub-Plan 4**: URL Builder Refactor
7. 📝 **Create completion log**: `implementation-logs/YYYYMMDD-HHMM-SP3-COMPLETE.md`

---

## Time Breakdown

- Step 1 (Feature Flag): 15 minutes
- Step 2 (State Hook): 30 minutes
- Step 3 (Dashboard Update): 90 minutes
- Step 4 (Loading/Error States): 30 minutes
- Step 5 (Analytics): 15 minutes
- Step 6 (Backup): 5 minutes
- Testing & Validation: 45 minutes
- Mobile Testing: 30 minutes

**Total**: ~4 hours

---

**Status**: ⏸️ Ready to begin (after Sub-Plans 1 & 2)
**Last Updated**: October 22, 2025
