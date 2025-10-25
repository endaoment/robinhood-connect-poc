# Robinhood Connect POC

**Status**: Ready for Implementation  
**Pattern**: Frontend/Backend Separation

> API integration POC structured for backend migration

## What This Is

A Robinhood Connect integration with separated concerns:

- **Frontend** (`app/`) - Next.js demonstration UI
- **Backend** (`libs/`) - NestJS modules designed for endaoment-backend

## Quick Links

- **[QUICK-START.md](./QUICK-START.md)** - Get running now
- **[robinhood-onramp/docs/STRUCTURE.md](./robinhood-onramp/docs/STRUCTURE.md)** - Directory organization
- **[robinhood-onramp/docs/MIGRATION-GUIDE.md](./robinhood-onramp/docs/MIGRATION-GUIDE.md)** - Backend integration
- **[robinhood-onramp/docs/](./robinhood-onramp/docs/)** - Full documentation

## Using as a Template

1. Clone this repository
2. Rename `libs/robinhood` to `libs/your-integration`
3. Build your services following the same patterns

See [QUICK-START.md](./QUICK-START.md#use-as-template-for-new-integrations) for details.

## Backend Migration

Copy `libs/robinhood/` to `endaoment-backend/libs/api/robinhood/` and wire dependencies.

See [robinhood-onramp/docs/MIGRATION-GUIDE.md](./robinhood-onramp/docs/MIGRATION-GUIDE.md) for complete instructions.

## What's Included

- NestJS module with 5 HTTP endpoints
- 4 service implementations
- DTOs with validation
- Test suite (183+ tests)
- Support for 19 blockchain networks

## Documentation

- **[robinhood-onramp/README.md](./robinhood-onramp/README.md)** - POC setup and usage
- **[robinhood-onramp/docs/](./robinhood-onramp/docs/)** - Architecture, testing, development guides
- **[.cursor/plans/](./cursor/plans/robinhood-backend-alignment/)** - Planning logs

---

**Last Updated**: October 25, 2025  
**Status**: Ready for Implementation
