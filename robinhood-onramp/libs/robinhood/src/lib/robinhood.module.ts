/**
 * Robinhood Connect Module
 *
 * Provides complete Robinhood Connect integration with:
 * - Asset registry management
 * - URL generation for onramp flows
 * - Pledge creation and tracking
 * - Robinhood API client
 *
 * This module is backend-ready and can be used as-is in NestJS.
 *
 * In POC: Services are used by Next.js API routes
 * In Backend: Full NestJS module with controller
 *
 * NOTE: This file uses NestJS decorators but is designed to be tree-shakeable
 * in the Next.js POC where it won't be imported.
 */

// These imports are only used in backend context
import type { Module } from '@nestjs/common'

// Import controller and services
import { RobinhoodController } from './robinhood.controller'
import { RobinhoodClientService } from './services/robinhood-client.service'
import { AssetRegistryService } from './services/asset-registry.service'
import { UrlBuilderService } from './services/url-builder.service'
import { PledgeService } from './services/pledge.service'

/**
 * Robinhood Connect Module
 *
 * Example usage in backend:
 *
 * ```typescript
 * // In app.module.ts
 * import { RobinhoodModule } from '@/libs/robinhood';
 *
 * @Module({
 *   imports: [
 *     RobinhoodModule,  // Import complete module
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * This automatically registers:
 * - RobinhoodController (routes)
 * - All services (DI providers)
 * - Exports services for other modules
 */
// @Module({  // Commented out to avoid errors in POC
//   controllers: [RobinhoodController],
//   providers: [
//     // Main services
//     RobinhoodClientService,
//     AssetRegistryService,
//     UrlBuilderService,
//     PledgeService,
//   ],
//   exports: [
//     // Export services for use by other modules
//     RobinhoodClientService,
//     AssetRegistryService,
//     UrlBuilderService,
//     PledgeService,
//   ],
// })
export class RobinhoodModule {}

/**
 * Migration Instructions for Backend:
 *
 * 1. Uncomment the @Module() decorator above
 * 2. If using asset discovery services, add them to providers array
 * 3. If integrating with backend modules, add imports:
 *
 *    @Module({
 *      imports: [
 *        TypeOrmModule.forFeature([CryptoDonationPledge]),  // Database entities
 *        TokensModule,              // Token resolution
 *        NotificationModule,        // Notifications
 *      ],
 *      controllers: [RobinhoodController],
 *      providers: [...],
 *      exports: [...],
 *    })
 *
 * 4. Update services to use @Injectable() decorator
 * 5. Update service constructors to inject backend dependencies
 * 6. That's it! The module is ready to use.
 *
 * The controller automatically registers these routes:
 * - GET  /robinhood/health
 * - GET  /robinhood/assets
 * - POST /robinhood/url/generate
 * - POST /robinhood/callback
 * - POST /robinhood/pledge/create
 */

