/**
 * Static Non-EVM Deposit Addresses (Fallback)
 *
 * IMPORTANT: All addresses here are STATIC (hardcoded)
 * walletType = Static means we're using hardcoded fallback
 * These will show as "Static" source in the UI
 */

import type { RobinhoodDepositAddress } from '../types'
import { PrimeWalletType } from './prime-addresses'

export const NON_EVM_DEPOSIT_ADDRESSES: Record<string, RobinhoodDepositAddress> = {
  // Bitcoin-like chains - Static
  BTC: {
    address: '3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC',
    walletType: PrimeWalletType.Static,
  },
  LTC: {
    address: 'MQNay3B5gRq4o7nHuTJf9LpFkDmxhmockK',
    walletType: PrimeWalletType.Static,
  },
  BCH: {
    address: 'qqqg0e4qs9h6j6z8t53kwmjukwksmkzphvtsfv3j2q',
    walletType: PrimeWalletType.Static,
  },
  DOGE: {
    address: 'DUGnpFtJGnmmGzFMBoEgSw5nPgRfSzYHF7',
    walletType: PrimeWalletType.Static,
  },

  // Other L1 chains - Static
  SOL: {
    address: 'DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1',
    walletType: PrimeWalletType.Static,
  },
  ADA: {
    address: 'addr1vydgw0ruk6q78vl0f26q6zxtssfnh2thxzgqvvthe8je56crgtapt',
    walletType: PrimeWalletType.Static,
  },
  XTZ: {
    address: 'tz1P4FJEdVTEEG5TRREFavjQthzsJuESiCRV',
    walletType: PrimeWalletType.Static,
  },
  SUI: {
    address: '0xfb44ad61588e5094d617851c759e35dc72720267b5464eb95284c6d5a1945ce2',
    walletType: PrimeWalletType.Static,
  },

  // Networks with memos - Static
  XLM: {
    address: 'GB4SJVA7KAFDZJFVTSEV2YWZZA3VEANHHK3WSJRHO2XS2GDYJCGWKDB5',
    memo: '1380611530',
    walletType: PrimeWalletType.Static,
  },
  XRP: {
    address: 'rn7d8bZhsdz9ecf586XsvbmVePfxYGrs34',
    memo: '2237695492',
    walletType: PrimeWalletType.Static,
  },
  HBAR: {
    address: '0.0.5006230',
    memo: '904278439',
    walletType: PrimeWalletType.Static,
  },

  // Solana tokens - Static
  BONK: {
    address: 'puNRXZc4qEYWdUjmx68Lcb87DobBpgZQPdTndoS4U5B',
    walletType: PrimeWalletType.Static,
  },
  MOODENG: {
    address: 'Fd4ir2iU6H8kaYvTbAwXmrdjo6JPt7ABo7b5poCTpAsE',
    walletType: PrimeWalletType.Static,
  },
  TRUMP: {
    address: 'DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1', // Using SOL address as placeholder
    note: 'Using SOL address - need specific TRUMP Solana address',
    walletType: PrimeWalletType.Static,
  },
}
