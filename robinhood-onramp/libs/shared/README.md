# Shared Utilities Library

## Overview

Shared utilities and mock services used across the POC.

**⚠️ Important**: The `backend-mock/` services are **POC-only** and should NOT be migrated to endaoment-backend.

## Structure

```
src/
├── lib/
│   ├── utils/                       # Performance, security utilities
│   │   ├── performance-utils.ts
│   │   ├── security-utils.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   ├── backend-mock/                # 🚫 POC-ONLY - Mock backend services
│   │   ├── mock-pledge.service.ts
│   │   ├── mock-token.service.ts
│   │   ├── mock-notification.service.ts
│   │   ├── toast-logger.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── index.ts
└── index.ts

tests/
└── utils/                           # Utility tests
```

## Usage

### In POC (Next.js)

```typescript
// Import utilities
import { measurePerformance, sanitizeInput } from '@/libs/shared'

// Import mock services (POC demo only)
import { mockPledgeService, toastLogger } from '@/libs/shared'

// Use mock services to demonstrate backend calls
mockPledgeService.create({
  connectId: 'abc-123',
  asset: 'BTC',
  network: 'BITCOIN',
  amount: '0.5',
})
// Shows toast notification with API call details
```

## Components

### Utilities (`utils/`)

**✅ Can be migrated to backend if needed**

- `performance-utils.ts` - Performance measurement utilities
- `security-utils.ts` - Input sanitization and validation
- `utils.ts` - General utility functions

### Backend Mock (`backend-mock/`)

**🚫 POC-ONLY - Do NOT migrate to backend**

Mock services that simulate backend API calls via toast notifications:

- `mock-pledge.service.ts` - Simulates pledge creation API
- `mock-token.service.ts` - Simulates token resolution API
- `mock-notification.service.ts` - Simulates notification sending
- `toast-logger.ts` - Toast notification helper

**Purpose**: Demonstrate backend integration patterns without actual backend access.

## Integration with endaoment-backend

### Utilities

If needed, copy utilities to backend:

```bash
cp libs/shared/src/lib/utils/performance-utils.ts \
   endaoment-backend/libs/shared/src/lib/utils/

cp libs/shared/src/lib/utils/security-utils.ts \
   endaoment-backend/libs/shared/src/lib/utils/
```

### Backend Mock Services

**DO NOT MIGRATE** - These are POC demonstration tools only:

- Used to show API calls via toasts
- Replaced by real backend services
- No equivalent in production

## Mock Services Details

### MockPledgeService

Simulates `POST /v1/robinhood/pledge/create`:

```typescript
mockPledgeService.create({
  connectId: 'abc-123',
  asset: 'BTC',
  network: 'BITCOIN',
  amount: '0.5',
})

// Shows toast:
// 🎯 Backend API Call: POST /v1/robinhood/pledge/create
// Body: { connectId: "abc-123", ... }
// Expected Response: { pledgeId: "uuid-...", status: "PendingLiquidation" }
```

### MockTokenService

Simulates token resolution API:

```typescript
const token = await mockTokenService.resolve({
  asset: 'USDC',
  network: 'ETHEREUM',
})

// Shows toast with token details
```

### MockNotificationService

Simulates notification sending:

```typescript
mockNotificationService.sendDonationComplete({
  pledgeId: 'uuid-123',
  userId: 'user-456',
})

// Shows toast notification
```

## Toast Logger

All mock services use `toastLogger` to display API call details:

```typescript
toastLogger.logApiCall({
  method: 'POST',
  url: '/v1/robinhood/pledge/create',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json',
  },
  body: { ... },
  expectedResponse: { ... },
})
```

## Testing

Run tests for this library:

```bash
npm run test:shared
```

## Migration Checklist

When migrating Robinhood library to backend:

- [ ] ✅ Copy utility files if needed
- [ ] 🚫 **DO NOT** copy `backend-mock/` directory
- [ ] Replace mock service calls with real backend services
- [ ] Remove toast logger imports from production code
- [ ] Update imports to use real `PledgeService`, `TokenService`, etc.

## Architecture

This library serves two purposes:

1. **Utilities**: Reusable helper functions (can migrate)
2. **Mock Services**: POC demonstration tools (POC-only)

In production backend, the mock services are replaced by:

- `PledgeService` → Real database persistence
- `TokenService` → Actual token resolution
- `NotificationService` → Real email/SMS notifications

## Note

The separation of `backend-mock/` into this shared library makes it clear that these are temporary demonstration tools, not production code.

