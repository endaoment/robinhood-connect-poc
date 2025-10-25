# Naming Conventions

> Consistent naming across the codebase.

## Terminology

**Onramp** - Transfer from Robinhood to external wallet  
**Connect ID** - Robinhood's unique transfer identifier  
**Pledge** - Database record of crypto donation  
**Asset** - Cryptocurrency (ETH, SOL, USDC)  
**Network** - Blockchain network (ETHEREUM, SOLANA, POLYGON)

## File Naming

```
kebab-case for files:
- robinhood-client.service.ts
- generate-url.dto.ts
- asset-registry.spec.ts

PascalCase for classes/components:
- RobinhoodClientService
- GenerateUrlDto
- AssetCard
```

## Code Naming

### Variables and Functions

```typescript
// camelCase for variables and functions
const walletAddress = '0x...'
const connectId = 'abc-123'

function generateConnectId() { ... }
function mapCallbackToPledge() { ... }
```

### Classes

```typescript
// PascalCase for classes
class RobinhoodClientService { ... }
class GenerateUrlDto { ... }
class AssetRegistryService { ... }
```

### Constants

```typescript
// UPPER_SNAKE_CASE for constants
const ROBINHOOD_BASE_URL = 'https://...'
const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_TIMEOUT = 5000
```

## Service Patterns

Services end with `Service`:

- `RobinhoodClientService`
- `AssetRegistryService`
- `UrlBuilderService`
- `PledgeService`

DTOs end with `Dto`:

- `GenerateUrlDto`
- `RobinhoodCallbackDto`
- `CreatePledgeDto`
- `AssetDto`

## API Naming

### Endpoints

```
kebab-case for paths:
/api/robinhood/generate-onramp-url
/api/robinhood/order-status
```

### Request/Response Fields

```json
{
  "assetCode": "ETH",
  "networkName": "ETHEREUM",
  "walletAddress": "0x...",
  "connectId": "abc-123"
}
```

camelCase for JSON fields.

## UI Text

**Buttons**: Title Case

- "Initiate Transfer"
- "View Details"
- "Select Asset"

**Messages**: Sentence case

- "Transfer initiated successfully"
- "Please select an asset to continue"

## Examples

### Good ✅

```typescript
const connectId = await robinhoodClient.generateConnectId(params)
const asset = assetRegistry.getAsset('ETH', 'ETHEREUM')
const url = urlBuilder.generateUrl({ asset, network })
```

### Avoid ❌

```typescript
const cid = await rhClient.genConnId(p) // Too abbreviated
const a = registry.get('ETH', 'ETHEREUM') // Not descriptive
const u = builder.gen({ a, n }) // Unclear
```

## Object Parameters

Use object parameters for 3+ arguments:

```typescript
// ✅ Good
generateUrl({ asset, network, amount, walletAddress })

// ❌ Avoid
generateUrl(asset, network, amount, walletAddress)
```

## Documentation

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development guide
- [LINTING-AND-TYPE-SAFETY.md](./LINTING-AND-TYPE-SAFETY.md) - Type safety
