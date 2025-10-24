/**
 * Security utilities for input validation and sanitization
 */

// Sanitize string input to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000) // Limit length
}

// Validate and sanitize numeric input
export function sanitizeAmount(input: string): string | null {
  const cleaned = input.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)

  if (isNaN(parsed) || parsed <= 0 || parsed > 1000000) {
    return null
  }

  return parsed.toString()
}

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Simple rate limiting
export function checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const key = identifier
  const current = rateLimitStore.get(key)

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    return false
  }

  current.count++
  return true
}

// Validate environment variables
export function validateEnvironment(): void {
  const required = ['ROBINHOOD_APP_ID', 'ROBINHOOD_API_KEY']
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Log security events (implement proper logging in production)
export function logSecurityEvent(event: string, details: any): void {
  console.warn(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    ...details,
  })
}

// Validate UUID v4 format
export function isValidUUID(uuid: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidV4Regex.test(uuid)
}

// Validate asset code format (uppercase letters, 2-10 characters)
export function isValidAssetCode(assetCode: string): boolean {
  return /^[A-Z]{2,10}$/.test(assetCode)
}

// Validate network code format (uppercase letters and underscores)
export function isValidNetworkCode(networkCode: string): boolean {
  return /^[A-Z_]+$/.test(networkCode)
}

// Validate amount format (positive numeric)
export function isValidAmount(amount: string): boolean {
  const parsed = parseFloat(amount)
  return !isNaN(parsed) && parsed > 0 && /^\d+(\.\d+)?$/.test(amount)
}

// Sanitize callback parameters from Robinhood
export function sanitizeCallbackParams(params: {
  assetCode?: string | null
  assetAmount?: string | null
  network?: string | null
}): { assetCode: string; assetAmount: string; network: string } | null {
  const { assetCode, assetAmount, network } = params

  // Check all required parameters are present
  if (!assetCode || !assetAmount || !network) {
    return null
  }

  // Validate each parameter format
  if (!isValidAssetCode(assetCode)) {
    logSecurityEvent('Invalid asset code in callback', { assetCode })
    return null
  }

  if (!isValidAmount(assetAmount)) {
    logSecurityEvent('Invalid amount in callback', { assetAmount })
    return null
  }

  if (!isValidNetworkCode(network)) {
    logSecurityEvent('Invalid network code in callback', { network })
    return null
  }

  return { assetCode, assetAmount, network }
}

// Clear old entries from rate limit store (call periodically)
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Set up periodic cleanup (call once on server start)
export function setupRateLimitCleanup(intervalMs = 300000): NodeJS.Timeout {
  return setInterval(cleanupRateLimitStore, intervalMs)
}
