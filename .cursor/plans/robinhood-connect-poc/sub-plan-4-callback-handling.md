# Sub-Plan 4: Callback Handling

**Priority**: High (Core Flow)  
**Estimated Complexity**: Medium  
**Dependencies**: Sub-Plans 1-3 (Project Setup, Deposit Address API, URL Generation)

## Context

This sub-plan implements the callback handling system that processes the redirect from Robinhood after users complete their offramp flow. This is the critical bridge that receives the user back from Robinhood, parses the callback parameters, triggers deposit address redemption, and displays the final deposit address to the user. As a result of completing this sub-plan, users will have a complete end-to-end flow from offramp initiation to receiving their deposit address.

## What This Sub-Plan Accomplishes

1. **Callback Page Creation**: Build the page that handles Robinhood redirects
2. **Parameter Parsing**: Extract and validate assetCode, assetAmount, and network from URL parameters
3. **Address Redemption Integration**: Automatically trigger deposit address redemption using the referenceId
4. **User Interface**: Display deposit address with copy functionality and clear instructions
5. **Error Handling**: Handle all failure scenarios gracefully with user-friendly messages

## Key Architectural Decisions

- **Server-Side Rendering**: Use Next.js page component for better SEO and initial load performance
- **Automatic Redemption**: Trigger address redemption immediately upon callback to minimize user wait time
- **Comprehensive Validation**: Validate all callback parameters before processing
- **User-Friendly Display**: Clear instructions and easy copy-to-clipboard functionality

## Implementation Details

### Callback URL Structure

**Expected Callback URL**: `http://localhost:3000/callback?assetCode=ETH&assetAmount=0.05&network=ETHEREUM`

**Parameters**:

- `assetCode`: The crypto asset selected (ETH, USDC, BTC, etc.)
- `assetAmount`: The amount user wants to transfer
- `network`: The blockchain network (ETHEREUM, POLYGON, SOLANA, etc.)

### Files to Create/Modify

#### Create `app/callback/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CallbackParams, DepositAddressResponse } from "@/types/robinhood";

interface CallbackState {
  loading: boolean;
  error: string | null;
  depositAddress: DepositAddressResponse | null;
  callbackParams: CallbackParams | null;
}

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [state, setState] = useState<CallbackState>({
    loading: true,
    error: null,
    depositAddress: null,
    callbackParams: null,
  });

  const [copied, setCopied] = useState(false);

  // Parse and validate callback parameters
  const parseCallbackParams = (): CallbackParams | null => {
    const assetCode = searchParams.get("assetCode");
    const assetAmount = searchParams.get("assetAmount");
    const network = searchParams.get("network");

    if (!assetCode || !assetAmount || !network) {
      return null;
    }

    // Validate parameter formats
    if (!/^[A-Z]{2,10}$/.test(assetCode)) {
      return null;
    }

    if (!/^\d+(\.\d+)?$/.test(assetAmount) || parseFloat(assetAmount) <= 0) {
      return null;
    }

    if (!/^[A-Z_]+$/.test(network)) {
      return null;
    }

    return { assetCode, assetAmount, network };
  };

  // Redeem deposit address using referenceId from localStorage
  const redeemDepositAddress = async (referenceId: string) => {
    try {
      const response = await fetch("/api/robinhood/redeem-deposit-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ referenceId }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to redeem deposit address");
      }

      return result.data;
    } catch (error: any) {
      console.error("Deposit address redemption failed:", error);
      throw new Error(error.message || "Failed to redeem deposit address");
    }
  };

  // Copy address to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Deposit address copied to clipboard",
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the address",
        variant: "destructive",
      });
    }
  };

  // Get blockchain explorer URL for the network
  const getExplorerUrl = (network: string, address: string): string | null => {
    const explorers: Record<string, string> = {
      ETHEREUM: `https://etherscan.io/address/${address}`,
      POLYGON: `https://polygonscan.com/address/${address}`,
      SOLANA: `https://solscan.io/account/${address}`,
      BITCOIN: `https://blockstream.info/address/${address}`,
      LITECOIN: `https://blockchair.com/litecoin/address/${address}`,
      DOGECOIN: `https://blockchair.com/dogecoin/address/${address}`,
    };

    return explorers[network] || null;
  };

  // Main effect to handle callback processing
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse callback parameters
        const callbackParams = parseCallbackParams();

        if (!callbackParams) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              "Invalid callback parameters. The redirect from Robinhood was incomplete or malformed.",
          }));
          return;
        }

        setState((prev) => ({ ...prev, callbackParams }));

        // Get referenceId from localStorage (set during URL generation)
        const referenceId = localStorage.getItem("robinhood_reference_id");

        if (!referenceId) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              "Missing reference ID. Please start the transfer process again.",
          }));
          return;
        }

        // Redeem deposit address
        const depositAddress = await redeemDepositAddress(referenceId);

        setState((prev) => ({
          ...prev,
          loading: false,
          depositAddress,
        }));

        // Clean up localStorage
        localStorage.removeItem("robinhood_reference_id");
      } catch (error: any) {
        console.error("Callback processing failed:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error.message ||
            "An unexpected error occurred while processing your transfer.",
        }));
      }
    };

    processCallback();
  }, [searchParams]);

  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  Processing your transfer...
                </h2>
                <p className="text-sm text-zinc-600 mt-2">
                  We're setting up your deposit address. This should only take a
                  moment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-600">Transfer Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (state.depositAddress && state.callbackParams) {
    const explorerUrl = getExplorerUrl(
      state.depositAddress.networkCode,
      state.depositAddress.address
    );

    return (
      <div className="min-h-screen bg-zinc-50 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
                <div>
                  <CardTitle className="text-emerald-600">
                    Transfer Ready!
                  </CardTitle>
                  <CardDescription>
                    Your deposit address has been generated. Complete your
                    transfer by sending crypto to this address.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Transfer Summary */}
              <div className="bg-zinc-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Transfer Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">Asset:</span>
                    <div className="font-medium">
                      {state.depositAddress.assetCode}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Amount:</span>
                    <div className="font-medium">
                      {state.depositAddress.assetAmount}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Network:</span>
                    <Badge variant="secondary">
                      {state.depositAddress.networkCode}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-zinc-500">Status:</span>
                    <Badge
                      variant="outline"
                      className="text-emerald-600 border-emerald-200"
                    >
                      Ready for Transfer
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Deposit Address */}
              <div>
                <h3 className="font-semibold mb-3">Deposit Address</h3>
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-500">
                      Send {state.depositAddress.assetCode} to this address:
                    </span>
                    {explorerUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(explorerUrl, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-zinc-100 p-3 rounded text-sm font-mono break-all">
                      {state.depositAddress.address}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(state.depositAddress!.address)
                      }
                      className="shrink-0"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Address Tag (for assets that require it) */}
                  {state.depositAddress.addressTag && (
                    <div className="mt-4">
                      <div className="text-sm text-zinc-500 mb-2">
                        Memo/Tag (Required):
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 bg-zinc-100 p-3 rounded text-sm font-mono">
                          {state.depositAddress.addressTag}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(state.depositAddress!.addressTag!)
                          }
                          className="shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Instructions</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div>
                    1.{" "}
                    <strong>Only send {state.depositAddress.assetCode}</strong>{" "}
                    to this address on the{" "}
                    <strong>{state.depositAddress.networkCode}</strong> network.
                  </div>
                  <div>
                    2.{" "}
                    <strong>
                      Send exactly {state.depositAddress.assetAmount}{" "}
                      {state.depositAddress.assetCode}
                    </strong>{" "}
                    as specified in your Robinhood transfer.
                  </div>
                  {state.depositAddress.addressTag && (
                    <div>
                      3. <strong>Include the memo/tag</strong> when sending the
                      transaction.
                    </div>
                  )}
                  <div>
                    4. The transfer may take several minutes to complete
                    depending on network congestion.
                  </div>
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1"
                >
                  View Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(state.depositAddress!.address)}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fallback (should not reach here)
  return null;
}
```

#### Create Loading Component `components/callback-loading.tsx`

```typescript
import { Card, CardContent } from "@/components/ui/card";

export function CallbackLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                Processing your transfer...
              </h2>
              <p className="text-sm text-zinc-600 mt-2">
                We're setting up your deposit address. This should only take a
                moment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Update `lib/robinhood-url-builder.ts` to Store ReferenceId

```typescript
// Add this function to store referenceId in localStorage
export function storeReferenceId(referenceId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("robinhood_reference_id", referenceId);
  }
}

// Update buildOfframpUrl to automatically store referenceId
export function buildOfframpUrl(params: OfframpUrlParams): OfframpUrlResult {
  // ... existing implementation ...

  const result = {
    url: url.toString(),
    referenceId,
    params: urlParams,
  };

  // Store referenceId for callback handling
  storeReferenceId(referenceId);

  return result;
}
```

## Step-by-Step Instructions

### Step 1: Create Callback Page

```bash
# Create callback directory
mkdir -p app/callback

# Create the page component
# Copy the complete implementation from above
```

### Step 2: Update URL Builder

**Update `lib/robinhood-url-builder.ts`:**

- Add the `storeReferenceId` function
- Modify `buildOfframpUrl` to store referenceId automatically

### Step 3: Test Callback Flow

**Create test URL with callback parameters:**

```
http://localhost:3000/callback?assetCode=ETH&assetAmount=0.05&network=ETHEREUM
```

**Test scenarios:**

1. Valid parameters with stored referenceId
2. Missing parameters
3. Invalid parameter formats
4. Missing referenceId in localStorage

### Step 4: Test Integration

```bash
# Start development server
npm run dev

# Test complete flow:
# 1. Generate offramp URL (stores referenceId)
# 2. Navigate to callback URL with parameters
# 3. Verify deposit address redemption
```

## Testing Checklist

### Parameter Parsing

- [ ] Valid callback parameters are parsed correctly
- [ ] Missing parameters trigger appropriate error
- [ ] Invalid assetCode format is rejected
- [ ] Invalid assetAmount format is rejected
- [ ] Invalid network format is rejected

### Deposit Address Redemption

- [ ] Successful redemption displays deposit address
- [ ] Missing referenceId shows appropriate error
- [ ] Invalid referenceId shows appropriate error
- [ ] API errors are handled gracefully
- [ ] Network errors are handled gracefully

### User Interface

- [ ] Loading state displays while processing
- [ ] Success state shows all transfer details
- [ ] Error state shows clear error message
- [ ] Copy to clipboard functionality works
- [ ] Navigation buttons work correctly

### LocalStorage Integration

- [ ] ReferenceId is stored during URL generation
- [ ] ReferenceId is retrieved during callback
- [ ] ReferenceId is cleaned up after use
- [ ] Missing referenceId is handled gracefully

## Edge Cases & Considerations

### URL Parameter Validation

- **Special Characters**: Handle URL-encoded special characters
- **Case Sensitivity**: Asset codes should be uppercase
- **Decimal Precision**: Handle various decimal formats for amounts
- **Unicode Characters**: Ensure proper handling of international characters

### LocalStorage Reliability

- **Browser Support**: LocalStorage may not be available in all environments
- **Storage Limits**: LocalStorage has size limits
- **Privacy Mode**: Some browsers disable localStorage in private mode
- **Cross-Tab Issues**: Multiple tabs may interfere with localStorage

### Network Reliability

- **API Timeouts**: Handle slow API responses
- **Retry Logic**: Consider retry mechanisms for failed redemptions
- **Offline Handling**: Handle offline scenarios gracefully

### Mobile Considerations

- **Viewport**: Ensure proper mobile viewport handling
- **Touch Interactions**: Optimize for touch interfaces
- **App Switching**: Handle returning from Robinhood app properly

## Success Criteria

This sub-plan is complete when:

1. **Callback Page Functional**: `/callback` page handles Robinhood redirects properly
2. **Parameter Parsing**: All callback parameters are validated and parsed correctly
3. **Address Redemption**: Deposit address redemption is triggered automatically
4. **User Interface**: Clear display of deposit address with copy functionality
5. **Error Handling**: All error scenarios display user-friendly messages
6. **LocalStorage Integration**: ReferenceId storage and retrieval works reliably
7. **Mobile Responsive**: Interface works well on mobile devices

## Next Steps

After completing this sub-plan:

1. **Sub-Plan 5**: Add order status tracking to monitor transfer completion
2. **Sub-Plan 6**: Create the dashboard UI that initiates the offramp flow
3. **Sub-Plan 7**: Comprehensive testing and polish

## Notes

- **LocalStorage Limitations**: Consider server-side storage for production use
- **Error Recovery**: Provide clear paths for users to retry failed operations
- **Security**: Never store sensitive data in localStorage
- **Analytics**: Consider tracking callback success/failure rates

## Common Issues & Solutions

### Issue: Parameters Not Parsing

**Solution**: Check URL encoding and parameter names match exactly

### Issue: ReferenceId Not Found

**Solution**: Ensure URL generation and callback happen in same browser session

### Issue: Copy to Clipboard Fails

**Solution**: Implement fallback for browsers that don't support clipboard API

### Issue: Mobile App Redirect Issues

**Solution**: Test universal link behavior on actual devices

### Issue: LocalStorage Not Available

**Solution**: Implement fallback storage mechanism or server-side session

### Issue: Long Addresses Not Displaying Well

**Solution**: Use proper CSS word-break and responsive design for long addresses
