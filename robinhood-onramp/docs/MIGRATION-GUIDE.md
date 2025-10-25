# Backend Migration Guide

> Instructions for integrating POC code into endaoment-backend.

## Quick Summary

**What**: Copy `libs/robinhood/` to backend, wire dependencies  
**Time**: 2-3 hours  
**Risk**: Low - code structured for backend patterns

## Migration Steps

### 1. Copy Files

```bash
cp -r robinhood-onramp/libs/robinhood \
      endaoment-backend/libs/api/robinhood
```

### 2. Update Module

Edit `libs/api/robinhood/src/lib/robinhood.module.ts`:

```typescript
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CryptoDonationPledge } from '@/libs/database/entities/crypto-donation-pledge.entity'
import { TokensModule } from '@/libs/api/tokens/tokens.module'
import { NotificationModule } from '@/libs/api/notification/notification.module'

@Module({
  imports: [TypeOrmModule.forFeature([CryptoDonationPledge]), TokensModule, NotificationModule],
  controllers: [RobinhoodController],
  providers: [RobinhoodClientService, AssetRegistryService, UrlBuilderService, PledgeService],
  exports: [RobinhoodClientService, AssetRegistryService, UrlBuilderService, PledgeService],
})
export class RobinhoodModule {}
```

### 3. Update Controller

Edit `libs/api/robinhood/src/lib/robinhood.controller.ts`:

Uncomment all decorators:

```typescript
@Controller('robinhood')  // Uncomment
export class RobinhoodController {
  @Get('health')          // Uncomment
  async getHealth() { ... }

  @Get('assets')          // Uncomment
  async getAssets() { ... }

  @Post('url/generate')   // Uncomment
  async generateUrl(@Body() dto: GenerateUrlDto) { ... }

  @Post('callback')       // Uncomment
  async handleCallback(@Body() dto: RobinhoodCallbackDto) { ... }

  @Post('pledge/create')  // Uncomment
  async createPledge(@Body() dto: CreatePledgeDto) { ... }
}
```

### 4. Update PledgeService

Edit `libs/api/robinhood/src/lib/services/pledge.service.ts`:

Replace mock services with real ones:

```typescript
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CryptoDonationPledge } from '@/libs/database/entities/crypto-donation-pledge.entity'
import { TokenService } from '@/libs/api/tokens/token.service'
import { NotificationService } from '@/libs/api/notification/notification.service'

@Injectable()
export class PledgeService {
  constructor(
    @InjectRepository(CryptoDonationPledge)
    private readonly pledgeRepository: Repository<CryptoDonationPledge>,
    private readonly tokenService: TokenService,
    private readonly notificationService: NotificationService,
  ) {}

  async createFromCallback(dto: RobinhoodCallbackDto): Promise<CryptoDonationPledge> {
    const resolvedToken = await this.tokenService.resolveToken({
      symbol: dto.asset,
      chain: dto.network,
    })

    const pledge = this.pledgeRepository.create({
      otcTransactionHash: `robinhood:${dto.connectId}`,
      pledgerUserId: dto.userId,
      inputToken: resolvedToken,
      inputAmount: this.convertToSmallestUnit(dto.amount, resolvedToken.decimals),
      destinationOrgId: dto.destinationFundId,
      status: PledgeStatus.PendingLiquidation,
      centralizedExchangeDonationStatus: 'Completed',
      centralizedExchangeTransactionId: dto.orderId,
      createdAt: new Date(),
    })

    const savedPledge = await this.pledgeRepository.save(pledge)

    await this.notificationService.notifyPledgeCreated({
      pledgeId: savedPledge.id,
      userId: dto.userId,
      amount: dto.amount,
      asset: dto.asset,
    })

    return savedPledge
  }

  private convertToSmallestUnit(amount: string, decimals: number): string {
    const amountNum = parseFloat(amount)
    const multiplier = Math.pow(10, decimals)
    return (amountNum * multiplier).toString()
  }
}
```

### 5. Add Environment Variables

```env
ROBINHOOD_APP_ID=your-app-id
ROBINHOOD_API_KEY=your-api-key
ROBINHOOD_BASE_URL=https://trading.robinhood.com
```

### 6. Import Module

Edit `apps/api/src/app.module.ts`:

```typescript
import { RobinhoodModule } from '@/libs/robinhood'

@Module({
  imports: [
    // ... other modules
    RobinhoodModule,
  ],
})
export class AppModule {}
```

### 7. Run Tests

```bash
cd endaoment-backend
npm test libs/api/robinhood
```

Expected: 183 tests pass.

### 8. Verify Endpoints

```bash
npm run start:dev
```

Test endpoints:

- `GET /v1/robinhood/health`
- `GET /v1/robinhood/assets`
- `POST /v1/robinhood/url/generate`
- `POST /v1/robinhood/callback`
- `POST /v1/robinhood/pledge/create`

## What Gets Copied

**Services** (copy as-is):

- RobinhoodClientService
- AssetRegistryService
- UrlBuilderService
- PledgeService (needs mock removal)
- AssetDiscoveryService
- EvmAssetService
- NonEvmAssetService

**DTOs** (copy as-is):

- GenerateUrlDto
- RobinhoodCallbackDto
- CreatePledgeDto
- AssetDto

**Constants** (copy as-is):

- asset-mappings.ts
- networks.ts
- errors.ts

**Tests** (copy, update imports):

- All `.spec.ts` files
- Mock helpers

## What NOT to Copy

- `app/` directory (Next.js frontend)
- `libs/shared/src/lib/backend-mock/` (toast logger)
- POC scripts
- Frontend assets

## Database

Uses existing `CryptoDonationPledge` entity (same as Coinbase).

Field mapping:

- `connectId` → `otcTransactionHash` (prefixed with `robinhood:`)
- `userId` → `pledgerUserId`
- `asset` + `network` → `inputToken` (resolved via TokenService)
- `amount` → `inputAmount` (converted to smallest unit)
- `orderId` → `centralizedExchangeTransactionId`

## Troubleshooting

**Module won't import**:

- Verify tsconfig paths configured correctly

**Decorator errors**:

- Ensure `reflect-metadata` imported

**TokenService not found**:

- Verify `TokensModule` in imports

**Repository not injected**:

- Verify `TypeOrmModule.forFeature([CryptoDonationPledge])` in imports

**Tests fail**:

- Update import paths to match backend structure

## Validation

Before deployment:

- [ ] All 183 tests pass
- [ ] Health endpoint returns 200
- [ ] Can list assets
- [ ] Can generate test URL
- [ ] Environment variables set
- [ ] Module imported in app.module.ts

In staging:

- [ ] Generate real URL
- [ ] Complete test transaction
- [ ] Verify callback creates pledge
- [ ] Check pledge in database
- [ ] Verify notification sent

## Rollback

If issues arise:

1. Remove `RobinhoodModule` from `app.module.ts`
2. Restart application
3. (Optional) Delete `libs/api/robinhood/` directory

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing approach
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development guide
