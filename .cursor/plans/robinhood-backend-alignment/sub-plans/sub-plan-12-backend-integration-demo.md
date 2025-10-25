# Sub-Plan 12: Backend Integration Demonstration

**Status**: Pending
**Priority**: Medium
**Dependencies**: Sub-Plan 11 (API Route Refactoring)

> **Note**: This sub-plan uses the final `libs/` structure from SP9.5-9.6 and requires a working, compiled application (ensured by SP11).

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
