import { redeemDepositAddress } from '@/lib/robinhood-api'
import { NextResponse } from 'next/server'

interface RedeemAddressRequest {
  referenceId: string
}

// Validate referenceId format (UUID v4)
function isValidReferenceId(referenceId: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidV4Regex.test(referenceId)
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body: RedeemAddressRequest = await request.json()

    // Validate request body
    if (!body.referenceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'referenceId is required',
          code: 'MISSING_REFERENCE_ID',
        },
        { status: 400 },
      )
    }

    // Validate referenceId format
    if (!isValidReferenceId(body.referenceId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid referenceId format. Must be a valid UUID v4.',
          code: 'INVALID_REFERENCE_ID_FORMAT',
        },
        { status: 400 },
      )
    }

    // Call Robinhood API to redeem deposit address
    const depositAddressData = await redeemDepositAddress(body.referenceId)

    // Return success response
    return NextResponse.json({
      success: true,
      data: depositAddressData,
    })
  } catch (error: any) {
    console.error('Error in redeem-deposit-address API:', error)

    // Handle specific error types
    if (error.code === 'ROBINHOOD_API_ERROR') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'ROBINHOOD_API_ERROR',
        },
        { status: 400 },
      )
    }

    if (error.code === 'INVALID_REFERENCE_ID') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired referenceId',
          code: 'INVALID_REFERENCE_ID',
        },
        { status: 404 },
      )
    }

    if (error.code === 'NETWORK_ERROR') {
      return NextResponse.json(
        {
          success: false,
          error: 'Network error communicating with Robinhood. Please try again.',
          code: 'NETWORK_ERROR',
        },
        { status: 503 },
      )
    }

    // Generic error handling
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to redeem deposit address. Please try again.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 },
    )
  }
}
