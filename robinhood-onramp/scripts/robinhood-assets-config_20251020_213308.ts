/**
 * Coinbase Prime Trading Balance Deposit Addresses
 * for ALL Robinhood-supported assets
 * Generated: 2025-10-20T21:33:08.794303
 * Coverage: 27/40 assets
 */

export const ROBINHOOD_ASSET_ADDRESSES: Record<string, { address: string; memo?: string }> = {
  AAVE: { address: '0x0788702c7d70914f34b82fb6ad0b405263a00486' }, // Aave
  ADA: { address: 'addr1vydgw0ruk6q78vl0f26q6zxtssfnh2thxzgqvvthe8je56crgtapt' }, // Cardano
  ARB: { address: '0x6931a51e15763C4d8da468cbF7C51323d96F2e80' }, // Arbitrum
  AVAX: { address: '0x2063115a37f55c19cA60b9d1eca2378De00CD79b' }, // Avalanche
  BCH: { address: 'qqqg0e4qs9h6j6z8t53kwmjukwksmkzphvtsfv3j2q' }, // Bitcoin Cash
  BONK: { address: 'puNRXZc4qEYWdUjmx68Lcb87DobBpgZQPdTndoS4U5B' }, // BONK
  BTC: { address: '3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC' }, // Bitcoin
  COMP: { address: '0x944bff154f0486b6c834c5607978b45ffc264902' }, // Compound
  CRV: { address: '0xe2efa30cca6b06e4436c0f25f2d0409407ac3a4d' }, // Curve DAO
  DOGE: { address: 'DUGnpFtJGnmmGzFMBoEgSw5nPgRfSzYHF7' }, // Dogecoin
  ETC: { address: '0x269285683a921dbce6fcb21513b06998f8fbbc99' }, // Ethereum Classic
  ETH: { address: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e' }, // Ethereum
  HBAR: { address: '0.0.5006230', memo: '904278439' }, // Hedera
  LINK: { address: '0xcf26c0f23e566b42251bc0cf680c8999def1d7f0' }, // Chainlink
  LTC: { address: 'MQNay3B5gRq4o7nHuTJf9LpFkDmxhmockK' }, // Litecoin
  MOODENG: { address: 'Fd4ir2iU6H8kaYvTbAwXmrdjo6JPt7ABo7b5poCTpAsE' }, // Moo Deng
  ONDO: { address: '0x894f85323110a0a8883b22b18f26864882c3c63e' }, // Ondo
  OP: { address: '0xE006aBC90950DB9a81A3812502D0b031FaAf28D8' }, // Optimism
  SHIB: { address: '0x263dcd3e749b1f00c3998b5a0f14e3255658803b' }, // Shiba Inu
  SOL: { address: 'DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1' }, // Solana
  SUI: { address: '0xfb44ad61588e5094d617851c759e35dc72720267b5464eb95284c6d5a1945ce2' }, // SUI
  UNI: { address: '0x396b24e9137befef326af9fdba92d95dd124d5d4' }, // Uniswap
  USDC: { address: '0xd71a079cb64480334ffb400f017a0dde94f553dd' }, // USD Coin
  XLM: { address: 'GB4SJVA7KAFDZJFVTSEV2YWZZA3VEANHHK3WSJRHO2XS2GDYJCGWKDB5', memo: '1380611530' }, // Stellar Lumens
  XRP: { address: 'rn7d8bZhsdz9ecf586XsvbmVePfxYGrs34', memo: '2237695492' }, // XRP
  XTZ: { address: 'tz1P4FJEdVTEEG5TRREFavjQthzsJuESiCRV' }, // Tezos
  ZORA: { address: '0x407506929b5C58992987609539a1D424f2305Cc3' }, // Zora
}

/**
 * Missing wallets - need to be created in Coinbase Prime
 */
export const MISSING_ROBINHOOD_ASSETS = [
  'ASTER', // Aster
  'FLOKI', // Floki
  'MEW', // cat in a dogs world
  'PENGU', // Pudgy Penguins
  'PEPE', // Pepecoin
  'PNUT', // Peanut the Squirrel
  'POPCAT', // Popcat
  'TON', // Toncoin
  'TRUMP', // OFFICIAL TRUMP
  'VIRTUAL', // Virtuals Protocol
  'WIF', // Dogwifhat
  'WLFI', // World Liberty Financial
  'XPL', // Plasma
]
