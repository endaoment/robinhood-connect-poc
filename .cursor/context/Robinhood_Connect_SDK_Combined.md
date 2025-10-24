# Robinhood Connect SDK - Complete Documentation

**HIGHLY CONFIDENTIAL - DO NOT SHARE**

---

## Table of Contents

1. [Onramp SDK (v4 - March 24, 2023)](#onramp-sdk)
2. [Offramp API Documentation (v1.2 - Jan 7, 2025)](#offramp-api-documentation)
3. [App Installation Detection (v5.2 - Feb 26, 2025)](#app-installation-detection)

---

# Onramp SDK

**Version:** v4  
**Updated:** March 24, 2023

## Overview

Robinhood Connect is an SDK/UI widget that lets users use their existing Robinhood accounts to transfer/fund their dApps or self-custody wallets, utilizing existing Robinhood infrastructure.

## Integration Steps

### 1. Reach out to the Robinhood Connect team

- To integrate with Robinhood Connect, reach out to Will (<william.mccormick@robinhood.com>). Upon signing an NDA with us we can begin the integration.

### 2. Get Unique ApplicationId and appKey

- The Robinhood Connect team will provide a unique applicationId and appKeys to whitelist your dApp. You could also provide assets for your dApp's logo and redirect urls that need to be whitelisted.

### 3. Add a Robinhood Connect Button to the UI

- Button assets will be shared by the team, this button can be rendered as you see fit on your app or website.

### 4. Add logic to generate connectId

- To prevent malicious use, every link to Robinhood Connect needs a unique connectId which can be generated on the dApp's authenticated backend, see ConnectId under API Docs below.

### 5. Link to Robinhood Connect

- Configure the onClick action for the button added in the previous step to open to the URL for Robinhood Connect in a new tab on the native browser on mobile or desktop. If the user has the Robinhood mobile app installed, the link will open on the app and the user won't have to log in again. More details about the URL can be found in the section below.

**Note:** Do not add any redirects on this link or else the Universal Link might not open on the Robinhood mobile app.

### 6. Undergo Pre-Launch Checklist with the Robinhood Connect team

These include:

- Validation of the Robinhood Connect integration being appropriately implemented.
- Add some Robinhood users to whitelist some for testing.
- We would also try out the integration before rollout to make sure everything looks good, so do let us know how we can test out the alpha build
- Going over the rollout strategy for this integration.
- Satisfying all legal requirements like NDA, Due Diligence etc.

### 7. Launch

## API Docs

### 1. ConnectId

To prevent phishing of users when being linked to Robinhood Connect UI a unique and transient connectId needs to be appended to each link.

#### Steps to generate connectId

1. Ensure an authentication mechanism between the wallet owner and the dApp's backend exists.
2. Generate the connectId on your backend by calling the below URL (sample request available below)
3. Append the connectId received when linking to Robinhood Connect's UI.

**Note:**

- The connectId needs to be uniquely generated for each time the user is linked to Robinhood Connect
- We strongly recommend not generating the connectId on the client side, to not accidentally expose the apiKey
- The connectId needs to be "fresh", as it's a short lived token.
- Please reach out to the Robinhood Connect team if you have any questions and concerns, we're happy to brainstorm with you!

**Base URL - POST:** `https://api.robinhood.com/catpay/v1/connect_id/`

#### Request Headers

| Name           | Type | Required/Optional | Comments                                  |
| -------------- | ---- | ----------------- | ----------------------------------------- |
| x-api-key      | str  | Required          | The api Key provided by the RH team       |
| application-id | str  | Required          | The applicationId provided by the RH team |

#### Request Body

| Name              | Type | Required/Optional | Comments                                     |
| ----------------- | ---- | ----------------- | -------------------------------------------- |
| withdrawalAddress | str  | Required          | The user's withdrawal address                |
| userIdentifier    | str  | Required          | A unique identifier that identifies the user |

#### Sample request

```bash
curl --location --request POST \
'https://api.robinhood.com/catpay/v1/connect_id/' \
--header 'application-id: <APP_ID_PROVIDED_BY_RH>' \
--header 'x-api-key: <API_KEY_PROVIDED_BY_RH>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "withdrawal_address": "0x1377454e08497ed3E5112349099E931600EB7Bb3"
}'
```

#### Response

| Name      | Type | Comments                                                    |
| --------- | ---- | ----------------------------------------------------------- |
| connectId | UUID | A unique request Id that needs to be passed for redirection |

#### Sample Response

```json
{ "connectId": "19f0fce8-37da-4206-a43f-5925e9c4e1dc" }
```

### 2. Robinhood Connect URL

The user needs to open this URL in a new tab (step 4 above). This will open the Robinhood Connect UI in the Robinhood app if it's already installed, or the Robinhood Connect Web UI if the user does not have the Robinhood app installed.

**Base URL:** `https://applink.robinhood.com/u/connect`

#### Query Parameters

| Name              | Type                   | Required/Optional | Comments                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ---------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| applicationId     | str                    | Required          | A unique ID provided to each dApp by the Robinhood team                                                                                                                                                                                                                                                                    |
| connectId         | UUID                   | Required          | A unique request ID generated for each redirection to Robinhood Connect                                                                                                                                                                                                                                                    |
| walletAddress     | str                    | Required          | The wallet address to which the coin would be transferred                                                                                                                                                                                                                                                                  |
| userIdentifier    | str                    | Required          | A unique identifier that identifies the user on the dApp                                                                                                                                                                                                                                                                   |
| supportedNetworks | comma separated string | Required          | The networks supported by the wallet address and origin app (For possible values, please see the Reference section below)                                                                                                                                                                                                  |
| supportedAssets   | comma separated string | Optional          | The assets supported by the wallet address and origin app (For possible values, please see the Reference section below). **Note:** it's strongly recommended to provide supported assets. If omitted, users will be able to select any coin Robinhood supports in the supported networks, even if the origin app does not. |
| redirectUrl       | string                 | Optional          | Link to return after the user finishes Robinhood Connect flow. This URL must be registered to your unique application ID                                                                                                                                                                                                   |
| assetCode         | str                    | Optional          | To be set if the asset to be purchase has been already determined (For possible values, please see the Reference section below)                                                                                                                                                                                            |
| fiatCode          | str                    | Optional          | To be set if the asset to be purchased has been already determined. We accept only USD at the moment.                                                                                                                                                                                                                      |
| assetAmount       | str                    | Optional          | To be set, if quantity has been already determined in the asset denomination. If this is set, assetCode must be set.                                                                                                                                                                                                       |
| fiatAmount        | str                    | Optional          | To be set, if quantity has been determined in fiat denomination. If this is set, assetCode and fiatCode must be set.                                                                                                                                                                                                       |

#### Sample URLs

1. ```
   https://applink.robinhood.com/u/connect?applicationId=<APP_ID_PROVIDED_BY_RH>&walletAddress=<wallet_address>&supportedAssets=DOGE&supportedNetworks=DOGECOIN&connectId=123e4567-e89b-12d3-a456-426614174001
   ```

2. ```
   https://applink.robinhood.com/u/connect?applicationId=<APP_ID_PROVIDED_BY_RH>&walletAddress=<wallet_address>&supportedAssets=ETH,MATIC,SHIB&supportedNetworks=ETHEREUM,POLYGON&connectId=123e4567-e89b-12d3-a456-426614174000
   ```

### 3. Asset Discovery

This API returns all the crypto assets supported by Robinhood Connect.

**Base URL:** `https://api.robinhood.com/catpay/v1/supported_currencies/`

#### Query Parameters

| Name          | Type | Required/Optional | Comments                           |
| ------------- | ---- | ----------------- | ---------------------------------- |
| applicationId | str  | Required          | To track the origin of the request |

#### Sample request

```bash
curl -s --request GET \
'https://api.robinhood.com/catpay/v1/supported_currencies/?applicationId=<APP_ID_PROVIDED_BY_RH>'
```

#### Response

| Name                | Type                     | Comments                                       |
| ------------------- | ------------------------ | ---------------------------------------------- |
| applicationId       | str                      | To track the origin of the request             |
| cryptoCurrencyPairs | List<CryptoCurrencyPair> | List of supported crypto currency pair objects |

#### CryptoCurrencyPair

| Name              | Type         | Comments                         |
| ----------------- | ------------ | -------------------------------- |
| id                | str          | Crypto currency pair id          |
| assetCurrency     | CurrencyInfo | Asset currency information       |
| quoteCurrency     | CurrencyInfo | Quote currency information       |
| supportedNetworks | List<str>    | Networks supported for the asset |

#### CurrencyInfo

| Name         | Type | Comments                                   |
| ------------ | ---- | ------------------------------------------ |
| id           | str  | Currency id                                |
| code         | str  | Currency code (USD, ETH etc)               |
| name         | str  | Currency name                              |
| currencyType | str  | Type of the currency. i.e Fiat, Crypto etc |

#### Sample Response

```json
{
  "applicationId": "test-123",
  "cryptoCurrencyPairs": [
    {
      "id": "69432091-9fd3-4ca8-aef3-78fc2f193608",
      "assetCurrency": {
        "id": "6f64d0ab-aa87-4cb2-ae2b-2287a2b2c7a4",
        "code": "ATOM",
        "name": "Cosmos",
        "currencyType": "cryptocurrency"
      },
      "quoteCurrency": {
        "id": "1072fc76-1862-41ab-82c2-485837590762",
        "code": "USD",
        "name": "US Dollar",
        "currencyType": "fiat"
      },
      "supportedNetworks": ["COSMOS"]
    }
  ]
}
```

### 4. Price Quote

This API returns the crypto currency price quote for Robinhood Connect.

**Base URL:** `https://api.robinhood.com/catpay/v1/{assetCode}/quote/`

#### Query Parameters

| Name          | Type | Required/Optional | Comments                                                                                                                                                                                 |
| ------------- | ---- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| applicationId | str  | Required          | To track the origin of the request                                                                                                                                                       |
| assetCode     | str  | Required          | The asset code for the quote                                                                                                                                                             |
| networkCode   | str  | Optional          | If the user wants quote for a specific network                                                                                                                                           |
| fiatCode      | str  | Optional          | Fiat code for the quote. Defaults to USD if nothing is provided                                                                                                                          |
| fiatAmount    | str  | Optional          | Amount in Fiat for the asset quote                                                                                                                                                       |
| cryptoAmount  | str  | Optional          | Amount in crypto for the asset quote. If both fiatAmount and cryptoAmount are specified, cryptoAmount will take precedence. Defaults to 1 if fiatAmount and cryptoAmount aren't provided |

#### Sample request

```bash
curl --request GET \
'https://api.robinhood.com/catpay/v1/ETH/quote/?applicationId=<APP_ID_PROVIDED_BY_RH>&networkCode=ETHEREUM&cryptoAmount=1&fiatCode=USD'
```

#### Response

| Name          | Type      | Required/Optional | Comments                                                                                                                |
| ------------- | --------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| applicationId | str       | Required          | To track the origin of the request                                                                                      |
| assetCode     | str       | Required          | The asset code for the quote                                                                                            |
| fiatCode      | str       | Required          | Defaults to USD if nothing is provided in the request                                                                   |
| fiatAmount    | str       | Required          | Amount in Fiat for the asset quote                                                                                      |
| cryptoAmount  | str       | Required          | Amount in crypto for the asset quote                                                                                    |
| price         | str       | Required          | Price of the asset quote                                                                                                |
| networkFee    | PriceItem | Required          | Network fee for the quote which encompasses fee in fiat and in crypto                                                   |
| processingFee | PriceItem | Required          | Processing fee for the quote which encompasses fee in fiat and in crypto                                                |
| totalAmount   | PriceItem | Required          | Total amount (i.e base amount + network fee + processing fee) for the quote which encompasses fee in fiat and in crypto |

#### PriceItem

| Name           | Type | Comments                                                              |
| -------------- | ---- | --------------------------------------------------------------------- |
| type           | str  | Indicates the type of price item (Ex network fee, processing fee etc) |
| fiatAmount     | str  | Amount in fiat for the price item                                     |
| cryptoQuantity | str  | Amount in crypto for the price item                                   |

#### Sample Response

```json
{
  "assetCode": "ETH",
  "applicationId": "test-123",
  "fiatCode": "USD",
  "fiatAmount": "1770.1466069946937",
  "cryptoAmount": "1",
  "price": "1770.1466069946937",
  "networkFee": {
    "type": "PRICE_ITEM_TYPE_CRYPTO_CURRENCY_NETWORK_FEE",
    "fiatAmount": "1.49",
    "cryptoQuantity": "0.00084"
  },
  "processingFee": {
    "type": "PRICE_ITEM_TYPE_CRYPTO_CURRENCY_PROCESSING_FEE",
    "fiatAmount": "0",
    "cryptoQuantity": "0"
  },
  "totalAmount": {
    "type": "PRICE_ITEM_TYPE_TOTAL",
    "fiatAmount": "1771.64",
    "cryptoQuantity": "1.00084"
  }
}
```

## Reference

### 1. Supported Networks

These are the possible values for supportedNetworks:

- AVALANCHE
- BITCOIN
- BITCOIN_CASH
- BITCOIN_SATOSHI_VISION
- LITECOIN
- DOGECOIN
- ETHEREUM
- ETHEREUM_CLASSIC
- POLYGON
- SOLANA
- STELLAR
- CARDANO
- BINANCE_SMART_CHAIN
- POLKADOT
- ALGORAND
- FANTOM
- ZCASH
- TEZOS
- HEDERA
- TRON
- COSMOS

### 2. Available Assets

The list of Asset Codes used by Robinhood can be found at:

- <https://nummus.robinhood.com/currencies/>

---

# App Installation Detection

**Version:** v5.2  
**Updated:** Feb 26, 2025

## Checking if Robinhood App is installed

Below application level code for iOS and Android, can be used to check if the dApp user also has Robinhood App installed. Documentation provided for iOS, Android and React-Native.

## Android

```java
import android.content.Context
import android.content.pm.PackageManager

fun isAppInstalled(context: Context, packageName: String): Boolean {
  return try {
    val packageName = "com.robinhood.android"
    context.packageManager.getPackageInfo(packageName, 0)
    true // App is installed
  } catch (e: PackageManager.NameNotFoundException) {
    false // App is not installed
  }
}
```

## iOS

### 1. Add url scheme to info.plist

```xml
<!-- Add this to your Info.plist: -->
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>robinhood</string>
  <!-- other URL schemes -->
</array>
```

### 2. Check if the url can be opened

```swift
// Check if the app is installed. Return true if installed, false otherwise.
func isRobinhoodInstalled() -> Bool {
  guard let url = URL(string: "robinhood://") else { return false }
  return UIApplication.shared.canOpenURL(url)
}
```

## Android: React Native

### 1. Add intent in Android Manifest

```xml
<manifest ...>
  <queries>
    <intent>
      <action android:name="android.intent.action.VIEW" />
      <data android:scheme="robinhood" />
    </intent>
  </queries>
  <!-- The rest of your manifest -->
</manifest>
```

### 2. In the react-native code, check for app installation

```javascript
import { Linking } from "react-native";

// to check if the app is installed or not.
export async function isRobinhoodInstalled() {
  try {
    const canOpen = await Linking.canOpenURL("robinhood://");
    return canOpen; // true if installed, false otherwise
  } catch (error) {
    return false;
  }
}
```

## iOS: React Native

### 1. Add url scheme to info.plist

```xml
<!-- Add this to your Info.plist: -->
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>robinhood</string>
  <!-- other URL schemes -->
</array>
```

### 2. In the react-native code, check for app installation

```javascript
import { Linking } from "react-native";

// to check if the app is installed or not.
export async function isRobinhoodInstalled() {
  try {
    const canOpen = await Linking.canOpenURL("robinhood://");
    return canOpen; // true if installed, false otherwise
  } catch (error) {
    return false;
  }
}
```

---

**End of Documentation**
