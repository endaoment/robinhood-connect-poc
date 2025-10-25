# Robinhood Connect - Flow Diagrams

Visual representations of the Robinhood Connect **onramp** (transfer FROM Robinhood) flow with backend-aligned architecture.

> **Note**: These diagrams reflect the current backend-aligned architecture with service layer, DTOs, and proper separation of concerns.

---

## Table of Contents

1. [High-Level User Flow](#1-high-level-user-flow)
2. [Service Layer Architecture](#2-service-layer-architecture)
3. [Detailed Sequence Diagram](#3-detailed-sequence-diagram)
4. [Backend Migration Flow](#4-backend-migration-flow)
5. [Data Flow - Pledge Creation](#5-data-flow---pledge-creation)

---

## 1. High-Level User Flow

```mermaid
flowchart TD
    Start([User Visits Dashboard]) --> Browse[User Browses Assets]
    Browse --> Select[Selects Asset<br/>e.g., ETH, SOL, USDC]
    Select --> InitiateBtn[Clicks 'Initiate Transfer']

    InitiateBtn --> Frontend[Frontend Calls API]
    Frontend --> UrlBuilder[UrlBuilderService<br/>generates onramp URL]
    UrlBuilder --> RHClient[RobinhoodClientService<br/>gets connectId]
    RHClient --> BuildURL[Build URL with<br/>pre-selected asset]
    BuildURL --> ReturnURL[Return URL to Frontend]

    ReturnURL --> Redirect[Redirect to Robinhood]
    Redirect --> RHAuth[User Authenticates]
    RHAuth --> RHAmount[Enters Amount]
    RHAmount --> RHConfirm[Confirms Transfer]

    RHConfirm --> Callback[Robinhood Redirects<br/>to /callback]
    Callback --> PledgeService[PledgeService creates<br/>CryptoDonationPledge]
    PledgeService --> ShowSuccess[Display Success]
    ShowSuccess --> Complete([Transfer Complete])

    style Start fill:#e1f5e1
    style Complete fill:#e1f5e1
    style UrlBuilder fill:#cfe2ff
    style PledgeService fill:#cfe2ff
    style RHClient fill:#fff3cd
```

---

## 2. Service Layer Architecture

```mermaid
graph TB
    subgraph "Frontend (app/)"
        Dashboard[Dashboard Page]
        Callback[Callback Page]
        Components[React Components]
    end

    subgraph "API Routes - POC Only"
        HealthRoute["/api/robinhood/health"]
        AssetsRoute["/api/robinhood/assets"]
        GenerateRoute["/api/robinhood/generate-onramp-url"]
    end

    subgraph "Backend Layer (libs/robinhood/) - Production Ready"
        Controller[RobinhoodController<br/>NestJS HTTP endpoints]

        subgraph "Services"
            RHClient[RobinhoodClientService<br/>API communication]
            AssetRegistry[AssetRegistryService<br/>Asset discovery]
            UrlBuilder[UrlBuilderService<br/>URL generation]
            Pledge[PledgeService<br/>Pledge creation]
        end

        subgraph "DTOs"
            GenerateDto[GenerateUrlDto]
            CallbackDto[RobinhoodCallbackDto]
            PledgeDto[CreatePledgeDto]
        end
    end

    subgraph "Backend Services (endaoment-backend)"
        TokenService[TokenService<br/>Token resolution]
        PledgeRepo[(CryptoDonationPledge<br/>Repository)]
        NotificationService[NotificationService<br/>Notifications]
    end

    Dashboard --> GenerateRoute
    GenerateRoute --> UrlBuilder

    UrlBuilder --> RHClient
    UrlBuilder --> AssetRegistry

    Callback --> Pledge
    Pledge --> TokenService
    Pledge --> PledgeRepo
    Pledge --> NotificationService

    style Controller fill:#d4edda
    style RHClient fill:#cfe2ff
    style AssetRegistry fill:#cfe2ff
    style UrlBuilder fill:#cfe2ff
    style Pledge fill:#cfe2ff
```

---

## 3. Detailed Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant Dashboard
    participant APIRoute as API Route
    participant UrlBuilder as UrlBuilderService
    participant RHClient as RobinhoodClientService
    participant AssetRegistry as AssetRegistryService
    participant RobinhoodAPI as Robinhood API
    participant RobinhoodApp as Robinhood App
    participant Callback
    participant PledgeService
    participant TokenService
    participant Database

    User->>Dashboard: Selects asset (e.g., ETH)
    Dashboard->>User: Shows wallet address

    User->>Dashboard: Clicks "Initiate Transfer"
    Dashboard->>APIRoute: POST /generate-onramp-url<br/>{asset, network, amount, ...}

    APIRoute->>UrlBuilder: generateUrl(dto)
    UrlBuilder->>AssetRegistry: getAsset(asset)
    AssetRegistry-->>UrlBuilder: Asset metadata

    UrlBuilder->>RHClient: generateConnectId({walletAddress, userIdentifier})
    RHClient->>RobinhoodAPI: POST /catpay/v1/connect_id/
    RobinhoodAPI-->>RHClient: {connect_id: "abc-123"}
    RHClient-->>UrlBuilder: connectId

    UrlBuilder->>UrlBuilder: buildRedirectUrl(callback params)
    UrlBuilder->>UrlBuilder: buildOnrampUrl(all params)
    UrlBuilder-->>APIRoute: {url, connectId}
    APIRoute-->>Dashboard: Return URL

    Dashboard->>RobinhoodApp: Redirect to URL
    RobinhoodApp->>User: Show asset pre-selected
    User->>RobinhoodApp: Enter amount & confirm

    RobinhoodApp->>Callback: Redirect with params<br/>{connectId, asset, network, amount, orderId}

    Callback->>PledgeService: createFromCallback(dto)
    PledgeService->>TokenService: resolveToken(asset, network)
    TokenService-->>PledgeService: Resolved token

    PledgeService->>Database: save(CryptoDonationPledge)
    Database-->>PledgeService: Saved pledge

    PledgeService-->>Callback: Pledge created
    Callback->>User: Show success message

    Note over RHClient,RobinhoodAPI: connectId must come from<br/>Robinhood API (not random UUID)
    Note over PledgeService,Database: Uses existing<br/>CryptoDonationPledge entity
```

---

## 4. Backend Migration Flow

```mermaid
flowchart LR
    subgraph "POC (robinhood-connect-poc)"
        POCApp[app/<br/>Next.js Frontend]
        POCApi[app/api/<br/>Next.js Routes]
        POCLibs[libs/robinhood/<br/>Services, DTOs, Tests]
    end

    subgraph "Backend (endaoment-backend)"
        BackendLibs[libs/api/robinhood/<br/>Same structure]
        BackendModule[RobinhoodModule<br/>NestJS]
        BackendController[RobinhoodController<br/>NestJS]
        BackendServices[Existing Services<br/>Token, Notification, etc.]
    end

    POCLibs -->|Copy entire folder| BackendLibs
    BackendLibs --> BackendModule
    BackendModule --> BackendController
    BackendModule --> BackendServices

    POCApp -.->|Delete| X1[Not migrated]
    POCApi -.->|Delete| X2[Not migrated]

    Note1[Migration: ~2 hours<br/>1. Copy libs/robinhood/<br/>2. Uncomment decorators<br/>3. Wire services]

    style POCLibs fill:#d4edda
    style BackendLibs fill:#d4edda
    style POCApp fill:#f8d7da
    style POCApi fill:#f8d7da
    style Note1 fill:#fff3cd
```

---

## 5. Data Flow - Pledge Creation

```mermaid
flowchart TD
    Callback[Robinhood Callback] --> Parse[Parse Callback Params]

    Parse --> Data{Callback Data}
    Data --> ConnectId[connectId:<br/>'abc-123']
    Data --> Asset[asset:<br/>'ETH']
    Data --> Network[network:<br/>'ETHEREUM']
    Data --> Amount[amount:<br/>'1.5']
    Data --> OrderId[orderId:<br/>'order-789']
    Data --> UserId[userId:<br/>'user-456']

    ConnectId --> Pledge[PledgeService]
    Asset --> Pledge
    Network --> Pledge
    Amount --> Pledge
    OrderId --> Pledge
    UserId --> Pledge

    Pledge --> Resolve[TokenService<br/>resolveToken]
    Resolve --> Token[Resolved Token<br/>with decimals]

    Pledge --> Convert[Convert Amount<br/>to smallest unit]
    Amount --> Convert
    Token --> Convert
    Convert --> Wei[1500000000000000000<br/>wei]

    Pledge --> Map[Map to Entity]
    Map --> Entity{CryptoDonationPledge}

    ConnectId --> Hash[otcTransactionHash:<br/>'robinhood:abc-123']
    UserId --> PledgerId[pledgerUserId:<br/>'user-456']
    Token --> InputToken[inputToken:<br/>Resolved Token]
    Wei --> InputAmount[inputAmount:<br/>'1500000000000000000']
    OrderId --> TxId[centralizedExchangeTransactionId:<br/>'order-789']

    Hash --> Entity
    PledgerId --> Entity
    InputToken --> Entity
    InputAmount --> Entity
    TxId --> Entity

    Entity --> Save[Repository.save]
    Save --> Database[(Database)]

    Database --> Notify[NotificationService]
    Notify --> Complete([Pledge Created])

    style Pledge fill:#cfe2ff
    style Entity fill:#d4edda
    style Complete fill:#e1f5e1
```

---

## Key Architecture Highlights

### ✅ Service Layer

- **RobinhoodClientService** - Robinhood API communication
- **AssetRegistryService** - Asset discovery and metadata
- **UrlBuilderService** - URL generation with validation
- **PledgeService** - Pledge creation and mapping

### ✅ DTO Validation

- **GenerateUrlDto** - Validates URL generation parameters
- **RobinhoodCallbackDto** - Validates callback data
- **CreatePledgeDto** - Validates pledge creation

### ✅ Backend Integration

- Uses existing **CryptoDonationPledge** entity
- Integrates with **TokenService** for token resolution
- Integrates with **NotificationService** for alerts
- Complete field mapping documented

### ✅ Testing

- 183 tests with 98%+ coverage
- Jest + nock for HTTP mocking
- AAA pattern (Arrange-Act-Assert)
- All services thoroughly tested

---

## Migration Notes

### POC to Backend

**What gets migrated**:

- ✅ `libs/robinhood/` → Complete NestJS module
- ❌ `app/` → Deleted (Next.js specific)

**Migration time**: ~2 hours

**Steps**:

1. Copy `libs/robinhood/` to backend
2. Uncomment module/controller decorators
3. Wire real services (replace mocks)
4. Run 183 tests
5. Deploy

See [MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md) for complete instructions.

---

## Rendering These Diagrams

### In GitHub

GitHub natively supports Mermaid - diagrams render automatically.

### Locally

```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate PNG
mmdc -i FLOW-DIAGRAMS.md -o flow-diagrams.png

# Generate SVG
mmdc -i FLOW-DIAGRAMS.md -o flow-diagrams.svg
```

### Online

- [Mermaid Live Editor](https://mermaid.live)
- Copy/paste diagram code
- Export as PNG/SVG/PDF

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture documentation
- [MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md) - Backend integration guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing documentation
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development setup

---

**Last Updated**: October 25, 2025  
**Version**: v1.0.0 (Backend-Aligned)  
**Status**: Current and accurate
