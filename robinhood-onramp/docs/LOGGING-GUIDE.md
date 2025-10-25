# Logging Guide

Comprehensive logging strategy for the Robinhood Connect integration.

---

## Overview

The application features structured logging throughout the Robinhood Connect **onramp** flow (transfer FROM Robinhood to external wallets).

### Logging Principles

1. **Structured Logging**: Consistent format across all services
2. **Context-Rich**: Include relevant metadata with each log
3. **Performance Tracking**: Log timing for operations
4. **Error Context**: Full error details with stack traces
5. **Security-Safe**: Never log sensitive data (API keys, addresses)

---

## Logging Levels

### Standard Log Levels

- 🔵 **INFO**: Normal operation flow
- ⚠️ **WARN**: Recoverable issues or deprecations
- ❌ **ERROR**: Operation failures requiring attention
- 🐛 **DEBUG**: Detailed debugging information (dev only)

### Service-Specific Markers

- ✅ `[SUCCESS]` - Operation completed successfully
- ❌ `[ERROR]` - Operation failed
- ✓ `[VALIDATION]` - Validation step passed
- 📥 `[REQUEST]` - Incoming request received
- 📤 `[HTTP]` - Outgoing HTTP request
- ⏱️ `[TIMING]` - Performance timing information
- 🌐 `[ROBINHOOD-API]` - Robinhood API interaction
- 🔨 `[BUILD-URL]` - URL building process
- 🎯 `[SERVICE]` - Service-level operation

---

## Service Layer Logging

### RobinhoodClientService

```typescript
@Injectable()
export class RobinhoodClientService {
  private readonly logger = new Logger(RobinhoodClientService.name);

  async generateConnectId(params: GenerateConnectIdParams): Promise<string> {
    this.logger.log(`[GENERATE-CONNECT-ID] Starting with params: ${JSON.stringify(params)}`);
    
    try {
      const response = await this.httpClient.post('/catpay/v1/connect_id/', {});
      
      this.logger.log(`[GENERATE-CONNECT-ID] Success: ${response.connect_id}`);
      return response.connect_id;
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[GENERATE-CONNECT-ID] Failed: ${message}`, error);
      throw error;
    }
  }
}
```

**Log Output Example**:

```
[RobinhoodClientService] [GENERATE-CONNECT-ID] Starting with params: {"walletAddress":"0x...","userIdentifier":"user@example.com"}
[RobinhoodClientService] [GENERATE-CONNECT-ID] Success: abc-123-def-456
```

### AssetRegistryService

```typescript
@Injectable()
export class AssetRegistryService {
  private readonly logger = new Logger(AssetRegistryService.name);

  async initialize(): Promise<void> {
    this.logger.log('[INITIALIZE] Building asset registry...');
    
    const startTime = Date.now();
    
    try {
      const assets = await this.assetDiscovery.discoverAssets();
      this.assets = assets;
      
      const duration = Date.now() - startTime;
      this.logger.log(`[INITIALIZE] Registry built: ${assets.length} assets in ${duration}ms`);
      
    } catch (error: unknown) {
      this.logger.error('[INITIALIZE] Failed to build registry', error);
      throw error;
    }
  }
}
```

**Log Output Example**:

```
[AssetRegistryService] [INITIALIZE] Building asset registry...
[AssetRegistryService] [INITIALIZE] Registry built: 45 assets in 234ms
```

### UrlBuilderService

```typescript
@Injectable()
export class UrlBuilderService {
  private readonly logger = new Logger(UrlBuilderService.name);

  async generateUrl(dto: GenerateUrlDto): Promise<GenerateUrlResult> {
    this.logger.log(`[GENERATE-URL] Asset: ${dto.asset}, Network: ${dto.network}`);
    
    const connectId = await this.robinhoodClient.generateConnectId({
      walletAddress: dto.walletAddress,
      userIdentifier: dto.userIdentifier
    });
    
    const url = this.buildOnrampUrl({ ...dto, connectId });
    
    this.logger.log(`[GENERATE-URL] Success - ConnectId: ${connectId}`);
    this.logger.debug(`[GENERATE-URL] Full URL: ${url}`);
    
    return { url, connectId };
  }
}
```

### PledgeService

```typescript
@Injectable()
export class PledgeService {
  private readonly logger = new Logger(PledgeService.name);

  async createFromCallback(dto: RobinhoodCallbackDto): Promise<CryptoDonationPledge> {
    this.logger.log(`[CREATE-PLEDGE] From callback - Asset: ${dto.asset}, Amount: ${dto.amount}`);
    
    try {
      // Resolve token
      const token = await this.tokenService.resolveToken(dto.asset, dto.network);
      this.logger.log(`[CREATE-PLEDGE] Token resolved: ${token.symbol}`);
      
      // Create pledge
      const pledge = await this.pledgeRepository.save({
        otcTransactionHash: `robinhood:${dto.connectId}`,
        pledgerUserId: dto.userId,
        inputToken: token,
        inputAmount: this.convertToSmallestUnit(dto.amount, token.decimals),
        // ... other fields
      });
      
      this.logger.log(`[CREATE-PLEDGE] Success - Pledge ID: ${pledge.id}`);
      return pledge;
      
    } catch (error: unknown) {
      this.logger.error('[CREATE-PLEDGE] Failed', error);
      throw error;
    }
  }
}
```

---

## API Route Logging (POC Only)

> **Note**: These API routes are POC-only and deleted during backend migration.

### Generate URL Route

```typescript
// app/api/robinhood/generate-onramp-url/route.ts
export async function POST(request: Request) {
  console.log('================================================================================');
  console.log('🚀 [GENERATE-URL] Starting request');
  console.log('================================================================================');
  
  try {
    const body = await request.json();
    console.log('📥 [REQUEST] Body:', JSON.stringify(body, null, 2));
    
    const result = await urlBuilderService.generateUrl(body);
    
    console.log('✅ [SUCCESS] URL generated');
    console.log('⏱️  [TIMING] Request completed');
    console.log('================================================================================');
    
    return NextResponse.json({ success: true, ...result });
    
  } catch (error: unknown) {
    console.error('❌ [ERROR] Request failed:', error);
    console.log('================================================================================');
    return NextResponse.json({ success: false, error: 'Failed to generate URL' }, { status: 500 });
  }
}
```

---

## Client-Side Logging (POC Dashboard)

### User Interaction Logging

```typescript
// app/(routes)/dashboard/page.tsx
const handleInitiateTransfer = async () => {
  console.log('================================================================================');
  console.log('🎯 [CLIENT] User initiated transfer');
  console.log('📊 [CLIENT] Asset:', selectedAsset, 'Network:', selectedNetwork);
  
  const startTime = Date.now();
  
  try {
    console.log('📤 [CLIENT] Calling API: /api/robinhood/generate-onramp-url');
    
    const response = await fetch('/api/robinhood/generate-onramp-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset: selectedAsset, network: selectedNetwork })
    });
    
    const duration = Date.now() - startTime;
    console.log(`📥 [CLIENT] API response received in ${duration}ms`);
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ [CLIENT] URL generated successfully');
      console.log('   ConnectId:', data.connectId);
      console.log('🌐 [CLIENT] Opening Robinhood...');
      
      window.location.href = data.url;
    } else {
      console.error('❌ [CLIENT] URL generation failed');
    }
    
  } catch (error: unknown) {
    console.error('❌ [CLIENT] Request failed:', error);
  }
  
  console.log('================================================================================');
};
```

---

## Error Logging

### Structured Error Logs

All errors include:
- Error message
- Error code (if applicable)
- Stack trace
- Request context
- Timing information

```typescript
try {
  await operation();
} catch (error: unknown) {
  const errorDetails = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    context: {
      asset,
      network,
      userId
    },
    timestamp: new Date().toISOString()
  };
  
  this.logger.error('Operation failed', errorDetails);
  
  throw new CustomError('User-friendly message', errorDetails);
}
```

### Error Log Example

```
[PledgeService] Operation failed
{
  "message": "Token not found for asset BTC on network ETHEREUM",
  "stack": "Error: Token not found\n    at TokenService.resolveToken...",
  "context": {
    "asset": "BTC",
    "network": "ETHEREUM",
    "userId": "user-123"
  },
  "timestamp": "2025-10-25T17:00:00.000Z"
}
```

---

## Performance Logging

### Timing Logs

Track operation duration:

```typescript
async performOperation(): Promise<Result> {
  const startTime = Date.now();
  
  try {
    const result = await this.doWork();
    
    const duration = Date.now() - startTime;
    this.logger.log(`Operation completed in ${duration}ms`);
    
    if (duration > 1000) {
      this.logger.warn(`Slow operation detected: ${duration}ms`);
    }
    
    return result;
    
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    this.logger.error(`Operation failed after ${duration}ms`, error);
    throw error;
  }
}
```

---

## Viewing Logs

### Development (Local)

**Server Logs** (Terminal):
```bash
npm run dev

# All server-side logs appear in terminal:
# - API route logs
# - Service logs
# - HTTP requests
# - Errors
```

**Client Logs** (Browser Console):
```
Open Developer Tools (F12) → Console tab

# Client-side logs:
# - User interactions
# - API calls
# - Response data
# - Errors
```

### Production (Backend)

Logs can be shipped to:
- **CloudWatch** (AWS)
- **Datadog**
- **Splunk**
- **ELK Stack**

Example log aggregation:

```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

WinstonModule.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' }),
    new winston.transports.CloudWatch({
      logGroupName: 'robinhood-integration',
      logStreamName: 'api-logs'
    })
  ]
});
```

---

## Security Considerations

### What NOT to Log

❌ **Never log**:
- API keys or secrets
- Full wallet addresses (truncate: `0x1234...5678`)
- User passwords or tokens
- Credit card information
- Personal identifying information (PII)

✅ **Safe to log**:
- Asset symbols (ETH, BTC)
- Network names (ETHEREUM, POLYGON)
- Connect IDs (after transfer)
- Operation status
- Timing information
- Error messages (without sensitive data)

### Safe Logging Examples

```typescript
// ❌ Bad - logs full address
this.logger.log(`Wallet: ${walletAddress}`);

// ✅ Good - truncates sensitive data
this.logger.log(`Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);

// ❌ Bad - logs API key
this.logger.log(`API Key: ${apiKey}`);

// ✅ Good - masks sensitive data
this.logger.log(`API Key: ${apiKey.slice(0, 8)}...`);
```

---

## Best Practices

1. **Use Structured Logging**: JSON format for easy parsing
2. **Include Context**: Asset, network, user ID (hashed)
3. **Log Performance**: Track slow operations
4. **Log Errors Completely**: Message + stack + context
5. **Use Appropriate Levels**: INFO for normal flow, ERROR for failures
6. **Don't Over-Log**: Avoid logging in tight loops
7. **Protect Sensitive Data**: Truncate or mask PII
8. **Use Logger Instances**: Not console.log in production code

---

## Example: Full Flow Trace

Complete transfer flow logs:

**Client (Browser Console)**:
```
🎯 [CLIENT] User initiated transfer
📊 [CLIENT] Asset: ETH, Network: ETHEREUM
📤 [CLIENT] Calling API: /api/robinhood/generate-onramp-url
📥 [CLIENT] API response received in 245ms
✅ [CLIENT] URL generated successfully
   ConnectId: abc-123-def-456
🌐 [CLIENT] Opening Robinhood...
```

**Server (Terminal)**:
```
[UrlBuilderService] [GENERATE-URL] Asset: ETH, Network: ETHEREUM
[RobinhoodClientService] [GENERATE-CONNECT-ID] Starting...
[RobinhoodClientService] [GENERATE-CONNECT-ID] Success: abc-123-def-456
[UrlBuilderService] [GENERATE-URL] Success - ConnectId: abc-123-def-456
```

**Backend (After Callback)**:
```
[PledgeService] [CREATE-PLEDGE] From callback - Asset: ETH, Amount: 1.5
[PledgeService] [CREATE-PLEDGE] Token resolved: ETH
[PledgeService] [CREATE-PLEDGE] Success - Pledge ID: pledge-789
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing documentation

---

**Last Updated**: October 25, 2025  
**Version**: v1.0.0 (Backend-Aligned)  
**Status**: Production-Ready
