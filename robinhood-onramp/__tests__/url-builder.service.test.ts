/**
 * Comprehensive tests for UrlBuilderService
 *
 * Tests:
 * - URL generation in Daffy style
 * - Parameter validation
 * - URL validation
 * - Callback URL parsing
 * - Configuration handling
 * - Edge cases
 */
import { UrlBuilderService } from '@/lib/robinhood/services/url-builder.service'

describe('UrlBuilderService', () => {
  // Save original env vars
  const originalEnv = process.env

  beforeEach(() => {
    // Reset env vars
    process.env = { ...originalEnv }
    process.env.ROBINHOOD_APP_ID = 'test-app-id-123'
    process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID = 'test-public-app-id-456'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Constructor', () => {
    it('should initialize with default config', () => {
      const service = new UrlBuilderService()
      expect(service).toBeDefined()
    })

    it('should accept custom base URL', () => {
      const service = new UrlBuilderService({
        baseUrl: 'https://custom.robinhood.com/onramp',
      })
      expect(service).toBeDefined()
    })

    it('should accept custom application ID', () => {
      const service = new UrlBuilderService({
        applicationId: 'custom-app-id',
      })
      expect(service).toBeDefined()
    })

    it('should accept custom logger', () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const service = new UrlBuilderService(undefined, mockLogger)
      expect(service).toBeDefined()
    })

    it('should throw error if no application ID in env', () => {
      delete process.env.ROBINHOOD_APP_ID
      delete process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID

      expect(() => new UrlBuilderService()).toThrow(/environment variable not set/)
    })

    it('should prefer NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID', () => {
      process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID = 'public-id'
      process.env.ROBINHOOD_APP_ID = 'private-id'

      const service = new UrlBuilderService()
      expect(service).toBeDefined()
    })

    it('should fallback to ROBINHOOD_APP_ID', () => {
      delete process.env.NEXT_PUBLIC_ROBINHOOD_APPLICATION_ID
      process.env.ROBINHOOD_APP_ID = 'private-id'

      const service = new UrlBuilderService()
      expect(service).toBeDefined()
    })
  })

  describe('generateOnrampUrl', () => {
    it('should generate valid URL with all parameters', () => {
      const service = new UrlBuilderService()

      const result = service.generateOnrampUrl({
        connectId: 'test-connect-id-abc',
        asset: 'BTC',
        network: 'BITCOIN',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://app.endaoment.org/callback',
      })

      expect(result.url).toBeDefined()
      expect(result.connectId).toBe('test-connect-id-abc')
      expect(result.params.asset).toBe('BTC')
      expect(result.params.network).toBe('BITCOIN')
      expect(result.params.walletAddress).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
    })

    it('should include required URL parameters', () => {
      const service = new UrlBuilderService()

      const result = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'ETH',
        network: 'ETHEREUM',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      })

      const url = new URL(result.url)

      expect(url.searchParams.get('applicationId')).toBeDefined()
      expect(url.searchParams.get('connectId')).toBe('test-id')
      expect(url.searchParams.get('paymentMethod')).toBe('crypto_balance')
      expect(url.searchParams.get('supportedAssets')).toBe('ETH')
      expect(url.searchParams.get('supportedNetworks')).toBe('ETHEREUM')
      expect(url.searchParams.get('walletAddress')).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')
    })

    it('should include Daffy-style parameters', () => {
      const service = new UrlBuilderService()

      const result = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'SOL',
        network: 'SOLANA',
        walletAddress: 'So11111111111111111111111111111111111111111',
      })

      const url = new URL(result.url)

      // Daffy includes both supportedAssets and assetCode
      expect(url.searchParams.get('supportedAssets')).toBe('SOL')
      expect(url.searchParams.get('assetCode')).toBe('SOL')
      expect(url.searchParams.get('flow')).toBe('transfer')
    })

    it('should use default redirect URL if not provided', () => {
      const service = new UrlBuilderService()

      const result = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      })

      const url = new URL(result.url)
      const redirectUrl = url.searchParams.get('redirectUrl')

      expect(redirectUrl).toBeDefined()
      expect(redirectUrl).toContain('callback')
    })

    it('should use custom redirect URL when provided', () => {
      const service = new UrlBuilderService()
      const customRedirect = 'https://custom.example.com/return'

      const result = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: customRedirect,
      })

      const url = new URL(result.url)
      expect(url.searchParams.get('redirectUrl')).toBe(customRedirect)
    })

    it('should throw error for empty connectId', () => {
      const service = new UrlBuilderService()

      expect(() =>
        service.generateOnrampUrl({
          connectId: '',
          asset: 'BTC',
          network: 'BITCOIN',
          walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        })
      ).toThrow('ConnectId is required')
    })

    it('should throw error for whitespace-only connectId', () => {
      const service = new UrlBuilderService()

      expect(() =>
        service.generateOnrampUrl({
          connectId: '   ',
          asset: 'BTC',
          network: 'BITCOIN',
          walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        })
      ).toThrow('ConnectId is required')
    })

    it('should throw error for invalid asset code', () => {
      const service = new UrlBuilderService()

      expect(() =>
        service.generateOnrampUrl({
          connectId: 'test-id',
          asset: '',
          network: 'BITCOIN',
          walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        })
      ).toThrow(/Invalid asset code/)
    })

    it('should throw error for empty network', () => {
      const service = new UrlBuilderService()

      expect(() =>
        service.generateOnrampUrl({
          connectId: 'test-id',
          asset: 'BTC',
          network: '' as any,
          walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        })
      ).toThrow('Network is required')
    })

    it('should throw error for invalid wallet address', () => {
      const service = new UrlBuilderService()

      expect(() =>
        service.generateOnrampUrl({
          connectId: 'test-id',
          asset: 'BTC',
          network: 'BITCOIN',
          walletAddress: '',
        })
      ).toThrow(/Invalid wallet address/)
    })

    it('should handle Bitcoin addresses', () => {
      const service = new UrlBuilderService()

      const result = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      })

      expect(result.params.walletAddress).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
    })

    it('should handle Ethereum addresses', () => {
      const service = new UrlBuilderService()

      const result = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'ETH',
        network: 'ETHEREUM',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      })

      expect(result.params.walletAddress).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')
    })

    it('should handle Solana addresses', () => {
      const service = new UrlBuilderService()

      const result = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'SOL',
        network: 'SOLANA',
        walletAddress: 'So11111111111111111111111111111111111111111',
      })

      expect(result.params.walletAddress).toBe('So11111111111111111111111111111111111111111')
    })

    it('should handle various asset codes', () => {
      const service = new UrlBuilderService()
      const assets = ['BTC', 'ETH', 'SOL', 'USDC', 'MATIC', 'AVAX', 'DOGE']

      assets.forEach((asset) => {
        const result = service.generateOnrampUrl({
          connectId: 'test-id',
          asset,
          network: 'ETHEREUM', // Using ETHEREUM for simplicity
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        })

        expect(result.params.asset).toBe(asset)
      })
    })

    it('should return metadata in result', () => {
      const service = new UrlBuilderService()

      const result = service.generateOnrampUrl({
        connectId: 'metadata-test-id',
        asset: 'ETH',
        network: 'ETHEREUM',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      })

      expect(result.connectId).toBe('metadata-test-id')
      expect(result.params).toEqual({
        asset: 'ETH',
        network: 'ETHEREUM',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      })
    })

    it('should use custom base URL from config', () => {
      const customBaseUrl = 'https://custom.robinhood.com/onramp'
      const service = new UrlBuilderService({
        baseUrl: customBaseUrl,
      })

      const result = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      })

      expect(result.url).toContain(customBaseUrl)
    })
  })

  describe('validateUrl', () => {
    it('should validate correctly formed URL', () => {
      const service = new UrlBuilderService()

      const generatedUrl = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      })

      const isValid = service.validateUrl({
        url: generatedUrl.url,
      })

      expect(isValid).toBe(true)
    })

    it('should validate URL against expected base', () => {
      const service = new UrlBuilderService()

      const generatedUrl = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      })

      const isValid = service.validateUrl({
        url: generatedUrl.url,
        expectedBaseUrl: 'https://robinhood.com/connect/amount',
      })

      expect(isValid).toBe(true)
    })

    it('should reject URL with wrong base', () => {
      const service = new UrlBuilderService()

      const isValid = service.validateUrl({
        url: 'https://wrong-domain.com/path?applicationId=test&connectId=abc&walletAddress=0x123',
        expectedBaseUrl: 'https://robinhood.com/connect/amount',
      })

      expect(isValid).toBe(false)
    })

    it('should reject URL missing applicationId', () => {
      const service = new UrlBuilderService()

      const isValid = service.validateUrl({
        url: 'https://robinhood.com/connect/amount?connectId=abc&walletAddress=0x123',
      })

      expect(isValid).toBe(false)
    })

    it('should reject URL missing connectId', () => {
      const service = new UrlBuilderService()

      const isValid = service.validateUrl({
        url: 'https://robinhood.com/connect/amount?applicationId=test&walletAddress=0x123',
      })

      expect(isValid).toBe(false)
    })

    it('should reject URL missing walletAddress', () => {
      const service = new UrlBuilderService()

      const isValid = service.validateUrl({
        url: 'https://robinhood.com/connect/amount?applicationId=test&connectId=abc',
      })

      expect(isValid).toBe(false)
    })

    it('should reject malformed URL', () => {
      const service = new UrlBuilderService()

      const isValid = service.validateUrl({
        url: 'not-a-valid-url',
      })

      expect(isValid).toBe(false)
    })

    it('should handle URL without expected base', () => {
      const service = new UrlBuilderService()

      const isValid = service.validateUrl({
        url: 'https://robinhood.com/connect/amount?applicationId=test&connectId=abc&walletAddress=0x123',
      })

      expect(isValid).toBe(true)
    })

    it('should validate protocol', () => {
      const service = new UrlBuilderService()

      const isValid = service.validateUrl({
        url: 'http://robinhood.com/connect/amount?applicationId=test&connectId=abc&walletAddress=0x123',
        expectedBaseUrl: 'https://robinhood.com/connect/amount',
      })

      expect(isValid).toBe(false) // Protocol mismatch
    })

    it('should validate pathname', () => {
      const service = new UrlBuilderService()

      const isValid = service.validateUrl({
        url: 'https://robinhood.com/wrong/path?applicationId=test&connectId=abc&walletAddress=0x123',
        expectedBaseUrl: 'https://robinhood.com/connect/amount',
      })

      expect(isValid).toBe(false) // Path mismatch
    })
  })

  describe('parseCallbackUrl', () => {
    it('should parse callback URL with all parameters', () => {
      const service = new UrlBuilderService()

      const callbackUrl =
        'https://app.endaoment.org/callback?orderId=order-123&asset=BTC&network=BITCOIN&amount=0.5&connectId=connect-abc'

      const params = service.parseCallbackUrl(callbackUrl)

      expect(params.orderId).toBe('order-123')
      expect(params.asset).toBe('BTC')
      expect(params.network).toBe('BITCOIN')
      expect(params.amount).toBe('0.5')
      expect(params.connectId).toBe('connect-abc')
    })

    it('should parse URL with single parameter', () => {
      const service = new UrlBuilderService()

      const callbackUrl = 'https://app.endaoment.org/callback?status=success'
      const params = service.parseCallbackUrl(callbackUrl)

      expect(params.status).toBe('success')
    })

    it('should parse URL with no parameters', () => {
      const service = new UrlBuilderService()

      const callbackUrl = 'https://app.endaoment.org/callback'
      const params = service.parseCallbackUrl(callbackUrl)

      expect(Object.keys(params)).toHaveLength(0)
    })

    it('should handle URL-encoded values', () => {
      const service = new UrlBuilderService()

      const callbackUrl =
        'https://app.endaoment.org/callback?message=Hello%20World&email=test%40example.com'
      const params = service.parseCallbackUrl(callbackUrl)

      expect(params.message).toBe('Hello World')
      expect(params.email).toBe('test@example.com')
    })

    it('should handle special characters', () => {
      const service = new UrlBuilderService()

      const callbackUrl =
        'https://app.endaoment.org/callback?id=abc-123-def&hash=0xabc123'
      const params = service.parseCallbackUrl(callbackUrl)

      expect(params.id).toBe('abc-123-def')
      expect(params.hash).toBe('0xabc123')
    })

    it('should handle duplicate parameters (takes last)', () => {
      const service = new UrlBuilderService()

      const callbackUrl =
        'https://app.endaoment.org/callback?param=first&param=second'
      const params = service.parseCallbackUrl(callbackUrl)

      // URL API typically takes the last value for duplicate keys
      expect(params.param).toBeDefined()
    })

    it('should throw error for invalid URL', () => {
      const service = new UrlBuilderService()

      expect(() => service.parseCallbackUrl('not-a-valid-url')).toThrow(/Invalid callback URL/)
    })

    it('should handle empty string parameter values', () => {
      const service = new UrlBuilderService()

      const callbackUrl = 'https://app.endaoment.org/callback?empty=&filled=value'
      const params = service.parseCallbackUrl(callbackUrl)

      expect(params.empty).toBe('')
      expect(params.filled).toBe('value')
    })

    it('should parse numeric parameters as strings', () => {
      const service = new UrlBuilderService()

      const callbackUrl = 'https://app.endaoment.org/callback?amount=123.45&count=10'
      const params = service.parseCallbackUrl(callbackUrl)

      expect(params.amount).toBe('123.45')
      expect(params.count).toBe('10')
    })

    it('should handle boolean-like values as strings', () => {
      const service = new UrlBuilderService()

      const callbackUrl =
        'https://app.endaoment.org/callback?success=true&failed=false'
      const params = service.parseCallbackUrl(callbackUrl)

      expect(params.success).toBe('true')
      expect(params.failed).toBe('false')
    })
  })

  describe('Logging', () => {
    it('should log URL generation', () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const service = new UrlBuilderService(undefined, mockLogger)

      service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      })

      expect(mockLogger.info).toHaveBeenCalled()
    })

    it('should log URL validation results', () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const service = new UrlBuilderService(undefined, mockLogger)

      service.validateUrl({
        url: 'https://robinhood.com/connect/amount?applicationId=test&connectId=abc&walletAddress=0x123',
      })

      expect(mockLogger.info).toHaveBeenCalled()
    })

    it('should log validation warnings', () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const service = new UrlBuilderService(undefined, mockLogger)

      service.validateUrl({
        url: 'https://wrong-domain.com/path',
        expectedBaseUrl: 'https://robinhood.com/connect/amount',
      })

      expect(mockLogger.warn).toHaveBeenCalled()
    })

    it('should log callback parsing', () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const service = new UrlBuilderService(undefined, mockLogger)

      service.parseCallbackUrl('https://app.endaoment.org/callback?status=success')

      expect(mockLogger.info).toHaveBeenCalled()
    })

    it('should log errors', () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const service = new UrlBuilderService(undefined, mockLogger)

      try {
        service.parseCallbackUrl('invalid-url')
      } catch {
        // Expected error
      }

      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long connectIds', () => {
      const service = new UrlBuilderService()
      const longConnectId = 'a'.repeat(500)

      const result = service.generateOnrampUrl({
        connectId: longConnectId,
        asset: 'BTC',
        network: 'BITCOIN',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      })

      expect(result.connectId).toBe(longConnectId)
    })

    it('should handle uppercase/lowercase asset codes', () => {
      const service = new UrlBuilderService()

      const result = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'btc', // lowercase
        network: 'BITCOIN',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      })

      expect(result.params.asset).toBe('btc')
    })

    it('should handle special characters in redirect URL', () => {
      const service = new UrlBuilderService()

      const result = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'BTC',
        network: 'BITCOIN',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://app.example.com/callback?ref=donation&source=robinhood',
      })

      expect(result.url).toBeDefined()
    })

    it('should handle mixed case networks', () => {
      const service = new UrlBuilderService()

      const result = service.generateOnrampUrl({
        connectId: 'test-id',
        asset: 'ETH',
        network: 'Ethereum' as any, // Mixed case
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      })

      expect(result.params.network).toBe('Ethereum')
    })

    it('should parse callback URLs with hash fragments', () => {
      const service = new UrlBuilderService()

      // Hash fragments are typically ignored by URL API
      const callbackUrl =
        'https://app.endaoment.org/callback?status=success#section'
      const params = service.parseCallbackUrl(callbackUrl)

      expect(params.status).toBe('success')
    })

    it('should handle callback URLs with port numbers', () => {
      const service = new UrlBuilderService()

      const callbackUrl = 'http://localhost:3000/callback?orderId=123'
      const params = service.parseCallbackUrl(callbackUrl)

      expect(params.orderId).toBe('123')
    })
  })

  describe('Integration Scenarios', () => {
    it('should support complete URL generation and validation flow', () => {
      const service = new UrlBuilderService()

      // Generate URL
      const result = service.generateOnrampUrl({
        connectId: 'integration-test-id',
        asset: 'ETH',
        network: 'ETHEREUM',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        redirectUrl: 'https://app.endaoment.org/callback',
      })

      // Validate generated URL
      const isValid = service.validateUrl({
        url: result.url,
        expectedBaseUrl: 'https://robinhood.com/connect/amount',
      })

      expect(isValid).toBe(true)
    })

    it('should support callback URL round-trip', () => {
      const service = new UrlBuilderService()

      // Original parameters
      const originalParams = {
        orderId: 'order-123',
        asset: 'BTC',
        network: 'BITCOIN',
        amount: '0.5',
        connectId: 'connect-abc',
        status: 'completed',
      }

      // Build callback URL
      const callbackUrl = new URL('https://app.endaoment.org/callback')
      Object.entries(originalParams).forEach(([key, value]) => {
        callbackUrl.searchParams.append(key, value)
      })

      // Parse it back
      const parsedParams = service.parseCallbackUrl(callbackUrl.toString())

      // Verify all parameters preserved
      expect(parsedParams).toEqual(originalParams)
    })

    it('should handle complete donation flow URL pattern', () => {
      const service = new UrlBuilderService()

      // Step 1: Generate onramp URL
      const onrampResult = service.generateOnrampUrl({
        connectId: 'flow-test-connect-id',
        asset: 'ETH',
        network: 'ETHEREUM',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        redirectUrl: 'https://app.endaoment.org/callback',
      })

      expect(onrampResult.url).toContain('robinhood.com/connect/amount')

      // Step 2: Simulate callback with parameters
      const callbackUrl =
        'https://app.endaoment.org/callback?orderId=order-456&asset=ETH&network=ETHEREUM&amount=1.5&connectId=flow-test-connect-id'

      // Step 3: Parse callback
      const callbackParams = service.parseCallbackUrl(callbackUrl)

      expect(callbackParams.connectId).toBe('flow-test-connect-id')
      expect(callbackParams.asset).toBe('ETH')
      expect(callbackParams.network).toBe('ETHEREUM')
      expect(callbackParams.amount).toBe('1.5')
      expect(callbackParams.orderId).toBe('order-456')
    })
  })
})

