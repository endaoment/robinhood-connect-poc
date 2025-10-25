# Sub-Plan 13: Architecture Documentation Update

**Status**: Pending
**Priority**: Medium
**Dependencies**: Sub-Plan 12 (Migration Guide)
**Estimated Time**: 2-3 hours

## Context Required

**Files**: `docs/ARCHITECTURE.md` - Current architecture documentation

## Objectives

Update architecture documentation to reflect:

1. New service layer structure
2. DTO validation layer
3. Mock backend integration approach
4. Testing infrastructure
5. Migration path to backend

## Document Updates

### 1. System Architecture Diagram

Update to show:

```
┌─────────────────────────────────────────┐
│          Next.js Frontend               │
│  (Dashboard, Callback Pages)            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        API Routes (Next.js)             │
│  - /api/robinhood/health                │
│  - /api/robinhood/assets                │
│  - /api/robinhood/url/generate          │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          Service Layer                  │
│  ┌────────────────────────────────┐    │
│  │ RobinhoodClientService         │    │
│  │ - generateConnectId()          │    │
│  │ - fetchTradingAssets()         │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │ AssetRegistryService           │    │
│  │ - initialize()                 │    │
│  │ - getAsset()                   │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │ UrlBuilderService              │    │
│  │ - generateOnrampUrl()          │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │ PledgeService                  │    │
│  │ - createFromCallback()         │    │
│  └────────────────────────────────┘    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Mock Backend Services              │
│  (Demonstrates backend integration)     │
│  ┌────────────────────────────────┐    │
│  │ MockTokenService               │    │
│  │ - resolveToken()               │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │ MockPledgeService              │    │
│  │ - createPledge()               │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │ MockNotificationService        │    │
│  │ - notifyCryptoPledgeCreated()  │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        Toast Logger                     │
│  (Visual API Call Demonstrations)      │
└─────────────────────────────────────────┘
```

### 2. Service Layer Documentation

Add section explaining:

- Service-based architecture
- Object parameter pattern
- Error handling approach
- Retry logic implementation
- Logging strategy

### 3. DTO Validation Layer

Document:

- class-validator usage
- Transform decorators
- Validation helper functions
- Error response format

### 4. Mock Backend Integration

Explain:

- Why mocks are used
- Toast demonstration approach
- Backend API mapping
- CryptoDonationPledge mapping

### 5. Testing Strategy

Document:

- Jest + nock setup
- Test coverage goals (80%+)
- Nock helper patterns
- Test structure (AAA pattern)

### 6. Migration Path

Link to MIGRATION-GUIDE.md and summarize:

- File mapping approach
- NestJS conversion steps
- Backend service wiring
- Production deployment checklist

### 7. Code Examples

Update all code examples to use:

- New service classes
- DTO validation
- Object parameter pattern

### 8. Decision Log

Add architectural decisions:

- Decision: Service layer extraction
- Decision: Mock backend with toasts
- Decision: Object parameters for 3+ args
- Decision: Singleton for AssetRegistry

## Deliverables

- [ ] ARCHITECTURE.md fully updated
- [ ] Diagrams current
- [ ] All services documented
- [ ] Code examples updated
- [ ] Migration path explained
- [ ] Decision log complete

## Final Steps

After completing this sub-plan:

1. **Review** all 13 sub-plans for completeness
2. **Create** implementation log: `YYYYMMDD-HHMM-SP13-COMPLETE.md`
3. **Update** README.md with completion status
4. **Verify** all documentation is current
5. **Archive** planning phase - ready for implementation!

## Project Completion Checklist

- [ ] All sub-plans drafted (SP0-SP13)
- [ ] OVERVIEW.md complete
- [ ] README.md complete
- [ ] All sub-plans follow standard format
- [ ] Dependencies clearly documented
- [ ] Validation steps included
- [ ] Success criteria defined
- [ ] Ready for implementation to begin

🎉 **Planning Phase Complete!**

