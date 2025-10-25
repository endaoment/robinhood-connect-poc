# Sub-Plan 2: Asset Selection UI Component

**Status**: Ready for Implementation
**Priority**: High
**Dependencies**: Sub-Plan 1 (Asset Metadata)
**Estimated Time**: 4-6 hours

---

## Context Required

### Files to Review

**File**: `robinhood-offramp/lib/robinhood-asset-metadata.ts` (from Sub-Plan 1)

- **Purpose**: Asset metadata to display
- **Critical**: Understand `AssetMetadata` structure
- **Critical**: Helper functions: `getEnabledAssets()`, `searchAssets()`, `getAssetsByCategory()`

**File**: `robinhood-offramp/components/ui/card.tsx`

- **Purpose**: Existing shadcn/ui card component
- **What to understand**: How to use Card component

**File**: `robinhood-offramp/components/ui/input.tsx`

- **Purpose**: Existing shadcn/ui input component
- **What to understand**: Search input styling

**File**: `robinhood-offramp/components/ui/badge.tsx`

- **Purpose**: Existing shadcn/ui badge component
- **What to understand**: Category and network badges

**File**: `robinhood-offramp/app/dashboard/page.tsx`

- **Purpose**: Current dashboard layout
- **What to understand**: Existing styling patterns and component structure

### Understanding Required

1. **shadcn/ui Components**: How to use existing component library
2. **Tailwind CSS**: Styling patterns in the project
3. **React Patterns**: State management, event handling
4. **Accessibility**: ARIA labels, keyboard navigation
5. **Responsive Design**: Mobile vs desktop layouts

---

## Objectives

1. **Create Reusable Asset Selector Component**

   - Self-contained, composable component
   - Can be used inline or as separate page
   - Type-safe props and events

2. **Implement Rich Visual Design**

   - Asset cards with icons
   - Category grouping
   - Network badges
   - Hover and selection states

3. **Add Search and Filter Functionality**

   - Real-time search by name/symbol
   - Filter by category
   - Show popular assets first

4. **Ensure Accessibility**

   - Keyboard navigation
   - Screen reader support
   - ARIA labels
   - Focus management

5. **Optimize for Mobile**
   - Responsive grid layout
   - Touch-friendly targets
   - Mobile search experience

---

## Precise Implementation Steps

### Step 1: Create Asset Icon Component

**File**: `robinhood-offramp/components/asset-icon.tsx` (NEW)

**Action**: Create reusable icon component with fallback

**Code**:

```typescript
import Image from "next/image";

interface AssetIconProps {
  /** Asset symbol (e.g., 'ETH') */
  symbol: string;
  /** Icon filename or URL */
  icon: string;
  /** Size in pixels */
  size?: number;
  /** CSS class name */
  className?: string;
}

/**
 * Asset icon with fallback to symbol text
 */
export function AssetIcon({
  symbol,
  icon,
  size = 40,
  className = "",
}: AssetIconProps) {
  const [imageError, setImageError] = React.useState(false);

  // Try to load icon from public/assets/crypto-icons/
  const iconPath = `/assets/crypto-icons/${icon}`;

  if (imageError) {
    // Fallback to symbol text in colored circle
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-label={`${symbol} icon`}
      >
        {symbol.slice(0, 3)}
      </div>
    );
  }

  return (
    <Image
      src={iconPath}
      alt={`${symbol} icon`}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setImageError(true)}
      priority={false}
    />
  );
}

/**
 * Small asset icon for compact displays
 */
export function AssetIconSmall(props: Omit<AssetIconProps, "size">) {
  return <AssetIcon {...props} size={24} />;
}

/**
 * Large asset icon for featured displays
 */
export function AssetIconLarge(props: Omit<AssetIconProps, "size">) {
  return <AssetIcon {...props} size={64} />;
}
```

**Validation**:

```bash
npx tsc --noEmit
```

**Expected Output**: No TypeScript errors

---

### Step 2: Create Asset Card Component

**File**: `robinhood-offramp/components/asset-card.tsx` (NEW)

**Action**: Create individual asset card for selection

**Code**:

```typescript
"use client";

import React from "react";
import { AssetMetadata } from "@/types/robinhood";
import { AssetIcon } from "./asset-icon";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface AssetCardProps {
  /** Asset metadata to display */
  asset: AssetMetadata;
  /** Whether this asset is currently selected */
  selected?: boolean;
  /** Callback when asset is selected */
  onSelect?: (asset: AssetMetadata) => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Individual asset card for selection
 */
export function AssetCard({
  asset,
  selected = false,
  onSelect,
  className,
}: AssetCardProps) {
  const handleClick = () => {
    if (onSelect && asset.enabled) {
      onSelect(asset);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && asset.enabled) {
      e.preventDefault();
      onSelect?.(asset);
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        !asset.enabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={asset.enabled ? 0 : -1}
      role="button"
      aria-pressed={selected}
      aria-disabled={!asset.enabled}
      aria-label={`Select ${asset.name} (${asset.symbol})`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Asset Icon */}
          <AssetIcon
            symbol={asset.symbol}
            icon={asset.icon}
            size={48}
            className="flex-shrink-0"
          />

          {/* Asset Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{asset.name}</h3>
              {asset.isPopular && (
                <Badge variant="secondary" className="text-xs">
                  Popular
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-muted-foreground font-mono">
                {asset.symbol}
              </p>
              <Badge variant="outline" className="text-xs">
                {asset.network}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">
              {asset.description}
            </p>
          </div>

          {/* Selection Indicator */}
          {selected && (
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact asset card for dense lists
 */
export function AssetCardCompact({
  asset,
  selected,
  onSelect,
  className,
}: AssetCardProps) {
  return (
    <button
      onClick={() => onSelect?.(asset)}
      className={cn(
        "w-full p-3 rounded-lg border transition-all",
        "hover:bg-accent hover:border-blue-300",
        "flex items-center gap-3",
        selected && "bg-blue-50 border-blue-500",
        !asset.enabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={!asset.enabled}
      aria-pressed={selected}
    >
      <AssetIcon symbol={asset.symbol} icon={asset.icon} size={32} />
      <div className="flex-1 text-left">
        <p className="font-medium">{asset.symbol}</p>
        <p className="text-xs text-muted-foreground">{asset.name}</p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
```

**Validation**:

```bash
npx tsc --noEmit
```

**Expected Output**: No TypeScript errors

---

### Step 3: Create Asset Selector Component

**File**: `robinhood-offramp/components/asset-selector.tsx` (NEW)

**Action**: Create main asset selector with search and filtering

**Code**:

```typescript
"use client";

import React, { useState, useMemo } from "react";
import { AssetMetadata, AssetCategory } from "@/types/robinhood";
import {
  getEnabledAssets,
  getPopularAssets,
  searchAssets,
  getAssetsByCategory,
  CATEGORY_INFO,
} from "@/lib/robinhood-asset-metadata";
import { AssetCard, AssetCardCompact } from "./asset-card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface AssetSelectorProps {
  /** Currently selected asset symbol */
  selectedAsset?: string;
  /** Callback when asset is selected */
  onSelect: (asset: AssetMetadata) => void;
  /** Display mode */
  variant?: "grid" | "list" | "compact";
  /** Show search bar */
  showSearch?: boolean;
  /** Show category tabs */
  showCategories?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * Complete asset selection interface with search and filtering
 */
export function AssetSelector({
  selectedAsset,
  onSelect,
  variant = "grid",
  showSearch = true,
  showCategories = true,
  className = "",
}: AssetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "popular" | AssetCategory
  >("all");

  // Get assets based on active filter
  const assets = useMemo(() => {
    // Search takes priority
    if (searchQuery.trim()) {
      return searchAssets(searchQuery);
    }

    // Then category filter
    if (activeCategory === "popular") {
      return getPopularAssets();
    } else if (activeCategory === "all") {
      return getEnabledAssets();
    } else {
      return getAssetsByCategory(activeCategory);
    }
  }, [searchQuery, activeCategory]);

  // Group assets by category for display
  const assetsByCategory = useMemo(() => {
    const groups: Record<string, AssetMetadata[]> = {};
    assets.forEach((asset) => {
      if (!groups[asset.category]) {
        groups[asset.category] = [];
      }
      groups[asset.category].push(asset);
    });
    return groups;
  }, [assets]);

  const handleAssetSelect = (asset: AssetMetadata) => {
    onSelect(asset);
  };

  const CardComponent = variant === "compact" ? AssetCardCompact : AssetCard;

  return (
    <div className={className}>
      {/* Search Bar */}
      {showSearch && (
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by name or symbol (e.g., 'Bitcoin' or 'BTC')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            aria-label="Search assets"
          />
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {assets.length} asset{assets.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* Category Tabs */}
      {showCategories && !searchQuery && (
        <Tabs
          value={activeCategory}
          onValueChange={(value) =>
            setActiveCategory(value as typeof activeCategory)
          }
          className="mb-6"
        >
          <TabsList className="w-full justify-start flex-wrap h-auto">
            <TabsTrigger value="all">All Assets</TabsTrigger>
            <TabsTrigger value="popular">
              Popular
              <Badge variant="secondary" className="ml-2">
                {getPopularAssets().length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="layer1">Layer 1</TabsTrigger>
            <TabsTrigger value="stablecoin">Stablecoins</TabsTrigger>
            <TabsTrigger value="defi">DeFi</TabsTrigger>
            <TabsTrigger value="layer2">Layer 2</TabsTrigger>
            <TabsTrigger value="meme">Meme</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Asset Grid/List */}
      {assets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No assets found matching &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-blue-600 hover:underline mt-2"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div
          className={
            variant === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {assets.map((asset) => (
            <CardComponent
              key={`${asset.symbol}-${asset.network}`}
              asset={asset}
              selected={selectedAsset === asset.symbol}
              onSelect={handleAssetSelect}
            />
          ))}
        </div>
      )}

      {/* Asset Count */}
      {!searchQuery && assets.length > 0 && (
        <p className="text-sm text-muted-foreground mt-6 text-center">
          Showing {assets.length}{" "}
          {activeCategory === "all"
            ? ""
            : CATEGORY_INFO[
                activeCategory as AssetCategory
              ]?.name.toLowerCase() || ""}{" "}
          asset{assets.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

/**
 * Asset selector with modal-style presentation
 */
export function AssetSelectorModal({
  selectedAsset,
  onSelect,
  onClose,
}: AssetSelectorProps & { onClose?: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Select Asset to Donate</h2>
            <p className="text-muted-foreground mt-1">
              Choose which cryptocurrency you&apos;d like to contribute
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AssetSelector
            selectedAsset={selectedAsset}
            onSelect={(asset) => {
              onSelect(asset);
              onClose?.();
            }}
            variant="grid"
          />
        </div>
      </div>
    </div>
  );
}
```

**Validation**:

```bash
npx tsc --noEmit
```

**Expected Output**: No TypeScript errors

---

### Step 4: Add Missing shadcn/ui Components

**Action**: Install any missing shadcn/ui components

**Commands**:

```bash
cd robinhood-offramp

# Add Tabs component if not present
npx shadcn@latest add tabs

# Verify Badge component exists
# (should already exist based on project structure)
```

**Validation**:

```bash
ls components/ui/tabs.tsx
ls components/ui/badge.tsx
```

**Expected Output**: Files exist

---

### Step 5: Create Placeholder Icons Directory

**Action**: Create directory structure for asset icons

**Commands**:

```bash
cd robinhood-offramp
mkdir -p public/assets/crypto-icons
```

**Note**: Actual icon files will be added later or loaded from CDN

---

### Step 6: Create Asset Selector Stories/Examples

**File**: `robinhood-offramp/components/asset-selector-example.tsx` (NEW)

**Action**: Create example usage for testing

**Code**:

```typescript
"use client";

import { useState } from "react";
import { AssetMetadata } from "@/types/robinhood";
import { AssetSelector } from "./asset-selector";
import { Button } from "./ui/button";

/**
 * Example usage of AssetSelector component
 * Use this for development and testing
 */
export function AssetSelectorExample() {
  const [selectedAsset, setSelectedAsset] = useState<AssetMetadata | null>(
    null
  );

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Asset Selector Examples</h1>

      {/* Selected Asset Display */}
      {selectedAsset && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold mb-2">Selected Asset:</h2>
          <p className="font-mono">
            {selectedAsset.symbol} - {selectedAsset.name} (
            {selectedAsset.network})
          </p>
          <Button
            onClick={() => setSelectedAsset(null)}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Grid Variant */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Grid Layout (Default)</h2>
        <AssetSelector
          selectedAsset={selectedAsset?.symbol}
          onSelect={setSelectedAsset}
          variant="grid"
        />
      </section>

      {/* List Variant */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">List Layout</h2>
        <AssetSelector
          selectedAsset={selectedAsset?.symbol}
          onSelect={setSelectedAsset}
          variant="list"
        />
      </section>

      {/* Compact Variant */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Compact Layout</h2>
        <div className="max-w-md">
          <AssetSelector
            selectedAsset={selectedAsset?.symbol}
            onSelect={setSelectedAsset}
            variant="compact"
          />
        </div>
      </section>
    </div>
  );
}
```

**Validation**: Add to a test page to visually verify

---

## Deliverables Checklist

- [ ] Asset icon component created: `components/asset-icon.tsx`

  - [ ] Main `AssetIcon` component
  - [ ] `AssetIconSmall` variant
  - [ ] `AssetIconLarge` variant
  - [ ] Fallback to text on image error

- [ ] Asset card component created: `components/asset-card.tsx`

  - [ ] Full `AssetCard` component
  - [ ] `AssetCardCompact` variant
  - [ ] Selection state visual feedback
  - [ ] Keyboard navigation support
  - [ ] Accessibility attributes

- [ ] Asset selector component created: `components/asset-selector.tsx`

  - [ ] Main `AssetSelector` component
  - [ ] Search functionality
  - [ ] Category filtering
  - [ ] Grid/list/compact layouts
  - [ ] `AssetSelectorModal` variant

- [ ] shadcn/ui components installed

  - [ ] Tabs component
  - [ ] Badge component
  - [ ] Card component

- [ ] Icon directory created: `public/assets/crypto-icons/`

- [ ] Example component created for testing

- [ ] All TypeScript compilation succeeds

---

## Validation Steps

### 1. TypeScript Compilation

```bash
cd robinhood-offramp
npx tsc --noEmit
```

**Expected**: Exit code 0, no errors

### 2. Component Import Test

```bash
npx tsx -e "
  import { AssetSelector } from './components/asset-selector';
  import { AssetCard } from './components/asset-card';
  import { AssetIcon } from './components/asset-icon';
  console.log('✅ All components import successfully');
"
```

**Expected**: "✅ All components import successfully"

### 3. Visual Testing (Manual)

Create a test page: `app/test-asset-selector/page.tsx`

```typescript
import { AssetSelectorExample } from "@/components/asset-selector-example";

export default function TestPage() {
  return <AssetSelectorExample />;
}
```

Start dev server and visit: `http://localhost:3030/test-asset-selector`

**Verify**:

- [ ] Assets display in grid
- [ ] Search works
- [ ] Category tabs work
- [ ] Asset selection shows visual feedback
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Mobile responsive (resize browser)

### 4. Accessibility Audit

Use browser DevTools or axe DevTools:

```
Run accessibility audit on test page
```

**Expected**: Score > 95, no critical issues

### 5. Mobile Responsiveness

Test at these viewport sizes:

- 375px (mobile)
- 768px (tablet)
- 1024px (desktop)

**Expected**: Layout adapts appropriately

---

## Backward Compatibility Checkpoint

**Purpose**: Ensure UI components don't break existing pages

### Commands

```bash
cd robinhood-offramp

# 1. TypeScript compilation
npx tsc --noEmit

# 2. Start dev server
npm run dev

# 3. Visit existing pages
# - http://localhost:3030/dashboard
# - http://localhost:3030/callback
```

### Success Criteria

- ✅ TypeScript compiles with no errors
- ✅ Dev server starts successfully
- ✅ Existing dashboard page loads
- ✅ No console errors
- ✅ No visual regressions on existing pages
- ✅ New components are isolated (don't affect existing UI)

### If Checkpoint Fails

1. **Import Errors**:

   - Check for missing 'use client' directives
   - Verify import paths are correct
   - Check for circular dependencies

2. **Styling Issues**:

   - Ensure Tailwind classes don't conflict
   - Check CSS specificity
   - Verify shadcn/ui components styled correctly

3. **Runtime Errors**:
   - Check browser console for errors
   - Verify all hooks used correctly
   - Check for missing dependencies

### Rollback Procedure

```bash
git checkout robinhood-offramp/components/asset-icon.tsx
git checkout robinhood-offramp/components/asset-card.tsx
git checkout robinhood-offramp/components/asset-selector.tsx
git checkout robinhood-offramp/components/asset-selector-example.tsx
```

---

## Common Issues and Solutions

### Issue 1: Missing 'use client' Directive

**Symptom**: Error about using hooks in server component

**Solution**:

- Add `'use client';` to top of component files
- Verify in: `asset-card.tsx`, `asset-selector.tsx`

### Issue 2: Image Loading Errors

**Symptom**: Icons don't load, errors in console

**Solution**:

- This is expected until icons are added
- Fallback to text symbols should work
- Verify fallback UI displays correctly

### Issue 3: Tabs Component Not Found

**Symptom**: `Cannot find module '@/components/ui/tabs'`

**Solution**:

```bash
npx shadcn@latest add tabs
```

### Issue 4: Layout Issues on Mobile

**Symptom**: Cards too small or grid doesn't respond

**Solution**:

- Check Tailwind responsive classes: `md:grid-cols-2 lg:grid-cols-3`
- Test with browser DevTools device emulation
- Adjust grid columns if needed

### Issue 5: Search Performance Issues

**Symptom**: Slow when typing in search

**Solution**:

- Already using `useMemo` for filtering
- If still slow, add debouncing:

```typescript
const [debouncedQuery] = useDebounce(searchQuery, 300);
```

---

## Integration Points

### Receives from Sub-Plan 1

- ✅ Asset metadata structure
- ✅ Helper functions for filtering
- ✅ Category definitions

### Provides to Sub-Plan 3 (Dashboard Integration)

- ✅ `AssetSelector` component ready to use
- ✅ `onSelect` callback for asset selection
- ✅ Multiple layout variants available
- ✅ Fully accessible and keyboard navigable

### Provides to Sub-Plan 4 (URL Builder)

- ✅ Selected asset data structure
- ✅ Asset validation before URL generation

---

## Next Steps

After completing this sub-plan:

1. ✅ **Verify all deliverables** complete
2. ✅ **Run all validation steps** successfully
3. ✅ **Test on multiple devices/browsers**
4. ✅ **Run accessibility audit**
5. ✅ **Commit changes** with descriptive message
6. ⏭️ **Proceed to Sub-Plan 3**: Dashboard Integration
7. 📝 **Create completion log**: `implementation-logs/YYYYMMDD-HHMM-SP2-COMPLETE.md`

---

## Time Breakdown

- Step 1 (Asset Icon): 45 minutes
- Step 2 (Asset Card): 60 minutes
- Step 3 (Asset Selector): 90 minutes
- Step 4 (shadcn Components): 15 minutes
- Step 5 (Icon Directory): 5 minutes
- Step 6 (Examples): 30 minutes
- Testing & Validation: 60 minutes
- Accessibility & Mobile Testing: 45 minutes

**Total**: ~6 hours

---

**Status**: ⏸️ Ready to begin (after Sub-Plan 1)
**Last Updated**: October 22, 2025
