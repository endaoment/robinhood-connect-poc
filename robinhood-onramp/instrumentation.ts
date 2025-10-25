/**
 * Next.js Instrumentation Hook
 * 
 * This file must stay at the root of the app directory.
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * 
 * Runs once when the Next.js server starts
 * 
 * Used to initialize:
 * - Dynamic asset registry (fetches from Robinhood + Prime APIs)
 * - Backend token map sync (validates against Endaoment API)
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Note: Init logic moved to service initialization
    // Asset registry is initialized on-demand in AssetRegistryService
    console.log("Robinhood Connect initialization skipped - services handle their own setup");
  }
}


