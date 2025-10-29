/**
 * Nock helpers for mocking Robinhood API calls in tests
 *
 * Based on Coinbase nock-api pattern
 */
import nock from 'nock'

const ROBINHOOD_BASE_URL = 'https://api.robinhood.com'

interface MockRobinhoodAsset {
  asset_code: string
  name: string
  is_active: boolean
  networks: Array<{
    blockchain: string
    is_active: boolean
    confirmation_count: number
  }>
}

/**
 * Mock successful ConnectId generation
 */
export function mockConnectIdSuccess(connectId: string = 'test-connect-id-123') {
  return nock(ROBINHOOD_BASE_URL)
    .post('/catpay/v1/connect_id/')
    .reply(200, {
      connect_id: connectId,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    })
}

/**
 * Mock ConnectId generation failure
 */
export function mockConnectIdFailure(statusCode: number = 500, message: string = 'Internal Server Error') {
  return nock(ROBINHOOD_BASE_URL)
    .post('/catpay/v1/connect_id/')
    .reply(statusCode, {
      error: message,
    })
}

/**
 * Mock successful Discovery API call
 */
export function mockDiscoverySuccess(assets: MockRobinhoodAsset[] = []) {
  return nock(ROBINHOOD_BASE_URL)
    .get('/api/v1/crypto/trading/assets/')
    .reply(200, {
      results: assets,
      count: assets.length,
    })
}

/**
 * Mock Discovery API with query parameters
 */
export function mockDiscoveryWithQuery(query: Record<string, string>, assets: MockRobinhoodAsset[] = []) {
  return nock(ROBINHOOD_BASE_URL)
    .get('/api/v1/crypto/trading/assets/')
    .query(query)
    .reply(200, {
      results: assets,
      count: assets.length,
    })
}

/**
 * Mock Discovery API failure
 */
export function mockDiscoveryFailure(statusCode: number = 500, message: string = 'Internal Server Error') {
  return nock(ROBINHOOD_BASE_URL)
    .get('/api/v1/crypto/trading/assets/')
    .reply(statusCode, {
      error: message,
    })
}

/**
 * Mock network timeout
 */
export function mockTimeout(endpoint: string, method: 'GET' | 'POST' = 'GET') {
  return nock(ROBINHOOD_BASE_URL)
    [method.toLowerCase() as 'get' | 'post'](endpoint)
    .delayConnection(30000) // 30 second delay
    .reply(200)
}

/**
 * Mock successful Order Details API call
 */
export function mockOrderDetailsSuccess(connectId: string, orderData: Partial<any> = {}) {
  const defaultData = {
    applicationId: 'test-app-id',
    connectId,
    assetCode: 'SOL',
    networkCode: 'SOLANA',
    fiatCode: 'USD',
    fiatAmount: '0.41',
    cryptoAmount: '0.002',
    price: '205.00',
    networkFee: {
      type: 'PRICE_ITEM_TYPE_CRYPTO_CURRENCY_NETWORK_FEE',
      fiatAmount: '0.05',
      cryptoQuantity: '0.0002',
    },
    processingFee: {
      type: 'PRICE_ITEM_TYPE_CRYPTO_CURRENCY_PROCESSING_FEE',
      fiatAmount: '0',
      cryptoQuantity: '0',
    },
    paymentMethod: 'crypto_balance',
    totalAmount: {
      type: 'PRICE_ITEM_TYPE_TOTAL',
      fiatAmount: '0.46',
      cryptoQuantity: '0.0022',
    },
    blockchainTransactionId: '4bED2xdo6sjGWaqF1VaFGXdzYWuasg1pKQi1x1wSzhKErDbDujoFggLSFkTMuAT72uy5nXPtoSMCahLrsTuXhahz',
    destinationAddress: 'DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1',
    referenceId: '',
    status: 'ORDER_STATUS_SUCCEEDED',
  }

  return nock(ROBINHOOD_BASE_URL)
    .get(`/catpay/v1/external/order/${connectId}`)
    .reply(200, { ...defaultData, ...orderData })
}

/**
 * Mock Order Details API with IN_PROGRESS status
 */
export function mockOrderDetailsInProgress(connectId: string) {
  return mockOrderDetailsSuccess(connectId, {
    status: 'ORDER_STATUS_IN_PROGRESS',
    blockchainTransactionId: '',
    fiatAmount: '0',
    cryptoAmount: '0',
  })
}

/**
 * Mock Order Details API with FAILED status
 */
export function mockOrderDetailsFailed(connectId: string) {
  return mockOrderDetailsSuccess(connectId, {
    status: 'ORDER_STATUS_FAILED',
  })
}

/**
 * Mock Order Details API with CANCELLED status
 */
export function mockOrderDetailsCancelled(connectId: string) {
  return mockOrderDetailsSuccess(connectId, {
    status: 'ORDER_STATUS_CANCELLED',
  })
}

/**
 * Mock Order Details API failure (404 - Not Found)
 */
export function mockOrderDetailsNotFound(connectId: string) {
  return nock(ROBINHOOD_BASE_URL)
    .get(`/catpay/v1/external/order/${connectId}`)
    .reply(404, {
      code: 5,
      message: 'order not found for reference id provided',
      details: [
        {
          '@type': 'type.googleapis.com/rosetta.catpay.v1.ErrorResponse',
          message: 'order not found for reference id provided',
          code: 'ERROR_CODE_NOT_FOUND',
        },
      ],
    })
}

/**
 * Mock Order Details API failure (generic error)
 */
export function mockOrderDetailsFailure(connectId: string, statusCode: number = 500, message: string = 'Internal Server Error') {
  return nock(ROBINHOOD_BASE_URL)
    .get(`/catpay/v1/external/order/${connectId}`)
    .reply(statusCode, {
      error: message,
    })
}

/**
 * Sample trading asset for tests
 */
export function createMockAsset(overrides: Partial<any> = {}) {
  return {
    asset_code: 'BTC',
    name: 'Bitcoin',
    is_active: true,
    networks: [
      {
        blockchain: 'BITCOIN',
        is_active: true,
        confirmation_count: 3,
      },
    ],
    ...overrides,
  }
}

/**
 * Create multiple mock assets
 */
export function createMockAssets(count: number = 3): MockRobinhoodAsset[] {
  const assetCodes = ['BTC', 'ETH', 'SOL', 'USDC', 'MATIC', 'AVAX', 'DOGE']
  const names = ['Bitcoin', 'Ethereum', 'Solana', 'USD Coin', 'Polygon', 'Avalanche', 'Dogecoin']
  const networks = ['BITCOIN', 'ETHEREUM', 'SOLANA', 'ETHEREUM', 'POLYGON', 'AVALANCHE', 'DOGECOIN']

  return Array.from({ length: Math.min(count, assetCodes.length) }, (_, i) => ({
    asset_code: assetCodes[i],
    name: names[i],
    is_active: true,
    networks: [
      {
        blockchain: networks[i],
        is_active: true,
        confirmation_count: i === 0 ? 3 : 12, // BTC needs 3, others 12
      },
    ],
  }))
}

/**
 * Clean all nock mocks
 */
export function cleanAll() {
  nock.cleanAll()
}

/**
 * Restore HTTP interceptors
 */
export function restore() {
  nock.restore()
}

/**
 * Check if all nock interceptors were used
 */
export function isDone(): boolean {
  return nock.isDone()
}

/**
 * Get pending nock mocks
 */
export function pendingMocks(): string[] {
  return nock.pendingMocks()
}

