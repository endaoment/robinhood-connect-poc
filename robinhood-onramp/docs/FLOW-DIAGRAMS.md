# Flow Diagrams

> Visual flows for the Robinhood Connect integration.

## User Flow

```mermaid
flowchart TD
    Start([User Visits Dashboard]) --> Browse[Browse Assets]
    Browse --> Select[Select Asset]
    Select --> InitiateBtn[Click 'Initiate Transfer']

    InitiateBtn --> Frontend[Frontend Calls API]
    Frontend --> UrlBuilder[UrlBuilderService<br/>generates URL]
    UrlBuilder --> RHClient[RobinhoodClientService<br/>gets connectId]
    RHClient --> BuildURL[Build URL with<br/>pre-selected asset]
    BuildURL --> ReturnURL[Return URL]

    ReturnURL --> Redirect[Redirect to Robinhood]
    Redirect --> RHAuth[User Authenticates]
    RHAuth --> RHAmount[Enters Amount]
    RHAmount --> RHConfirm[Confirms Transfer]

    RHConfirm --> Callback[Robinhood Redirects<br/>to /callback with connectId]
    Callback --> Poll[⭐ Poll Order Details API]
    Poll --> GetDetails{Order Status?}
    GetDetails -->|In Progress| Wait[Wait 2 seconds]
    Wait --> Poll
    GetDetails -->|Succeeded| CreatePledge[⭐ Auto-create pledge<br/>with blockchain tx hash]
    CreatePledge --> Complete([Transfer Complete])
    GetDetails -->|Failed| Error([Show Error])
```

## Service Architecture

```mermaid
graph TB
    subgraph "Frontend (app/)"
        Dashboard[Dashboard Page]
        Callback[Callback Page]
    end

    subgraph "Backend (libs/robinhood/)"
        Controller[RobinhoodController]

        subgraph "Services"
            RHClient[RobinhoodClientService]
            AssetRegistry[AssetRegistryService]
            UrlBuilder[UrlBuilderService]
            Pledge[PledgeService]
        end

        subgraph "DTOs"
            GenerateDto[GenerateUrlDto]
            CallbackDto[RobinhoodCallbackDto]
        end
    end

    subgraph "Backend Services"
        TokenService[TokenService]
        PledgeRepo[(Repository)]
        NotificationService[NotificationService]
    end

    Dashboard --> UrlBuilder
    UrlBuilder --> RHClient
    UrlBuilder --> AssetRegistry

    Callback --> Pledge
    Pledge --> TokenService
    Pledge --> PledgeRepo
    Pledge --> NotificationService
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant UrlBuilder
    participant RHClient
    participant RobinhoodAPI as Robinhood API
    participant RobinhoodUI as Robinhood UI
    participant Callback
    participant OrderAPI as Order Details API
    participant Pledge

    User->>Dashboard: Select ETH on Ethereum
    Dashboard->>UrlBuilder: generateUrl({ asset, network })
    UrlBuilder->>RHClient: generateConnectId()
    RHClient->>RobinhoodAPI: POST /connect_id
    RobinhoodAPI-->>RHClient: connectId
    RHClient-->>UrlBuilder: connectId
    UrlBuilder-->>Dashboard: URL
    Dashboard->>User: Redirect to Robinhood

    User->>RobinhoodUI: Authenticate & Transfer
    RobinhoodUI->>Callback: Redirect with connectId
    
    loop Poll every 2s (max 10 attempts)
        Callback->>OrderAPI: ⭐ GET /order/{connectId}
        OrderAPI-->>Callback: Order details + status
        alt Status: SUCCEEDED
            Callback->>Pledge: ⭐ createFromOrderDetails(data)
            Note over Pledge: Uses blockchain tx hash<br/>crypto amount, fiat amount
            Pledge-->>Callback: Pledge created
            Callback->>User: ✅ Success with amounts
        else Status: IN_PROGRESS
            Callback->>Callback: Wait 2 seconds, retry
        else Status: FAILED
            Callback->>User: ❌ Transfer failed
        end
    end
```

## Migration Flow

```mermaid
flowchart LR
    POC[robinhood-onramp/libs/robinhood/] --> Copy[Copy folder]
    Copy --> Backend[endaoment-backend/libs/api/robinhood/]
    Backend --> Uncomment[Uncomment decorators]
    Uncomment --> Wire[Wire dependencies]
    Wire --> Done[5 endpoints registered]
```

## Pledge Creation Flow (New - Order Details API)

```mermaid
flowchart TD
    Callback[Callback receives connectId] --> Poll[Poll Order Details API]
    Poll --> CheckStatus{Order Status?}
    CheckStatus -->|IN_PROGRESS| Wait[Wait 2 seconds]
    Wait --> Poll
    CheckStatus -->|SUCCEEDED| Extract[Extract order data]
    CheckStatus -->|FAILED| ErrorFlow[Show error to user]
    
    Extract --> OrderData[⭐ Get definitive data:<br/>- Blockchain tx hash<br/>- Crypto amount<br/>- Fiat amount<br/>- Asset/Network<br/>- Destination address]
    OrderData --> ResolveToken[TokenService.resolveToken<br/>using assetCode + networkCode]
    ResolveToken --> ConvertAmount[Convert to smallest unit]
    ConvertAmount --> CreatePledge[Create pledge with:<br/>- Blockchain tx hash<br/>- Fiat amount tracking<br/>- Destination address]
    CreatePledge --> SaveDB[Repository.save]
    SaveDB --> Notify[NotificationService.notify]
    Notify --> ShowSuccess[Show success with<br/>actual amounts]
```

## Legacy Pledge Creation Flow (Deprecated)

```mermaid
flowchart TD
    Callback[Callback with URL params] --> Validate[Validate CallbackDto]
    Validate --> Issue[⚠️ Issue: Amount often 0<br/>No blockchain tx hash]
    Issue --> ResolveToken[TokenService.resolveToken]
    ResolveToken --> CreateEntity[Create pledge entity]
    CreateEntity --> SaveDB[Repository.save]
    SaveDB --> Notify[NotificationService.notify]
    Notify --> Return[Return pledge]
    
    style Issue fill:#f9f,stroke:#333,stroke-width:2px
```

## Viewing Diagrams

**GitHub**: Renders mermaid automatically  
**Locally**: Use Mermaid CLI or mermaid.live  
**VSCode**: Install Mermaid extension

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) - Backend migration
