/**
 * Export Robinhood Connect assets as OTC tokens (for backend integration)
 *
 * This script generates a JSON file with all Robinhood Connect assets
 * in the backend's IOtcToken format, ready to be added to:
 * libs/api/tokens/src/lib/otc-token.ts
 *
 * Usage:
 *   npx tsx scripts/export-otc-tokens.ts
 *
 * Output:
 *   scripts/robinhood-otc-tokens.json
 */

import * as fs from 'fs'
import * as path from 'path'
import {
  initializeAssetRegistry,
  getAssetRegistry,
} from '../lib/robinhood/assets/registry'

async function main() {
  console.log('🚀 Exporting Robinhood Connect assets as OTC tokens...\n')

  // Initialize dynamic registry
  console.log('📡 Fetching latest assets from Robinhood API...')
  await initializeAssetRegistry({ useDynamic: true, serverSide: true })

  // Get all enabled assets
  const registry = getAssetRegistry()
  const otcTokens = Object.values(registry)
    .filter((asset) => asset.enabled)
    .map((asset) => ({
      address: asset.depositAddress.address,
      symbol: asset.symbol,
      name: asset.name,
      memo: asset.depositAddress.memo || null,
      logoUrl: asset.icon ? `/assets/crypto-icons/${asset.icon}` : null,
    }))

  console.log(`✅ Found ${otcTokens.length} enabled assets\n`)

  // Format for backend integration
  const output = {
    metadata: {
      generated: new Date().toISOString(),
      source: 'robinhood-connect-poc',
      totalAssets: otcTokens.length,
      format: 'IOtcToken (matches libs/api/tokens/src/lib/otc-token.ts)',
    },
    tokens: otcTokens,
    typescript: {
      description: 'TypeScript array for direct copy-paste into backend',
      code: formatAsTypescriptArray(otcTokens),
    },
  }

  // Write to file
  const outputPath = path.join(__dirname, 'robinhood-otc-tokens.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

  console.log(`📄 Exported to: ${outputPath}\n`)
  console.log('📊 Summary:')
  console.log(`   Total tokens: ${otcTokens.length}`)
  console.log(`   With memos: ${otcTokens.filter((t) => t.memo).length}`)
  console.log(`   Symbols: ${otcTokens.map((t) => t.symbol).join(', ')}\n`)

  // Show sample token
  console.log('🔍 Sample token (BTC):')
  const btc = otcTokens.find((t) => t.symbol === 'BTC')
  if (btc) {
    console.log(JSON.stringify(btc, null, 2))
  }

  console.log('\n✅ Export complete!')
  console.log('\n📋 Next steps:')
  console.log('   1. Review robinhood-otc-tokens.json')
  console.log('   2. Copy TypeScript array to backend APPROVED_OTC_TOKENS')
  console.log('   3. Verify addresses with Coinbase Prime team')
  console.log('   4. Test deposits for each asset')
}

function formatAsTypescriptArray(tokens: readonly any[]): string {
  const lines = tokens.map((token, index) => {
    const comma = index < tokens.length - 1 ? ',' : ''
    return `  {
    address: '${token.address}',
    symbol: '${token.symbol}',
    name: '${token.name}',
    memo: ${token.memo ? `'${token.memo}'` : 'null'},
    logoUrl: ${token.logoUrl ? `'${token.logoUrl}'` : 'null'},
  }${comma}`
  })

  return `export const ROBINHOOD_OTC_TOKENS: ReadonlyArray<IOtcToken> = [\n${lines.join('\n')}\n]`
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
}
