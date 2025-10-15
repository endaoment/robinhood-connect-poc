# Robinhood Connect Offramp Integration - Implementation Plans

This directory contains detailed implementation plans for integrating Robinhood Connect offramp functionality, enabling users to transfer crypto FROM their Robinhood accounts TO Endaoment.

## 🎯 Target User Flow

### Primary Flow (MVP)

1. **User connects** with Robinhood Connect (no authentication needed on our side)
2. **User views** their Robinhood account crypto balances (in Robinhood app/web)
3. **User selects** a crypto balance to transfer
4. **User agrees** to transfer balance to Endaoment
5. **Balance arrives** in Endaoment's Robinhood account

### Bonus/Future Flow

6. **Market sell** received crypto for USD
7. **Convert** USD to USDC
8. **Send** USDC to Endaoment-owned wallet address

## 📋 Plan Structure

### Overview Document

- **[OVERVIEW.md](./OVERVIEW.md)** - Start here! Contains project context, architectural differences from Coinbase, and guidelines that apply to all sub-plans.

### Implementation Sub-Plans

Each sub-plan is self-contained and can be given to a fresh agent for implementation:

1. **[sub-plan-1-project-setup.md](./sub-plan-1-project-setup.md)**

   - **Priority**: High (Foundation)
   - **Focus**: Fork coinbase-oauth, environment setup, remove NextAuth
   - **Key Features**: Directory structure, API keys, TypeScript types
   - **Dependencies**: None

2. **[sub-plan-2-deposit-address-redemption.md](./sub-plan-2-deposit-address-redemption.md)**

   - **Priority**: High (Core API)
   - **Focus**: Backend API for redeeming deposit addresses
   - **Key Features**: `/api/robinhood/redeem-deposit-address` endpoint
   - **Dependencies**: Sub-Plan 1

3. **[sub-plan-3-offramp-url-generation.md](./sub-plan-3-offramp-url-generation.md)**

   - **Priority**: High (Core Flow)
   - **Focus**: Generate Robinhood Connect offramp URLs
   - **Key Features**: referenceId generation, URL building, universal links
   - **Dependencies**: Sub-Plan 1

4. **[sub-plan-4-callback-handling.md](./sub-plan-4-callback-handling.md)**

   - **Priority**: High (Core Flow)
   - **Focus**: Handle redirect from Robinhood, display deposit address
   - **Key Features**: Parse callback params, trigger redemption, UI display
   - **Dependencies**: Sub-Plans 1-3

5. **[sub-plan-5-order-tracking.md](./sub-plan-5-order-tracking.md)**

   - **Priority**: Medium (Monitoring)
   - **Focus**: Track order status and completion
   - **Key Features**: Order status API, polling, transaction details
   - **Dependencies**: Sub-Plans 1-4

6. **[sub-plan-6-dashboard-ui.md](./sub-plan-6-dashboard-ui.md)**

   - **Priority**: Medium (User Experience)
   - **Focus**: Dashboard and offramp initiation UI
   - **Key Features**: Transfer modal, asset selection, transaction history
   - **Dependencies**: Sub-Plans 1-5

7. **[sub-plan-7-testing-polish.md](./sub-plan-7-testing-polish.md)**
   - **Priority**: Medium (Quality)
   - **Focus**: Testing, security audit, documentation
   - **Key Features**: Manual testing checklist, error handling, deployment
   - **Dependencies**: Sub-Plans 1-6

## 🚀 Implementation Approach

### Sequential Implementation (Recommended)

Work through plans 1-7 in order. Each plan builds on the previous ones.

### Parallel Implementation

If multiple agents are working:

- **Phase 1** (Must be sequential): Sub-Plan 1
- **Phase 2** (Can be parallel): Sub-Plans 2, 3
- **Phase 3** (Can be parallel): Sub-Plans 4, 5, 6
- **Phase 4** (Must be sequential): Sub-Plan 7

### Checkpoint Approach

Complete and test each sub-plan before moving to the next:

1. Implement the sub-plan
2. Test the specific functionality
3. Verify integration with previous sub-plans
4. Move to next sub-plan

## 🔄 Key Architectural Differences from Coinbase

### Authentication Model

- **Coinbase**: OAuth 2.0 with NextAuth, session management, access/refresh tokens
- **Robinhood**: No authentication on our side, user authenticates in Robinhood app

### User Flow Pattern

- **Coinbase**: Login → Dashboard → Select asset → Confirm → Direct API transaction
- **Robinhood**: Dashboard → Generate referenceId → Link to Robinhood → Callback → Redeem address → User completes in Robinhood

### Balance Viewing

- **Coinbase**: API call with access token to fetch user accounts
- **Robinhood**: User views balances in Robinhood app, selects there

### Transaction Processing

- **Coinbase**: Direct API call from our backend using user's access token
- **Robinhood**: Redirect-based flow with deposit address redemption

## 🔧 Technical Requirements

### Repository Setup

- **New Repository**: `https://github.com/endaoment/robinhood-connect-poc`
- **Forked From**: `coinbase-integration-poc` repository
- **Implementation Directory**: `robinhood-offramp/` (main application code)
- **Documentation Directory**: `.cursor/plans/robinhood-connect-poc/` (this documentation)

### Environment Variables

```bash
ROBINHOOD_APP_ID=your-app-id-from-robinhood
ROBINHOOD_API_KEY=your-api-key-from-robinhood
NEXTAUTH_URL=http://localhost:3000  # Can be removed after NextAuth removal
NEXTAUTH_SECRET=your-secret         # Can be removed after NextAuth removal
```

### Key Dependencies

- Next.js 14+
- TypeScript
- Tailwind CSS
- uuid (for referenceId generation)
- Existing UI components from coinbase-oauth

### Robinhood API Endpoints

- **Deposit Address Redemption**: `POST https://api.robinhood.com/catpay/v1/redeem_deposit_address/`
- **Order Status**: `GET https://api.robinhood.com/catpay/v1/external/order/?referenceId=...`
- **Price Quotes**: `GET https://api.robinhood.com/catpay/v1/{assetCode}/quote/offramp`

## 📱 Supported Networks & Assets

### Networks

- ETHEREUM
- POLYGON
- SOLANA
- BITCOIN
- LITECOIN
- DOGECOIN
- AVALANCHE
- And more (see Robinhood SDK docs)

### Popular Assets

- ETH, USDC, USDT (Ethereum/Polygon)
- SOL, USDC (Solana)
- BTC, LTC, DOGE
- Full list: https://nummus.robinhood.com/currency_pairs/

## ✅ Success Criteria

The integration is considered complete when:

1. **User can initiate offramp** from dashboard
2. **referenceId is generated** securely on backend
3. **Robinhood app opens** via universal link (or web fallback)
4. **User completes selection** in Robinhood interface
5. **Callback is handled** correctly with parameter parsing
6. **Deposit address is redeemed** and displayed to user
7. **Order status can be tracked** until completion
8. **Error cases are handled** gracefully
9. **Security best practices** are followed (API keys on backend only)
10. **Manual testing** passes in Robinhood app

## 🧪 Testing Guidelines

### Manual Testing Flow

1. Start offramp from dashboard
2. Verify referenceId generation
3. Click link to open Robinhood
4. Complete flow in Robinhood app/web
5. Verify callback handling
6. Confirm deposit address display
7. Check order status updates
8. Verify transaction completion

### Key Test Scenarios

- **Happy path**: Complete offramp flow
- **Error handling**: Invalid referenceId, API failures
- **Mobile vs Desktop**: Universal link behavior
- **Network variations**: Different crypto networks
- **Amount variations**: Small and large transfers

## 📚 Additional Resources

### Design Standards

See [OVERVIEW.md](./OVERVIEW.md) for:

- Architecture patterns
- Security considerations
- API integration details
- Error handling strategies
- TypeScript type definitions

### File Structure

```
robinhood-offramp/
├── app/
│   ├── api/
│   │   └── robinhood/
│   │       ├── redeem-deposit-address/
│   │       │   └── route.ts
│   │       └── order-status/
│   │           └── route.ts
│   ├── callback/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
│   ├── offramp-modal.tsx
│   ├── order-status.tsx
│   └── ui/ (existing components)
├── lib/
│   ├── robinhood-api.ts
│   └── types.ts
└── types/
    └── robinhood.d.ts
```

## 🤝 Contributing

When implementing a sub-plan:

1. **Read OVERVIEW.md first** for context and architecture
2. **Follow the specific sub-plan** instructions step-by-step
3. **Test thoroughly** after each major change
4. **Verify security** (API keys never exposed to client)
5. **Check error handling** for edge cases
6. **Document any issues** or deviations in IMPLEMENTATION-LOG.md

## 📝 Notes

- Each sub-plan is designed to be given to a fresh AI agent
- Plans include full code examples and implementation details
- Testing checklists ensure nothing is missed
- Security considerations are highlighted throughout
- Focus is on offramp (Robinhood → Endaoment), not onramp

## 🎯 Quick Start

1. Read [OVERVIEW.md](./OVERVIEW.md)
2. Start with [sub-plan-1-project-setup.md](./sub-plan-1-project-setup.md)
3. Work through sub-plans sequentially
4. Test after each sub-plan
5. Finish with [sub-plan-7-testing-polish.md](./sub-plan-7-testing-polish.md)

---

**Last Updated**: January 14, 2025  
**Status**: Ready for implementation  
**Total Sub-Plans**: 7  
**Focus**: Offramp (Robinhood → Endaoment)
