# Quick Start - Robinhood Connect POC

Get the POC running in 5 minutes.

## Run the POC

```bash
# Navigate to implementation directory
cd robinhood-onramp

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add your Robinhood API credentials to .env.local

# Start development server
npm run dev
```

**Access**: <http://localhost:3030>

## Test

```bash
cd robinhood-onramp

npm test                 # Run all 183+ tests
npm run test:coverage    # Check coverage (98%+)
npx tsc --noEmit        # Type check
npm run build            # Production build
```

## Migrate to Backend

```bash
# Copy Robinhood library to backend
cp -r robinhood-onramp/libs/robinhood endaoment-backend/libs/api/robinhood
```

**Then**:

1. Wire database and service dependencies
2. Uncomment NestJS decorators
3. Import module in AppModule
4. Verify tests pass

**Details**: [robinhood-onramp/docs/MIGRATION-GUIDE.md](./robinhood-onramp/docs/MIGRATION-GUIDE.md)

## Documentation

**Implementation Guide**: [robinhood-onramp/README.md](./robinhood-onramp/README.md)  
**Architecture**: [robinhood-onramp/docs/ARCHITECTURE.md](./robinhood-onramp/docs/ARCHITECTURE.md)  
**Testing**: [robinhood-onramp/docs/TESTING_GUIDE.md](./robinhood-onramp/docs/TESTING_GUIDE.md)  
**All Guides**: [robinhood-onramp/docs/](./robinhood-onramp/docs/)
