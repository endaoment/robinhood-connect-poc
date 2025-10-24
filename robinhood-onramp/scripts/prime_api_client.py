#!/usr/bin/env python3
"""
Coinbase Prime API Client
Clean implementation based on working endaoment-operations code
"""

import base64
import hashlib
import hmac
import json
import logging
import time
from typing import Dict, Optional, Tuple

import requests

logger = logging.getLogger(__name__)


class CoinbasePrimeClient:
    """Coinbase Prime API client with authentication"""

    BASE_URL = "https://api.prime.coinbase.com"

    def __init__(self, access_key: str, signing_key: str, passphrase: str, portfolio_id: str):
        """Initialize Coinbase Prime API client
        
        Args:
            access_key: Your API Access Key from Prime UI
            signing_key: Your API Signing Key (secret) from Prime UI
            passphrase: Your API Passphrase from Prime UI
            portfolio_id: Your Portfolio ID from Prime UI
        """
        self.access_key = access_key
        self.signing_key = signing_key
        self.passphrase = passphrase
        self.portfolio_id = portfolio_id
        
        logger.info(f"Initialized Prime client for portfolio: {portfolio_id}")

    def _generate_signature(self, timestamp: str, method: str, path: str, body: str = "") -> str:
        """Generate X-CB-ACCESS-SIGNATURE header
        
        CRITICAL: Returns base64-encoded HMAC-SHA256 signature (NOT hex!)
        Based on working code from endaoment-operations/coinbase-auto-liquidator
        """
        message = f"{timestamp}{method}{path}{body}"
        
        # Create HMAC signature and encode to base64 (NOT hexdigest!)
        signature_bytes = hmac.new(
            self.signing_key.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        return base64.b64encode(signature_bytes).decode('utf-8')

    def _get_headers(self, method: str, path: str, body: str = "") -> Dict[str, str]:
        """Generate authentication headers for API request
        
        Reference: https://docs.cdp.coinbase.com/prime/docs/rest-auth
        """
        timestamp = str(int(time.time()))
        signature = self._generate_signature(timestamp, method, path, body)

        return {
            "X-CB-ACCESS-KEY": self.access_key,
            "X-CB-ACCESS-PASSPHRASE": self.passphrase,
            "X-CB-ACCESS-SIGNATURE": signature,
            "X-CB-ACCESS-TIMESTAMP": timestamp,
            "Content-Type": "application/json"
        }

    def list_wallets(self, cursor: Optional[str] = None) -> Dict:
        """List all wallets with pagination support
        
        This is a READ-ONLY operation - safe to call for testing.
        """
        # Base path for signature (without query params)
        base_path = f"/v1/portfolios/{self.portfolio_id}/wallets"
        
        # Build URL with cursor if provided
        if cursor:
            url = f"{self.BASE_URL}{base_path}?cursor={cursor}"
        else:
            url = f"{self.BASE_URL}{base_path}"
        
        # Important: Signature uses base path WITHOUT query parameters
        headers = self._get_headers("GET", base_path)

        logger.info(f"Listing wallets: {url}")
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Failed to list wallets: {response.status_code}")
            logger.error(f"Response: {response.text}")
            response.raise_for_status()
        
        return response.json()

    def create_trading_wallet(self, symbol: str, name: str) -> Dict:
        """Create a TRADING wallet for specified asset
        
        WARNING: This creates a new wallet! Only call after verifying need.
        Note: network_family is NOT needed - Coinbase determines this from symbol
        """
        path = f"/v1/portfolios/{self.portfolio_id}/wallets"
        url = f"{self.BASE_URL}{path}"

        payload = {
            "name": name,
            "symbol": symbol,
            "wallet_type": "TRADING",
        }

        body = json.dumps(payload)
        headers = self._get_headers("POST", path, body)

        logger.info(f"Creating TRADING wallet for {symbol} with name '{name}'")
        response = requests.post(url, headers=headers, data=body)
        
        if response.status_code not in [200, 201]:
            logger.error(f"Failed to create wallet: {response.status_code}")
            logger.error(f"Response: {response.text}")
            response.raise_for_status()
        
        result = response.json()
        logger.info(f"Wallet created successfully")
        return result

    def get_wallet_deposit_address(self, wallet_id: str) -> Tuple[Optional[str], Optional[str]]:
        """Get deposit address and memo (if applicable) for wallet"""
        # Base path for signature (without query params)
        base_path = f"/v1/portfolios/{self.portfolio_id}/wallets/{wallet_id}/deposit_instructions"
        # Full URL with query params
        url = f"{self.BASE_URL}{base_path}?deposit_type=CRYPTO"

        # Important: Signature uses base path WITHOUT query parameters
        headers = self._get_headers("GET", base_path)

        logger.info(f"Fetching deposit address for wallet: {wallet_id}")
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Failed to get deposit address: {response.status_code}")
            logger.error(f"Response: {response.text}")
            response.raise_for_status()

        data = response.json()
        
        # Parse response structure
        crypto_instructions = data.get("crypto_instructions", {})
        address = crypto_instructions.get("address")
        memo = crypto_instructions.get("account_identifier")

        logger.info(f"Address: {address}")
        if memo:
            logger.info(f"Memo: {memo}")

        return address, memo

    def list_all_wallets(self) -> list:
        """Get ALL wallets across all pages"""
        all_wallets = []
        cursor = None
        
        while True:
            response = self.list_wallets(cursor=cursor)
            wallets = response.get('wallets', [])
            all_wallets.extend(wallets)
            
            logger.info(f"Retrieved {len(wallets)} wallets (total so far: {len(all_wallets)})")
            
            pagination = response.get('pagination', {})
            if not pagination.get('has_next'):
                break
                
            cursor = pagination.get('next_cursor')
        
        logger.info(f"Retrieved all {len(all_wallets)} wallets")
        return all_wallets





