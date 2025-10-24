# Robinhood Connect - User Guide

> ⚠️ **DEPRECATED**: This document contains legacy offramp instructions.
> Offramp has been removed. This integration only supports **onramp** (deposits to external wallets).
>
> For current usage, see the asset pre-selection dashboard at `/dashboard`.

## How to Transfer Crypto from Robinhood (Legacy Documentation)

### Step 1: Start Transfer

1. Visit the dashboard at [your-domain.com/dashboard](http://localhost:3002/dashboard)
2. Click **"Start Transfer"** button on the main card
3. The transfer modal will open with transfer options

### Step 2: Configure Your Transfer

1. **Select Network**: Choose the blockchain network (Ethereum, Polygon, Solana, etc.)
2. **Select Asset**: Choose the cryptocurrency you want to transfer (ETH, USDC, BTC, etc.)
3. **Enter Amount**: Input the amount you want to transfer
   - Toggle between crypto amount and fiat amount
   - View estimated value and processing fees
4. Click **"Open Robinhood"** to continue

### Step 3: Complete in Robinhood

1. A new tab/window will open with the Robinhood app or website
2. **On Mobile**: The Robinhood app will open automatically
3. **On Desktop**: You'll be directed to Robinhood's web interface
4. Review your transfer details in Robinhood:
   - Asset type and amount
   - Network selection
   - Estimated fees
5. Confirm and authorize the transfer in Robinhood

### Step 4: Receive Deposit Address

1. After completing the flow in Robinhood, you'll be redirected back automatically
2. Your unique deposit address will be displayed
3. **Important**: Copy the deposit address carefully
4. If the network requires an address tag/memo, copy that as well
5. Complete the transfer by sending crypto to this address from Robinhood

### Step 5: Track Your Transfer

1. Your transfer will appear in **"Recent Activity"** on the dashboard
2. Click **"View Transaction History"** to see all transfers
3. Click on any transfer to view detailed status:
   - **In Progress**: Transfer is being processed
   - **Completed**: Transfer successful, blockchain transaction ID available
   - **Failed**: Transfer failed, contact support if needed
4. For completed transfers, click the blockchain explorer link to verify on-chain

## Supported Assets & Networks

### Ethereum Network

- **Assets**: ETH, USDC, USDT
- **Explorer**: [etherscan.io](https://etherscan.io)

### Polygon Network

- **Assets**: MATIC, USDC, USDT
- **Explorer**: [polygonscan.com](https://polygonscan.com)

### Solana Network

- **Assets**: SOL, USDC
- **Explorer**: [solscan.io](https://solscan.io)

### Bitcoin Network

- **Assets**: BTC
- **Explorer**: [blockstream.info](https://blockstream.info)

### Litecoin Network

- **Assets**: LTC
- **Explorer**: [blockchair.com](https://blockchair.com/litecoin)

### Dogecoin Network

- **Assets**: DOGE
- **Explorer**: [blockchair.com](https://blockchair.com/dogecoin)

### Avalanche Network

- **Assets**: AVAX, USDC, USDT

For a complete list of supported assets, visit [Robinhood's currency pairs page](https://nummus.robinhood.com/currency_pairs/).

## Troubleshooting

### Transfer Not Working?

**Issue**: Robinhood app doesn't open

- Ensure you have the Robinhood app installed on mobile
- On desktop, the web interface should open automatically
- Check that popup blockers are disabled

**Issue**: Deposit address not showing

- Ensure you completed the flow in Robinhood
- Check that you were redirected back to our callback URL
- Try refreshing the page

**Issue**: Transfer stuck "In Progress"

- Blockchain transfers can take time depending on network congestion
- Ethereum: 1-15 minutes typically
- Bitcoin: 10-60 minutes typically
- Check the blockchain explorer for transaction status

### Invalid Transfer Amount

- Ensure you have sufficient balance in your Robinhood account
- Check minimum transfer amounts (varies by asset)
- Verify you're not exceeding maximum transfer limits

### Wrong Network Selected

⚠️ **Critical**: Always ensure you select the correct network!

- Sending assets to the wrong network may result in permanent loss
- Double-check network selection before confirming
- Verify the deposit address matches the expected network

### Need Help?

If you encounter any issues:

1. **Check Transaction History**: View your transfer status in the dashboard
2. **Reference ID**: Each transfer has a unique reference ID for support inquiries
3. **Contact Support**: Reach out with your reference ID for assistance
4. **Blockchain Explorer**: Use the explorer link to verify on-chain status

## Security & Best Practices

### Keep Your Information Safe

- Never share your deposit address with untrusted parties
- Always verify the deposit address before sending crypto
- Use the copy button to avoid typos when entering addresses
- Keep your Robinhood account secure with 2FA

### Verify Before Sending

1. ✅ Confirm the asset type matches (ETH to ETH address, etc.)
2. ✅ Confirm the network matches (Ethereum to Ethereum address, etc.)
3. ✅ Double-check the deposit address
4. ✅ If required, include the address tag/memo

### Transaction Times

- Transfer times vary by blockchain network
- Most transfers complete within 15-60 minutes
- Use the transaction history to monitor progress
- Blockchain congestion may cause delays

### Fees

- Robinhood may charge network fees for transfers
- Processing fees are shown before you confirm
- Total cost includes crypto amount + fees
- Fees vary by network and current network congestion

## Frequently Asked Questions

### How long does a transfer take?

Transfer times depend on the blockchain network:

- **Ethereum**: 1-15 minutes
- **Polygon**: 1-5 minutes
- **Solana**: < 1 minute
- **Bitcoin**: 10-60 minutes

### Can I cancel a transfer?

Once a transfer is confirmed in Robinhood and submitted to the blockchain, it cannot be cancelled. Always verify details before confirming.

### What happens if I send to the wrong address?

Blockchain transactions are irreversible. Always verify the deposit address before sending. We cannot recover funds sent to incorrect addresses.

### Are there minimum amounts?

Yes, minimum transfer amounts vary by asset and network. Robinhood will show minimum amounts in the transfer interface.

### How do I view my transaction history?

Click **"View Transaction History"** on the dashboard to see all your transfers, including their status and blockchain transaction IDs.

### What if my transfer fails?

If a transfer fails:

1. Check the error message in transaction history
2. Verify you had sufficient balance in Robinhood
3. Ensure the amount met minimum requirements
4. Contact support with your reference ID if needed

## Contact & Support

For assistance:

- **Reference your Transfer ID**: Available in transaction history
- **Check Status First**: Use transaction history and blockchain explorer
- **Contact Support**: [support email or link]

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0
