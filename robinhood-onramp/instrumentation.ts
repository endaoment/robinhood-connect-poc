/**
 * Next.js Instrumentation Hook
 * Runs once when the Next.js server starts
 * 
 * Used to initialize:
 * - Dynamic asset registry (fetches from Robinhood + Prime APIs)
 * - Backend token map sync (validates against Endaoment API)
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeRobinhoodConnect } = await import("./lib/robinhood/init");
    await initializeRobinhoodConnect();
  }
}


