/**
 * Robinhood Order Details API Route
 *
 * Fetches complete order details from Robinhood using the connectId.
 * This provides the definitive source of truth for:
 * - Crypto amount transferred
 * - Fiat amount equivalent
 * - Blockchain transaction hash
 * - Transfer status
 * - Network fees
 *
 * This replaces reliance on callback URL parameters which don't include amounts.
 */

import { NextRequest, NextResponse } from 'next/server'
import { RobinhoodClientService } from '@/libs/robinhood/lib/services/robinhood-client.service'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log('\n' + '='.repeat(80))
  console.log('🔍 [ORDER-DETAILS] Starting request')
  console.log('='.repeat(80))

  try {
    // Get connectId from query parameters
    const { searchParams } = new URL(request.url)
    const connectId = searchParams.get('connectId')

    if (!connectId) {
      console.log('❌ [VALIDATION] Missing connectId parameter')
      return NextResponse.json(
        {
          success: false,
          error: 'connectId is required',
        },
        { status: 400 }
      )
    }

    console.log(`✓ [VALIDATION] connectId: ${connectId}`)

    // Get Robinhood credentials
    const apiKey = process.env.ROBINHOOD_API_KEY
    const appId = process.env.ROBINHOOD_APP_ID

    if (!apiKey || !appId) {
      console.log('❌ [CONFIG] Missing Robinhood credentials')
      return NextResponse.json(
        {
          success: false,
          error: 'Robinhood credentials not configured',
        },
        { status: 500 }
      )
    }

    // Create Robinhood client
    const client = new RobinhoodClientService({
      apiKey,
      appId,
      baseUrl: 'https://api.robinhood.com',
    })

    console.log('🌐 [API] Fetching order details from Robinhood...')

    // Fetch order details
    const orderDetails = await client.getOrderDetails(connectId)

    console.log('✅ [API] Order details retrieved successfully')
    console.log('📊 [DETAILS]', {
      assetCode: orderDetails.assetCode,
      cryptoAmount: orderDetails.cryptoAmount,
      fiatAmount: orderDetails.fiatAmount,
      status: orderDetails.status,
      blockchainTxId: orderDetails.blockchainTransactionId?.substring(0, 20) + '...',
    })

    const duration = Date.now() - startTime
    console.log(`⏱️  [TIMING] Request completed in ${duration}ms`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json({
      success: true,
      data: orderDetails,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.log('❌ [ERROR] Request failed')
    console.log('Error:', error instanceof Error ? error.message : 'Unknown error')
    console.log(`⏱️  [TIMING] Request failed after ${duration}ms`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch order details',
      },
      { status: 500 }
    )
  }
}

