# Naming Conventions

This document defines the naming conventions used throughout the robinhood-onramp codebase.

## Terminology

### User-Facing Terms

Use these terms in UI text, button labels, and user-facing messages:

- **Transfer**: The action of moving cryptocurrency from Robinhood to external wallet
- **Asset**: The cryptocurrency being transferred (e.g., ETH, USDC)
- **Network**: The blockchain network (e.g., Ethereum, Polygon)

Avoid: "onramp", "deposit" in user-facing text

### Technical Terms

Use these terms in code, APIs, and technical documentation:

- **Onramp**: The technical process/API for deposits to external wallets
- **ConnectId**: The Robinhood Connect ID for tracking transfers
- **Callback**: The redirect endpoint after transfer completion

### Deprecated Terms

DO NOT USE (removed from codebase):

- **Offramp**: Removed - separate Robinhood API not implemented
- **ReferenceId**: Deprecated - use `connectId` consistently
- **Order Status**: Removed - not applicable for onramp (offramp-only API)
- **Redemption API**: Removed - not used in current implementation

## File Naming

### Directories and Files

- Use `kebab-case` for directories: `my-directory/`
- Use `kebab-case` for utility files: `robinhood-url-builder.ts`
- Use `kebab-case` for components: `asset-selector.tsx`

### API Routes

- Use `kebab-case`: `generate-onramp-url/`
- Descriptive of action: `generate-X`, `fetch-X`, `create-X`

## Code Naming

### Variables

```typescript
// camelCase, descriptive
const selectedAsset = 'ETH'
const connectId = '123'

// Booleans: is/has/should prefix
const isLoading = false
const hasError = false
const shouldRedirect = true
```

### Functions

```typescript
// camelCase, verb-first
function generateOnrampUrl() {}
function handleAssetSelect() {}
function validateNetwork() {}

// Avoid abbreviations
function generateURL() {} // ❌ Bad
function generateUrl() {} // ✅ Good
```

### Components

```typescript
// PascalCase or kebab-case file names
// PascalCase for component names
export function AssetSelector() {}
export function TransactionHistory() {}

// Descriptive, not generic
export function Component() {} // ❌ Bad
export function AssetCard() {} // ✅ Good
```

### Types and Interfaces

```typescript
// PascalCase
interface OnrampURLResponse {}
type AssetConfig = {}

// Descriptive
interface Params {} // ❌ Too generic
interface OnrampParams {} // ✅ Better
interface DaffyStyleOnrampParams {} // ✅ Best - context included
```

### Constants

```typescript
// UPPER_SNAKE_CASE for true constants
const API_BASE_URL = 'https://...'
const MAX_RETRIES = 3

// camelCase for configuration objects
const assetConfig = {}
```

## UI Text Conventions

### Button Labels

- "Initiate Transfer" (not "Start Onramp" or "Begin Deposit")
- "Select Asset" (not "Choose Crypto")
- "Confirm" / "Cancel" (standard)

### Messages

- Success: "Transfer completed successfully"
- Error: "Transfer failed: [reason]"
- Loading: "Initiating transfer..."

### Consistent Capitalization

- Title Case for headings: "Select Your Asset"
- Sentence case for descriptions: "Choose the cryptocurrency you want to transfer"

## API Naming

### Endpoints

```
POST /api/robinhood/generate-onramp-url
```

### Request/Response Fields

```typescript
// Request
{
  selectedAsset: 'ETH',
  selectedNetwork: 'ETHEREUM'
}

// Response
{
  url: 'https://...',
  connectId: '...'
}
```

## Comments

### Function Comments

```typescript
/**
 * Generates a Robinhood Connect onramp URL.
 *
 * @param connectId - The Connect ID from Robinhood API
 * @param selectedAsset - Asset to transfer (e.g., 'ETH')
 * @param selectedNetwork - Network to use (e.g., 'ETHEREUM')
 * @returns The complete Robinhood Connect URL
 */
```

### Inline Comments

```typescript
// Fetch connectId from Robinhood API
const response = await fetch(ROBINHOOD_API_URL)

// Not:
// Get ID from RH  ❌ (too abbreviated)
```

## Examples

### Good Naming ✅

```typescript
const selectedAsset = 'ETH'
const isLoading = false

function handleAssetSelect(asset: string) {
  generateOnrampUrl(connectId, asset, selectedNetwork)
}

interface OnrampURLResponse {
  url: string
  connectId: string
}
```

### Bad Naming ❌

```typescript
const sa = 'ETH' // Too abbreviated
const loading = false // Should be isLoading

function select(a: string) {
  // Unclear, abbreviated
  getURL(id, a, n) // All unclear
}

interface Res {
  // Too generic
  url: string
  id: string
}
```

## Architecture-Specific Patterns

### Onramp vs Offramp

**Critical**: This codebase implements **onramp only** (deposits to external wallets).

- **Use "onramp"** in technical code and API names
- **Use "transfer"** in user-facing text
- **Never use "offramp"** - it's a separate Robinhood API not implemented here

### ID System

**Use `connectId` consistently** throughout the codebase:

```typescript
// ✅ Good - backend-aligned
const connectId = await robinhoodClient.generateConnectId(params);
localStorage.setItem('connectId', connectId);

// Services use connectId
await pledgeService.createFromCallback({ connectId, ... });

// ❌ Bad (deprecated)
const referenceId = '...' // Use connectId instead
```

**Note**: The term `connectId` aligns with Robinhood API terminology and backend patterns.

### Asset Selection Flow

Follow this naming pattern:

```typescript
// User selects asset
const selectedAsset = 'ETH'
const selectedNetwork = 'ETHEREUM'

// Generate URL
const { url, connectId } = await generateOnrampUrl({
  asset: selectedAsset,
  network: selectedNetwork,
  walletAddress: getWalletAddress(selectedAsset),
})

// Track transfer
localStorage.setItem('connectId', connectId)
```

## Common Pitfalls

### Inconsistent Terminology

```typescript
// ❌ Bad - mixing terms
<Button>Start Onramp</Button>
toast({ title: "Transfer complete" })

// ✅ Good - consistent user-facing terms
<Button>Initiate Transfer</Button>
toast({ title: "Transfer Completed Successfully!" })
```

### Over-Abbreviation

```typescript
// ❌ Bad
const sa = selectedAsset
const sn = selectedNetwork
const cid = connectId

// ✅ Good
// Use full names - they're clearer
```

### Generic Names

```typescript
// ❌ Bad
interface Response {}
function handle() {}
const data = {}

// ✅ Good
interface OnrampURLResponse {}
function handleAssetSelect() {}
const assetData = {}
```

---

## Validation Checklist

When reviewing code or PRs, check:

- [ ] No "offramp" in variable/function names
- [ ] User-facing text uses "transfer", not "onramp"
- [ ] Technical code uses "onramp", not "offramp"
- [ ] `connectId` used consistently (not `referenceId`)
- [ ] Component names are descriptive
- [ ] Function names start with verbs
- [ ] Boolean variables use `is/has/should` prefix
- [ ] No unclear abbreviations
- [ ] Types are PascalCase
- [ ] Constants are UPPER_SNAKE_CASE
- [ ] Files are kebab-case

## Service Naming Patterns

### Service Classes

Follow NestJS conventions:

```typescript
// ✅ Good - descriptive service names
export class RobinhoodClientService {}
export class AssetRegistryService {}
export class UrlBuilderService {}
export class PledgeService {}

// ❌ Bad - generic or abbreviated
export class RHService {}
export class Client {}
export class Service {}
```

### DTO Classes

```typescript
// ✅ Good - clear what they validate
export class GenerateUrlDto {}
export class RobinhoodCallbackDto {}
export class CreatePledgeDto {}

// ❌ Bad
export class UrlParams {}
export class Input {}
```

---

## Related Documentation

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture patterns
- [LINTING-AND-TYPE-SAFETY.md](./LINTING-AND-TYPE-SAFETY.md) - Code quality standards

---

**Last Updated**: October 25, 2025  
**Version**: v1.0.0 (Backend-Aligned)  
**Status**: Active - Follow these conventions for all new code
