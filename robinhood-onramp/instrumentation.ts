/**
 * Next.js Instrumentation Hook
 * 
 * This file must stay at the root of the app directory.
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * 
 * Runs once when the Next.js server starts
 * 
 * Used to initialize:
 * - reflect-metadata (required for class-validator decorators)
 * - Dynamic asset registry (fetches from Robinhood + Prime APIs)
 * - Backend token map sync (validates against Endaoment API)
 */

// Import reflect-metadata for class-validator decorators
import 'reflect-metadata';

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log('[Instrumentation] Initializing Robinhood Connect...');
    
    // Dynamically import to avoid loading on client
    const { initializeAssetRegistry } = await import('./libs/robinhood/src/lib/assets/registry');
    
    try {
      // Initialize asset registry with dynamic fetching from APIs
      await initializeAssetRegistry({
        useDynamic: true,
        serverSide: true,
      });
      console.log('[Instrumentation] ✓ Asset registry initialized successfully');
    } catch (error) {
      console.error('[Instrumentation] ✗ Failed to initialize asset registry:', error);
      console.log('[Instrumentation] Will fall back to static registry on first access');
    }
  }
}


