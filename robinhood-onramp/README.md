# Robinhood Connect - Onramp Application

**Status**: Ready for Implementation  
**Architecture**: Frontend/Backend Separation

> POC for Robinhood Connect API integration. See [docs/STRUCTURE.md](./docs/STRUCTURE.md) for directory organization.

## Quick Start

```bash
npm install
cp .env.example .env.local  # Add your Robinhood API credentials
npm run dev
```

Visit <http://localhost:3030>

## Requirements

- Node.js 18+
- Robinhood API credentials (App ID and API Key)

## Environment Variables

```.env
ROBINHOOD_APP_ID=your-app-id
ROBINHOOD_API_KEY=your-api-key
```

## Architecture

**Frontend** (`app/`) - Next.js UI for POC demonstration  
**Backend** (`libs/`) - NestJS modules for migration to endaoment-backend

The backend layer is designed to copy directly into the production backend.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for details.

## Supported Networks

19 blockchain networks configured:

- **EVM**: Ethereum, Polygon, Arbitrum, Base, Optimism, Zora, Avalanche, Ethereum Classic
- **Bitcoin-like**: Bitcoin, Bitcoin Cash, Litecoin, Dogecoin
- **Other L1**: Solana, Cardano, Tezos, Sui
- **Memo-required**: Stellar, XRP, Hedera

## Development

```bash
npm run dev              # Start dev server
npm test                 # Run tests
npx tsc --noEmit        # Type check
npm run build            # Build for production
```

## Documentation

### Quick Reference

- [docs/STRUCTURE.md](./docs/STRUCTURE.md) - Directory organization
- [docs/MIGRATION-GUIDE.md](./docs/MIGRATION-GUIDE.md) - Backend integration
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture

### Guides

- [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) - Development
- [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) - Testing
- [docs/FLOW-DIAGRAMS.md](./docs/FLOW-DIAGRAMS.md) - Visual flows

## Testing

### Manual Testing

1. Start: `npm run dev`
2. Visit <http://localhost:3030/dashboard>
3. Select an asset and initiate transfer

### With API Credentials

You'll need valid Robinhood API credentials and a registered callback URL for end-to-end testing.

## Deployment

Deploy to Vercel:

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard, then register your callback URL with Robinhood.

## Security

- API keys handled on backend only
- Input validation on all endpoints
- Type-safe interfaces throughout
- Address format validation per network

OWASP Top 10 considerations applied where applicable.

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0
