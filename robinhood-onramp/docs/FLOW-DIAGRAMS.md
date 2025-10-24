# Robinhood Connect - Flow Diagrams

This document contains visual representations of the Robinhood Connect asset pre-selection onramp flow.

---

## 1. High-Level User Flow (Asset Pre-Selection)

```mermaid
flowchart TD
    Start([User Visits Dashboard]) --> Search[User Searches/Browses Assets]
    Search --> Select[User Selects Cryptocurrency<br/>e.g., ETH, SOL, USDC]
    Select --> ShowAddress[System Shows Wallet Address<br/>for Asset's Network]
    ShowAddress --> InitiateBtn[User Clicks 'Initiate Transfer']
    
    InitiateBtn --> CallAPI[Frontend Calls<br/>/api/robinhood/generate-onramp-url]
    CallAPI --> GetConnectId[Backend Calls Robinhood<br/>POST /catpay/v1/connect_id/]
    GetConnectId --> BuildURL[Backend Builds URL<br/>with Pre-Selected Asset]
    BuildURL --> ReturnURL[Backend Returns URL<br/>to Frontend]
    
    ReturnURL --> Redirect[Redirect to Robinhood<br/>Asset Pre-Selected]
    Redirect --> RHAuth[User Authenticates in Robinhood]
    RHAuth --> RHAmount[User Enters Amount<br/>for Pre-Selected Asset]
    RHAmount --> RHConfirm[User Confirms Transfer]

    RHConfirm --> Callback[Robinhood Redirects to /callback<br/>with asset, network, amount, orderId]
    Callback --> ShowSuccess[Display Success Message<br/>with Transfer Details]
    ShowSuccess --> Dashboard[User Returns to Dashboard]
    Dashboard --> Toast[Success Toast Displays<br/>with Full Transfer Info]
    Toast --> Complete([Transfer Complete])

    style Start fill:#e1f5e1
    style Complete fill:#e1f5e1
    style Select fill:#cfe2ff
    style GetConnectId fill:#fff3cd
    style Redirect fill:#d4edda
```

---

## 2. Detailed Sequence Diagram (Asset Pre-Selection)

```mermaid
sequenceDiagram
    actor User
    participant Dashboard as Next.js Dashboard
    participant AssetSearch as Asset Search/Selector
    participant APIRoute as /api/robinhood/generate-onramp-url
    participant RobinhoodAPI as Robinhood Connect ID API
    participant RobinhoodApp as Robinhood App/Web
    participant Callback as Callback Page
    participant LocalStorage

    User->>Dashboard: Visits /dashboard
    Dashboard->>User: Shows asset search and list

    User->>AssetSearch: Searches for asset (e.g., "ETH")
    AssetSearch->>User: Shows filtered results

    User->>AssetSearch: Clicks on asset to select
    AssetSearch->>Dashboard: Update selected asset
    Dashboard->>User: Shows wallet address for asset's network

    User->>Dashboard: Clicks "Initiate Transfer"
    Dashboard->>APIRoute: POST {selectedAsset, selectedNetwork}

    APIRoute->>APIRoute: Validate asset & network
    APIRoute->>RobinhoodAPI: POST /catpay/v1/connect_id/ {}
    RobinhoodAPI-->>APIRoute: Return {connectId}
    
    APIRoute->>APIRoute: Get wallet address for network
    APIRoute->>APIRoute: Build URL with buildDaffyStyleOnrampUrl()
    APIRoute-->>Dashboard: Return {url, connectId}

    Dashboard->>RobinhoodApp: Redirect to Robinhood URL

    RobinhoodApp->>User: Show authentication
    User->>RobinhoodApp: Authenticate
    RobinhoodApp->>User: Show pre-selected asset
    User->>RobinhoodApp: Enter amount
    User->>RobinhoodApp: Confirm transfer

    RobinhoodApp->>Callback: Redirect with params<br/>(asset, network, amount, orderId, connectId)
    
    Callback->>Callback: Parse URL parameters
    Callback->>LocalStorage: Store order details
    Callback->>User: Display success message

    User->>Dashboard: Navigate back to dashboard
    Dashboard->>LocalStorage: Check for order success
    Dashboard->>User: Show success toast with transfer details

    Note over APIRoute,RobinhoodAPI: Critical: connectId must<br/>come from Robinhood API
```

---

## 3. System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Side (Browser)"
        Dashboard[Dashboard Component]
        Modal[Offramp Modal Component]
        Callback[Callback Page]
        Status[Order Status Component]
        LocalStorage[(localStorage<br/>referenceId)]
    end

    subgraph "Next.js Backend"
        GenerateURL[/api/robinhood/generate-offramp-url<br/>Optional - can use client-side]
        StatusEndpoint[/api/robinhood/order-status]
        NetworkAddresses[lib/network-addresses.ts<br/>Pre-configured addresses<br/>19 networks]
        URLBuilder[lib/robinhood-url-builder.ts]
    end

    subgraph "Robinhood Services"
        RHConnect[Robinhood Connect<br/>Universal Link]
        RHApp[Robinhood App/Web]
        RHAPI[Robinhood API<br/>Order Status]
    end

    Dashboard -->|1. User clicks button| Modal
    Modal -->|2. Generate UUID| LocalStorage
    Modal -->|3. Build URL| URLBuilder
    URLBuilder -->|4. Redirect| RHConnect
    RHConnect -->|5. Open app| RHApp
    RHApp -->|6. Callback redirect| Callback
    Callback -->|7. Verify referenceId| LocalStorage
    Callback -->|8. Get address| NetworkAddresses
    Callback -->|9. Poll status| StatusEndpoint
    StatusEndpoint -->|10. Check order| RHAPI
    Status -->|Auto-refresh| StatusEndpoint

    style NetworkAddresses fill:#d4edda
    style Modal fill:#fff3cd
    style RHAPI fill:#f8d7da
    style Callback fill:#cfe2ff
```

---

## 4. Network Selection & Address Retrieval

```mermaid
flowchart LR
    subgraph "19 Supported Networks"
        EVM[EVM Networks<br/>8 networks<br/>Ethereum, Polygon, etc.]
        Bitcoin[Bitcoin-like<br/>4 networks<br/>BTC, BCH, LTC, DOGE]
        L1[Other L1<br/>4 networks<br/>Solana, Cardano, etc.]
        Memo[Memo Required<br/>3 networks<br/>Stellar, XRP, Hedera]
    end

    User[User in Robinhood App] --> Choose{Chooses Network<br/>Based on Balance}

    Choose --> EVM
    Choose --> Bitcoin
    Choose --> L1
    Choose --> Memo

    EVM --> Return[Returns to Callback]
    Bitcoin --> Return
    L1 --> Return
    Memo --> Return

    Return --> Lookup[Lookup in<br/>network-addresses.ts]
    Lookup --> Instant[Instant Address<br/>0ms response time!]

    Instant --> Display[Display to User]

    style Instant fill:#d4edda
    style Lookup fill:#d4edda
    style User fill:#cfe2ff
```

---

## 5. State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle: Dashboard Loaded
    Idle --> ModalOpen: Click "Start Transfer"
    ModalOpen --> URLGenerated: Click "Open Robinhood"

    note right of URLGenerated
        Generate UUID
        Build URL with 19 networks
        Store in localStorage
    end note

    URLGenerated --> RedirectingToRH: Open Universal Link
    RedirectingToRH --> InRobinhood: User Authenticates

    note right of InRobinhood
        User sees real balances
        Selects crypto & amount
        Confirms transfer
    end note

    InRobinhood --> Callback: Redirect with params

    note right of Callback
        assetCode (e.g., "USDC")
        assetAmount (e.g., "100")
        network (e.g., "POLYGON")
        referenceId (UUID)
    end note

    Callback --> AddressRetrieved: Lookup pre-configured address

    note right of AddressRetrieved
        Instant lookup from
        network-addresses.ts
        No API call needed!
    end note

    AddressRetrieved --> TrackingStatus: Display address to user

    TrackingStatus --> TrackingStatus: Poll every 5s
    TrackingStatus --> Complete: Status = "completed"
    Complete --> [*]: Show success

    TrackingStatus --> Failed: Status = "failed"
    Failed --> [*]: Show error
```

---

## 6. Data Flow - Callback Parameters

```mermaid
flowchart TD
    RH[Robinhood Callback] -->|Query Parameters| Parse[Parse URL Params]

    Parse --> Param1[assetCode<br/>e.g., 'USDC']
    Parse --> Param2[assetAmount<br/>e.g., '100']
    Parse --> Param3[network<br/>e.g., 'POLYGON']
    Parse --> Param4[referenceId<br/>e.g., 'uuid-v4']

    Param4 --> Verify{Verify against<br/>localStorage}
    Verify -->|Match| Safe[Continue Flow]
    Verify -->|No Match| Error[Show Error]

    Safe --> Param3
    Param3 --> Switch{Network Type?}

    Switch -->|EVM| EVMAddr[EVM Address<br/>0x...]
    Switch -->|Bitcoin| BTCAddr[Bitcoin Address<br/>bc1...]
    Switch -->|Solana| SOLAddr[Solana Address<br/>base58...]
    Switch -->|Memo Required| MemoAddr[Address + Memo<br/>memo: xxxxx]

    EVMAddr --> Display[Display to User]
    BTCAddr --> Display
    SOLAddr --> Display
    MemoAddr --> Display

    Display --> Copy[Copy Button Available]
    Display --> Status[Begin Status Tracking]

    style Verify fill:#fff3cd
    style Display fill:#d4edda
    style Error fill:#f8d7da
```

---

## 7. API Endpoint Flow

```mermaid
flowchart TB
    subgraph "Client Requests"
        GenRequest[POST /api/robinhood/generate-offramp-url<br/>Optional: Can generate client-side]
        StatusRequest[GET /api/robinhood/order-status<br/>Required: Check transfer status]
    end

    subgraph "Backend Processing"
        GenEndpoint[generate-offramp-url handler]
        StatusEndpoint[order-status handler]
    end

    subgraph "External Services"
        RHAPI[Robinhood API]
    end

    subgraph "Local Config"
        NetworkConfig[network-addresses.ts<br/>Pre-configured addresses]
        URLBuilder[robinhood-url-builder.ts<br/>URL generation logic]
    end

    GenRequest -.->|Optional| GenEndpoint
    GenEndpoint --> URLBuilder
    URLBuilder --> GenResponse[Return Robinhood URL]

    StatusRequest --> StatusEndpoint
    StatusEndpoint -->|API Call| RHAPI
    RHAPI --> StatusResponse[Return order status]

    Note1[Note: Address redemption API<br/>is NOT used anymore!<br/>We use pre-configured addresses]

    style NetworkConfig fill:#d4edda
    style Note1 fill:#fff3cd
    style GenRequest stroke-dasharray: 5 5
```

---

## 8. Error Handling Flow

```mermaid
flowchart TD
    Start[User Action] --> Action{Which Stage?}

    Action -->|Modal| ModalError[Modal Opens]
    Action -->|URL Generation| URLError[URL Building]
    Action -->|Robinhood| RHError[In Robinhood App]
    Action -->|Callback| CallbackError[Callback Processing]
    Action -->|Status| StatusError[Status Polling]

    ModalError --> MECheck{Error?}
    MECheck -->|No networks| ShowErr1[Show: No networks supported]
    MECheck -->|Success| Continue1[Open Robinhood]

    URLError --> UECheck{Error?}
    UECheck -->|Invalid UUID| ShowErr2[Show: Invalid reference ID]
    UECheck -->|Success| Continue2[Redirect]

    RHError --> RECheck{Error?}
    RECheck -->|User cancels| ShowErr3[Return to dashboard<br/>No callback]
    RECheck -->|Network error| ShowErr4[Show connection error]
    RECheck -->|Success| Continue3[Callback]

    CallbackError --> CECheck{Error?}
    CECheck -->|No referenceId| ShowErr5[Show: Invalid session]
    CECheck -->|Unknown network| ShowErr6[Show: Network not supported]
    CECheck -->|Success| Continue4[Display address]

    StatusError --> SECheck{Error?}
    SECheck -->|API error| ShowErr7[Show: Status unavailable<br/>Continue auto-retry]
    SECheck -->|Timeout| ShowErr8[Show: Check manually]
    SECheck -->|Success| Continue5[Update UI]

    ShowErr1 --> End1[User can retry]
    ShowErr2 --> End1
    ShowErr3 --> End2[User back to dashboard]
    ShowErr4 --> End1
    ShowErr5 --> End2
    ShowErr6 --> End2
    ShowErr7 --> End3[Continue with degraded UX]
    ShowErr8 --> End3

    Continue1 --> Success[Flow Continues]
    Continue2 --> Success
    Continue3 --> Success
    Continue4 --> Success
    Continue5 --> Success

    style ShowErr1 fill:#f8d7da
    style ShowErr2 fill:#f8d7da
    style ShowErr3 fill:#f8d7da
    style ShowErr4 fill:#f8d7da
    style ShowErr5 fill:#f8d7da
    style ShowErr6 fill:#f8d7da
    style ShowErr7 fill:#fff3cd
    style ShowErr8 fill:#fff3cd
    style Success fill:#d4edda
```

---

## Key Features Highlighted in Diagrams

### 🎯 Asset Pre-Selection

- User selects cryptocurrency before initiating transfer
- Asset is pre-selected in Robinhood (no confusion)
- Clear wallet address shown before transfer begins
- Proven to work reliably with external wallet transfers

### 🔑 Connect ID from Robinhood API

- Backend calls `/catpay/v1/connect_id/` to get valid connectId
- No random UUIDs in production
- Required for Robinhood Connect to work properly

### 📋 Pre-Configured Wallet Addresses

- Centralized address management in configuration files
- Addresses organized by network
- Instant address lookup (no API call needed)

### 🔄 Simple State Management

- Order details stored in localStorage
- Success toast displayed on dashboard return
- Minimal backend state required

### 🌐 19 Network Support

- 95% coverage of Robinhood networks
- EVM, Bitcoin-like, Layer 1s, and memo-required networks
- ~120 supported assets across all networks

---

## Usage

These diagrams can be:

- Embedded in documentation
- Used in presentations
- Rendered in GitHub (supports Mermaid natively)
- Exported to PNG/SVG using Mermaid CLI or online editors

To render locally:

```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate images
mmdc -i FLOW-DIAGRAMS.md -o output.png
```

---

**Created**: October 17, 2025  
**Related**: README.md, DEVELOPER_GUIDE.md, USER_GUIDE.md
