# Sub-Plan 5: Order Status & Tracking

**Priority**: Medium (Monitoring)  
**Estimated Complexity**: Medium  
**Dependencies**: Sub-Plans 1-4 (Project Setup, Deposit Address API, URL Generation, Callback Handling)

## Context

This sub-plan implements order status tracking and monitoring functionality for Robinhood Connect offramp orders. After users receive their deposit address and send crypto, this system allows them to track the progress of their transfer until completion. As a result of completing this sub-plan, users will be able to monitor their transfers in real-time and receive confirmation when their crypto has been successfully processed by Robinhood.

## What This Sub-Plan Accomplishes

1. **Order Status API**: Backend API to fetch order status from Robinhood using referenceId
2. **Status Monitoring Component**: React component to display order status with real-time updates
3. **Polling Mechanism**: Automatic status polling with exponential backoff
4. **Status Visualization**: Clear visual indicators for different order states
5. **Transaction Details**: Display blockchain transaction hash and completion details

## Key Architectural Decisions

- **Polling Strategy**: Use exponential backoff to balance responsiveness with API rate limits
- **Status Caching**: Cache status responses to reduce API calls
- **Real-time Updates**: Automatic polling while order is in progress
- **Error Resilience**: Handle API failures gracefully with retry mechanisms

## Implementation Details

### Order Status States

From Robinhood SDK:

- `ORDER_STATUS_IN_PROGRESS`: Transfer is being processed
- `ORDER_STATUS_SUCCEEDED`: Transfer completed successfully
- `ORDER_STATUS_FAILED`: Transfer failed

### Files to Create/Modify

#### Create `app/api/robinhood/order-status/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getOrderStatus } from "@/lib/robinhood-api";

interface OrderStatusRequest {
  referenceId: string;
}

// Validate referenceId format (UUID v4)
function isValidReferenceId(referenceId: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(referenceId);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const referenceId = searchParams.get("referenceId");

    // Validate referenceId parameter
    if (!referenceId) {
      return NextResponse.json(
        {
          success: false,
          error: "referenceId parameter is required",
          code: "MISSING_REFERENCE_ID",
        },
        { status: 400 }
      );
    }

    // Validate referenceId format
    if (!isValidReferenceId(referenceId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid referenceId format. Must be a valid UUID v4.",
          code: "INVALID_REFERENCE_ID_FORMAT",
        },
        { status: 400 }
      );
    }

    // Fetch order status from Robinhood
    const orderStatus = await getOrderStatus(referenceId);

    return NextResponse.json({
      success: true,
      data: orderStatus,
    });
  } catch (error: any) {
    console.error("Error in order-status API:", error);

    // Handle specific error types
    if (error.code === "INVALID_REFERENCE_ID") {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found or referenceId expired",
          code: "ORDER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (error.code === "NETWORK_ERROR") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Network error communicating with Robinhood. Please try again.",
          code: "NETWORK_ERROR",
        },
        { status: 503 }
      );
    }

    // Generic error handling
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order status. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
```

#### Update `lib/robinhood-api.ts` with Order Status Function

```typescript
import type { OrderStatusResponse } from "@/types/robinhood";

// Add to existing robinhood-api.ts file

/**
 * Get order status from Robinhood using referenceId
 * @param referenceId - UUID v4 from offramp order
 * @returns Promise<OrderStatusResponse>
 */
export async function getOrderStatus(
  referenceId: string
): Promise<OrderStatusResponse> {
  validateEnvironmentVariables();

  const url = `https://api.robinhood.com/catpay/v1/external/order/?referenceId=${referenceId}`;

  try {
    console.log(`Fetching order status for referenceId: ${referenceId}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": process.env.ROBINHOOD_API_KEY!,
        "application-id": process.env.ROBINHOOD_APP_ID!,
      },
      // Ensure fresh request, no caching
      cache: "no-store",
    });

    console.log(
      `Robinhood order status API response status: ${response.status}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Robinhood order status API error:", errorData);

      // Handle specific HTTP status codes
      if (response.status === 404) {
        throw new RobinhoodAPIError(
          "Order not found or referenceId expired",
          "INVALID_REFERENCE_ID",
          404
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new RobinhoodAPIError(
          "Authentication failed. Check API credentials.",
          "AUTHENTICATION_ERROR",
          response.status
        );
      }

      if (response.status >= 500) {
        throw new RobinhoodAPIError(
          "Robinhood API server error. Please try again later.",
          "SERVER_ERROR",
          response.status
        );
      }

      // Generic API error
      const errorMessage =
        errorData.error || errorData.message || "Unknown API error";
      throw new RobinhoodAPIError(
        errorMessage,
        "ROBINHOOD_API_ERROR",
        response.status
      );
    }

    const responseData = await response.json();
    console.log("Robinhood order status API success:", responseData);

    // Validate response structure
    if (
      !responseData.status ||
      !responseData.assetCode ||
      !responseData.referenceID
    ) {
      throw new RobinhoodAPIError(
        "Invalid response format from Robinhood order status API",
        "INVALID_RESPONSE_FORMAT"
      );
    }

    return responseData;
  } catch (error: any) {
    // Re-throw RobinhoodAPIError instances
    if (error instanceof RobinhoodAPIError) {
      throw error;
    }

    // Handle network errors
    if (
      error.code === "ENOTFOUND" ||
      error.code === "ECONNREFUSED" ||
      error.name === "FetchError"
    ) {
      console.error("Network error calling Robinhood order status API:", error);
      throw new RobinhoodAPIError(
        "Network error communicating with Robinhood",
        "NETWORK_ERROR"
      );
    }

    // Handle timeout errors
    if (error.name === "AbortError" || error.code === "ETIMEDOUT") {
      console.error("Timeout error calling Robinhood order status API:", error);
      throw new RobinhoodAPIError(
        "Request timeout communicating with Robinhood",
        "TIMEOUT_ERROR"
      );
    }

    // Generic error handling
    console.error(
      "Unexpected error calling Robinhood order status API:",
      error
    );
    throw new RobinhoodAPIError(
      "Unexpected error communicating with Robinhood",
      "UNEXPECTED_ERROR"
    );
  }
}
```

#### Create `components/order-status.tsx`

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { OrderStatusResponse, OrderStatus } from "@/types/robinhood";

interface OrderStatusProps {
  referenceId: string;
  onStatusChange?: (status: OrderStatus) => void;
  autoRefresh?: boolean;
}

interface OrderStatusState {
  loading: boolean;
  error: string | null;
  orderStatus: OrderStatusResponse | null;
  lastUpdated: Date | null;
}

export function OrderStatusComponent({
  referenceId,
  onStatusChange,
  autoRefresh = true,
}: OrderStatusProps) {
  const { toast } = useToast();
  const [state, setState] = useState<OrderStatusState>({
    loading: true,
    error: null,
    orderStatus: null,
    lastUpdated: null,
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Fetch order status from API
  const fetchOrderStatus = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setState((prev) => ({ ...prev, loading: true, error: null }));
      }

      try {
        const response = await fetch(
          `/api/robinhood/order-status?referenceId=${referenceId}`
        );
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch order status");
        }

        const newStatus = result.data.status;
        const previousStatus = state.orderStatus?.status;

        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
          orderStatus: result.data,
          lastUpdated: new Date(),
        }));

        // Notify parent component of status change
        if (onStatusChange && newStatus !== previousStatus) {
          onStatusChange(newStatus);
        }

        // Show toast for status changes
        if (previousStatus && newStatus !== previousStatus) {
          if (newStatus === "ORDER_STATUS_SUCCEEDED") {
            toast({
              title: "Transfer Complete!",
              description:
                "Your crypto transfer has been successfully processed.",
            });
          } else if (newStatus === "ORDER_STATUS_FAILED") {
            toast({
              title: "Transfer Failed",
              description: "Your crypto transfer could not be completed.",
              variant: "destructive",
            });
          }
        }

        return result.data;
      } catch (error: any) {
        console.error("Failed to fetch order status:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to fetch order status",
        }));
        throw error;
      }
    },
    [referenceId, onStatusChange, state.orderStatus?.status, toast]
  );

  // Set up polling with exponential backoff
  const setupPolling = useCallback(() => {
    if (!autoRefresh || !state.orderStatus) return;

    // Don't poll if order is complete or failed
    if (
      state.orderStatus.status === "ORDER_STATUS_SUCCEEDED" ||
      state.orderStatus.status === "ORDER_STATUS_FAILED"
    ) {
      return;
    }

    // Clear existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Start with 5 second intervals, increase gradually
    let attempts = 0;
    const maxAttempts = 20; // Stop polling after 20 attempts

    const poll = async () => {
      try {
        await fetchOrderStatus(false); // Don't show loading spinner for polling
        attempts++;

        // Exponential backoff: 5s, 10s, 20s, 30s, 60s (max)
        const delay = Math.min(
          5000 * Math.pow(1.5, Math.floor(attempts / 3)),
          60000
        );

        if (attempts < maxAttempts) {
          const newInterval = setTimeout(poll, delay);
          setPollingInterval(newInterval);
        }
      } catch (error) {
        // Stop polling on persistent errors
        console.error("Polling stopped due to error:", error);
      }
    };

    // Start polling
    const initialInterval = setTimeout(poll, 5000);
    setPollingInterval(initialInterval);
  }, [autoRefresh, state.orderStatus, pollingInterval, fetchOrderStatus]);

  // Initial fetch and setup polling
  useEffect(() => {
    fetchOrderStatus();
  }, [referenceId]);

  // Setup polling when order status changes
  useEffect(() => {
    setupPolling();

    // Cleanup on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [setupPolling]);

  // Manual refresh
  const handleRefresh = () => {
    fetchOrderStatus();
  };

  // Copy transaction hash to clipboard
  const copyTransactionHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      toast({
        title: "Copied!",
        description: "Transaction hash copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the transaction hash",
        variant: "destructive",
      });
    }
  };

  // Get blockchain explorer URL
  const getExplorerUrl = (
    networkCode: string,
    txHash: string
  ): string | null => {
    const explorers: Record<string, string> = {
      ETHEREUM: `https://etherscan.io/tx/${txHash}`,
      POLYGON: `https://polygonscan.com/tx/${txHash}`,
      SOLANA: `https://solscan.io/tx/${txHash}`,
      BITCOIN: `https://blockstream.info/tx/${txHash}`,
      LITECOIN: `https://blockchair.com/litecoin/transaction/${txHash}`,
      DOGECOIN: `https://blockchair.com/dogecoin/transaction/${txHash}`,
    };

    return explorers[networkCode] || null;
  };

  // Get status display info
  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case "ORDER_STATUS_IN_PROGRESS":
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          label: "In Progress",
          description: "Your transfer is being processed",
          variant: "secondary" as const,
          color: "text-blue-600",
        };
      case "ORDER_STATUS_SUCCEEDED":
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
          label: "Completed",
          description: "Your transfer has been successfully processed",
          variant: "default" as const,
          color: "text-emerald-600",
        };
      case "ORDER_STATUS_FAILED":
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          label: "Failed",
          description: "Your transfer could not be completed",
          variant: "destructive" as const,
          color: "text-red-600",
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          label: "Unknown",
          description: "Status unknown",
          variant: "outline" as const,
          color: "text-gray-600",
        };
    }
  };

  if (state.loading && !state.orderStatus) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            <span>Loading order status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state.error && !state.orderStatus) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Status</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!state.orderStatus) {
    return null;
  }

  const statusInfo = getStatusInfo(state.orderStatus.status);
  const explorerUrl = state.orderStatus.blockchainTransactionId
    ? getExplorerUrl(
        state.orderStatus.networkCode,
        state.orderStatus.blockchainTransactionId
      )
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {statusInfo.icon}
            <div>
              <CardTitle className={statusInfo.color}>
                Transfer {statusInfo.label}
              </CardTitle>
              <CardDescription>{statusInfo.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={state.loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${state.loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Asset:</span>
            <div className="font-medium">{state.orderStatus.assetCode}</div>
          </div>
          <div>
            <span className="text-zinc-500">Amount:</span>
            <div className="font-medium">{state.orderStatus.cryptoAmount}</div>
          </div>
          <div>
            <span className="text-zinc-500">Network:</span>
            <div className="font-medium">{state.orderStatus.networkCode}</div>
          </div>
          <div>
            <span className="text-zinc-500">Value:</span>
            <div className="font-medium">
              ${parseFloat(state.orderStatus.fiatAmount).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Transaction Hash */}
        {state.orderStatus.blockchainTransactionId && (
          <div>
            <span className="text-sm text-zinc-500">Transaction Hash:</span>
            <div className="flex items-center space-x-2 mt-1">
              <code className="flex-1 bg-zinc-100 p-2 rounded text-xs font-mono break-all">
                {state.orderStatus.blockchainTransactionId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyTransactionHash(
                    state.orderStatus!.blockchainTransactionId!
                  )
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
              {explorerUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(explorerUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {state.lastUpdated && (
          <div className="text-xs text-zinc-500">
            Last updated: {state.lastUpdated.toLocaleTimeString()}
          </div>
        )}

        {/* Auto-refresh indicator */}
        {autoRefresh &&
          state.orderStatus.status === "ORDER_STATUS_IN_PROGRESS" && (
            <div className="text-xs text-zinc-500 flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Auto-refreshing every few seconds...</span>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
```

## Step-by-Step Instructions

### Step 1: Create Order Status API Route

```bash
# Create API route directory
mkdir -p app/api/robinhood/order-status

# Create the route file
# Copy implementation from above
```

### Step 2: Update Robinhood API Client

**Update `lib/robinhood-api.ts`:**

- Add the `getOrderStatus` function
- Ensure proper error handling and validation

### Step 3: Create Order Status Component

**Create `components/order-status.tsx`:**

- Copy the complete implementation from above
- Ensure all imports are correct

### Step 4: Test API Route

```bash
# Start development server
npm run dev

# Test order status API with a test referenceId
curl "http://localhost:3000/api/robinhood/order-status?referenceId=f2056f4c-93c7-422b-bd59-fbfb5b05b6ad"
```

### Step 5: Test Component Integration

**Create test page `app/test-order-status/page.tsx`:**

```typescript
"use client";

import { OrderStatusComponent } from "@/components/order-status";

export default function TestOrderStatusPage() {
  const testReferenceId = "f2056f4c-93c7-422b-bd59-fbfb5b05b6ad";

  return (
    <div className="container mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold mb-6">Order Status Test</h1>
      <OrderStatusComponent
        referenceId={testReferenceId}
        autoRefresh={true}
        onStatusChange={(status) => console.log("Status changed:", status)}
      />
    </div>
  );
}
```

### Step 6: Clean Up Test Files

```bash
# Remove test files after verification
rm -rf app/test-order-status
```

## Testing Checklist

### API Route Testing

- [ ] GET request with valid referenceId returns order status
- [ ] GET request with missing referenceId returns 400 error
- [ ] GET request with invalid referenceId format returns 400 error
- [ ] GET request with non-existent referenceId returns 404 error
- [ ] API handles network errors gracefully
- [ ] API handles Robinhood API errors gracefully

### Component Testing

- [ ] Component displays loading state initially
- [ ] Component displays order status correctly
- [ ] Component handles different status states (in progress, succeeded, failed)
- [ ] Auto-refresh polling works correctly
- [ ] Manual refresh button works
- [ ] Transaction hash copy functionality works
- [ ] External explorer links work

### Polling Mechanism

- [ ] Polling starts automatically for in-progress orders
- [ ] Polling stops for completed/failed orders
- [ ] Exponential backoff increases delay appropriately
- [ ] Polling handles API errors gracefully
- [ ] Polling stops after maximum attempts

### Error Handling

- [ ] Network errors display appropriate message
- [ ] API errors display appropriate message
- [ ] Invalid referenceId shows clear error
- [ ] Component recovers from temporary errors

## Edge Cases & Considerations

### Polling Strategy

- **Rate Limiting**: Robinhood may have API rate limits
- **Battery Usage**: Aggressive polling can drain mobile battery
- **Network Efficiency**: Balance responsiveness with network usage
- **Memory Leaks**: Ensure polling intervals are properly cleaned up

### Status Transitions

- **Race Conditions**: Handle rapid status changes
- **Stale Data**: Ensure fresh data on manual refresh
- **Notification Timing**: Don't spam users with status change notifications

### Error Recovery

- **Temporary Failures**: Distinguish between temporary and permanent failures
- **Retry Logic**: Implement appropriate retry mechanisms
- **User Feedback**: Provide clear feedback on error states

### Performance

- **Component Unmounting**: Clean up intervals when component unmounts
- **Multiple Instances**: Handle multiple order status components on same page
- **Background Tabs**: Consider pausing polling in background tabs

## Success Criteria

This sub-plan is complete when:

1. **API Route Functional**: `/api/robinhood/order-status` returns proper order status data
2. **Component Working**: OrderStatusComponent displays status correctly with auto-refresh
3. **Polling Implemented**: Exponential backoff polling for in-progress orders
4. **Status Visualization**: Clear visual indicators for all order states
5. **Transaction Details**: Display blockchain transaction hash with explorer links
6. **Error Handling**: Graceful handling of all error scenarios
7. **Performance Optimized**: Proper cleanup and memory management

## Next Steps

After completing this sub-plan:

1. **Sub-Plan 6**: Create dashboard UI that integrates order status tracking
2. **Sub-Plan 7**: Comprehensive testing and polish
3. **Integration**: Add order status to callback page for immediate tracking

## Notes

- **Real Testing**: Full testing requires actual orders from Robinhood flow
- **Polling Optimization**: Consider WebSocket connections for real-time updates in production
- **Caching**: Consider caching completed order statuses to reduce API calls
- **Analytics**: Track polling patterns and API usage for optimization

## Common Issues & Solutions

### Issue: Polling Not Stopping

**Solution**: Ensure proper cleanup in useEffect return function

### Issue: Too Many API Calls

**Solution**: Implement proper exponential backoff and maximum attempt limits

### Issue: Component Not Updating

**Solution**: Check that state updates are triggering re-renders correctly

### Issue: Memory Leaks

**Solution**: Clear all intervals and timeouts in component cleanup

### Issue: Stale Status Data

**Solution**: Implement proper cache invalidation and fresh data fetching

### Issue: Mobile Performance

**Solution**: Optimize polling frequency and pause polling when app is backgrounded
