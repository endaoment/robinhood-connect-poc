# Quick Start Guide

## Run the POC

```bash
cd robinhood-onramp
npm install
cp .env.example .env.local  # Add your API credentials
npm run dev
```

Visit: <http://localhost:3030>

## Test

```bash
npm test                 # Run all tests
npm run test:coverage    # Check coverage
npx tsc --noEmit        # Type check
npm run build            # Production build
```

## Migrate to endaoment-backend

### Copy Files

```bash
cp -r robinhood-onramp/libs/robinhood \
      endaoment-backend/libs/api/robinhood
```

### Wire Dependencies

Edit `endaoment-backend/libs/api/robinhood/src/lib/robinhood.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CryptoDonationPledge } from "@/libs/data-access";
import { TokensModule } from "@/libs/tokens";
import { NotificationModule } from "@/libs/notification";

@Module({
  imports: [
    TypeOrmModule.forFeature([CryptoDonationPledge]),
    TokensModule,
    NotificationModule,
  ],
  // ... rest stays the same
})
export class RobinhoodModule {}
```

### Import Module

Edit `endaoment-backend/apps/api/src/app.module.ts`:

```typescript
import { RobinhoodModule } from "@/libs/robinhood";

@Module({
  imports: [
    // ... other modules
    RobinhoodModule,
  ],
})
export class AppModule {}
```

### Test

```bash
cd endaoment-backend
npm test libs/api/robinhood
```

Expected: 5 endpoints register (health, assets, url/generate, callback, pledge/create)

See [robinhood-onramp/docs/MIGRATION-GUIDE.md](./robinhood-onramp/docs/MIGRATION-GUIDE.md) for complete instructions.

## Use as Template for New Integrations

```bash
# 1. Clone this repo
git clone robinhood-connect-poc your-integration-poc

# 2. Rename integration
cd your-integration-poc/robinhood-onramp
mv libs/robinhood libs/your-integration

# 3. Update package.json
vim package.json  # Change name

# 4. Build your integration
# - Add services in libs/your-integration/src/lib/services/
# - Add DTOs in libs/your-integration/src/lib/dtos/
# - Update controller and module
# - Build frontend demo in app/
```

## Learn More

- **[robinhood-onramp/docs/STRUCTURE.md](./robinhood-onramp/docs/STRUCTURE.md)** - Directory structure
- **[robinhood-onramp/docs/ARCHITECTURE.md](./robinhood-onramp/docs/ARCHITECTURE.md)** - Architecture
- **[robinhood-onramp/docs/MIGRATION-GUIDE.md](./robinhood-onramp/docs/MIGRATION-GUIDE.md)** - Migration details
