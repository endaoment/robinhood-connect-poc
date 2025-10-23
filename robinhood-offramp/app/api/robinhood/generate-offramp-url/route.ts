import { getAssetConfig } from '@/lib/robinhood-asset-config'
import {
  buildDaffyStyleOfframpUrl,
  buildOfframpUrl,
  isValidAssetCode,
  isValidNetwork,
} from '@/lib/robinhood-url-builder'
import type { AssetCode, RobinhoodNetwork, SupportedNetwork } from '@/types/robinhood'
import { NextResponse } from 'next/server'

interface GenerateUrlRequest {
  supportedNetworks: string[]
  assetCode?: string
  assetAmount?: string
  fiatAmount?: string
  // NEW: For Daffy-style URL generation (Sub-Plan 4)
  selectedAsset?: string
  selectedNetwork?: string
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

    // Build URL - Use Daffy-style if asset pre-selection is provided
    console.log('🔨 [BUILD-URL] Generating Robinhood offramp URL...')

    let result: { url: string; referenceId?: string; connectId?: string; params: any }

    // NEW FLOW: Daffy-style URL with asset pre-selection (Sub-Plan 4)
    if (body.selectedAsset && body.selectedNetwork) {
      console.log('   ✨ Using Daffy-style URL builder (asset pre-selected)')
      console.log(`   Asset: ${body.selectedAsset}, Network: ${body.selectedNetwork}`)

      try {
        // Get asset configuration including wallet address
        const assetConfig = getAssetConfig(body.selectedAsset)

        if (!assetConfig) {
          throw new Error(`Asset configuration not found for: ${body.selectedAsset}`)
        }

        console.log(`   Wallet address: ${assetConfig.walletAddress}`)

        // Get redirect URL from environment or construct it
        const redirectUrl =
          process.env.NEXT_PUBLIC_CALLBACK_URL ||
          (process.env.APP_URL ? `${process.env.APP_URL}/callback` : 'http://localhost:3030/callback')

        console.log(`   Redirect URL: ${redirectUrl}`)

        // Step 1: Generate connectId from Robinhood API
        console.log('   🔑 Calling Robinhood API to generate connectId...')
        const connectIdResponse = await fetch('https://api.robinhood.com/catpay/v1/connect_id/', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.ROBINHOOD_API_KEY || '',
            'application-id': process.env.ROBINHOOD_APP_ID || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            withdrawal_address: assetConfig.walletAddress,
            user_identifier: `user_${Date.now()}`, // Unique identifier for this session
          }),
        })

        if (!connectIdResponse.ok) {
          const errorText = await connectIdResponse.text()
          console.error(`   ❌ Failed to generate connectId: ${connectIdResponse.status}`)
          console.error(`   Response: ${errorText}`)
          throw new Error(`Failed to generate connectId from Robinhood: ${connectIdResponse.status}`)
        }

        const connectIdData = await connectIdResponse.json()
        const validConnectId = connectIdData.connect_id || connectIdData.connectId

        if (!validConnectId) {
          console.error(`   ❌ No connectId in response: ${JSON.stringify(connectIdData)}`)
          throw new Error('No connectId returned from Robinhood API')
        }

        console.log(`   ✅ Valid connectId received: ${validConnectId}`)

        // Step 2: Generate Daffy-style URL with the valid connectId
        const daffyResult = buildDaffyStyleOfframpUrl({
          asset: body.selectedAsset,
          network: body.selectedNetwork as RobinhoodNetwork,
          walletAddress: assetConfig.walletAddress,
          redirectUrl: redirectUrl,
          connectId: validConnectId, // Use the real connectId from Robinhood
        })

        result = {
          url: daffyResult.url,
          connectId: daffyResult.connectId,
          params: daffyResult.params,
        }

        console.log('✅ [BUILD-URL] Daffy-style URL generated successfully')
        console.log(`   🆔 Connect ID: ${daffyResult.connectId}`)
        console.log(`   🔗 FULL URL:\n${daffyResult.url}`)
        console.log(`   ⚙️  Params: ${JSON.stringify(daffyResult.params)}`)
      } catch (error: any) {
        console.error(`❌ [BUILD-URL] Daffy-style URL generation failed: ${error.message}`)
        throw error
      }
    }
    // OLD FLOW: Multi-network URL (deprecated, but kept for backward compatibility)
    else {
      console.log('   ⚠️  Using legacy multi-network URL builder (deprecated)')
      const legacyResult = buildOfframpUrl({
        supportedNetworks: body.supportedNetworks as SupportedNetwork[],
        assetCode: body.assetCode as AssetCode,
        assetAmount: body.assetAmount,
        fiatCode: body.fiatAmount ? 'USD' : undefined,
        fiatAmount: body.fiatAmount,
      })

      result = {
        url: legacyResult.url,
        referenceId: legacyResult.referenceId,
        params: legacyResult.params,
      }

      console.log('✅ [BUILD-URL] Legacy URL generated')
      console.log(`   📋 Reference ID: ${legacyResult.referenceId}`)
      console.log(`   🔗 URL: ${legacyResult.url.substring(0, 100)}...`)
      console.log(`   ⚙️  Params: ${JSON.stringify(legacyResult.params)}`)
    }

    const duration = Date.now() - startTime
    console.log(`\n⏱️  [TIMING] Request completed in ${duration}ms`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        referenceId: result.referenceId || result.connectId, // Support both old and new ID formats
        connectId: result.connectId, // New Daffy-style ID
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
