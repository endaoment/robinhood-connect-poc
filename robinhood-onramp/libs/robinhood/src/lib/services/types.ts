/**
 * Shared types for Robinhood services
 */

/**
 * Base configuration for Robinhood services
 */
export interface RobinhoodConfig {
  appId: string
  apiKey: string
  baseUrl?: string
}

/**
 * Standard error response from Robinhood API
 */
export interface RobinhoodApiError {
  error: string
  message: string
  statusCode: number
}

/**
 * Retry configuration for API calls
 */
export interface RetryConfig {
  maxAttempts: number
  delayMs: number
  backoffMultiplier: number
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
}

/**
 * Logger interface for services
 */
export interface ServiceLogger {
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
  debug(message: string, ...args: unknown[]): void
}

/**
 * Default console logger implementation
 */
export const createConsoleLogger = (serviceName: string): ServiceLogger => ({
  info: (message: string, ...args: unknown[]) => console.log(`[${serviceName}] INFO:`, message, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`[${serviceName}] WARN:`, message, ...args),
  error: (message: string, ...args: unknown[]) => console.error(`[${serviceName}] ERROR:`, message, ...args),
  debug: (message: string, ...args: unknown[]) => console.debug(`[${serviceName}] DEBUG:`, message, ...args),
})

