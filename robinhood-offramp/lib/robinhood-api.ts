import type { DepositAddressResponse, OrderStatusResponse } from '@/types/robinhood'

// Custom error class for Robinhood API errors
class RobinhoodAPIError extends Error {
  code: string
  statusCode?: number

  constructor(message: string, code: string, statusCode?: number) {
    super(message)
    this.name = 'RobinhoodAPIError'
    this.code = code
    this.statusCode = statusCode
  }
}

// Validate environment variables
function validateEnvironmentVariables() {
  if (!process.env.ROBINHOOD_API_KEY) {
    throw new Error('ROBINHOOD_API_KEY environment variable is required')
  }
  if (!process.env.ROBINHOOD_APP_ID) {
    throw new Error('ROBINHOOD_APP_ID environment variable is required')
  }
}

/**
 * Redeem deposit address from Robinhood using referenceId
 * @param referenceId - UUID v4 generated during offramp initiation
 * @returns Promise<DepositAddressResponse>
 */
export async function redeemDepositAddress(referenceId: string): Promise<DepositAddressResponse> {
  validateEnvironmentVariables()

  const url = 'https://api.robinhood.com/catpay/v1/redeem_deposit_address/'

  try {
    console.log(`Redeeming deposit address for referenceId: ${referenceId}`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ROBINHOOD_API_KEY!,
        'application-id': process.env.ROBINHOOD_APP_ID!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ referenceId }),
      // Ensure fresh request, no caching
      cache: 'no-store',
    })

    // Log response status for debugging
    console.log(`Robinhood API response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Robinhood API error response:', errorData)

      // Handle specific HTTP status codes
      if (response.status === 404) {
        throw new RobinhoodAPIError('ReferenceId not found or expired', 'INVALID_REFERENCE_ID', 404)
      }

      if (response.status === 401 || response.status === 403) {
        throw new RobinhoodAPIError(
          'Authentication failed. Check API credentials.',
          'AUTHENTICATION_ERROR',
          response.status,
        )
      }

      if (response.status >= 500) {
        throw new RobinhoodAPIError(
          'Robinhood API server error. Please try again later.',
          'SERVER_ERROR',
          response.status,
        )
      }

      // Generic API error
      const errorMessage = errorData.error || errorData.message || 'Unknown API error'
      throw new RobinhoodAPIError(errorMessage, 'ROBINHOOD_API_ERROR', response.status)
    }

    const responseData = await response.json()
    console.log('Robinhood API success response:', responseData)

    // Validate response structure
    if (!responseData.address || !responseData.assetCode || !responseData.networkCode) {
      throw new RobinhoodAPIError('Invalid response format from Robinhood API', 'INVALID_RESPONSE_FORMAT')
    }

    return {
      address: responseData.address,
      addressTag: responseData.addressTag,
      assetCode: responseData.assetCode,
      assetAmount: responseData.assetAmount,
      networkCode: responseData.networkCode,
    }
  } catch (error: any) {
    // Re-throw RobinhoodAPIError instances
    if (error instanceof RobinhoodAPIError) {
      throw error
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.name === 'FetchError') {
      console.error('Network error calling Robinhood API:', error)
      throw new RobinhoodAPIError('Network error communicating with Robinhood', 'NETWORK_ERROR')
    }

    // Handle timeout errors
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      console.error('Timeout error calling Robinhood API:', error)
      throw new RobinhoodAPIError('Request timeout communicating with Robinhood', 'TIMEOUT_ERROR')
    }

    // Generic error handling
    console.error('Unexpected error calling Robinhood API:', error)
    throw new RobinhoodAPIError('Unexpected error communicating with Robinhood', 'UNEXPECTED_ERROR')
  }
}

/**
 * Get order status from Robinhood using referenceId
 * @param referenceId - UUID v4 from offramp order
 * @returns Promise<OrderStatusResponse>
 */
export async function getOrderStatus(referenceId: string): Promise<OrderStatusResponse> {
  validateEnvironmentVariables()

  const url = `https://api.robinhood.com/catpay/v1/external/order/?referenceId=${referenceId}`

  try {
    console.log(`Fetching order status for referenceId: ${referenceId}`)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.ROBINHOOD_API_KEY!,
        'application-id': process.env.ROBINHOOD_APP_ID!,
      },
      // Ensure fresh request, no caching
      cache: 'no-store',
    })

    console.log(`Robinhood order status API response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Robinhood order status API error:', errorData)

      // Handle specific HTTP status codes
      if (response.status === 404) {
        throw new RobinhoodAPIError(
          'Order not found or referenceId expired',
          'INVALID_REFERENCE_ID',
          404,
        )
      }

      if (response.status === 401 || response.status === 403) {
        throw new RobinhoodAPIError(
          'Authentication failed. Check API credentials.',
          'AUTHENTICATION_ERROR',
          response.status,
        )
      }

      if (response.status >= 500) {
        throw new RobinhoodAPIError(
          'Robinhood API server error. Please try again later.',
          'SERVER_ERROR',
          response.status,
        )
      }

      // Generic API error
      const errorMessage = errorData.error || errorData.message || 'Unknown API error'
      throw new RobinhoodAPIError(errorMessage, 'ROBINHOOD_API_ERROR', response.status)
    }

    const responseData = await response.json()
    console.log('Robinhood order status API success:', responseData)

    // Validate response structure
    if (!responseData.status || !responseData.assetCode || !responseData.referenceID) {
      throw new RobinhoodAPIError(
        'Invalid response format from Robinhood order status API',
        'INVALID_RESPONSE_FORMAT',
      )
    }

    return responseData
  } catch (error: any) {
    // Re-throw RobinhoodAPIError instances
    if (error instanceof RobinhoodAPIError) {
      throw error
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.name === 'FetchError') {
      console.error('Network error calling Robinhood order status API:', error)
      throw new RobinhoodAPIError('Network error communicating with Robinhood', 'NETWORK_ERROR')
    }

    // Handle timeout errors
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      console.error('Timeout error calling Robinhood order status API:', error)
      throw new RobinhoodAPIError('Request timeout communicating with Robinhood', 'TIMEOUT_ERROR')
    }

    // Generic error handling
    console.error('Unexpected error calling Robinhood order status API:', error)
    throw new RobinhoodAPIError('Unexpected error communicating with Robinhood', 'UNEXPECTED_ERROR')
  }
}

export async function getPriceQuote(assetCode: string, networkCode: string): Promise<any> {
  throw new Error('Not implemented yet - will be implemented in future sub-plan')
}
