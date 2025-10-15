# Sub-Plan 3: Offramp URL Generation

**Priority**: High (Core Flow)  
**Estimated Complexity**: Medium  
**Dependencies**: Sub-Plan 1 (Project Setup)

## Context

This sub-plan implements the URL generation system for Robinhood Connect offramp flows. This is the mechanism that creates the special links that open the Robinhood app (via universal links) or web interface, allowing users to complete their crypto transfers. As a result of completing this sub-plan, the system will be able to generate secure, properly formatted Robinhood Connect URLs with all necessary parameters for the offramp flow.

## What This Sub-Plan Accomplishes

1. **URL Builder Utility**: Create robust URL generation functions for Robinhood Connect offramp
2. **ReferenceId Management**: Generate and validate UUID v4 referenceIds for order tracking
3. **Parameter Validation**: Ensure all URL parameters are properly formatted and validated
4. **Network & Asset Support**: Handle supported networks and asset codes from Robinhood SDK
5. **Universal Link Optimization**: Generate URLs optimized for mobile app linking

## Key Architectural Decisions

- **Backend Generation**: ReferenceId generated on backend for security and tracking
- **Parameter Validation**: Strict validation of all input parameters before URL generation
- **Flexible Configuration**: Support both predefined and user-selected asset/amount combinations
- **Error Handling**: Comprehensive validation with clear error messages

## Implementation Details

### URL Structure

**Base URL**: `https://applink.robinhood.com/u/connect`

**Required Parameters**:

- `offRamp=true` - Indicates offramp flow
- `applicationId` - Your Robinhood app ID
- `referenceId` - UUID v4 for tracking
- `supportedNetworks` - Comma-separated network list
- `redirectUrl` - Where to return after completion

**Optional Parameters**:

- `assetCode` - Specific asset (ETH, USDC, BTC, etc.)
- `assetAmount` - Specific amount in asset units
- `fiatCode` - Fiat currency (USD)
- `fiatAmount` - Specific amount in fiat

### Files to Create/Modify

#### Update `lib/robinhood-url-builder.ts`

```typescript
import { v4 as uuidv4 } from "uuid";
import type {
  RobinhoodOfframpParams,
  SupportedNetwork,
  AssetCode,
} from "@/types/robinhood";

// Supported networks from Robinhood SDK
export const SUPPORTED_NETWORKS: SupportedNetwork[] = [
  "AVALANCHE",
  "BITCOIN",
  "BITCOIN_CASH",
  "LITECOIN",
  "DOGECOIN",
  "ETHEREUM",
  "ETHEREUM_CLASSIC",
  "POLYGON",
  "SOLANA",
  "STELLAR",
  "TEZOS",
];

// Common asset codes
export const COMMON_ASSETS: AssetCode[] = [
  "BTC",
  "ETH",
  "USDC",
  "USDT",
  "SOL",
  "MATIC",
  "LTC",
  "DOGE",
  "AVAX",
  "ADA",
];

// Network to asset mapping (common combinations)
export const NETWORK_ASSET_MAP: Record<SupportedNetwork, AssetCode[]> = {
  ETHEREUM: ["ETH", "USDC", "USDT"],
  POLYGON: ["MATIC", "USDC", "USDT"],
  SOLANA: ["SOL", "USDC"],
  BITCOIN: ["BTC"],
  LITECOIN: ["LTC"],
  DOGECOIN: ["DOGE"],
  AVALANCHE: ["AVAX", "USDC"],
  BITCOIN_CASH: ["BCH"],
  ETHEREUM_CLASSIC: ["ETC"],
  STELLAR: ["XLM"],
  TEZOS: ["XTZ"],
};

/**
 * Generate a new UUID v4 referenceId for order tracking
 */
export function generateReferenceId(): string {
  return uuidv4();
}

/**
 * Validate referenceId format (UUID v4)
 */
export function isValidReferenceId(referenceId: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(referenceId);
}

/**
 * Validate supported network
 */
export function isValidNetwork(network: string): network is SupportedNetwork {
  return SUPPORTED_NETWORKS.includes(network as SupportedNetwork);
}

/**
 * Validate asset code format
 */
export function isValidAssetCode(assetCode: string): boolean {
  // Asset codes are typically 2-10 uppercase letters
  return /^[A-Z]{2,10}$/.test(assetCode);
}

/**
 * Validate amount format (positive number with optional decimals)
 */
export function isValidAmount(amount: string): boolean {
  return /^\d+(\.\d+)?$/.test(amount) && parseFloat(amount) > 0;
}

/**
 * Get redirect URL for the current environment
 */
export function getRedirectUrl(): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${baseUrl}/callback`;
}

/**
 * Build offramp URL parameters with validation
 */
export interface OfframpUrlParams {
  supportedNetworks: SupportedNetwork[];
  assetCode?: AssetCode;
  assetAmount?: string;
  fiatCode?: "USD";
  fiatAmount?: string;
  referenceId?: string; // If not provided, will be generated
}

export interface OfframpUrlResult {
  url: string;
  referenceId: string;
  params: RobinhoodOfframpParams;
}

/**
 * Build complete offramp URL with all parameters
 */
export function buildOfframpUrl(params: OfframpUrlParams): OfframpUrlResult {
  // Validate environment variables
  if (!process.env.ROBINHOOD_APP_ID) {
    throw new Error("ROBINHOOD_APP_ID environment variable is required");
  }

  // Validate required parameters
  if (!params.supportedNetworks || params.supportedNetworks.length === 0) {
    throw new Error("At least one supported network is required");
  }

  // Validate supported networks
  for (const network of params.supportedNetworks) {
    if (!isValidNetwork(network)) {
      throw new Error(
        `Invalid network: ${network}. Supported networks: ${SUPPORTED_NETWORKS.join(
          ", "
        )}`
      );
    }
  }

  // Validate asset code if provided
  if (params.assetCode && !isValidAssetCode(params.assetCode)) {
    throw new Error(
      `Invalid asset code: ${params.assetCode}. Must be 2-10 uppercase letters.`
    );
  }

  // Validate asset amount if provided
  if (params.assetAmount && !isValidAmount(params.assetAmount)) {
    throw new Error(
      `Invalid asset amount: ${params.assetAmount}. Must be a positive number.`
    );
  }

  // Validate fiat amount if provided
  if (params.fiatAmount && !isValidAmount(params.fiatAmount)) {
    throw new Error(
      `Invalid fiat amount: ${params.fiatAmount}. Must be a positive number.`
    );
  }

  // Validate that if assetAmount is provided, assetCode must also be provided
  if (params.assetAmount && !params.assetCode) {
    throw new Error("assetCode is required when assetAmount is specified");
  }

  // Validate that if fiatAmount is provided, both assetCode and fiatCode must be provided
  if (params.fiatAmount && (!params.assetCode || !params.fiatCode)) {
    throw new Error(
      "assetCode and fiatCode are required when fiatAmount is specified"
    );
  }

  // Generate or validate referenceId
  const referenceId = params.referenceId || generateReferenceId();
  if (!isValidReferenceId(referenceId)) {
    throw new Error(`Invalid referenceId format: ${referenceId}`);
  }

  // Build URL parameters
  const urlParams: RobinhoodOfframpParams = {
    applicationId: process.env.ROBINHOOD_APP_ID,
    offRamp: true,
    supportedNetworks: params.supportedNetworks.join(","),
    redirectUrl: getRedirectUrl(),
    referenceId: referenceId,
  };

  // Add optional parameters
  if (params.assetCode) {
    urlParams.assetCode = params.assetCode;
  }
  if (params.assetAmount) {
    urlParams.assetAmount = params.assetAmount;
  }
  if (params.fiatCode) {
    urlParams.fiatCode = params.fiatCode;
  }
  if (params.fiatAmount) {
    urlParams.fiatAmount = params.fiatAmount;
  }

  // Build URL
  const url = new URL("https://applink.robinhood.com/u/connect");

  // Add all parameters to URL
  Object.entries(urlParams).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, value.toString());
    }
  });

  return {
    url: url.toString(),
    referenceId,
    params: urlParams,
  };
}

/**
 * Convenience function for common offramp scenarios
 */
export function buildSimpleOfframpUrl(
  assetCode: AssetCode,
  network: SupportedNetwork,
  amount?: string
): OfframpUrlResult {
  return buildOfframpUrl({
    supportedNetworks: [network],
    assetCode,
    assetAmount: amount,
  });
}

/**
 * Build offramp URL for multiple networks (user chooses in Robinhood)
 */
export function buildMultiNetworkOfframpUrl(
  networks: SupportedNetwork[]
): OfframpUrlResult {
  return buildOfframpUrl({
    supportedNetworks: networks,
  });
}

/**
 * Build offramp URL with fiat amount specification
 */
export function buildFiatOfframpUrl(
  assetCode: AssetCode,
  network: SupportedNetwork,
  fiatAmount: string
): OfframpUrlResult {
  return buildOfframpUrl({
    supportedNetworks: [network],
    assetCode,
    fiatCode: "USD",
    fiatAmount,
  });
}

/**
 * Get compatible assets for a given network
 */
export function getAssetsForNetwork(network: SupportedNetwork): AssetCode[] {
  return NETWORK_ASSET_MAP[network] || [];
}

/**
 * Get compatible networks for a given asset
 */
export function getNetworksForAsset(assetCode: AssetCode): SupportedNetwork[] {
  return Object.entries(NETWORK_ASSET_MAP)
    .filter(([_, assets]) => assets.includes(assetCode))
    .map(([network, _]) => network as SupportedNetwork);
}

/**
 * Validate asset/network compatibility
 */
export function isAssetNetworkCompatible(
  assetCode: AssetCode,
  network: SupportedNetwork
): boolean {
  const assetsForNetwork = getAssetsForNetwork(network);
  return assetsForNetwork.includes(assetCode);
}
```

#### Create API Route `app/api/robinhood/generate-offramp-url/route.ts`

```typescript
import { NextResponse } from "next/server";
import {
  buildOfframpUrl,
  isValidNetwork,
  isValidAssetCode,
} from "@/lib/robinhood-url-builder";
import type { SupportedNetwork, AssetCode } from "@/types/robinhood";

interface GenerateUrlRequest {
  supportedNetworks: string[];
  assetCode?: string;
  assetAmount?: string;
  fiatAmount?: string;
}

export async function POST(request: Request) {
  try {
    const body: GenerateUrlRequest = await request.json();

    // Validate required fields
    if (
      !body.supportedNetworks ||
      !Array.isArray(body.supportedNetworks) ||
      body.supportedNetworks.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "supportedNetworks array is required and must not be empty",
        },
        { status: 400 }
      );
    }

    // Validate networks
    const invalidNetworks = body.supportedNetworks.filter(
      (network) => !isValidNetwork(network)
    );
    if (invalidNetworks.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid networks: ${invalidNetworks.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate asset code if provided
    if (body.assetCode && !isValidAssetCode(body.assetCode)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid asset code: ${body.assetCode}`,
        },
        { status: 400 }
      );
    }

    // Build URL
    const result = buildOfframpUrl({
      supportedNetworks: body.supportedNetworks as SupportedNetwork[],
      assetCode: body.assetCode as AssetCode,
      assetAmount: body.assetAmount,
      fiatCode: body.fiatAmount ? "USD" : undefined,
      fiatAmount: body.fiatAmount,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        referenceId: result.referenceId,
        params: result.params,
      },
    });
  } catch (error: any) {
    console.error("Error generating offramp URL:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate offramp URL",
      },
      { status: 500 }
    );
  }
}
```

#### Update TypeScript Definitions in `types/robinhood.d.ts`

```typescript
// Add to existing types

export interface OfframpUrlRequest {
  supportedNetworks: SupportedNetwork[];
  assetCode?: AssetCode;
  assetAmount?: string;
  fiatAmount?: string;
}

export interface OfframpUrlResponse {
  success: boolean;
  data?: {
    url: string;
    referenceId: string;
    params: RobinhoodOfframpParams;
  };
  error?: string;
}
```

## Step-by-Step Instructions

### Step 1: Update URL Builder Utility

**Replace `lib/robinhood-url-builder.ts`:**

- Copy the complete implementation from above
- Ensure all imports are correct
- Test TypeScript compilation

### Step 2: Create URL Generation API Route

```bash
# Create API route directory
mkdir -p app/api/robinhood/generate-offramp-url

# Create the route file
# Copy implementation from above
```

### Step 3: Test URL Generation

**Create temporary test file `lib/test-url-generation.ts`:**

```typescript
import {
  buildOfframpUrl,
  buildSimpleOfframpUrl,
} from "./robinhood-url-builder";

// Test basic URL generation
console.log("Testing basic offramp URL generation...");

try {
  // Test simple ETH offramp
  const ethResult = buildSimpleOfframpUrl("ETH", "ETHEREUM", "0.1");
  console.log("ETH URL:", ethResult.url);
  console.log("Reference ID:", ethResult.referenceId);

  // Test USDC on Polygon
  const usdcResult = buildSimpleOfframpUrl("USDC", "POLYGON", "100");
  console.log("USDC URL:", usdcResult.url);

  // Test multi-network
  const multiResult = buildOfframpUrl({
    supportedNetworks: ["ETHEREUM", "POLYGON", "SOLANA"],
  });
  console.log("Multi-network URL:", multiResult.url);
} catch (error) {
  console.error("URL generation test failed:", error);
}
```

**Run test:**

```bash
# Run the test
npx tsx lib/test-url-generation.ts

# Clean up test file
rm lib/test-url-generation.ts
```

### Step 4: Test API Route

```bash
# Start development server
npm run dev

# Test URL generation API
curl -X POST http://localhost:3000/api/robinhood/generate-offramp-url \
  -H "Content-Type: application/json" \
  -d '{
    "supportedNetworks": ["ETHEREUM"],
    "assetCode": "ETH",
    "assetAmount": "0.1"
  }'
```

### Step 5: Verify URL Format

**Check generated URL format:**

```
https://applink.robinhood.com/u/connect?
  offRamp=true&
  applicationId=your-app-id&
  supportedNetworks=ETHEREUM&
  redirectUrl=http://localhost:3000/callback&
  referenceId=f2056f4c-93c7-422b-bd59-fbfb5b05b6ad&
  assetCode=ETH&
  assetAmount=0.1
```

## Testing Checklist

### URL Generation Testing

- [ ] Basic URL generation with required parameters works
- [ ] Optional parameters (assetCode, assetAmount) are included correctly
- [ ] Multiple networks are comma-separated properly
- [ ] ReferenceId is valid UUID v4 format
- [ ] Redirect URL uses correct environment base URL

### Parameter Validation Testing

- [ ] Invalid networks are rejected with clear error messages
- [ ] Invalid asset codes are rejected
- [ ] Invalid amounts (negative, non-numeric) are rejected
- [ ] Missing required parameters are caught
- [ ] Asset/amount combinations are validated correctly

### API Route Testing

- [ ] POST request with valid parameters returns success
- [ ] POST request with invalid networks returns 400 error
- [ ] POST request with invalid asset codes returns 400 error
- [ ] POST request with missing parameters returns 400 error
- [ ] Generated URLs are properly formatted

### Edge Cases Testing

- [ ] Empty supportedNetworks array is rejected
- [ ] Very long asset codes are rejected
- [ ] Special characters in parameters are handled
- [ ] Unicode characters are handled properly
- [ ] URL encoding works correctly

## Edge Cases & Considerations

### Network Compatibility

- **Asset/Network Matching**: Not all assets are available on all networks
- **Network Names**: Must match exactly with Robinhood's expected format
- **Case Sensitivity**: Network names are case-sensitive (uppercase)

### Amount Formatting

- **Decimal Precision**: Different assets have different decimal precision requirements
- **Minimum Amounts**: Robinhood may have minimum transfer amounts
- **Maximum Amounts**: Consider maximum transfer limits

### URL Length Limits

- **Browser Limits**: Very long URLs may be truncated by browsers
- **Mobile App Limits**: Mobile apps may have URL length restrictions
- **Parameter Optimization**: Consider parameter order and encoding

### Universal Link Behavior

- **iOS Behavior**: Universal links work differently on iOS vs Android
- **App Installation**: Behavior when Robinhood app is not installed
- **Fallback Handling**: Web fallback when app linking fails

## Success Criteria

This sub-plan is complete when:

1. **URL Generation Works**: Can generate valid Robinhood Connect offramp URLs
2. **Parameter Validation**: All input parameters are properly validated
3. **API Route Functional**: `/api/robinhood/generate-offramp-url` works correctly
4. **ReferenceId Management**: UUID v4 referenceIds are generated and validated
5. **Network Support**: All supported networks from Robinhood SDK are handled
6. **Error Handling**: Clear error messages for all validation failures
7. **TypeScript Integration**: Full type safety with proper interfaces

## Next Steps

After completing this sub-plan:

1. **Sub-Plan 4**: Implement callback handling to parse redirect parameters
2. **Sub-Plan 6**: Create UI components that use these URL generation functions
3. **Sub-Plan 5**: Add order status tracking using the referenceId

## Notes

- **Universal Links**: Test on actual mobile devices for proper app linking behavior
- **Environment URLs**: Ensure redirect URLs work in all environments (dev, staging, prod)
- **Parameter Evolution**: Robinhood may add new parameters in future SDK versions
- **URL Encoding**: Special characters in parameters are automatically URL-encoded

## Common Issues & Solutions

### Issue: Universal Links Not Working

**Solution**: Verify Robinhood app is installed and URL format is exactly correct

### Issue: Invalid Network Names

**Solution**: Use exact network names from Robinhood SDK documentation (uppercase)

### Issue: ReferenceId Collisions

**Solution**: UUID v4 has extremely low collision probability, but consider adding timestamp prefix if needed

### Issue: URL Too Long

**Solution**: Use shorter parameter names or move complex data to server-side storage

### Issue: Environment Variable Missing

**Solution**: Ensure ROBINHOOD_APP_ID is set in all environments

### Issue: Redirect URL Not Working

**Solution**: Verify redirect URL is whitelisted with Robinhood team and matches exactly
