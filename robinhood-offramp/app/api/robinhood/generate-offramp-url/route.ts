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
  try {
    const body: GenerateUrlRequest = await request.json()

    // Validate required fields
    if (!body.supportedNetworks || !Array.isArray(body.supportedNetworks) || body.supportedNetworks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'supportedNetworks array is required and must not be empty',
        },
        { status: 400 },
      )
    }

    // Validate networks
    const invalidNetworks = body.supportedNetworks.filter((network) => !isValidNetwork(network))
    if (invalidNetworks.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid networks: ${invalidNetworks.join(', ')}`,
        },
        { status: 400 },
      )
    }

    // Validate asset code if provided
    if (body.assetCode && !isValidAssetCode(body.assetCode)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid asset code: ${body.assetCode}`,
        },
        { status: 400 },
      )
    }

    // Build URL
    const result = buildOfframpUrl({
      supportedNetworks: body.supportedNetworks as SupportedNetwork[],
      assetCode: body.assetCode as AssetCode,
      assetAmount: body.assetAmount,
      fiatCode: body.fiatAmount ? 'USD' : undefined,
      fiatAmount: body.fiatAmount,
    })

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        referenceId: result.referenceId,
        params: result.params,
      },
    })
  } catch (error: any) {
    console.error('Error generating offramp URL:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate offramp URL',
      },
      { status: 500 },
    )
  }
}
