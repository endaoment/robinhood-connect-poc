"use client";

import { BACKEND_TOKEN_MAP, BackendToken } from "./types";
import { showApiCallToast, safeToast } from "./toast-logger";

/**
 * Parameters for token resolution
 */
export interface ResolveTokenParams {
  /**
   * Asset symbol (e.g., 'BTC')
   */
  symbol: string;

  /**
   * Network name (e.g., 'BITCOIN')
   */
  network: string;

  /**
   * Whether to show toast (default: true)
   */
  showToast?: boolean;
}

/**
 * Mock implementation of backend TokenService
 *
 * Simulates database queries for token resolution
 * Shows what backend would do via toasts
 *
 * In real backend, this would:
 * - Query `token` table by symbol and network
 * - Return token entity with ID for foreign key
 */
export class MockTokenService {
  /**
   * Resolve token by symbol and network
   *
   * Simulates backend TokenService.resolveTokenBySymbol()
   *
   * @param params - Token resolution parameters
   * @returns BackendToken or null if not found
   *
   * @example
   * ```typescript
   * const token = await mockTokenService.resolveToken({
   *   symbol: 'BTC',
   *   network: 'BITCOIN',
   * });
   * // Shows toast with SQL query, returns token entity
   * ```
   */
  async resolveToken(params: ResolveTokenParams): Promise<BackendToken | null> {
    const { symbol, network, showToast = true } = params;

    const token = BACKEND_TOKEN_MAP[symbol.toUpperCase()];

    if (!token) {
      if (showToast) {
        safeToast(() =>
          showApiCallToast({
            endpoint: "TokenService.resolveTokenBySymbol",
            query: `
SELECT * FROM token 
WHERE symbol = '${symbol}' 
  AND network = '${network}' 
  AND is_active = true
LIMIT 1;
          `.trim(),
            explanation: `Backend would query database for token matching symbol '${symbol}' on network '${network}'`,
            expectedResponse: null,
          })
        );
      }
      return null;
    }

    if (showToast) {
      safeToast(() =>
        showApiCallToast({
          endpoint: "TokenService.resolveTokenBySymbol",
          query: `
SELECT * FROM token 
WHERE symbol = '${symbol}' 
  AND network = '${network}' 
  AND is_active = true
LIMIT 1;
        `.trim(),
          explanation: `Backend would query database and return token entity`,
          expectedResponse: token,
        })
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return token;
  }

  /**
   * Get token by ID
   *
   * Simulates backend TokenService.findById()
   */
  async getTokenById(
    tokenId: number,
    showToast: boolean = true
  ): Promise<BackendToken | null> {
    const token = Object.values(BACKEND_TOKEN_MAP).find(
      (t) => t.id === tokenId
    );

    if (showToast && token) {
      safeToast(() =>
        showApiCallToast({
          endpoint: "TokenService.findById",
          query: `SELECT * FROM token WHERE id = ${tokenId} LIMIT 1;`,
          expectedResponse: token,
        })
      );
    }

    return token || null;
  }
}

// Singleton instance
export const mockTokenService = new MockTokenService();

