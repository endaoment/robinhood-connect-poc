/**
 * Test Infrastructure Validation
 *
 * Simple tests to verify Jest and Nock are working correctly
 */
import { mockConnectIdSuccess, mockDiscoverySuccess, createMockAssets, cleanAll } from './mocks/robinhood-nock-api'
import { RobinhoodClientService } from '@/lib/robinhood/services/robinhood-client.service'

describe('Test Infrastructure', () => {
  describe('Jest Configuration', () => {
    it('should run basic test', () => {
      expect(true).toBe(true)
    })

    it('should have environment variables set', () => {
      expect(process.env.ROBINHOOD_APP_ID).toBe('test-app-id-123')
      expect(process.env.ROBINHOOD_API_KEY).toBe('test-api-key-456')
    })
  })

  describe('Nock Mocking', () => {
    afterEach(() => {
      cleanAll()
    })

    it('should mock ConnectId generation', async () => {
      const testConnectId = 'test-connect-id-abc'
      mockConnectIdSuccess(testConnectId)

      const service = new RobinhoodClientService({
        appId: process.env.ROBINHOOD_APP_ID!,
        apiKey: process.env.ROBINHOOD_API_KEY!,
      })

      const result = await service.generateConnectId({
        walletAddress: '0x123',
        userIdentifier: 'test@example.com',
      })

      expect(result).toBe(testConnectId)
    })

    it('should mock Discovery API', async () => {
      const mockAssets = createMockAssets(3)
      mockDiscoverySuccess(mockAssets)

      const service = new RobinhoodClientService({
        appId: process.env.ROBINHOOD_APP_ID!,
        apiKey: process.env.ROBINHOOD_API_KEY!,
      })

      const result = await service.fetchTradingAssets()

      expect(result).toHaveLength(3)
      expect(result[0].asset_code).toBe('BTC')
    })
  })

  describe('Test Utilities', () => {
    it('should create mock assets', () => {
      const assets = createMockAssets(5)
      expect(assets).toHaveLength(5)
      expect(assets[0].asset_code).toBe('BTC')
      expect(assets[1].asset_code).toBe('ETH')
    })

    it('should create single mock asset with overrides', () => {
      const { createMockAsset } = require('./mocks/robinhood-nock-api')
      const asset = createMockAsset({
        asset_code: 'CUSTOM',
        name: 'Custom Token',
      })

      expect(asset.asset_code).toBe('CUSTOM')
      expect(asset.name).toBe('Custom Token')
      expect(asset.is_active).toBe(true)
    })
  })
})

