# Quick Start Guide - Robinhood Connect POC

> **Template-Based Implementation**: This POC is built using the [blank-poc](https://github.com/endaoment/blank-poc) template pattern. See [TEMPLATE-USAGE.md](./TEMPLATE-USAGE.md) for template details.

## Run This POC

**Implementation Directory**: All Robinhood-specific code is in `robinhood-onramp/`

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

**Next**: See [robinhood-onramp/README.md](./robinhood-onramp/README.md) for detailed implementation guide

## Test the Implementation

```bash
cd robinhood-onramp  # If not already there

npm test                 # Run all 183+ tests
npm run test:coverage    # Check coverage (98%+)
npx tsc --noEmit        # Type check
npm run build            # Production build
```

**See**: [robinhood-onramp/docs/TESTING_GUIDE.md](./robinhood-onramp/docs/TESTING_GUIDE.md) for comprehensive testing documentation

## Migrate to endaoment-backend

This POC follows the **template pattern** with backend-ready NestJS modules.

### Quick Copy

```bash
# Copy the Robinhood library to backend
cp -r robinhood-onramp/libs/robinhood \
      endaoment-backend/libs/api/robinhood
```

### Integration Steps

1. **Update Module** - Wire database and service dependencies
2. **Uncomment Decorators** - Activate NestJS controller
3. **Import Module** - Add to AppModule
4. **Test** - Verify 183 tests pass

### Complete Guide

📚 **Detailed Instructions**: [robinhood-onramp/docs/MIGRATION-GUIDE.md](./robinhood-onramp/docs/MIGRATION-GUIDE.md)

The migration guide includes:

- Step-by-step instructions
- Code examples
- Troubleshooting
- Validation steps
- Rollback procedures

## About the Template Pattern

This repository demonstrates the **POC template pattern**:

**Structure:**
- **Root Level**: Template-aware docs, project overview
- **Implementation Directory** (`robinhood-onramp/`): Provider-specific code
- **Backend-Ready**: NestJS modules for production migration

**For Creating New POCs:**

Use the [blank-poc](https://github.com/endaoment/blank-poc) template *(coming soon)*:

1. Clone blank-poc template
2. Customize for your provider
3. Follow this repository as reference implementation

**Template Documentation**: [TEMPLATE-USAGE.md](./TEMPLATE-USAGE.md) *(created in SP3)*

**This repository serves as the reference implementation example.**

## Learn More

### Template Pattern

- **[TEMPLATE-USAGE.md](./TEMPLATE-USAGE.md)** - Template pattern guide _(created in SP3)_
- **[blank-poc](https://github.com/endaoment/blank-poc)** - Base template _(coming soon)_

### Robinhood Implementation

- **[robinhood-onramp/README.md](./robinhood-onramp/README.md)** - Implementation overview
- **[robinhood-onramp/docs/](./robinhood-onramp/docs/)** - Complete documentation (10 guides)

**Key Guides:**

- [STRUCTURE.md](./robinhood-onramp/docs/STRUCTURE.md) - Directory organization
- [ARCHITECTURE.md](./robinhood-onramp/docs/ARCHITECTURE.md) - System architecture
- [MIGRATION-GUIDE.md](./robinhood-onramp/docs/MIGRATION-GUIDE.md) - Backend integration
- [TESTING_GUIDE.md](./robinhood-onramp/docs/TESTING_GUIDE.md) - Testing approach
- [DEVELOPER_GUIDE.md](./robinhood-onramp/docs/DEVELOPER_GUIDE.md) - Development workflow
