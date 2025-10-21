import { buildOfframpUrl, isValidAssetCode, isValidNetwork } from '@/lib/robinhood-url-builder'
import type { AssetCode, SupportedNetwork } from '@/types/robinhood'
import { NextResponse } from 'next/server'

interface GenerateUrlRequest {
  supportedNetworks: string[]
  assetCode?: string
  assetAmount?: string
  fiatAmount?: string
}

export async function POST(request: Request) {
  const startTime = Date.now()
  console.log('\n' + '='.repeat(80))
  console.log('🚀 [GENERATE-OFFRAMP-URL] Starting request')
  console.log('='.repeat(80))

  try {
    const body: GenerateUrlRequest = await request.json()

    console.log('📥 [REQUEST] Received body:')
    console.log(
      JSON.stringify(
        {
          supportedNetworks: body.supportedNetworks,
          assetCode: body.assetCode || 'none',
          assetAmount: body.assetAmount || 'none',
          fiatAmount: body.fiatAmount || 'none',
        },
        null,
        2,
      ),
    )

    // Validate required fields
    if (!body.supportedNetworks || !Array.isArray(body.supportedNetworks) || body.supportedNetworks.length === 0) {
      console.log('❌ [VALIDATION] Failed: supportedNetworks is required')
      return NextResponse.json(
        {
          success: false,
          error: 'supportedNetworks array is required and must not be empty',
        },
        { status: 400 },
      )
    }

    console.log(`✓ [VALIDATION] Networks count: ${body.supportedNetworks.length}`)

    // Validate networks
    const invalidNetworks = body.supportedNetworks.filter((network) => !isValidNetwork(network))
    if (invalidNetworks.length > 0) {
      console.log(`❌ [VALIDATION] Invalid networks found: ${invalidNetworks.join(', ')}`)
      return NextResponse.json(
        {
          success: false,
          error: `Invalid networks: ${invalidNetworks.join(', ')}`,
        },
        { status: 400 },
      )
    }

    console.log(`✓ [VALIDATION] All networks valid: ${body.supportedNetworks.join(', ')}`)

    // Validate asset code if provided
    if (body.assetCode && !isValidAssetCode(body.assetCode)) {
      console.log(`❌ [VALIDATION] Invalid asset code: ${body.assetCode}`)
      return NextResponse.json(
        {
          success: false,
          error: `Invalid asset code: ${body.assetCode}`,
        },
        { status: 400 },
      )
    }

    if (body.assetCode) {
      console.log(`✓ [VALIDATION] Asset code valid: ${body.assetCode}`)
    }

    // Build URL
    console.log('🔨 [BUILD-URL] Generating Robinhood offramp URL...')
    const result = buildOfframpUrl({
      supportedNetworks: body.supportedNetworks as SupportedNetwork[],
      assetCode: body.assetCode as AssetCode,
      assetAmount: body.assetAmount,
      fiatCode: body.fiatAmount ? 'USD' : undefined,
      fiatAmount: body.fiatAmount,
    })

    console.log('✅ [BUILD-URL] URL generated successfully')
    console.log(`   📋 Reference ID: ${result.referenceId}`)
    console.log(`   🔗 URL: ${result.url.substring(0, 100)}...`)
    console.log(`   ⚙️  Params: ${JSON.stringify(result.params)}`)

    const duration = Date.now() - startTime
    console.log(`\n⏱️  [TIMING] Request completed in ${duration}ms`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        referenceId: result.referenceId,
        params: result.params,
      },
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error('\n❌ [ERROR] Failed to generate offramp URL')
    console.error(`   Message: ${error.message}`)
    console.error(`   Stack: ${error.stack}`)
    console.log(`⏱️  [TIMING] Request failed after ${duration}ms`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate offramp URL',
      },
      { status: 500 },
    )
  }
}
