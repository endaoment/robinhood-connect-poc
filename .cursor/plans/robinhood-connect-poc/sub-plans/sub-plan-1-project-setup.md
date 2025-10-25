# Sub-Plan 1: Project Setup & Architecture

**Priority**: High (Foundation)  
**Estimated Complexity**: Medium  
**Dependencies**: None

## Context

This sub-plan establishes the foundation for the Robinhood Connect offramp integration by forking the existing coinbase-oauth directory and adapting it for Robinhood's stateless, app-linking architecture. As a result of completing this sub-plan, we'll have a clean project structure with proper environment variable setup and TypeScript definitions for Robinhood API integration.

## What This Sub-Plan Accomplishes

1. **Clean Project Foundation**: Fork coinbase-oauth to robinhood-offramp with Robinhood-specific configuration
2. **Environment Setup**: Configure API keys and remove Coinbase-specific variables
3. **Dependency Management**: Add required packages (uuid) and update project metadata
4. **TypeScript Foundation**: Create type definitions for all Robinhood API responses
5. **Architecture Preparation**: Set up file structure for stateless offramp flow

## Key Architectural Decisions

- **Gradual Migration**: Keep NextAuth temporarily to avoid breaking existing UI components
- **Stateless Design**: No user sessions or authentication on our side
- **Backend Security**: All API keys stored as environment variables, never exposed to client
- **UUID Tracking**: Use referenceId (UUID v4) as the primary order tracking mechanism

## Implementation Details

### Files to Create/Modify

#### New Directory Structure

```
robinhood-offramp/
├── app/
│   ├── api/
│   │   └── robinhood/          # New directory for Robinhood API routes
│   ├── callback/               # New directory for redirect handling
│   ├── dashboard/              # Existing (will modify in Sub-Plan 6)
│   ├── globals.css             # Existing
│   ├── layout.tsx              # Existing (will modify in Sub-Plan 6)
│   └── page.tsx                # Existing
├── components/
│   └── ui/                     # Existing shadcn/ui components
├── lib/
│   ├── robinhood-api.ts        # New API client functions
│   ├── robinhood-url-builder.ts # New URL generation utilities
│   └── utils.ts                # Existing
├── types/
│   └── robinhood.d.ts          # New TypeScript definitions
├── .env.local                  # Modified environment variables
├── package.json                # Modified dependencies
└── README.md                   # Updated project description
```

#### Environment Variables (`.env.local`)

```bash
# Robinhood Connect API Configuration
ROBINHOOD_APP_ID=your-app-id-from-robinhood-team
ROBINHOOD_API_KEY=your-api-key-from-robinhood-team

# Application Configuration
NEXTAUTH_URL=http://localhost:3030
NEXTAUTH_SECRET=your-nextauth-secret

# Note: NEXTAUTH variables will be removed in Sub-Plan 6
# Keeping them temporarily to avoid breaking existing components
```

#### TypeScript Definitions (`types/robinhood.d.ts`)

```typescript
// Robinhood Connect API Types

export interface RobinhoodOfframpParams {
  applicationId: string;
  offRamp: boolean;
  supportedNetworks: string;
  redirectUrl: string;
  referenceId: string;
  assetCode?: string;
  assetAmount?: string;
  fiatCode?: string;
  fiatAmount?: string;
}

export interface DepositAddressResponse {
  address: string;
  addressTag?: string;
  assetCode: string;
  assetAmount: string;
  networkCode: string;
}

export interface OrderStatusResponse {
  applicationId: string;
  connectId: string;
  assetCode: string;
  networkCode: string;
  fiatCode: string;
  fiatAmount: string;
  cryptoAmount: string;
  price: string;
  processingFee: PriceItem;
  paymentMethod: string;
  totalAmount: PriceItem;
  blockchainTransactionId?: string;
  destinationAddress: string;
  referenceID: string;
  status: OrderStatus;
}

export interface PriceItem {
  type: string;
  fiatAmount: string;
  cryptoQuantity: string;
}

export type OrderStatus =
  | "ORDER_STATUS_IN_PROGRESS"
  | "ORDER_STATUS_SUCCEEDED"
  | "ORDER_STATUS_FAILED";

export interface CallbackParams {
  assetCode: string;
  assetAmount: string;
  network: string;
}

export interface PriceQuoteResponse {
  assetCode: string;
  applicationId: string;
  fiatCode: string;
  fiatAmount: string;
  cryptoAmount: string;
  price: string;
  processingFee: PriceItem;
  totalAmount: PriceItem;
  partnerFee: PriceItem;
  paymentMethod: string;
  networkCode: string;
}

// Supported networks from Robinhood SDK
export type SupportedNetwork =
  | "AVALANCHE"
  | "BITCOIN"
  | "BITCOIN_CASH"
  | "LITECOIN"
  | "DOGECOIN"
  | "ETHEREUM"
  | "ETHEREUM_CLASSIC"
  | "POLYGON"
  | "SOLANA"
  | "STELLAR"
  | "TEZOS";

// Common asset codes
export type AssetCode =
  | "BTC"
  | "ETH"
  | "USDC"
  | "USDT"
  | "SOL"
  | "MATIC"
  | "LTC"
  | "DOGE"
  | "AVAX"
  | "ADA"
  | string; // Allow other asset codes
```

#### Package.json Updates

```json
{
  "name": "robinhood-offramp",
  "version": "0.1.0",
  "description": "Robinhood Connect offramp integration for crypto donations",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "next-auth": "^4.24.5",
    "uuid": "^9.0.1",
    "@types/uuid": "^9.0.7"
    // ... existing dependencies
  }
}
```

## Step-by-Step Instructions

### Step 1: Create New Repository in Endaoment Organization

```bash
# Navigate to the parent directory
cd /Users/rheeger/Code/endaoment

# Clone the existing coinbase-integration-poc repository
git clone https://github.com/endaoment/coinbase-integration-poc.git robinhood-connect-poc

# Navigate to the new directory
cd robinhood-connect-poc

# Remove the existing git history to start fresh
rm -rf .git

# Initialize new git repository
git init

# Create new repository on GitHub (using GitHub CLI)
# Note: This requires GitHub CLI (gh) to be installed and authenticated
gh repo create endaoment/robinhood-connect-poc --public --description "Robinhood Connect offramp integration for crypto donations"

# Add the new remote origin
git remote add origin https://github.com/endaoment/robinhood-connect-poc.git

# Copy the coinbase-oauth directory to robinhood-offramp
cp -r coinbase-oauth robinhood-offramp

# Remove the original coinbase-oauth directory (we only need robinhood-offramp)
rm -rf coinbase-oauth

# Copy the implementation plans into the new repository
mkdir -p .cursor/plans
cp -r /Users/rheeger/Code/endaoment/coinbase-integration-poc/.cursor/plans/robinhood-connect-poc .cursor/plans/

# Navigate to the main implementation directory
cd robinhood-offramp
```

**Alternative if GitHub CLI is not available:**

```bash
# Manual GitHub repository creation steps:
# 1. Go to https://github.com/endaoment
# 2. Click "New repository"
# 3. Name: robinhood-connect-poc
# 4. Description: "Robinhood Connect offramp integration for crypto donations"
# 5. Set to Public
# 6. Don't initialize with README (we'll push our own)
# 7. Create repository
# 8. Copy the git remote URL and use it below

git remote add origin https://github.com/endaoment/robinhood-connect-poc.git
```

### Step 2: Update Package Configuration

```bash
# Install additional dependencies
npm install uuid @types/uuid

# Update package.json metadata
# Manually edit package.json to change name and description
```

**Edit `package.json`:**

```json
{
  "name": "robinhood-offramp",
  "description": "Robinhood Connect offramp integration for crypto donations"
  // ... rest of configuration
}
```

### Step 3: Configure Environment Variables

**Create/Update `.env.local`:**

```bash
# Remove existing Coinbase variables
# Add Robinhood variables
ROBINHOOD_APP_ID=your-app-id-from-robinhood-team
ROBINHOOD_API_KEY=your-api-key-from-robinhood-team

# Keep NextAuth variables temporarily
NEXTAUTH_URL=http://localhost:3030
NEXTAUTH_SECRET=your-nextauth-secret
```

**Update `.env.example`:**

```bash
# Robinhood Connect Configuration
ROBINHOOD_APP_ID=
ROBINHOOD_API_KEY=

# Application Configuration
NEXTAUTH_URL=http://localhost:3030
NEXTAUTH_SECRET=
```

### Step 4: Create TypeScript Definitions

**Create `types/robinhood.d.ts`:**

```typescript
// Copy the complete TypeScript definitions from above
```

### Step 5: Create Directory Structure

```bash
# Create new directories for Robinhood-specific code
mkdir -p app/api/robinhood
mkdir -p app/callback
mkdir -p lib
```

### Step 6: Remove Coinbase-Specific Code

**Files to clean up:**

- Remove `app/api/auth/[...nextauth]/route.ts` (will recreate without Coinbase provider)
- Remove `app/api/coinbase/` directory entirely
- Keep existing UI components and utilities

**Update `app/api/auth/[...nextauth]/route.ts`:**

```typescript
import NextAuth, { type NextAuthOptions } from "next-auth";

// Minimal NextAuth configuration (temporary)
export const authOptions: NextAuthOptions = {
  providers: [], // No providers needed for Robinhood flow
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Step 7: Create Placeholder API Files

**Create `lib/robinhood-api.ts`:**

```typescript
// Placeholder for Robinhood API client functions
// Will be implemented in Sub-Plan 2

export async function redeemDepositAddress(referenceId: string) {
  // Implementation in Sub-Plan 2
  throw new Error("Not implemented yet");
}

export async function getOrderStatus(referenceId: string) {
  // Implementation in Sub-Plan 5
  throw new Error("Not implemented yet");
}

export async function getPriceQuote(assetCode: string, networkCode: string) {
  // Implementation in Sub-Plan 5
  throw new Error("Not implemented yet");
}
```

**Create `lib/robinhood-url-builder.ts`:**

```typescript
// Placeholder for URL generation utilities
// Will be implemented in Sub-Plan 3

import { v4 as uuidv4 } from "uuid";
import type { RobinhoodOfframpParams } from "@/types/robinhood";

export function generateReferenceId(): string {
  return uuidv4();
}

export function buildOfframpUrl(
  params: Partial<RobinhoodOfframpParams>
): string {
  // Implementation in Sub-Plan 3
  throw new Error("Not implemented yet");
}
```

### Step 8: Update Project README

**Update `README.md`:**

```markdown
# Robinhood Connect Offramp Integration

This project enables users to transfer crypto FROM their Robinhood accounts TO Endaoment using Robinhood Connect's offramp functionality.

## Quick Start

1. `cd robinhood-offramp`
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Robinhood API credentials
4. `npm run dev`

## Environment Variables

- `ROBINHOOD_APP_ID`: Application ID provided by Robinhood team
- `ROBINHOOD_API_KEY`: API key provided by Robinhood team

## User Flow

1. User visits dashboard
2. User clicks "Transfer from Robinhood"
3. User selects asset, amount, and network
4. System generates referenceId and opens Robinhood app
5. User completes transfer in Robinhood
6. System redeems deposit address and displays to user
7. User sends crypto to displayed address

## Architecture

This integration uses Robinhood's stateless offramp flow with app linking, unlike traditional OAuth-based integrations. No user authentication is required on our side.

## Security

All Robinhood API keys are stored as environment variables and used only on the backend. The client never has access to sensitive credentials.
```

### Step 9: Initial Git Commit and Push

```bash
# Navigate back to repository root
cd ..

# Create initial .gitignore (copy from coinbase-oauth)
cp robinhood-offramp/.gitignore .gitignore

# Create repository README.md
cat > README.md << 'EOF'
# Robinhood Connect Offramp Integration

This project enables users to transfer crypto FROM their Robinhood accounts TO Endaoment using Robinhood Connect's offramp functionality.

## Quick Start

1. `cd robinhood-offramp`
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Robinhood API credentials
4. `npm run dev`

## Implementation Plans

See `.cursor/plans/robinhood-connect-poc/` for detailed implementation documentation.

## Environment Variables

- `ROBINHOOD_APP_ID`: Application ID provided by Robinhood team
- `ROBINHOOD_API_KEY`: API key provided by Robinhood team

## User Flow

1. User visits dashboard
2. User clicks "Transfer from Robinhood"
3. User selects asset, amount, and network
4. System generates referenceId and opens Robinhood app
5. User completes transfer in Robinhood
6. System redeems deposit address and displays to user
7. User sends crypto to displayed address

## Architecture

This integration uses Robinhood's stateless offramp flow with app linking, unlike traditional OAuth-based integrations. No user authentication is required on our side.

## Security

All Robinhood API keys are stored as environment variables and used only on the backend. The client never has access to sensitive credentials.
EOF

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit: Robinhood Connect offramp integration

- Fork from coinbase-integration-poc
- Add robinhood-offramp implementation directory
- Include comprehensive implementation plans in .cursor/plans/
- Set up project structure for Robinhood Connect offramp flow
- Remove Coinbase-specific code and add Robinhood placeholders"

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 10: Verify Setup

```bash
# Navigate to implementation directory
cd robinhood-offramp

# Test that the project builds
npm run build

# Test that development server starts
npm run dev

# Verify TypeScript compilation
npx tsc --noEmit

# Verify git setup
git status
git remote -v
```

## Testing Checklist

### Git Repository Setup

- [ ] New repository created in Endaoment organization
- [ ] Repository cloned locally to `/Users/rheeger/Code/endaoment/robinhood-connect-poc`
- [ ] Git history reset and new repository initialized
- [ ] Remote origin set to `https://github.com/endaoment/robinhood-connect-poc.git`
- [ ] Implementation plans copied to `.cursor/plans/robinhood-connect-poc/`
- [ ] Initial commit created and pushed to main branch

### Build & Development

- [ ] `npm install` completes without errors (in robinhood-offramp directory)
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts development server
- [ ] Application loads at http://localhost:3030
- [ ] No TypeScript compilation errors

### Environment Configuration

- [ ] `.env.local` contains ROBINHOOD_APP_ID and ROBINHOOD_API_KEY
- [ ] Environment variables load correctly (check with `console.log(process.env.ROBINHOOD_APP_ID)` in API route)
- [ ] `.env.example` updated with new variables

### File Structure

- [ ] `types/robinhood.d.ts` exists with complete type definitions
- [ ] `lib/robinhood-api.ts` exists with placeholder functions
- [ ] `lib/robinhood-url-builder.ts` exists with UUID generation
- [ ] `app/api/robinhood/` directory created
- [ ] `app/callback/` directory created

### Code Quality

- [ ] TypeScript strict mode passes
- [ ] No linting errors
- [ ] All imports resolve correctly
- [ ] UUID library imports and works

## Edge Cases & Considerations

### Environment Variable Security

- **Never commit `.env.local`** to version control
- **Validate environment variables** are present before using
- **Use different API keys** for development and production

### TypeScript Integration

- **Import types correctly** using `import type` syntax
- **Extend types as needed** for additional Robinhood API responses
- **Maintain strict type checking** for better error catching

### Dependency Management

- **Pin UUID version** to avoid breaking changes
- **Keep existing dependencies** that are still needed
- **Remove unused dependencies** in future sub-plans

## Success Criteria

This sub-plan is complete when:

1. **Project builds successfully** with `npm run build`
2. **Development server runs** without errors
3. **Environment variables configured** for Robinhood API
4. **TypeScript definitions created** for all Robinhood API types
5. **Directory structure established** for future sub-plans
6. **Placeholder files created** with proper imports and exports
7. **README updated** with Robinhood-specific information
8. **No breaking changes** to existing UI components

## Next Steps

After completing this sub-plan:

1. **Sub-Plan 2**: Implement deposit address redemption API
2. **Sub-Plan 3**: Create offramp URL generation utilities
3. **Sub-Plan 4**: Build callback handling for Robinhood redirects

## Notes

- **Gradual migration approach**: Keeping NextAuth temporarily reduces risk
- **UUID library choice**: More compatible than crypto.randomUUID across environments
- **Type safety**: Strict TypeScript definitions prevent runtime errors
- **Security first**: API keys never exposed to client-side code
- **Existing components**: Can reuse shadcn/ui components without modification

## Common Issues & Solutions

### Issue: Environment Variables Not Loading

**Solution**: Restart development server after adding new environment variables

### Issue: TypeScript Import Errors

**Solution**: Ensure `types/robinhood.d.ts` is in TypeScript include path

### Issue: UUID Import Errors

**Solution**: Install both `uuid` and `@types/uuid` packages

### Issue: Build Failures

**Solution**: Check that all placeholder functions have proper return types and error handling
