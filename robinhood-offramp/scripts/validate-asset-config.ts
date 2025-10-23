/**
 * Validation script for asset metadata configuration
 *
 * Run with: npx tsx scripts/validate-asset-config.ts
 */

import {
  validateAssetConfiguration,
  getAssetStats,
  buildAssetConfigs,
} from '../lib/robinhood-asset-config'
import { ASSET_METADATA } from '../lib/robinhood-asset-metadata'

console.log('🔍 Validating Asset Configuration...\n')

// Step 1: Validate configuration
const validation = validateAssetConfiguration()

if (!validation.valid) {
  console.error('❌ Validation Failed!\n')
  validation.errors.forEach((error) => console.error(`  - ${error}`))
  process.exit(1)
}

console.log('✅ All enabled assets have wallet addresses\n')

// Step 2: Show statistics
const stats = getAssetStats()
console.log('📊 Asset Statistics:')
console.log(`  Total assets: ${stats.total}`)
console.log(`  Enabled: ${stats.enabled}`)
console.log(`  Disabled: ${stats.disabled}`)
console.log(`  Popular: ${stats.popular}`)
console.log(`\n  By Category:`)
Object.entries(stats.byCategory).forEach(([category, count]) => {
  console.log(`    ${category}: ${count}`)
})

// Step 3: Build and validate asset configs
console.log('\n🔨 Building Asset Configurations...')
const configs = buildAssetConfigs()
console.log(`✅ Successfully built ${configs.length} asset configurations\n`)

// Step 4: Check for missing icons
console.log('🖼️  Checking Icon References...')
const missingIcons: string[] = []
configs.forEach((config) => {
  // This is a placeholder - actual file check would require fs
  if (!config.icon) {
    missingIcons.push(config.symbol)
  }
})

if (missingIcons.length > 0) {
  console.warn('⚠️  Assets without icons:', missingIcons.join(', '))
} else {
  console.log('✅ All assets have icon references\n')
}

// Step 5: List all enabled assets
console.log('📋 Enabled Assets:')
configs.forEach((config) => {
  const popular = config.isPopular ? '⭐' : '  '
  console.log(`  ${popular} ${config.symbol.padEnd(10)} - ${config.name.padEnd(25)} (${config.network})`)
})

// Step 6: Summary
console.log('\n' + '━'.repeat(50))
console.log('✅ Asset Configuration Validation Complete!')
console.log('━'.repeat(50))

