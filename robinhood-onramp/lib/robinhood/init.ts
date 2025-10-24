/**
 * Robinhood Connect Initialization
 * Call this once at app startup (server-side)
 */

import { initializeAssetRegistry } from './assets/registry'

export async function initializeRobinhoodConnect(): Promise<void> {
  console.log('[Robinhood Connect] Initializing...')

  const startTime = Date.now()

  try {
    // Initialize asset registry
    await initializeAssetRegistry({
      useDynamic: shouldUseDynamicRegistry(),
      serverSide: true,
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    })

    const duration = Date.now() - startTime
    console.log(`[Robinhood Connect] Initialized in ${duration}ms`)
  } catch (error) {
    console.error('[Robinhood Connect] Initialization failed:', error)
    throw error
  }
}

function shouldUseDynamicRegistry(): boolean {
  // Use dynamic in production, static in development (for speed)
  if (process.env.FORCE_DYNAMIC_REGISTRY === 'true') {
    console.log('[Init] FORCE_DYNAMIC_REGISTRY=true - using DYNAMIC mode')
    return true
  }
  if (process.env.FORCE_STATIC_REGISTRY === 'true') {
    console.log('[Init] FORCE_STATIC_REGISTRY=true - using STATIC mode')
    return false
  }

  const isDynamic = process.env.NODE_ENV === 'production'
  console.log(`[Init] NODE_ENV=${process.env.NODE_ENV} - using ${isDynamic ? 'DYNAMIC' : 'STATIC'} mode`)
  return isDynamic
}
