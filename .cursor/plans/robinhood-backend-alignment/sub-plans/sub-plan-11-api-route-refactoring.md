# Sub-Plan 11: API Route Refactoring

**Status**: Ready for Implementation
**Priority**: Critical
**Dependencies**: Sub-Plan 9.6 (Frontend/Backend Separation)

> **Note**: This sub-plan uses the final `libs/` structure from SP9.5-9.6. These Next.js routes are POC-only and won't be migrated to backend (the NestJS controller in `libs/robinhood/` handles routes in production).
>
> **CRITICAL**: The app is currently not compiling due to TypeScript errors in the API routes. This sub-plan MUST be completed before SP12 (Backend Integration Demo) can function.

## Context Required

**Files to Refactor**:

- `app/api/robinhood/health/route.ts`
- `app/api/robinhood/assets/route.ts`
- `app/api/robinhood/generate-onramp-url/route.ts`

## Objectives

1. Refactor health endpoint to use AssetRegistryService
2. Refactor assets endpoint to use AssetRegistryService
3. Refactor URL generation to use services
4. Add DTO validation
5. Improve error handling
6. Add proper logging

## Implementation

### Health Route Example

```typescript
import { NextResponse } from "next/server";
import { getAssetRegistry } from "@/libs/robinhood";

export async function GET() {
  try {
    const registry = getAssetRegistry();
    const health = registry.getHealthStatus();

    return NextResponse.json({
      status: "healthy",
      registry: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", error: error.message },
      { status: 500 }
    );
  }
}
```

### URL Generation Route Example

```typescript
import { NextResponse } from "next/server";
import { 
  validateDtoOrThrow,
  GenerateUrlDto,
  urlBuilderService
} from "@/libs/robinhood";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateDtoOrThrow(GenerateUrlDto, body);

    const url = urlBuilderService.generateOnrampUrl(dto);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
```

## Deliverables

- [ ] Health route refactored
- [ ] Assets route refactored
- [ ] URL generation route refactored
- [ ] DTO validation added
- [ ] Error responses standardized
- [ ] All routes tested

## Next Steps

**Proceed to** [Sub-Plan 12: Backend Integration Demo](./sub-plan-12-backend-integration-demo.md)


