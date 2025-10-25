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

