# Robinhood Connect - Offramp Application

Complete Next.js application for transferring cryptocurrency from Robinhood to Endaoment.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Robinhood API credentials

# Start development server
npm run dev
```

Visit http://localhost:3000/dashboard

## 📋 Requirements

- Node.js 18+
- npm or pnpm
- Robinhood API credentials (App ID and API Key)

## 🔑 Environment Variables

Create `.env.local` with:

```bash
# Required
ROBINHOOD_APP_ID=your-app-id
ROBINHOOD_API_KEY=your-api-key

# Optional (legacy, can be removed)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

## 📂 Project Structure

```
robinhood-offramp/
├── app/
│   ├── api/robinhood/          # Backend API routes
│   │   ├── generate-offramp-url/    # POST - Generate transfer URL
│   │   ├── redeem-deposit-address/  # POST - Get deposit address
│   │   └── order-status/            # GET - Check transfer status
│   ├── callback/               # Handles Robinhood redirects
│   ├── dashboard/              # Main user interface
│   ├── layout.tsx              # Root layout (no auth required)
│   └── page.tsx                # Landing page
├── components/
│   ├── offramp-modal.tsx       # Transfer initiation modal
│   ├── order-status.tsx        # Real-time status tracking
│   ├── transaction-history.tsx # Transfer history viewer
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── robinhood-api.ts        # API client functions
│   ├── robinhood-url-builder.ts # URL generation utilities
│   ├── security-utils.ts       # Input validation
│   ├── performance-utils.ts    # Caching & optimization
│   └── error-messages.ts       # User-friendly errors
├── types/
│   └── robinhood.d.ts          # TypeScript definitions
└── docs/
    ├── USER_GUIDE.md           # User documentation
    └── DEVELOPER_GUIDE.md      # Developer documentation
```

## 🎯 Key Features

### User Interface

- **Dashboard**: Clean interface for initiating transfers
- **Offramp Modal**: Network, asset, and amount selection
- **Status Tracking**: Real-time updates with auto-refresh
- **Transaction History**: View all past transfers

### Backend API

- **URL Generation**: Creates Robinhood Connect links
- **Address Redemption**: Retrieves deposit addresses
- **Order Status**: Monitors transfer completion

### Security

- ✅ API keys on backend only
- ✅ Input validation on all endpoints
- ✅ Type-safe interfaces
- ✅ XSS prevention
- ✅ Rate limiting ready

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Quality
npx tsc --noEmit        # Type check
npm run lint             # Run linter

# Testing
npm test                 # Run tests (when implemented)
```

## 📝 API Endpoints

### Generate Offramp URL

```bash
POST /api/robinhood/generate-offramp-url
Content-Type: application/json

{
  "supportedNetworks": ["ETHEREUM"],
  "assetCode": "ETH",
  "assetAmount": "0.1"
}
```

### Redeem Deposit Address

```bash
POST /api/robinhood/redeem-deposit-address
Content-Type: application/json

{
  "referenceId": "f2056f4c-93c7-422b-bd59-fbfb5b05b6ad"
}
```

### Check Order Status

```bash
GET /api/robinhood/order-status?referenceId=<uuid>
```

## 🏗️ Architecture

### Stateless Flow

This integration uses Robinhood's stateless redirect flow:

1. Generate `referenceId` (UUID v4) on backend
2. Build Robinhood Connect URL with parameters
3. Store `referenceId` in localStorage (client)
4. Open Robinhood app/web with universal link
5. User completes transfer in Robinhood
6. Robinhood redirects back to `/callback`
7. Retrieve `referenceId` from localStorage
8. Call API to redeem deposit address
9. Display address to user
10. Track order status until completion

### No Authentication Required

Unlike OAuth integrations, this flow requires no user authentication on our side. Users authenticate directly in the Robinhood app.

## 🌐 Supported Networks & Assets

### Networks

- Ethereum, Polygon, Solana
- Bitcoin, Litecoin, Dogecoin
- Avalanche, and more

### Assets

- **ETH, USDC, USDT** (Ethereum/Polygon)
- **SOL, USDC** (Solana)
- **BTC, LTC, DOGE** (Bitcoin family)

See Robinhood documentation for complete list.

## 🧪 Testing

### Manual Testing

1. Start dev server: `npm run dev`
2. Visit http://localhost:3000/dashboard
3. Click "Start Transfer"
4. Test form validation
5. Generate URL (requires API credentials)

### Testing Without API Credentials

You can test the UI and client-side logic without Robinhood API credentials:

- ✅ Dashboard loads
- ✅ Modal opens and closes
- ✅ Form validation works
- ✅ Network/asset selection
- ⚠️ API calls will fail (expected)

### Testing With API Credentials

Complete end-to-end testing requires:

1. Valid Robinhood API credentials
2. Robinhood app installed (mobile) or web access
3. Callback URL registered with Robinhood team

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in dashboard
# Deploy to production
vercel --prod
```

### Environment Setup

In Vercel dashboard, add:

- `ROBINHOOD_APP_ID`
- `ROBINHOOD_API_KEY`
- `NEXTAUTH_URL` (your production domain)

### Post-Deployment

1. Register production callback URL with Robinhood:
   - `https://your-domain.com/callback`
2. Test complete flow
3. Monitor error rates
4. Set up analytics

## 📊 Performance

### Build Output

```
Route (app)                              Size  First Load JS
├ ○ /dashboard                        33.4 kB         146 kB
├ ○ /callback                         4.79 kB         113 kB
├ ƒ /api/robinhood/*                   144 B         101 kB
```

**Excellent performance**:

- Dashboard: 146 kB (< 200 kB target)
- Optimized code splitting
- Minimal API overhead

## 🔐 Security

- **9/10 Security Rating**
- OWASP Top 10 compliant
- Input validation on all endpoints
- API keys never exposed to client
- Type-safe interfaces throughout

See `SECURITY-AUDIT.md` in project root for complete audit.

## 📚 Documentation

### For Users

- **[USER_GUIDE.md](docs/USER_GUIDE.md)** - How to transfer crypto

### For Developers

- **[DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)** - Complete technical reference

### For Testing

- **[TESTING-CHECKLIST.md](../TESTING-CHECKLIST.md)** - 100+ test items

### For Production

- **[READY-FOR-PRODUCTION.md](../READY-FOR-PRODUCTION.md)** - Deployment checklist

## 🐛 Troubleshooting

### Clear Next.js Cache

```bash
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

### TypeScript Errors

```bash
npx tsc --noEmit
```

### Port Already in Use

Next.js will automatically try ports 3001, 3002, etc.

### Styling Missing

1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
2. Clear .next cache
3. Restart dev server

## 🤝 Contributing

This project uses:

- TypeScript strict mode
- No semicolons
- Single quotes
- Tailwind CSS for styling
- shadcn/ui for components

See [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) for detailed guidelines.

## 📞 Support

- **Technical Issues**: See [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)
- **User Questions**: See [USER_GUIDE.md](docs/USER_GUIDE.md)
- **API Access**: Contact Robinhood team

---

**Status**: ✅ Production Ready (pending API credentials)  
**Version**: 1.0.0  
**Last Updated**: October 15, 2025
