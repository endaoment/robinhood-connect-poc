# Sub-Plan 4: Robinhood Client Service Implementation

**Status**: Pending
**Priority**: Critical
**Dependencies**: Sub-Plan 1 (Service Layer Restructuring)
**Estimated Time**: 3-4 hours

## Context Required

### Files to Review

**Current Empty Service** (From SP1):

- `lib/robinhood/services/robinhood-client.service.ts` - Placeholder to implement

**Existing Logic to Extract**:

- Look at API route implementations for ConnectId generation patterns
- Review any existing Robinhood API interaction code

**Robinhood SDK Documentation**:

- ConnectId API: `POST /catpay/v1/connect_id/`
- Discovery API: `GET /api/v1/crypto/trading/assets/`
- Authentication patterns with API key

## Objectives

1. Implement `generateConnectId()` method with proper error handling
2. Implement `fetchTradingAssets()` method with caching
3. Add retry logic for network failures
4. Add comprehensive logging
5. Use object parameter pattern throughout
6. Add JSDoc documentation
7. Handle API authentication properly

## Precise Implementation Steps

### Step 1: Implement generateConnectId Method

**File**: `lib/robinhood/services/robinhood-client.service.ts`

**Action**: Replace placeholder with implementation

```typescript
async generateConnectId(params: GenerateConnectIdParams): Promise<string> {
  const { walletAddress, userIdentifier, config } = params;
  const activeConfig = { ...this.config, ...config };

  this.logger.info('Generating ConnectId', { walletAddress, userIdentifier });

  try {
    const response = await this.fetchWithRetry({
      url: `${activeConfig.baseUrl}/catpay/v1/connect_id/`,
      method: 'POST',
      headers: {
        'X-Api-Key': activeConfig.apiKey,
        'X-App-Id': activeConfig.appId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination_wallet_address: walletAddress,
        user_identifier: userIdentifier,
      }),
    });

    const data = await response.json();

    if (!data.connect_id) {
      throw new Error('No connect_id in response');
    }

    this.logger.info('ConnectId generated successfully', { connectId: data.connect_id });
    return data.connect_id;

  } catch (error) {
    this.logger.error('Failed to generate ConnectId', error);
    throw new Error(`ConnectId generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

### Step 2: Implement fetchTradingAssets Method

**Action**: Add implementation

```typescript
async fetchTradingAssets(params: FetchTradingAssetsParams = {}): Promise<any[]> {
  const { assetType, includeInactive = false, config } = params;
  const activeConfig = { ...this.config, ...config };

  this.logger.info('Fetching trading assets', { assetType, includeInactive });

  try {
    const url = new URL(`${activeConfig.baseUrl}/api/v1/crypto/trading/assets/`);
    if (assetType) {
      url.searchParams.append('asset_type', assetType);
    }

    const response = await this.fetchWithRetry({
      url: url.toString(),
      method: 'GET',
      headers: {
        'X-Api-Key': activeConfig.apiKey,
        'X-App-Id': activeConfig.appId,
      },
    });

    const data = await response.json();
    const assets = data.results || [];

    // Filter inactive if needed
    const filteredAssets = includeInactive
      ? assets
      : assets.filter((asset: any) => asset.is_active);

    this.logger.info('Assets fetched successfully', { count: filteredAssets.length });
    return filteredAssets;

  } catch (error) {
    this.logger.error('Failed to fetch assets', error);
    throw new Error(`Asset fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

### Step 3: Add Retry Logic

**Action**: Add private helper method

```typescript
private async fetchWithRetry(params: {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}): Promise<Response> {
  const { url, method, headers, body } = params;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      this.logger.warn(`Attempt ${attempt} failed`, { error: lastError.message });

      if (attempt < this.retryConfig.maxAttempts) {
        const delay = this.retryConfig.delayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
        this.logger.info(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}
```

## Deliverables Checklist

- [ ] `generateConnectId()` implemented
- [ ] `fetchTradingAssets()` implemented
- [ ] Retry logic added
- [ ] Error handling comprehensive
- [ ] Logging added throughout
- [ ] Object parameters used
- [ ] JSDoc updated
- [ ] TypeScript compiles
- [ ] Manual test passes

## Validation Steps

### Validation 1: TypeScript Compilation

```bash
npx tsc --noEmit lib/robinhood/services/robinhood-client.service.ts
```

**Expected**: No errors

### Validation 2: Service Instantiation

```bash
npx ts-node -e "import { RobinhoodClientService } from './lib/robinhood/services'; const s = new RobinhoodClientService({ appId: 'test', apiKey: 'test' }); console.log('✅ Service instantiates');"
```

**Expected**: "✅ Service instantiates"

## Next Steps

After completing this sub-plan:

1. **Create** implementation log: `YYYYMMDD-HHMM-SP4-COMPLETE.md`
2. **Proceed to** [Sub-Plan 5: Asset Registry Service](./sub-plan-5-asset-registry-service.md)

## Notes

- Actual API calls require valid ROBINHOOD_API_KEY
- Retry logic uses exponential backoff
- All methods log operations for debugging
- Error messages are descriptive
