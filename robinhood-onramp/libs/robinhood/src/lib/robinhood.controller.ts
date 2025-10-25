// @ts-nocheck - POC-only file, not used in Next.js
/**
 * Robinhood Connect Controller
 *
 * Handles HTTP endpoints for Robinhood Connect integration.
 * This controller is backend-ready and will work in NestJS as-is.
 *
 * In POC: Not used by Next.js (uses app/api/robinhood instead)
 * In Backend: Replaces Next.js routes, handles actual API requests
 *
 * NOTE: This file uses NestJS decorators but is designed to be tree-shakeable
 * in the Next.js POC where it won't be imported.
 */

// These imports are only used in backend context
// They will be tree-shaken in Next.js build
import type { Body, Controller, Get, Post } from '@nestjs/common'

// Service imports work in both contexts
import { RobinhoodClientService } from './services/robinhood-client.service'
import { AssetRegistryService } from './services/asset-registry.service'
import { UrlBuilderService } from './services/url-builder.service'
import { PledgeService } from './services/pledge.service'
import { GenerateUrlDto } from './dtos/generate-url.dto'
import { RobinhoodCallbackDto } from './dtos/callback.dto'
import { CreatePledgeDto } from './dtos/create-pledge.dto'

/**
 * Controller for Robinhood Connect API endpoints
 *
 * Routes (when used in NestJS backend):
 * - GET  /robinhood/health       - Health check
 * - GET  /robinhood/assets        - List available assets
 * - POST /robinhood/url/generate  - Generate onramp URL
 * - POST /robinhood/callback      - Handle Robinhood callback
 * - POST /robinhood/pledge/create - Create pledge manually
 */
// @Controller('robinhood')  // Commented out to avoid errors in POC
export class RobinhoodController {
  constructor(
    private readonly robinhoodClient: RobinhoodClientService,
    private readonly assetRegistry: AssetRegistryService,
    private readonly urlBuilder: UrlBuilderService,
    private readonly pledgeService: PledgeService,
  ) {}

  /**
   * Health check endpoint
   * GET /robinhood/health
   */
  // @Get('health')  // Uncomment in backend
  async getHealth() {
    const registry = this.assetRegistry
    const assets = registry.getAllAssets()

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      registry: {
        totalAssets: assets.length,
        evmAssets: assets.filter((a) => ['ETHEREUM', 'POLYGON', 'BASE'].includes(a.chain)).length,
        nonEvmAssets: assets.filter((a) => !['ETHEREUM', 'POLYGON', 'BASE'].includes(a.chain))
          .length,
      },
    }
  }

  /**
   * List all available assets
   * GET /robinhood/assets
   */
  // @Get('assets')  // Uncomment in backend
  async getAssets() {
    const assets = this.assetRegistry.getAllAssets()
    return {
      success: true,
      count: assets.length,
      assets,
    }
  }

  /**
   * Generate onramp URL
   * POST /robinhood/url/generate
   */
  // @Post('url/generate')  // Uncomment in backend
  async generateUrl(dto: GenerateUrlDto) {
    // In backend, dto will be automatically validated by class-validator
    // In POC, validation happens in Next.js route

    // Generate connectId from Robinhood API
    const connectId = await this.robinhoodClient.generateConnectId({
      walletAddress: dto.walletAddress,
      userIdentifier: dto.userIdentifier,
    })

    // Build onramp URL
    const url = this.urlBuilder.generateOnrampUrl({
      connectId,
      asset: dto.asset,
      network: dto.network,
      walletAddress: dto.walletAddress,
      redirectUrl: dto.redirectUrl,
    })

    return {
      success: true,
      url,
      connectId,
    }
  }

  /**
   * Handle callback from Robinhood
   * POST /robinhood/callback
   *
   * In production, this would:
   * 1. Validate callback data
   * 2. Create pledge in database
   * 3. Send notifications
   * 4. Return success
   */
  // @Post('callback')  // Uncomment in backend
  async handleCallback(dto: RobinhoodCallbackDto) {
    // Create pledge from callback
    const pledge = await this.pledgeService.createFromCallback(dto)

    return {
      success: true,
      pledgeId: pledge.otcTransactionHash,
      status: pledge.status,
    }
  }

  /**
   * Create pledge manually (for testing)
   * POST /robinhood/pledge/create
   */
  // @Post('pledge/create')  // Uncomment in backend
  async createPledge(dto: CreatePledgeDto) {
    const pledge = await this.pledgeService.createPledge(dto)

    return {
      success: true,
      pledge,
    }
  }
}

/**
 * Migration Instructions for Backend:
 *
 * 1. Uncomment all @Decorator() lines above
 * 2. Uncomment @Controller('robinhood') on class
 * 3. Uncomment @Body() decorators in method signatures:
 *    async generateUrl(@Body() dto: GenerateUrlDto)
 * 4. Import decorators from '@nestjs/common'
 * 5. Add RobinhoodController to RobinhoodModule.controllers
 * 6. Wire services to NestJS DI container
 * 7. Delete app/api/robinhood/ routes (POC-only)
 *
 * That's it! The controller is fully functional.
 */

