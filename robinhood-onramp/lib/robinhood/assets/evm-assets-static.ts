/**
 * Static EVM Deposit Addresses (Fallback)
 *
 * IMPORTANT: All addresses here are STATIC (hardcoded)
 * walletType = Static means we're using hardcoded fallback
 * These will show as "Static" source in the UI
 */

import type { RobinhoodDepositAddress } from '../types'
import { PrimeWalletType } from './prime-addresses'

export const EVM_DEPOSIT_ADDRESSES: Record<string, RobinhoodDepositAddress> = {
  // Native assets - Static (hardcoded from Sub-Plan 9)
  ETH: {
    address: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e',
    walletType: PrimeWalletType.Static,
  },
  AVAX: {
    address: '0x2063115a37f55c19cA60b9d1eca2378De00CD79b',
    walletType: PrimeWalletType.Static,
  },
  ETC: {
    address: '0x269285683a921dbce6fcb21513b06998f8fbbc99',
    walletType: PrimeWalletType.Static,
  },

  // Layer 2 - Static
  ARB: {
    address: '0x6931a51e15763C4d8da468cbF7C51323d96F2e80',
    walletType: PrimeWalletType.Static,
  },
  OP: {
    address: '0xE006aBC90950DB9a81A3812502D0b031FaAf28D8',
    walletType: PrimeWalletType.Static,
  },
  ZORA: {
    address: '0x407506929b5C58992987609539a1D424f2305Cc3',
    walletType: PrimeWalletType.Static,
  },
  MATIC: {
    address: '0x11362ec5cc119448225abbbb1c9c67e22e776cdd',
    walletType: PrimeWalletType.Static,
  },

  // Stablecoins - Static
  USDC: {
    address: '0xd71a079cb64480334ffb400f017a0dde94f553dd',
    walletType: PrimeWalletType.Static,
  },

  // DeFi tokens - Static
  AAVE: {
    address: '0x0788702c7d70914f34b82fb6ad0b405263a00486',
    walletType: PrimeWalletType.Static,
  },
  LINK: {
    address: '0xcf26c0f23e566b42251bc0cf680c8999def1d7f0',
    walletType: PrimeWalletType.Static,
  },
  COMP: {
    address: '0x944bff154f0486b6c834c5607978b45ffc264902',
    walletType: PrimeWalletType.Static,
  },
  CRV: {
    address: '0xe2efa30cca6b06e4436c0f25f2d0409407ac3a4d',
    walletType: PrimeWalletType.Static,
  },
  UNI: {
    address: '0x396b24e9137befef326af9fdba92d95dd124d5d4',
    walletType: PrimeWalletType.Static,
  },
  ONDO: {
    address: '0x894f85323110a0a8883b22b18f26864882c3c63e',
    walletType: PrimeWalletType.Static,
  },

  // Meme coins - Static
  SHIB: {
    address: '0x263dcd3e749b1f00c3998b5a0f14e3255658803b',
    walletType: PrimeWalletType.Static,
  },
  
  // Fallback/placeholder addresses (EOA - not real deposit addresses)
  PEPE: {
    address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2',
    note: 'Fallback EOA - not CBP',
    walletType: PrimeWalletType.Static,
  },
  FLOKI: {
    address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2',
    note: 'Fallback EOA - not CBP',
    walletType: PrimeWalletType.Static,
  },
  // Note: TRUMP moved to non-evm-assets.ts (it's on Solana, not Ethereum)
  VIRTUAL: {
    address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2',
    note: 'Fallback EOA - not CBP',
    walletType: PrimeWalletType.Static,
  },
  WLFI: {
    address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2',
    note: 'Fallback EOA - not CBP',
    walletType: PrimeWalletType.Static,
  },
}
