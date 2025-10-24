import { NextResponse } from 'next/server'

interface OrderStatusRequest {
  referenceId?: string
  orderId?: string
  connectId?: string
}

/**
 * Get order details from Robinhood
 *
 * ⚠️ NOTE: This endpoint is for OFFRAMP use only - it does NOT work for onramp flows
 *
 * According to Onramp SDK v1.3:
 * GET https://api.robinhood.com/catpay/v1/external/order/?referenceId=<referenceId>
 *
 * Returns full transaction details including cryptoAmount (the amount we need!)
 *
 * For onramp: The callback URL from Robinhood already contains all necessary data
 * (orderId, asset, network, etc.) - no need to fetch from this API
 */
export async function POST(request: Request) {
  const startTime = Date.now()
  console.log('\n' + '='.repeat(80))
  console.log('🔍 [ORDER-STATUS] Starting request')
  console.log('='.repeat(80))

  try {
    const body: OrderStatusRequest = await request.json()

    console.log('📥 [REQUEST] Received body:', JSON.stringify(body, null, 2))

    // Try to get an ID (referenceId, orderId, or connectId)
    const referenceId = body.referenceId || body.orderId || body.connectId

    if (!referenceId) {
      console.log('❌ [VALIDATION] No ID provided')
      return NextResponse.json(
        {
          success: false,
          error: 'referenceId, orderId, or connectId is required',
        },
        { status: 400 },
      )
    }

    console.log(`✓ [VALIDATION] Using ID: ${referenceId}`)

    // Call Robinhood Order Details API
    console.log('🔨 [API-CALL] Calling Robinhood Order Details API...')
    const apiUrl = `https://api.robinhood.com/catpay/v1/external/order/?referenceId=${referenceId}`

    console.log(`   URL: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.ROBINHOOD_API_KEY || '',
        'application-id': process.env.ROBINHOOD_APP_ID || '',
      },
    })

    console.log(`   Response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [API-CALL] Failed: ${response.status}`)
      console.error(`   Response: ${errorText}`)

      // If 404, the order might not exist yet or ID is wrong
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'Order not found. It may not be completed yet.',
            status: 'NOT_FOUND',
          },
          { status: 404 },
        )
      }

      throw new Error(`Robinhood API error: ${response.status} - ${errorText}`)
    }

    const orderData = await response.json()
    console.log('✅ [API-CALL] Order details received:', JSON.stringify(orderData, null, 2))

    const duration = Date.now() - startTime
    console.log(`\n⏱️  [TIMING] Request completed in ${duration}ms`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json({
      success: true,
      data: orderData,
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error('\n❌ [ERROR] Failed to get order status')
    console.error(`   Message: ${error.message}`)
    console.error(`   Stack: ${error.stack}`)
    console.log(`⏱️  [TIMING] Request failed after ${duration}ms`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get order status',
      },
      { status: 500 },
    )
  }
}
