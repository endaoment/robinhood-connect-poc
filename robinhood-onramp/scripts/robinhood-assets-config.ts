/**
 * Coinbase Prime Deposit Addresses for ALL Robinhood Transfer-Eligible Assets
 * Total: 38 assets
 * Coverage: 32/38 (84.2%)
 * Dedicated wallets: 27
 * Fallback addresses: 5
 * 
 * Reference: https://robinhood.com/us/en/support/articles/crypto-transfers/
 */

export const ROBINHOOD_ASSET_ADDRESSES: Record<string, { address: string; memo?: string; note?: string }> = {
  AAVE: { address: '0x0788702c7d70914f34b82fb6ad0b405263a00486' },
  ADA: { address: 'addr1vydgw0ruk6q78vl0f26q6zxtssfnh2thxzgqvvthe8je56crgtapt' },
  ARB: { address: '0x6931a51e15763C4d8da468cbF7C51323d96F2e80' },
  AVAX: { address: '0x2063115a37f55c19cA60b9d1eca2378De00CD79b' },
  BCH: { address: 'qqqg0e4qs9h6j6z8t53kwmjukwksmkzphvtsfv3j2q' },
  BONK: { address: 'puNRXZc4qEYWdUjmx68Lcb87DobBpgZQPdTndoS4U5B' },
  BTC: { address: '3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC' },
  COMP: { address: '0x944bff154f0486b6c834c5607978b45ffc264902' },
  CRV: { address: '0xe2efa30cca6b06e4436c0f25f2d0409407ac3a4d' },
  DOGE: { address: 'DUGnpFtJGnmmGzFMBoEgSw5nPgRfSzYHF7' },
  ETC: { address: '0x269285683a921dbce6fcb21513b06998f8fbbc99' },
  ETH: { address: '0xa22d566f52b303049d27a7169ed17a925b3fdb5e' },
  FLOKI: { address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2' }, // Using fallback Ethereum address (no dedicated Trading Balance wallet)
  HBAR: { address: '0.0.5006230', memo: '904278439' },
  LINK: { address: '0xcf26c0f23e566b42251bc0cf680c8999def1d7f0' },
  LTC: { address: 'MQNay3B5gRq4o7nHuTJf9LpFkDmxhmockK' },
  MOODENG: { address: 'Fd4ir2iU6H8kaYvTbAwXmrdjo6JPt7ABo7b5poCTpAsE' },
  ONDO: { address: '0x894f85323110a0a8883b22b18f26864882c3c63e' },
  OP: { address: '0xE006aBC90950DB9a81A3812502D0b031FaAf28D8' },
  PEPE: { address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2' }, // Using fallback Ethereum address (no dedicated Trading Balance wallet)
  SHIB: { address: '0x263dcd3e749b1f00c3998b5a0f14e3255658803b' },
  SOL: { address: 'DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1' },
  SUI: { address: '0xfb44ad61588e5094d617851c759e35dc72720267b5464eb95284c6d5a1945ce2' },
  TRUMP: { address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2' }, // Using fallback Ethereum address (no dedicated Trading Balance wallet)
  UNI: { address: '0x396b24e9137befef326af9fdba92d95dd124d5d4' },
  USDC: { address: '0xd71a079cb64480334ffb400f017a0dde94f553dd' },
  VIRTUAL: { address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2' }, // Using fallback Ethereum address (no dedicated Trading Balance wallet)
  WLFI: { address: '0x9D5025B327E6B863E5050141C987d988c07fd8B2' }, // Using fallback Ethereum address (no dedicated Trading Balance wallet)
  XLM: { address: 'GB4SJVA7KAFDZJFVTSEV2YWZZA3VEANHHK3WSJRHO2XS2GDYJCGWKDB5', memo: '1380611530' },
  XRP: { address: 'rn7d8bZhsdz9ecf586XsvbmVePfxYGrs34', memo: '2237695492' },
  XTZ: { address: 'tz1P4FJEdVTEEG5TRREFavjQthzsJuESiCRV' },
  ZORA: { address: '0x407506929b5C58992987609539a1D424f2305Cc3' },
}

/**
 * Assets still missing deposit addresses
 * These need Trading Balance wallets or fallback addresses
 */
export const MISSING_ASSETS = [
  { symbol: 'MEW', name: 'cat in a dogs world', chain: 'Solana' },
  { symbol: 'PENGU', name: 'Pudgy Penguins', chain: 'Solana' },
  { symbol: 'PNUT', name: 'Peanut the Squirrel', chain: 'Solana' },
  { symbol: 'POPCAT', name: 'Popcat', chain: 'Solana' },
  { symbol: 'TON', name: 'Toncoin', chain: 'Unknown' },
  { symbol: 'WIF', name: 'Dogwifhat', chain: 'Solana' },
]
