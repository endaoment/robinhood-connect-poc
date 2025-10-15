# Missing Coinbase Prime Addresses

## Status: 11 Configured ✅ | 9 Missing ⏳

Most of your Coinbase Prime addresses are already configured. You just need addresses for the additional networks.

---

## ✅ Already Configured (11 networks)

These are set and ready to use:

| Network              | Address                                                    | Type    |
| -------------------- | ---------------------------------------------------------- | ------- |
| **Ethereum**         | `0x8e58A3E8835A90EcF53c14C153cCE3aaC44B8113`               | EVM     |
| **Polygon**          | `0x3F5a6f6Ce9Dd9e1098f279Eb0aF00aFF317b3d66`               | EVM     |
| **Avalanche**        | `0x7e707c8d5dc65d80162c0a7fb02c634306952385`               | EVM     |
| **Ethereum Classic** | `0x6Eca26A6337b1069d3865F54158fA5Bf675C3d37`               | EVM     |
| **Bitcoin**          | `3NJ48qerB4sWE8qEF1bRzk7jXKh8AJnbBC`                       | Bitcoin |
| **Bitcoin Cash**     | `qrja4dr6kjtrrjae2y7jals4jc8up0assspl39fekq`               | Bitcoin |
| **Litecoin**         | `MEDGZCJWX8X1Njy5uRfvGwdi2QxaMNQYad`                       | Bitcoin |
| **Dogecoin**         | `DC77W64uHRkkmvDwusq2tfEjqBQwch1W7s`                       | Bitcoin |
| **Solana**           | `DPsUYCziRFjW8dcvitvtrJJfxbPUb1X7Ty8ybn3hRwM1`             | Solana  |
| **Stellar**          | `GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37` | Stellar |
| **Stellar Memo**     | `4212863649`                                               | Memo    |
| **Tezos**            | `tz1WiBmPs9ZLsvuiS92cxZQjikxEo9Dsv7eh`                     | Tezos   |

---

## ⏳ Still Needed (9 items)

### EVM Networks (4 addresses)

- [ ] **Arbitrum** - Need unique CB Prime address (0x format)
- [ ] **Base** - Need unique CB Prime address (0x format)
- [ ] **Optimism** - Need unique CB Prime address (0x format)
- [ ] **Zora** - Need unique CB Prime address (0x format)

### Other Networks (3 addresses)

- [ ] **Cardano** - Need CB Prime address (addr1 format)
- [ ] **XRP** - Need CB Prime address (r format)
- [ ] **Hedera** - Need CB Prime account ID (0.0.x format)

### Memos/Tags (2 items)

- [ ] **XRP Destination Tag** - Numeric tag for XRP
- [ ] **Hedera Memo** - Numeric memo for HBAR

---

## Quick Action Items

### 1. Request from CB Prime Team

Email your CB Prime account manager requesting:

```
Hi [Name],

We need Coinbase Prime deposit addresses for additional networks in our Robinhood
offramp integration:

EVM Networks (need unique address for each):
- Arbitrum (0x address)
- Base (0x address)
- Optimism (0x address)
- Zora (0x address)

Other Networks:
- Cardano (addr1 address)
- XRP (r address + destination tag)
- Hedera (0.0.x account ID + memo)

Each address needs automated liquidation configured.

Thanks!
```

### 2. Update Configuration

Once received, update `robinhood-offramp/lib/network-addresses.ts`:

```typescript
// Replace these placeholders:
ARBITRUM: 'PLACEHOLDER_CB_PRIME_ARBITRUM'  → Your CB Prime Arbitrum address
BASE: 'PLACEHOLDER_CB_PRIME_BASE'          → Your CB Prime Base address
OPTIMISM: 'PLACEHOLDER_CB_PRIME_OPTIMISM'  → Your CB Prime Optimism address
ZORA: 'PLACEHOLDER_CB_PRIME_ZORA'          → Your CB Prime Zora address
CARDANO: 'PLACEHOLDER_CB_PRIME_CARDANO'    → Your CB Prime Cardano address
XRP: 'PLACEHOLDER_CB_PRIME_XRP'            → Your CB Prime XRP address
HEDERA: 'PLACEHOLDER_CB_PRIME_HEDERA'      → Your CB Prime Hedera account ID
SUI: 'PLACEHOLDER_CB_PRIME_SUI'            → Your CB Prime Sui address
TONCOIN: 'PLACEHOLDER_CB_PRIME_TON'        → Your CB Prime Toncoin address

// And memos:
XRP: 'PLACEHOLDER_CB_PRIME_XRP_TAG'        → XRP destination tag
HEDERA: 'PLACEHOLDER_CB_PRIME_HBAR_MEMO'   → Hedera memo
```

### 3. Test and Deploy

```bash
cd robinhood-offramp
npm run build   # Verify configuration
```

---

## Important Notes

### EVM Address Requirements

**Each EVM network MUST have its own unique address** for CB Prime's automated liquidation:

- ✅ Ethereum: `0x8e58...8113` (different address)
- ✅ Polygon: `0x3F5a...3d66` (different address)
- ⏳ Arbitrum: Need unique address
- ⏳ Base: Need unique address
- ⏳ Optimism: Need unique address
- ⏳ Zora: Need unique address
- ✅ Avalanche: `0x7e70...2385` (different address)
- ✅ ETC: `0x6Eca...3d37` (different address)

**Why?** CB Prime's automated liquidation infrastructure tracks and settles each network separately.

### Networks That Can Share Addresses

**None.** Each network needs its own unique address for proper tracking and automated liquidation in CB Prime.

---

## Current Configuration File

**File**: `robinhood-offramp/lib/network-addresses.ts`

**Status**:

- ✅ 11 networks fully configured
- ⏳ 9 items waiting for CB Prime

**Next Step**: Request the 9 missing items from your CB Prime team

---

## Timeline

**Estimated**: 3-5 business days to receive addresses from CB Prime  
**Then**: 30 minutes to update configuration and test  
**Total**: Ready to launch within 1 week

---

## Questions?

All the complex documentation has been removed. This is straightforward:

1. You already have most CB Prime addresses ✅
2. Just need 9 more items from CB Prime team
3. Update the placeholders in `network-addresses.ts`
4. Test and deploy

That's it! 🚀
