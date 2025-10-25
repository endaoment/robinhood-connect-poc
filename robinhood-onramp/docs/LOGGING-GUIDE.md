# Logging Guide

> Logging patterns used in the POC.

## Logging Levels

- `log` - General information
- `error` - Errors and exceptions
- `warn` - Warnings and unusual conditions
- `debug` - Detailed debugging (development only)

## Service Logging

### Standard Pattern

```typescript
this.logger.log('Operation started', { context, metadata })
this.logger.error('Operation failed', error.stack)
this.logger.warn('Unusual condition', { details })
```

### RobinhoodClientService

```typescript
this.logger.log('[RobinhoodClient] Generating connect ID', { walletAddress })
this.logger.error('[RobinhoodClient] API call failed', error.stack)
```

### AssetRegistryService

```typescript
this.logger.log('[AssetRegistry] Initializing with X assets')
this.logger.warn('[AssetRegistry] Asset not found', { code, chain })
```

### UrlBuilderService

```typescript
this.logger.log('[UrlBuilder] Generating URL', { asset, network })
this.logger.error('[UrlBuilder] Validation failed', error.message)
```

### PledgeService

```typescript
this.logger.log('[Pledge] Creating pledge from callback', { connectId })
this.logger.error('[Pledge] Token resolution failed', error.stack)
```

## Error Logging

Structure error logs with context:

```typescript
try {
  await operation()
} catch (error) {
  this.logger.error('Operation failed', {
    operation: 'generateUrl',
    input: sanitizedInput,
    error: error.message,
    stack: error.stack,
  })
  throw error
}
```

## Security

**Never log**:

- API keys
- User passwords
- Full wallet private keys
- Personal identifiable information (PII)

**Safe to log**:

- Wallet addresses (public)
- Connect IDs
- Asset codes
- Network names
- Transaction hashes

## Development vs Production

**Development** (POC):

```typescript
console.log('Debug info') // OK in POC
this.logger.debug('...') // Detailed logs
```

**Production** (Backend):

```typescript
this.logger.log('...') // Standard logs only
this.logger.error('...') // Errors only
// No console.log, no debug logs
```

## Documentation

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
