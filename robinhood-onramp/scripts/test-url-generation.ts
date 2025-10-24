/**
 * Test URL generation for all supported assets
 *
 * Run with: npx tsx scripts/test-url-generation.ts
 */

import { buildAssetConfigs } from '../lib/robinhood-asset-config'
import { buildDaffyStyleOnrampUrl } from '../lib/robinhood-url-builder'

console.log('🧪 Testing URL Generation for All Assets\n')

// Set required environment variable for testing (supports both new and legacy names)
process.env.ROBINHOOD_APP_ID = process.env.ROBINHOOD_APP_ID || 'db2c834a-a740-4dfc-bbaf-06887558185f'

const configs = buildAssetConfigs()
const results: Array<{ asset: string; success: boolean; error?: string }> = []

configs.forEach((config) => {
  try {
    const result = buildDaffyStyleOnrampUrl({
      asset: config.symbol,
      network: config.network,
      walletAddress: config.walletAddress,
    })

    // Verify URL structure
    if (!result.url.includes('applink.robinhood.com')) {
      throw new Error('Invalid base URL')
    }

    if (!result.url.includes(`supportedAssets=${config.symbol}`)) {
      throw new Error('Missing or incorrect asset parameter')
    }

    console.log(`✅ ${config.symbol.padEnd(20)} ${config.network.padEnd(15)} URL: ${result.url.length} chars`)
    results.push({ asset: config.symbol, success: true })
  } catch (error) {
    console.error(
      `❌ ${config.symbol.padEnd(20)} ${config.network.padEnd(15)} Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
    results.push({
      asset: config.symbol,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

// Summary
console.log('\n' + '━'.repeat(70))
console.log('Summary:')
console.log(`  Total assets: ${results.length}`)
console.log(`  ✅ Successful: ${results.filter((r) => r.success).length}`)
console.log(`  ❌ Failed: ${results.filter((r) => !r.success).length}`)

if (results.some((r) => !r.success)) {
  console.log('\nFailed assets:')
  results
    .filter((r) => !r.success)
    .forEach((r) => {
      console.log(`  - ${r.asset}: ${r.error}`)
    })
  process.exit(1)
}

console.log('\n✅ All assets generated valid URLs!')
console.log('━'.repeat(70))
