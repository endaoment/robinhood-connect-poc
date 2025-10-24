/**
 * URL Builder Tests
 *
 * NOTE: This file requires Jest to be installed and configured.
 * To run these tests, first install Jest:
 *
 * npm install --save-dev jest @jest/globals @types/jest ts-jest
 *
 * Then add to package.json:
 * "scripts": {
 *   "test": "jest"
 * }
 *
 * For now, use scripts/test-url-generation.ts for validation
 */

// Uncomment when Jest is configured:
/*
import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  buildDaffyStyleOnrampUrl,
  validateAssetNetworkCompatibility,
} from '../lib/robinhood-url-builder'

describe('buildDaffyStyleOnrampUrl', () => {
  beforeEach(() => {
    // Set required environment variable
    process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID = 'db2c834a-a740-4dfc-bbaf-06887558185f'
  })

  it('should generate valid URL for ETH on Ethereum', () => {
    const result = buildDaffyStyleOnrampUrl({
      asset: 'ETH',
      network: 'ETHEREUM',
      walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
    })

    expect(result.url).toContain('applink.robinhood.com/u/connect')
    expect(result.url).toContain('supportedAssets=ETH')
    expect(result.url).toContain('supportedNetworks=ETHEREUM')
    expect(result.url).toContain('walletAddress=0xa22d566f52b303049d27a7169ed17a925b3fdb5e')
    expect(result.url).toContain('paymentMethod=crypto_balance')
    expect(result.connectId).toBeTruthy()
  })

  it('should generate valid URL for BTC on Bitcoin', () => {
    const result = buildDaffyStyleOnrampUrl({
      asset: 'BTC',
      network: 'BITCOIN',
      walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    })

    expect(result.url).toContain('supportedAssets=BTC')
    expect(result.url).toContain('supportedNetworks=BITCOIN')
  })

  it('should generate valid URL for SOL on Solana', () => {
    const result = buildDaffyStyleOnrampUrl({
      asset: 'SOL',
      network: 'SOLANA',
      walletAddress: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
    })

    expect(result.url).toContain('supportedAssets=SOL')
    expect(result.url).toContain('supportedNetworks=SOLANA')
  })

  it('should generate valid URL for USDC on Ethereum', () => {
    const result = buildDaffyStyleOnrampUrl({
      asset: 'USDC',
      network: 'ETHEREUM',
      walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
    })

    expect(result.url).toContain('supportedAssets=USDC')
    expect(result.url).toContain('supportedNetworks=ETHEREUM')
  })

  it('should generate valid URL for MATIC on Polygon', () => {
    const result = buildDaffyStyleOnrampUrl({
      asset: 'MATIC',
      network: 'POLYGON',
      walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
    })

    expect(result.url).toContain('supportedAssets=MATIC')
    expect(result.url).toContain('supportedNetworks=POLYGON')
  })

  it('should use provided connectId', () => {
    const customId = 'test-123-456'
    const result = buildDaffyStyleOnrampUrl({
      asset: 'ETH',
      network: 'ETHEREUM',
      walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
      connectId: customId,
    })

    expect(result.connectId).toBe(customId)
    expect(result.url).toContain(`connectId=${customId}`)
  })

  it('should use provided redirectUrl', () => {
    const customUrl = 'https://example.com/custom-callback'
    const result = buildDaffyStyleOnrampUrl({
      asset: 'ETH',
      network: 'ETHEREUM',
      walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
      redirectUrl: customUrl,
    })

    expect(result.url).toContain(`redirectUrl=${encodeURIComponent(customUrl)}`)
  })

  it('should throw error for missing asset', () => {
    expect(() => {
      buildDaffyStyleOnrampUrl({
        asset: '',
        network: 'ETHEREUM',
        walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
      })
    }).toThrow('Asset, network, and walletAddress are required')
  })

  it('should throw error for missing network', () => {
    expect(() => {
      buildDaffyStyleOnrampUrl({
        asset: 'ETH',
        network: '' as any,
        walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
      })
    }).toThrow('Asset, network, and walletAddress are required')
  })

  it('should throw error for missing wallet address', () => {
    expect(() => {
      buildDaffyStyleOnrampUrl({
        asset: 'ETH',
        network: 'ETHEREUM',
        walletAddress: '',
      })
    }).toThrow('Asset, network, and walletAddress are required')
  })

  it('should throw error for invalid Ethereum address', () => {
    expect(() => {
      buildDaffyStyleOnrampUrl({
        asset: 'ETH',
        network: 'ETHEREUM',
        walletAddress: 'invalid-address',
      })
    }).toThrow('Invalid wallet address format')
  })

  it('should throw error for invalid Bitcoin address', () => {
    expect(() => {
      buildDaffyStyleOnrampUrl({
        asset: 'BTC',
        network: 'BITCOIN',
        walletAddress: '0x123',
      })
    }).toThrow('Invalid wallet address format')
  })

  it('should include all required parameters', () => {
    const result = buildDaffyStyleOnrampUrl({
      asset: 'ETH',
      network: 'ETHEREUM',
      walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
    })

    // Check all required parameters are present
    expect(result.url).toContain('applicationId=')
    expect(result.url).toContain('walletAddress=')
    expect(result.url).toContain('supportedAssets=')
    expect(result.url).toContain('supportedNetworks=')
    expect(result.url).toContain('connectId=')
    expect(result.url).toContain('paymentMethod=crypto_balance')
    expect(result.url).toContain('redirectUrl=')
  })

  it('should return params object with correct values', () => {
    const result = buildDaffyStyleOnrampUrl({
      asset: 'ETH',
      network: 'ETHEREUM',
      walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
    })

    expect(result.params.asset).toBe('ETH')
    expect(result.params.network).toBe('ETHEREUM')
    expect(result.params.walletAddress).toBe('0xa22d566f52b303049d27a7169ed17a925b3fdb5e')
  })

  it('should throw error when environment variable is missing', () => {
    delete process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID

    expect(() => {
      buildDaffyStyleOnrampUrl({
        asset: 'ETH',
        network: 'ETHEREUM',
        walletAddress: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
      })
    }).toThrow('NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID environment variable not set')

    // Restore for other tests
    process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID = 'db2c834a-a740-4dfc-bbaf-06887558185f'
  })
})

describe('validateAssetNetworkCompatibility', () => {
  it('should validate ETH on ETHEREUM', () => {
    const isValid = validateAssetNetworkCompatibility('ETH', 'ETHEREUM')
    expect(isValid).toBe(true)
  })

  it('should validate BTC on BITCOIN', () => {
    const isValid = validateAssetNetworkCompatibility('BTC', 'BITCOIN')
    expect(isValid).toBe(true)
  })

  it('should validate SOL on SOLANA', () => {
    const isValid = validateAssetNetworkCompatibility('SOL', 'SOLANA')
    expect(isValid).toBe(true)
  })

  it('should validate USDC on ETHEREUM', () => {
    const isValid = validateAssetNetworkCompatibility('USDC', 'ETHEREUM')
    expect(isValid).toBe(true)
  })

  it('should validate MATIC on POLYGON', () => {
    const isValid = validateAssetNetworkCompatibility('MATIC', 'POLYGON')
    expect(isValid).toBe(true)
  })

  it('should reject ETH on BITCOIN', () => {
    const isValid = validateAssetNetworkCompatibility('ETH', 'BITCOIN')
    expect(isValid).toBe(false)
  })

  it('should reject BTC on ETHEREUM', () => {
    const isValid = validateAssetNetworkCompatibility('BTC', 'ETHEREUM')
    expect(isValid).toBe(false)
  })

  it('should reject unknown asset', () => {
    const isValid = validateAssetNetworkCompatibility('FAKE', 'ETHEREUM')
    expect(isValid).toBe(false)
  })
})
*/

// Placeholder export to make this a valid TypeScript module
export {}
