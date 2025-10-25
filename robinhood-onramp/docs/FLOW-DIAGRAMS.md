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

    RHConfirm --> Callback[Robinhood Redirects<br/>to /callback]
    Callback --> PledgeService[PledgeService creates<br/>pledge]
    PledgeService --> Complete([Transfer Complete])
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
    participant Robinhood
    participant Callback
    participant Pledge

    User->>Dashboard: Select ETH on Ethereum
    Dashboard->>UrlBuilder: generateUrl({ asset, network })
    UrlBuilder->>RHClient: generateConnectId()
    RHClient->>Robinhood: POST /connect_id
    Robinhood-->>RHClient: connectId
    RHClient-->>UrlBuilder: connectId
    UrlBuilder-->>Dashboard: URL
    Dashboard->>User: Redirect to Robinhood

    User->>Robinhood: Authenticate & Transfer
    Robinhood->>Callback: Redirect with transfer data
    Callback->>Pledge: createFromCallback(dto)
    Pledge-->>Callback: Pledge created
    Callback->>User: Success message
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

## Pledge Creation Flow

```mermaid
flowchart TD
    Callback[Callback with transfer data] --> Validate[Validate CallbackDto]
    Validate --> ResolveToken[TokenService.resolveToken]
    ResolveToken --> CreateEntity[Create pledge entity]
    CreateEntity --> SaveDB[Repository.save]
    SaveDB --> Notify[NotificationService.notify]
    Notify --> Return[Return pledge]
```

## Viewing Diagrams

**GitHub**: Renders mermaid automatically  
**Locally**: Use Mermaid CLI or mermaid.live  
**VSCode**: Install Mermaid extension

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) - Backend migration
