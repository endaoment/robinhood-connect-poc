# Robinhood Connect - Network Addresses Status

**Last Updated**: October 15, 2025  
**Total Networks Supported**: 20 networks  
**Fully Configured**: 19 networks ✅  
**Need Addresses**: 1 network 📝

---

## ✅ Fully Configured Networks (19)

These networks have production-ready addresses from Endaoment's OTC token configuration and are ready to use immediately.

### EVM-Compatible Networks (L1 & L2) - 8 Networks

All EVM networks use compatible addresses that can safely receive transfers across chains.

| Network              | Code               | Address                                      | Format             |
| -------------------- | ------------------ | -------------------------------------------- | ------------------ |
| **Ethereum**         | `ETHEREUM`         | `0x8e58A3E8835A90EcF53c14C153cCE3aaC44B8113` | EVM (0x)           |
| **Polygon**          | `POLYGON`          | `0x8e58A3E8835A90EcF53c14C153cCE3aaC44B8113` | EVM (0x)           |
| **Arbitrum**         | `ARBITRUM`         | `0x8e58A3E8835A90EcF53c14C153cCE3aaC44B8113` | EVM L2 (0x)        |
| **Base**             | `BASE`             | `0x8e58A3E8835A90EcF53c14C153cCE3aaC44B8113` | EVM L2 (0x)        |
| **Optimism**         | `OPTIMISM`         | `0x8e58A3E8835A90EcF53c14C153cCE3aaC44B8113` | EVM L2 (0x)        |
| **Zora**             | `ZORA`             | `0x8e58A3E8835A90EcF53c14C153cCE3aaC44B8113` | Base L2 (0x)       |
| **Avalanche**        | `AVALANCHE`        | `0x7e707c8d5dc65d80162c0a7fb02c634306952385` | C-Chain (0x)       |
| **Ethereum Classic** | `ETHEREUM_CLASSIC` | `0x6Eca26A6337b1069d3865F54158fA5Bf675C3d37` | EVM (0x, EOA only) |

### Bitcoin & Bitcoin-Like Networks - 4 Networks

| Network          | Code           | Address                                      | Format       |
| ---------------- | -------------- | -------------------------------------------- | ------------ |
| **Bitcoin**      | `BITCOIN`      | `3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC`         | P2SH (3)     |
| **Bitcoin Cash** | `BITCOIN_CASH` | `qrja4dr6kjtrrjae2y7jals4jc8up0assspl39fekq` | Cashaddr (q) |
| **Litecoin**     | `LITECOIN`     | `MEDGZCJWX8X1Njy5uRfvGwdi2QxaMNQYad`         | P2SH (M)     |
| **Dogecoin**     | `DOGECOIN`     | `DC77W64uHRkkmvDwusq2tfEjqBQwch1W7s`         | P2PKH (D)    |

### Other Layer 1 Networks - 4 Networks

| Network     | Code      | Address                                                              | Format            |
| ----------- | --------- | -------------------------------------------------------------------- | ----------------- |
| **Solana**  | `SOLANA`  | `DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1`                       | Base58 (44 chars) |
| **Cardano** | `CARDANO` | `addr1v9fu7mgyyyh63v7kqn57t7nadvv76n2cgjlg7l0r974nj9st03emv`         | Shelley (addr1)   |
| **Tezos**   | `TEZOS`   | `tz1WiBmPs9ZLsvuiS92cxZQjikxEo9Dsv7eh`                               | tz1 format        |
| **Sui**     | `SUI`     | `0x5e4072e696853d1d9c7b478c68a5d97f32ac35524e9dee3cf1022bc022e59c9a` | 0x + 64 hex chars |

### Networks with Required Memos - 3 Networks

These networks require both an address AND a memo/tag for proper crediting.

| Network     | Code      | Address                                                    | Memo/Tag     | Format                  |
| ----------- | --------- | ---------------------------------------------------------- | ------------ | ----------------------- |
| **Stellar** | `STELLAR` | `GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37` | `4212863649` | G-address + memo        |
| **XRP**     | `XRP`     | `rn7d8bZhsdz9ecf586XsvbmVePfxYGrs34`                       | `2237695492` | r-address + numeric tag |
| **Hedera**  | `HEDERA`  | `0.0.1133968`                                              | `2364220028` | Account ID + memo       |

---

## 📝 Networks Needing Addresses (1)

This network is supported by Robinhood but needs an address provided before it can be used in production.

### Network Details

| Network     | Code      | Required Format              | Assets Supported | Priority |
| ----------- | --------- | ---------------------------- | ---------------- | -------- |
| **Toncoin** | `TONCOIN` | Base64 or hexadecimal format | TON              | Low      |

### How to Add Missing Address

Once you have a Toncoin address:

1. Update `robinhood-offramp/lib/network-addresses.ts`
2. Replace the placeholder value:

   ```typescript
   TONCOIN: 'PLACEHOLDER_NEEDED_TON_ADDRESS',
   ```

   with your actual TON address in base64 or hexadecimal format

3. Run validation: `npm run build`
4. Test with small amounts before production

---

## 🎯 Supported Assets by Network

Based on [Robinhood's documentation](https://robinhood.com/us/en/support/articles/crypto-transfers/), here are the major assets supported on each network:

### Ethereum (+ ERC-20 tokens)

- ETH, USDC, USDT, AAVE, LINK, COMP, CRV, FLOKI, ONDO, PEPE, SHIB, UNI, WLFI

### Solana (+ SPL tokens)

- SOL, USDC, BONK, MEW (cat in a dogs world), WIF (dogwifhat), MOODENG (Moo Deng), TRUMP (OFFICIAL TRUMP), PNUT (Peanut the Squirrel), POPCAT, PENGU (Pudgy Penguins)

### Multi-Network USDC Support

USDC is supported on: Arbitrum, Base, Ethereum, Optimism, Polygon, Solana

### Layer 2 Networks

- **Arbitrum**: ARB, USDC
- **Optimism**: OP, USDC
- **Base**: USDC
- **Zora**: ZORA
- **Polygon**: MATIC, USDC, USDT

---

## 🔒 Address Format Validation

All addresses are validated against Robinhood's supported formats:

### EVM Networks (0x format)

- Must start with `0x`
- Must be exactly 42 characters
- Supported on: Ethereum, Polygon, Arbitrum, Base, Optimism, Zora, Avalanche, Ethereum Classic

### Bitcoin-Like Networks

- **Bitcoin**: `1` (P2PKH), `3` (P2SH), `bc1q` (SegWit)
- **Bitcoin Cash**: `1` (Legacy) or `q` (Cashaddr)
- **Litecoin**: `L` (P2PKH), `M` (P2SH), `ltc1` (SegWit)
- **Dogecoin**: `D` (P2PKH)

### Other Networks

- **Solana**: Base58 encoded, typically 44 characters
- **Stellar**: `G` prefix (standard address)
- **XRP**: `r` prefix (XRPL address)
- **Hedera**: `0.0.x` format (account ID)
- **Cardano**: `addr1` (Shelley), `Ae2` or `DdzFF` (Byron)
- **Tezos**: `tz` prefix
- **Sui**: `0x` + exactly 64 hex characters
- **Toncoin**: Base64 or hexadecimal

---

## ⚠️ Important Notes

### Address Reuse Strategy

**EVM-Compatible Chains**: We use the same address across all EVM-compatible chains (Ethereum, Polygon, Arbitrum, Base, Optimism, Zora) for safety and simplicity. This allows:

- Single address management for 6 networks
- Recovery if user sends to wrong EVM network
- Simplified monitoring and tracking

### Networks Requiring Memos

**Critical**: Three networks require both address AND memo for proper crediting:

1. **Stellar (XLM)**: Memo `4212863649`
2. **XRP**: Destination Tag `2237695492` (numeric only)
3. **Hedera (HBAR)**: Memo `2364220028`

**Without the correct memo, funds may be lost or require manual recovery.**

### Ethereum Classic Special Case

**Important**: Ethereum Classic addresses must be EOA (Externally Owned Accounts) only. Robinhood does NOT support withdrawals to smart contracts on ETC, even though the address format is identical to Ethereum.

---

## 📊 Network Statistics

| Category               | Count | Percentage |
| ---------------------- | ----- | ---------- |
| **Total Networks**     | 20    | 100%       |
| **Configured & Ready** | 19    | 95%        |
| **Need Addresses**     | 1     | 5%         |
| **EVM-Compatible**     | 8     | 40%        |
| **Bitcoin-Like**       | 4     | 20%        |
| **Require Memos**      | 3     | 15%        |

---

## 🚀 Testing Strategy

Before production deployment:

1. **Verify All Addresses**: Confirm ownership and access to private keys
2. **Test Small Amounts**: Send test transactions on each network
3. **Verify Memos**: Test that memos work correctly for XLM, XRP, HBAR
4. **Monitor Transactions**: Set up monitoring for all addresses
5. **Document Recovery**: Create recovery procedures for each network type

---

## 📞 Getting Additional Address

To provide the address for the remaining network (TONCOIN):

1. **Format Requirements**: Base64 or hexadecimal format (see Robinhood documentation)
2. **Update Location**: `robinhood-offramp/lib/network-addresses.ts`
3. **Validation**: Run `npm run build` to verify format
4. **Testing**: Test with small amounts before production

Once TONCOIN is added, we'll have **100% network coverage** of all Robinhood-supported networks! 🎯

---

## 🔗 References

- **Robinhood Documentation**: <https://robinhood.com/us/en/support/articles/crypto-transfers/>
- **Endaoment OTC Config**: Addresses sourced from production token configuration
- **Network Addresses File**: `/robinhood-offramp/lib/network-addresses.ts`
- **Supported Networks List**: `/robinhood-offramp/lib/robinhood-url-builder.ts`

---

**Status Summary**: ✅ **95% complete** - 19 of 20 networks fully configured and production-ready. Only 1 network (TONCOIN) needs an address.
