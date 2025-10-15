/**
 * User-friendly error messages
 */

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect to Robinhood. Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'The request took too long. Please try again.',

  // Validation errors
  INVALID_REFERENCE_ID: 'Invalid transfer reference. Please start a new transfer.',
  INVALID_AMOUNT: 'Please enter a valid amount greater than 0.',
  INVALID_ASSET: 'Please select a valid crypto asset.',
  INVALID_NETWORK: 'Please select a valid blockchain network.',

  // API errors
  ORDER_NOT_FOUND: 'Transfer not found. It may have expired or been cancelled.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please contact support.',
  SERVER_ERROR: 'Robinhood is temporarily unavailable. Please try again later.',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',

  // Generic errors
  UNKNOWN_ERROR: 'Something went wrong. Please try again or contact support.',

  // Success messages
  TRANSFER_INITIATED: 'Transfer initiated successfully! Complete the process in Robinhood.',
  TRANSFER_COMPLETED: 'Transfer completed successfully! Your donation has been processed.',
  ADDRESS_COPIED: 'Deposit address copied to clipboard.',
} as const

export type ErrorCode = keyof typeof ERROR_MESSAGES

export function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode as ErrorCode] || ERROR_MESSAGES.UNKNOWN_ERROR
}

export function createErrorResponse(errorCode: ErrorCode, details?: string) {
  return {
    success: false,
    error: getErrorMessage(errorCode),
    code: errorCode,
    details,
  }
}

export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
  }
}

// Error logging with sanitization (don't expose sensitive data)
export function logError(context: string, error: any, additionalInfo?: Record<string, any>): void {
  const errorInfo = {
    context,
    timestamp: new Date().toISOString(),
    message: error?.message || 'Unknown error',
    code: error?.code,
    statusCode: error?.statusCode,
    ...additionalInfo,
  }

  // In production, send to logging service (Sentry, LogRocket, etc.)
  console.error('[ERROR]', errorInfo)
}
