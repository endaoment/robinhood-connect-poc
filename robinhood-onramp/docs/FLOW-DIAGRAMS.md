# Robinhood Connect - Flow Diagrams

This document contains visual representations of the Robinhood Connect onramp transfer flow.

---

## 1. High-Level User Flow

```mermaid
flowchart TD
    Start([User Visits Dashboard]) --> Click[User Clicks 'Start Transfer']
    Click --> Modal[Modal Opens<br/>Shows 19 Supported Networks]
    Modal --> OpenRH[User Clicks 'Open Robinhood'<br/>No Form Input Required!]
    OpenRH --> Generate[Generate UUID referenceId<br/>Client-Side]
    Generate --> BuildURL[Build Robinhood Connect URL<br/>with All 19 Networks]
    BuildURL --> Store[Store referenceId in localStorage]
    Store --> Redirect[Redirect to Robinhood App/Web]

    Redirect --> RHAuth[User Authenticates in Robinhood]
    RHAuth --> ViewBalance[User Views Real Balances]
    ViewBalance --> SelectCrypto[User Selects Crypto & Amount]
    SelectCrypto --> Confirm[User Confirms Transfer]

    Confirm --> Callback[Robinhood Redirects to /callback<br/>with assetCode, assetAmount, network]
    Callback --> GetAddress[Retrieve Pre-Configured Address<br/>Instant - No API Call!]
    GetAddress --> Display[Display Deposit Address<br/>with Copy Button]
    Display --> Track[Track Order Status<br/>Auto-Refresh]
    Track --> Complete([Transfer Complete])

    style Start fill:#e1f5e1
    style Complete fill:#e1f5e1
    style Modal fill:#fff3cd
    style GetAddress fill:#d4edda
    style OpenRH fill:#cfe2ff
```

---

## 2. Detailed Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant Dashboard as Next.js Dashboard
    participant Modal as Offramp Modal
    participant LocalStorage
    participant RobinhoodApp as Robinhood App/Web
    participant Callback as Callback Page
    participant NetworkConfig as network-addresses.ts
    participant StatusAPI as Order Status API
    participant RobinhoodAPI as Robinhood Backend

    User->>Dashboard: Visits /dashboard
    Dashboard->>User: Shows "Start Transfer" button

    User->>Dashboard: Clicks "Start Transfer"
    Dashboard->>Modal: Opens modal
    Modal->>User: Displays 19 supported networks (informational)

    User->>Modal: Clicks "Open Robinhood"
    Modal->>Modal: Generate UUID v4 (referenceId)
    Modal->>Modal: Build URL with all 19 networks
    Modal->>LocalStorage: Store referenceId
    Modal->>RobinhoodApp: Redirect to universal link

    RobinhoodApp->>User: Show authentication
    User->>RobinhoodApp: Authenticate
    RobinhoodApp->>User: Display real balances
    User->>RobinhoodApp: Select crypto & amount
    User->>RobinhoodApp: Confirm transfer

    RobinhoodApp->>Callback: Redirect with query params<br/>(assetCode, assetAmount, network, referenceId)
    Callback->>LocalStorage: Verify referenceId matches
    Callback->>NetworkConfig: Lookup address for network
    NetworkConfig-->>Callback: Return pre-configured address (instant!)

    Callback->>User: Display deposit address + copy button

    loop Auto-refresh every 5 seconds
        Callback->>StatusAPI: GET /api/robinhood/order-status?referenceId=xxx
        StatusAPI->>RobinhoodAPI: Check order status
        RobinhoodAPI-->>StatusAPI: Return status (pending/complete)
        StatusAPI-->>Callback: Return status
        Callback->>User: Update status UI
    end

    RobinhoodAPI-->>StatusAPI: Status: completed
    StatusAPI-->>Callback: Transfer complete
    Callback->>User: Show success message

    Note over Modal,NetworkConfig: Zero-Click Flow:<br/>No form fields, no API call for address!
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

## Key Innovations Highlighted in Diagrams

### 🎯 Zero-Click User Experience

- No form fields to fill out
- User sees real balances in Robinhood before deciding
- Single "Open Robinhood" button

### ⚡ Instant Address Retrieval

- Pre-configured addresses in `network-addresses.ts`
- 0ms response time (vs 200-500ms API call)
- No dependency on Robinhood API for addresses

### 🔄 Stateless Architecture

- No session storage on backend
- `referenceId` stored in client localStorage
- Can scale horizontally without session management

### 🌐 19 Network Support

- 95% coverage of Robinhood networks
- EVM, Bitcoin-like, Layer 1s, and memo-required networks
- All addresses pre-configured and tested

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
