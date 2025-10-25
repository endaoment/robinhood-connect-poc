# Sub-Plan 12: Backend Integration Demonstration

**Status**: In Progress
**Priority**: Medium
**Dependencies**: Sub-Plan 11 (API Route Refactoring)

> **Note**: This sub-plan uses the final `libs/` structure from SP9.5-9.6 and requires a working, compiled application (ensured by SP11).

## Discovered Side-Quests

### ✅ Chain ID Mappers Refactor (2025-10-25)

**Trigger**: While preparing for callback page implementation, identified need for block explorer URL generation across all Robinhood networks.

**Implementation**: Created `libs/shared/src/lib/helpers/chain-id-mappers.ts` that:

- Mirrors backend's `chain-id-mappers.ts` structure exactly
- Adds support for all Robinhood networks (EVM + non-EVM)
- Preserves all existing backend functions (zero breaking changes)
- Adds new network-aware helper functions
- Includes comprehensive documentation for backend integration

**Value**:

- Backend team has clear migration path (only 6 lines to add for Zora + ETC support)
- POC can generate block explorer links for any network
- UI enhancement: Added globe icon in asset registry toast for one-click explorer access
- Demonstrates backend alignment in practice

**Log**: See [20251025-1618-CHAIN-ID-MAPPERS-REFACTOR.md](../implementation-logs/20251025-1618-CHAIN-ID-MAPPERS-REFACTOR.md)

**Impact on SP12**: Can now include block explorer links in callback success page and demonstrate proper network-to-explorer URL mapping.

---

## Context Required

**Files**: `app/callback/page.tsx` - Current callback handling

## Objectives

1. Update callback page to use PledgeService
2. Demonstrate complete flow with toasts
3. Show all backend API calls visually
4. Display created pledge structure
5. Demonstrate error handling

## Implementation

### Step 1: Update Callback Page

```typescript
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { pledgeService } from "@/libs/robinhood";
import { RobinhoodCallbackDto } from "@/libs/robinhood";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );

  useEffect(() => {
    async function handleCallback() {
      try {
        // Parse callback parameters
        const callbackData: RobinhoodCallbackDto = {
          asset: searchParams.get("asset") || "",
          network: searchParams.get("network") || "",
          connectId: searchParams.get("connectId") || "",
          orderId: searchParams.get("orderId") || "",
        } as RobinhoodCallbackDto;

        // Create pledge (shows toasts for all backend calls)
        const pledge = await pledgeService.createFromCallback(callbackData);

        setStatus("success");
      } catch (error) {
        console.error("Callback handling failed:", error);
        setStatus("error");
      }
    }

    handleCallback();
  }, [searchParams]);

  return (
    <div className="container mx-auto p-8">
      <h1>Processing Donation...</h1>
      {status === "processing" && <p>Creating pledge...</p>}
      {status === "success" && (
        <p>Success! Check toasts for backend API calls.</p>
      )}
      {status === "error" && <p>Error processing donation.</p>}
    </div>
  );
}
```

### Step 2: Test End-to-End Flow

1. Generate onramp URL
2. Simulate callback
3. Watch toasts demonstrate:
   - Token resolution query
   - Pledge creation INSERT
   - Discord notification
4. Verify pledge structure shown

## Deliverables

- [ ] Callback page updated
- [ ] Complete flow working
- [ ] All toasts showing
- [ ] Error handling tested
- [ ] User experience smooth

## Next Steps

**Proceed to** [Sub-Plan 13: Migration Guide](./sub-plan-13-migration-guide.md)
