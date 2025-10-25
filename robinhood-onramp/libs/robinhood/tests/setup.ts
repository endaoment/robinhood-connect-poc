/**
 * Jest test setup file
 *
 * Runs before each test to ensure clean state
 */
import 'reflect-metadata'
import { cleanAll } from './mocks/robinhood-nock-api'

// Mock uuid to avoid ES module issues
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-12345678-1234-1234-1234-123456789abc',
}))

// Set required environment variables for tests
process.env.ROBINHOOD_APP_ID = 'test-app-id-123'
process.env.ROBINHOOD_API_KEY = 'test-api-key-456'
process.env.DEFAULT_FUND_ID = 'test-fund-789'

// Clean nock mocks before each test
beforeEach(() => {
  cleanAll()
})

// Clean nock mocks after each test
afterEach(() => {
  cleanAll()
})

// Global test timeout
jest.setTimeout(10000)

