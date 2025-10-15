import { NextResponse } from 'next/server'
import { getOrderStatus } from '@/lib/robinhood-api'

interface OrderStatusRequest {
  referenceId: string
}

// Validate referenceId format (UUID v4)
function isValidReferenceId(referenceId: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidV4Regex.test(referenceId)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const referenceId = searchParams.get('referenceId')

    // Validate referenceId parameter
    if (!referenceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'referenceId parameter is required',
          code: 'MISSING_REFERENCE_ID',
        },
        { status: 400 },
      )
    }

    // Validate referenceId format
    if (!isValidReferenceId(referenceId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid referenceId format. Must be a valid UUID v4.',
          code: 'INVALID_REFERENCE_ID_FORMAT',
        },
        { status: 400 },
      )
    }

    // Fetch order status from Robinhood
    const orderStatus = await getOrderStatus(referenceId)

    return NextResponse.json({
      success: true,
      data: orderStatus,
    })
  } catch (error: any) {
    console.error('Error in order-status API:', error)

    // Handle specific error types
    if (error.code === 'INVALID_REFERENCE_ID') {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found or referenceId expired',
          code: 'ORDER_NOT_FOUND',
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
        error: 'Failed to fetch order status. Please try again.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 },
    )
  }
}

