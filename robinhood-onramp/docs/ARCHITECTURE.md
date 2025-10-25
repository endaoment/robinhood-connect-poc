# Robinhood Connect Architecture

This document describes the current implementation of the Robinhood Connect onramp integration.

## Overview

This integration allows users to transfer cryptocurrency from Robinhood to external wallets using the Robinhood Connect API.

**Key Points**:

- **Onramp Only**: This integration handles onramp (deposits to external wallets) only
- **Asset Pre-Selection**: Users must select asset before initiating transfer
- **Daffy-Style Flow**: Uses the proven Daffy-style URL generation approach
- **No Offramp**: Offramp (withdrawals from external wallets) is a separate API and not supported

---

## Architecture Components

### 1. Frontend Components

#### Dashboard (`app/(routes)/dashboard/page.tsx`)

- Displays asset selector with search functionality
- User selects cryptocurrency (ETH, SOL, USDC, etc.)
- Initiates transfer with selected asset
- Shows success toast after transfer completion

**Key Component**: Asset selection with dropdown search and filtering

#### Callback (`app/(routes)/callback/page.tsx`)

- Receives redirect from Robinhood after transfer completion
- Displays transfer success message
- Shows transaction details (asset, network, amount, orderId)
- Stores order details in localStorage for dashboard display

### 2. API Routes

#### Generate Onramp URL (`app/api/robinhood/generate-onramp-url/route.ts`)

- Calls Robinhood Connect ID API
- Generates Robinhood Connect URL with pre-selected asset
- Returns URL and connectId to frontend

**Flow**:

1. Receives `selectedAsset` and `selectedNetwork` from frontend
2. Validates asset and network compatibility
3. Calls `POST /catpay/v1/connect_id/` to get valid connectId from Robinhood
4. Retrieves wallet address for selected network
5. Builds URL using `buildDaffyStyleOnrampUrl()`
6. Returns URL and connectId to frontend

**Critical**: The connectId MUST be obtained from Robinhood API, not generated locally with UUID.

### 3. URL Builder (`lib/robinhood-url-builder.ts`)

**Function**: `buildDaffyStyleOnrampUrl(connectId, asset, network, walletAddress)`

Builds the Robinhood Connect URL with these key parameters:

- `applicationId`: Your Robinhood app ID
- `connectId`: Valid ID from Robinhood API (NOT a random UUID)
- `paymentMethod=crypto_balance`: Required for onramp
- `supportedAssets`: Single asset (e.g., 'ETH')
- `supportedNetworks`: Single network (e.g., 'ETHEREUM')
- `walletAddress`: Destination address from network addresses config
- `assetCode`: Asset being transferred (same as supportedAssets)
- `flow=transfer`: Required for callback to work
- `redirectUrl`: Encoded callback URL with transfer metadata

**Critical Implementation Details**:

- **Base URL**: `https://robinhood.com/connect/amount` (NOT `/applink/connect`)
- **Connect ID Source**: Must come from `/catpay/v1/connect_id/` API
- **Single Asset**: Only one asset can be pre-selected per URL
- **Single Network**: Only one network can be specified per URL

### 4. Configuration

#### Asset Metadata (`lib/robinhood-asset-metadata.ts`)

- Complete asset metadata (names, symbols, icons, networks)
- Asset search and filtering functionality
- Enabled/disabled asset flags
- ~120 supported assets across 20 networks

#### Network Addresses (`lib/network-addresses.ts`)

- Wallet addresses for each supported network
- Organized by network type (EVM, Bitcoin-like, memo-required)
- Includes memo/destination tag for networks that require them
- Supports 19 networks (TON pending address)

#### Asset Addresses (`lib/robinhood-asset-addresses.ts`)

- Maps assets to their specific network addresses
- Helper functions for getting addresses by asset
- Validation of asset/network compatibility

---

## Data Flow

### Complete Transfer Flow

1. **User Selection**:

   - User visits dashboard
   - Searches or selects asset from list (e.g., ETH, SOL, USDC)
   - System determines compatible network for asset
   - User clicks "Initiate Transfer"

2. **URL Generation**:

   - Frontend calls `/api/robinhood/generate-onramp-url`
   - Sends: `{ selectedAsset: "ETH", selectedNetwork: "ETHEREUM" }`
   - Backend validates asset/network compatibility
   - Backend calls Robinhood: `POST /catpay/v1/connect_id/`
   - Backend receives valid `connectId` from Robinhood
   - Backend retrieves wallet address for network
   - Backend builds URL with `buildDaffyStyleOnrampUrl()`
   - Backend returns URL to frontend: `{ url, connectId }`

3. **Robinhood Transfer**:

   - Frontend redirects browser to Robinhood Connect URL
   - User completes authentication in Robinhood
   - User confirms amount for the pre-selected asset
   - Robinhood processes the transfer
   - User completes the transfer

4. **Callback**:
   - Robinhood redirects to `/callback` with parameters:
     - `asset`: The transferred asset (e.g., "ETH")
     - `network`: The network used (e.g., "ETHEREUM")
     - `connectId`: The tracking ID
     - `timestamp`: When transfer completed
     - `orderId`: Robinhood's internal order ID
   - Callback page extracts parameters from URL
   - Stores order details in localStorage
   - Displays success message
   - User is redirected to dashboard
   - Dashboard shows success toast with transfer details

---

## Key Design Decisions

### Why Asset Pre-Selection?

Through testing 31 URL variations and consultation with Robinhood's team (Oct 23, 2025), we learned:

- Balance-first approach doesn't work reliably for external wallet transfers
- Asset must be pre-selected for onramp to work correctly
- This is a Robinhood API requirement, not a choice
- Users need to select what they want to transfer before initiating the flow

### Why No Order Status Polling?

The Order Status API (`/catpay/v1/external/order/`) is for offramp only. For onramp:

- All transfer data is available in the callback URL parameters
- No additional API calls needed after transfer
- Order status polling was removed Oct 23, 2025 after Robinhood clarification
- Simpler architecture without unnecessary polling

### Why Only Daffy-Style URL Builder?

Extensive testing showed:

- ❌ `buildOnrampUrl()` used wrong base URL - failed
- ❌ `buildMultiNetworkOnrampUrl()` balance-first approach - didn't work
- ✅ `buildDaffyStyleOnrampUrl()` with asset pre-selection - works perfectly

Only the working approach was kept. Deprecated builders were removed in Sub-Plan 2.

### Why No Offramp?

Offramp (withdrawals from external wallets to Robinhood) uses a completely different API:

- Different endpoints (`/redeem_deposit_address/` vs `/connect_id/`)
- Different parameters and flow
- Different use case (withdraw TO Robinhood vs transfer FROM Robinhood)
- Order status API only works for offramp

Mixing onramp and offramp code created confusion. All offramp code was removed in Sub-Plan 1 to focus exclusively on onramp.

---

## Important Notes

### ConnectId is Required

- **connectId**: Official Robinhood API term for the transfer tracking ID
- **Must be obtained**: Call `POST /catpay/v1/connect_id/` before building URL
- **Not a random UUID**: Do not generate UUIDs locally for production use
- **Used in callback**: Robinhood returns the connectId in callback parameters

### Base URL is Critical

**✅ Correct**: `https://robinhood.com/connect/amount`

**❌ Incorrect**: `https://robinhood.com/applink/connect`

The correct base URL is critical for the redirectUrl to work properly.

### Required Parameters

These parameters are REQUIRED for onramp to work:

- `applicationId` - Your Robinhood app ID
- `connectId` - From Robinhood API (not random UUID)
- `paymentMethod=crypto_balance` - Specifies transfer from Robinhood balance
- `supportedAssets` - Single asset code
- `supportedNetworks` - Single network
- `walletAddress` - Destination wallet address
- `flow=transfer` - Required for callback parameters
- `redirectUrl` - Where to send user after completion

### Supported Networks

**19 networks supported** (95% of Robinhood networks):

**EVM Networks (8)**:

- ETHEREUM, POLYGON, ARBITRUM, OPTIMISM, BASE, ZORA, AVALANCHE, ETHEREUM_CLASSIC

**Bitcoin-like (4)**:

- BITCOIN, BITCOIN_CASH, LITECOIN, DOGECOIN

**Other L1 (4)**:

- SOLANA, CARDANO, TEZOS, SUI

**Memo-Required (3)**:

- STELLAR (memo required), XRP (destination tag required), HEDERA (memo required)

**Pending (1)**:

- TONCOIN (address needed)

---

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

---

## Troubleshooting

### Transfer doesn't redirect back

**Cause**: Missing or incorrect `redirectUrl` parameter

**Solution**: Verify `redirectUrl` is properly encoded and includes protocol (https://)

### Robinhood shows error

**Possible Causes**:

1. Invalid or missing connectId
2. Wrong base URL
3. Missing required parameters

**Solution**:

- Verify you're calling `/catpay/v1/connect_id/` API first
- Check you're using `https://robinhood.com/connect/amount` base URL
- Validate all required parameters are present

### Callback receives no parameters

**Cause**: Missing `flow=transfer` parameter or wrong base URL

**Solution**: Ensure URL includes `&flow=transfer` and uses correct base URL

### Asset/network mismatch error

**Cause**: Selected asset not compatible with selected network

**Solution**: Use `isAssetNetworkCompatible()` to validate before generating URL

---

## Security Considerations

### API Key Protection

- API keys stored in environment variables only
- Never exposed to client-side code
- All Robinhood API calls made from backend routes
- Keys not logged or included in error messages

### Input Validation

- Asset codes validated against known list
- Network names validated against supported networks
- Wallet addresses validated per network type
- ConnectId validated as proper UUID v4 format

### URL Parameter Safety

- All URL parameters properly encoded
- No user input directly injected into URLs
- Wallet addresses validated before use

---

## Related Documentation

- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - How to test the integration
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development setup
- [USER_GUIDE.md](./USER_GUIDE.md) - User-facing documentation
- [FLOW-DIAGRAMS.md](./FLOW-DIAGRAMS.md) - Visual flow diagrams

---

## Historical Context

For historical context on implementation evolution, see:

- `.cursor/plans/robinhood-asset-preselection/` - Asset pre-selection feature planning
- `.cursor/plans/robinhood-legacy-cleanup/` - Code cleanup planning and implementation logs

### Why Order Status Was Removed

Previously, the callback page attempted to poll the Robinhood Order Status API to get transfer details. This was removed because:

1. The Order Status API (`/catpay/v1/external/order/`) only works for **offramp**, not onramp
2. It caused 404 errors and unnecessary polling/retries
3. All necessary data is already available in the callback URL parameters from Robinhood
4. Simpler architecture without polling improves reliability and performance

This change was made Oct 23, 2025 after clarification from Robinhood team.

---

**Last Updated**: October 24, 2025
**Current Version**: Asset Pre-Selection (working implementation)
**Sub-Plans Completed**: 1-4 (Offramp purge, deprecated builders removed, feature flags removed, ID consolidation)

