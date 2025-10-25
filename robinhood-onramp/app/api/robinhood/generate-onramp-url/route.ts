/**
 * Robinhood Connect Onramp URL Generation API
 *
 * ID SYSTEM NOTE:
 * - This API uses "connectId" exclusively (the official Robinhood onramp term)
 * - connectId is obtained from Robinhood API: POST /catpay/v1/connect_id/
 * - "referenceId" is only used in Robinhood's separate offramp API
 *
 * See: types/robinhood.d.ts for full ID system documentation
 */

import 'reflect-metadata';
import { getAssetConfig } from "@/libs/robinhood/lib/assets/registry";
import { buildDaffyStyleOnrampUrl } from "@/libs/robinhood/lib/url-builder/daffy-style";
import { isValidAssetCode } from "@/libs/robinhood/lib/url-builder/validation";
import { ROBINHOOD_CONNECT_SUPPORTED_NETWORKS, type RobinhoodNetwork } from "@/libs/robinhood/lib/constants";
import { NextResponse } from "next/server";

// Helper function for network validation
function isValidNetwork(network: string): boolean {
  return ROBINHOOD_CONNECT_SUPPORTED_NETWORKS.includes(
    network as RobinhoodNetwork
  );
}

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
  console.log('🚀 [GENERATE-ONRAMP-URL] Starting request')
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

    // Build URL - Daffy-style with asset pre-selection
    console.log('🔨 [BUILD-URL] Generating Robinhood onramp URL...')

    // Validate asset pre-selection is provided (required for external wallet transfers)
    if (!body.selectedAsset || !body.selectedNetwork) {
      console.log('❌ [VALIDATION] Asset pre-selection required')
      return NextResponse.json(
        {
          success: false,
          error: 'Asset and network selection required for external wallet transfers',
        },
        { status: 400 },
      )
    }

    console.log('   ✨ Using Daffy-style URL builder (asset pre-selected)')
    console.log(`   Asset: ${body.selectedAsset}, Network: ${body.selectedNetwork}`)

    let result: { url: string; connectId: string; params: any }

    try {
      // Get asset configuration including wallet address
      const assetConfig = getAssetConfig(body.selectedAsset)

      if (!assetConfig) {
        throw new Error(`Asset configuration not found for: ${body.selectedAsset}`)
      }

      console.log(`   Wallet address: ${assetConfig.depositAddress.address}`)

      // Get base redirect URL from environment or construct it
      const baseRedirectUrl =
        process.env.NEXT_PUBLIC_CALLBACK_URL ||
        (process.env.APP_URL ? `${process.env.APP_URL}/callback` : 'http://localhost:3030/callback')

      console.log(`   Base redirect URL: ${baseRedirectUrl}`)

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
          withdrawal_address: assetConfig.depositAddress.address,
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

      // Step 2: Encode transfer details + connectId into redirect URL
      // This ensures data survives the Robinhood roundtrip
      const transferData = new URLSearchParams({
        asset: body.selectedAsset,
        network: body.selectedNetwork,
        connectId: validConnectId, // Robinhood Connect ID for tracking
        timestamp: Date.now().toString(),
      })

      const redirectUrl = `${baseRedirectUrl}?${transferData.toString()}`
      console.log(`   Full redirect URL with transfer data: ${redirectUrl}`)

      // Step 3: Generate Daffy-style URL with the valid connectId
      const daffyResult = buildDaffyStyleOnrampUrl({
        asset: body.selectedAsset,
        network: body.selectedNetwork as RobinhoodNetwork,
        walletAddress: assetConfig.depositAddress.address,
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

    const duration = Date.now() - startTime
    console.log(`\n⏱️  [TIMING] Request completed in ${duration}ms`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        connectId: result.connectId,
        params: result.params,
      },
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error('\n❌ [ERROR] Failed to generate onramp URL')
    console.error(`   Message: ${error.message}`)
    console.error(`   Stack: ${error.stack}`)
    console.log(`⏱️  [TIMING] Request failed after ${duration}ms`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate onramp URL',
      },
      { status: 500 },
    )
  }
}
