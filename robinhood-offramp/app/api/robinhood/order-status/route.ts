import { getOrderStatus } from '@/lib/robinhood-api'
import { NextResponse } from 'next/server'

interface OrderStatusRequest {
  referenceId: string
}

// Validate referenceId format (UUID v4)
function isValidReferenceId(referenceId: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidV4Regex.test(referenceId)
}

export async function GET(request: Request) {
  const startTime = Date.now()
  console.log('\n' + '='.repeat(80))
  console.log('📊 [ORDER-STATUS] Starting request')
  console.log('='.repeat(80))

  try {
    const { searchParams } = new URL(request.url)
    const referenceId = searchParams.get('referenceId')

    console.log('📥 [REQUEST] Query params:')
    console.log(`   Reference ID: ${referenceId || 'MISSING'}`)

    // Validate referenceId parameter
    if (!referenceId) {
      console.log('❌ [VALIDATION] Failed: referenceId is required')
      return NextResponse.json(
        {
          success: false,
          error: 'referenceId parameter is required',
          code: 'MISSING_REFERENCE_ID',
        },
        { status: 400 },
      )
    }

    console.log('✓ [VALIDATION] Reference ID present')

    // Validate referenceId format
    if (!isValidReferenceId(referenceId)) {
      console.log(`❌ [VALIDATION] Invalid UUID format: ${referenceId}`)
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid referenceId format. Must be a valid UUID v4.',
          code: 'INVALID_REFERENCE_ID_FORMAT',
        },
        { status: 400 },
      )
    }

    console.log('✓ [VALIDATION] UUID format valid')
    console.log(`\n🌐 [ROBINHOOD-API] Fetching order status...`)
    console.log(`   Reference ID: ${referenceId}`)

    // Fetch order status from Robinhood
    const orderStatus = await getOrderStatus(referenceId)

    console.log('✅ [ROBINHOOD-API] Order status retrieved successfully')
    console.log(`   Status: ${orderStatus.status}`)
    console.log(`   Asset: ${orderStatus.assetCode}`)
    console.log(`   Reference ID: ${orderStatus.referenceID}`)
    if (orderStatus.assetAmount) {
      console.log(`   Amount: ${orderStatus.assetAmount}`)
    }

    const duration = Date.now() - startTime
    console.log(`\n⏱️  [TIMING] Request completed in ${duration}ms`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json({
      success: true,
      data: orderStatus,
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error('\n❌ [ERROR] Failed to fetch order status')
    console.error(`   Error Code: ${error.code || 'UNKNOWN'}`)
    console.error(`   Message: ${error.message}`)
    if (error.statusCode) {
      console.error(`   HTTP Status: ${error.statusCode}`)
    }
    console.log(`⏱️  [TIMING] Request failed after ${duration}ms`)
    console.log('='.repeat(80) + '\n')

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
