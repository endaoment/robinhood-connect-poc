# Sub-Plan 6: Dashboard & Offramp Flow UI

**Priority**: Medium (User Experience)  
**Estimated Complexity**: High  
**Dependencies**: Sub-Plans 1-5 (All previous sub-plans)

## Context

This sub-plan creates the complete user interface for the Robinhood Connect offramp integration, including the main dashboard, offramp initiation modal, and transaction history. This is where all previous sub-plans come together to create a seamless user experience. As a result of completing this sub-plan, users will have a polished, intuitive interface to initiate crypto transfers from Robinhood to Endaoment.

## What This Sub-Plan Accomplishes

1. **Dashboard Redesign**: Adapt the existing Coinbase dashboard for Robinhood Connect
2. **Offramp Modal**: Create a comprehensive modal for initiating transfers
3. **Asset & Network Selection**: User-friendly interface for choosing transfer parameters
4. **Price Quotes**: Real-time pricing display with fee breakdown
5. **Transaction History**: Track and display previous transfers
6. **Responsive Design**: Mobile-optimized interface for all screen sizes

## Key Architectural Decisions

- **Remove NextAuth Dependency**: Transition from session-based to stateless architecture
- **Reuse Existing Components**: Leverage shadcn/ui components from coinbase-oauth
- **Mobile-First Design**: Optimize for mobile since many users will return from Robinhood app
- **Progressive Enhancement**: Basic functionality works without JavaScript

## Implementation Details

### Files to Create/Modify

#### Update `app/dashboard/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, History, TrendingUp } from "lucide-react";
import { OfframpModal } from "@/components/offramp-modal";
import { TransactionHistory } from "@/components/transaction-history";

export default function Dashboard() {
  const [isOfframpModalOpen, setIsOfframpModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 p-4 sm:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">
            Crypto Donations Dashboard
          </h1>
          <p className="text-zinc-600 mt-2">
            Transfer crypto from your Robinhood account to support causes you
            care about
          </p>
        </div>

        {/* Main Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Transfer from Robinhood Card */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Transfer from Robinhood</CardTitle>
                  <CardDescription>
                    Use your existing Robinhood crypto to make donations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-800"
                    >
                      How it works
                    </Badge>
                  </div>
                  <ol className="text-sm text-emerald-700 space-y-1">
                    <li>1. Choose the crypto asset and amount to transfer</li>
                    <li>2. Open Robinhood app to confirm the transfer</li>
                    <li>
                      3. Receive deposit address and complete the transfer
                    </li>
                    <li>4. Track your donation until completion</li>
                  </ol>
                </div>

                <div className="flex items-center justify-between text-sm text-zinc-600">
                  <span>Supported assets: ETH, USDC, BTC, SOL, and more</span>
                  <Badge variant="outline">No fees from us</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setIsOfframpModalOpen(true)}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Start Transfer
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Your Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-zinc-900">$0.00</div>
                <div className="text-sm text-zinc-500">Total donated</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-700">0</div>
                <div className="text-sm text-zinc-500">Transfers completed</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowHistory(true)}
              >
                <History className="mr-2 h-4 w-4" />
                View History
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest crypto transfers and donations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-zinc-500">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transfers yet</p>
              <p className="text-sm">Your transfer history will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <OfframpModal
        isOpen={isOfframpModalOpen}
        onClose={() => setIsOfframpModalOpen(false)}
      />

      <TransactionHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
}
```

#### Create `components/offramp-modal.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ExternalLink, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  buildOfframpUrl,
  NETWORK_ASSET_MAP,
  getAssetsForNetwork,
} from "@/lib/robinhood-url-builder";
import type { SupportedNetwork, AssetCode } from "@/types/robinhood";

interface OfframpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PriceQuote {
  price: string;
  fiatAmount: string;
  processingFee: {
    fiatAmount: string;
  };
  totalAmount: {
    fiatAmount: string;
  };
}

export function OfframpModal({ isOpen, onClose }: OfframpModalProps) {
  const { toast } = useToast();

  // Form state
  const [selectedNetwork, setSelectedNetwork] =
    useState<SupportedNetwork>("ETHEREUM");
  const [selectedAsset, setSelectedAsset] = useState<AssetCode>("ETH");
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState<"crypto" | "fiat">("crypto");

  // UI state
  const [loading, setLoading] = useState(false);
  const [priceQuote, setPriceQuote] = useState<PriceQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNetwork("ETHEREUM");
      setSelectedAsset("ETH");
      setAmount("");
      setAmountType("crypto");
      setPriceQuote(null);
    }
  }, [isOpen]);

  // Update available assets when network changes
  useEffect(() => {
    const availableAssets = getAssetsForNetwork(selectedNetwork);
    if (
      availableAssets.length > 0 &&
      !availableAssets.includes(selectedAsset)
    ) {
      setSelectedAsset(availableAssets[0]);
    }
  }, [selectedNetwork, selectedAsset]);

  // Fetch price quote when parameters change
  useEffect(() => {
    if (selectedAsset && selectedNetwork && amount && parseFloat(amount) > 0) {
      fetchPriceQuote();
    } else {
      setPriceQuote(null);
    }
  }, [selectedAsset, selectedNetwork, amount, amountType]);

  const fetchPriceQuote = async () => {
    setQuoteLoading(true);
    try {
      // This would call the price quote API
      // For now, we'll simulate the response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockQuote: PriceQuote = {
        price: "2500.00",
        fiatAmount: (parseFloat(amount) * 2500).toFixed(2),
        processingFee: { fiatAmount: "0.00" },
        totalAmount: { fiatAmount: (parseFloat(amount) * 2500).toFixed(2) },
      };

      setPriceQuote(mockQuote);
    } catch (error) {
      console.error("Failed to fetch price quote:", error);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleStartTransfer = async () => {
    if (
      !selectedAsset ||
      !selectedNetwork ||
      !amount ||
      parseFloat(amount) <= 0
    ) {
      toast({
        title: "Invalid input",
        description:
          "Please select an asset, network, and enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate offramp URL
      const result = buildOfframpUrl({
        supportedNetworks: [selectedNetwork],
        assetCode: selectedAsset,
        assetAmount: amountType === "crypto" ? amount : undefined,
        fiatAmount: amountType === "fiat" ? amount : undefined,
        fiatCode: amountType === "fiat" ? "USD" : undefined,
      });

      // Store referenceId for callback handling (already done in buildOfframpUrl)
      console.log("Generated referenceId:", result.referenceId);

      // Open Robinhood Connect URL
      window.open(result.url, "_blank");

      // Close modal
      onClose();

      toast({
        title: "Opening Robinhood...",
        description:
          "Complete your transfer in the Robinhood app or web interface.",
      });
    } catch (error: any) {
      console.error("Failed to start transfer:", error);
      toast({
        title: "Transfer failed",
        description:
          error.message || "Failed to start transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableAssets = getAssetsForNetwork(selectedNetwork);
  const isValidAmount = amount && parseFloat(amount) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer from Robinhood</DialogTitle>
          <DialogDescription>
            Choose the crypto asset and amount you want to transfer from your
            Robinhood account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Network Selection */}
          <div className="grid gap-2">
            <Label htmlFor="network">Blockchain Network</Label>
            <Select
              value={selectedNetwork}
              onValueChange={(value) =>
                setSelectedNetwork(value as SupportedNetwork)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(NETWORK_ASSET_MAP).map((network) => (
                  <SelectItem key={network} value={network}>
                    {network}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asset Selection */}
          <div className="grid gap-2">
            <Label htmlFor="asset">Crypto Asset</Label>
            <Select
              value={selectedAsset}
              onValueChange={(value) => setSelectedAsset(value as AssetCode)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {availableAssets.map((asset) => (
                  <SelectItem key={asset} value={asset}>
                    {asset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex space-x-1">
                <Button
                  variant={amountType === "crypto" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmountType("crypto")}
                >
                  {selectedAsset}
                </Button>
                <Button
                  variant={amountType === "fiat" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmountType("fiat")}
                >
                  USD
                </Button>
              </div>
            </div>
            <Input
              id="amount"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount in ${
                amountType === "crypto" ? selectedAsset : "USD"
              }`}
              disabled={loading}
            />
          </div>

          {/* Price Quote */}
          {isValidAmount && (
            <Card>
              <CardContent className="pt-4">
                {quoteLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Getting price quote...</span>
                  </div>
                ) : priceQuote ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Estimated Value:</span>
                      <span className="font-medium">
                        ${priceQuote.fiatAmount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Fee:</span>
                      <span className="font-medium">
                        ${priceQuote.processingFee.fiatAmount}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total Value:</span>
                      <span>${priceQuote.totalAmount.fiatAmount}</span>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You'll complete the transfer in your Robinhood app or web
              interface. The exact amount and fees will be confirmed there.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleStartTransfer}
            disabled={loading || !isValidAmount}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening Robinhood...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Robinhood
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Create `components/transaction-history.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusComponent } from "@/components/order-status";
import { History, ExternalLink } from "lucide-react";

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Transaction {
  id: string;
  referenceId: string;
  assetCode: string;
  assetAmount: string;
  networkCode: string;
  status: string;
  createdAt: Date;
  completedAt?: Date;
}

export function TransactionHistory({
  isOpen,
  onClose,
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Load transaction history
  useEffect(() => {
    if (isOpen) {
      loadTransactionHistory();
    }
  }, [isOpen]);

  const loadTransactionHistory = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from your backend
      // For now, we'll load from localStorage or show empty state
      const stored = localStorage.getItem("robinhood_transactions");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTransactions(
          parsed.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          }))
        );
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to load transaction history:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ORDER_STATUS_IN_PROGRESS":
        return <Badge variant="secondary">In Progress</Badge>;
      case "ORDER_STATUS_SUCCEEDED":
        return (
          <Badge variant="default" className="bg-emerald-100 text-emerald-800">
            Completed
          </Badge>
        );
      case "ORDER_STATUS_FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (selectedTransaction) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Track the status of your crypto transfer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setSelectedTransaction(null)}
              className="mb-4"
            >
              ← Back to History
            </Button>

            <OrderStatusComponent
              referenceId={selectedTransaction.referenceId}
              autoRefresh={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Transaction History</DialogTitle>
          <DialogDescription>
            View all your crypto transfers from Robinhood
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
              <span className="ml-2">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No transactions yet</p>
              <p className="text-sm">Your transfer history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card
                  key={transaction.id}
                  className="cursor-pointer hover:bg-zinc-50"
                >
                  <CardContent
                    className="p-4"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-600 font-medium text-sm">
                            {transaction.assetCode}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {transaction.assetAmount} {transaction.assetCode}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {transaction.networkCode} •{" "}
                            {transaction.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(transaction.status)}
                        <ExternalLink className="h-4 w-4 text-zinc-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### Update `app/layout.tsx` (Remove NextAuth)

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Robinhood Connect - Crypto Donations",
  description:
    "Transfer crypto from Robinhood to support causes you care about",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Step-by-Step Instructions

### Step 1: Update Dashboard Page

**Replace `app/dashboard/page.tsx`:**

- Remove NextAuth dependencies
- Add Robinhood-specific content
- Integrate offramp modal

### Step 2: Create Offramp Modal

**Create `components/offramp-modal.tsx`:**

- Copy complete implementation from above
- Ensure all imports are correct
- Test asset/network selection logic

### Step 3: Create Transaction History

**Create `components/transaction-history.tsx`:**

- Copy complete implementation from above
- Integrate with OrderStatusComponent
- Add localStorage persistence

### Step 4: Update Root Layout

**Update `app/layout.tsx`:**

- Remove NextAuth providers
- Keep theme and toast providers
- Update metadata

### Step 5: Test Complete Flow

```bash
# Start development server
npm run dev

# Test complete user flow:
# 1. Visit dashboard
# 2. Click "Start Transfer"
# 3. Select asset, network, amount
# 4. Click "Open Robinhood"
# 5. Verify URL generation and storage
```

### Step 6: Test Responsive Design

**Test at different screen sizes:**

- Mobile (375px)
- Tablet (768px)
- Desktop (1024px+)

## Testing Checklist

### Dashboard Functionality

- [ ] Dashboard loads without NextAuth
- [ ] "Start Transfer" button opens offramp modal
- [ ] "View History" button opens transaction history
- [ ] Responsive layout works on all screen sizes

### Offramp Modal

- [ ] Network selection updates available assets
- [ ] Asset selection works correctly
- [ ] Amount input validates properly
- [ ] Price quotes display (when implemented)
- [ ] "Open Robinhood" generates correct URL
- [ ] Modal closes after successful URL generation

### Transaction History

- [ ] Empty state displays correctly
- [ ] Transaction list displays when data exists
- [ ] Clicking transaction opens order status
- [ ] Back navigation works correctly
- [ ] Status badges display correctly

### Integration Testing

- [ ] Complete flow from dashboard to callback works
- [ ] ReferenceId storage and retrieval works
- [ ] Order status tracking integrates correctly
- [ ] Error handling works throughout flow

## Edge Cases & Considerations

### Asset/Network Compatibility

- **Invalid Combinations**: Prevent selection of incompatible asset/network pairs
- **Dynamic Updates**: Update available options when selections change
- **Validation**: Validate selections before URL generation

### Amount Input Validation

- **Minimum Amounts**: Consider Robinhood's minimum transfer amounts
- **Maximum Amounts**: Handle maximum transfer limits
- **Decimal Precision**: Different assets have different decimal requirements
- **Currency Switching**: Handle switching between crypto and fiat amounts

### Mobile Experience

- **Touch Targets**: Ensure all interactive elements are touch-friendly
- **Keyboard Handling**: Optimize for mobile keyboards
- **App Switching**: Handle returning from Robinhood app smoothly
- **Viewport**: Ensure proper mobile viewport handling

### Error Handling

- **Network Failures**: Handle offline scenarios
- **Invalid Selections**: Prevent invalid form submissions
- **URL Generation Failures**: Handle API failures gracefully
- **Storage Failures**: Handle localStorage unavailability

## Success Criteria

This sub-plan is complete when:

1. **Dashboard Functional**: Dashboard loads and displays without NextAuth dependency
2. **Offramp Modal Working**: Complete asset/network/amount selection with URL generation
3. **Transaction History**: Display and track previous transfers with status updates
4. **Responsive Design**: Interface works well on mobile, tablet, and desktop
5. **Integration Complete**: All previous sub-plans integrate seamlessly
6. **Error Handling**: Graceful handling of all error scenarios
7. **User Experience**: Intuitive, polished interface that guides users through the flow

## Next Steps

After completing this sub-plan:

1. **Sub-Plan 7**: Comprehensive testing, security audit, and final polish
2. **Production Deployment**: Environment setup and deployment considerations
3. **User Testing**: Gather feedback and iterate on user experience

## Notes

- **NextAuth Removal**: This is a significant architectural change that affects the entire app
- **State Management**: Consider using React Context or state management library for complex state
- **Accessibility**: Ensure all components meet accessibility standards
- **Performance**: Optimize for mobile performance and slow networks

## Common Issues & Solutions

### Issue: NextAuth Removal Breaking Components

**Solution**: Systematically remove all NextAuth dependencies and replace with stateless alternatives

### Issue: Asset/Network Selection Not Working

**Solution**: Verify NETWORK_ASSET_MAP is properly imported and used

### Issue: Modal Not Opening Robinhood

**Solution**: Check popup blockers and ensure URL generation is working correctly

### Issue: Mobile Layout Issues

**Solution**: Test thoroughly on actual devices and adjust responsive breakpoints

### Issue: LocalStorage Not Persisting

**Solution**: Implement fallback storage mechanisms and handle storage failures

### Issue: Price Quotes Not Loading

**Solution**: Implement proper error handling and fallback displays for quote failures
