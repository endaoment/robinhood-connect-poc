"use client";

import {
  CreatePledgeDto,
  PledgeStatus,
  CentralizedExchangeStatus,
} from "@/libs/robinhood/lib/dtos";
import { BackendCryptoPledge } from "./types";
import {
  showApiCallToast,
  showBackendSuccess,
  safeToast,
} from "./toast-logger";
import { v4 as uuidv4 } from "uuid";

/**
 * Mock implementation of backend CryptoDonationPledgeService
 *
 * Simulates pledge creation in database
 * Shows what backend would do via toasts
 *
 * In real backend, this would:
 * - Validate DTO
 * - Insert into crypto_donation_pledge table
 * - Trigger notifications
 * - Return created pledge entity
 */
export class MockPledgeService {
  /**
   * Create a crypto donation pledge
   *
   * Simulates backend CryptoDonationPledgeService.create()
   *
   * @param dto - Validated pledge DTO
   * @param showToast - Whether to show toast (default: true)
   * @returns Created pledge entity
   *
   * @example
   * ```typescript
   * const pledge = await mockPledgeService.createPledge(pledgeDto);
   * // Shows toast with INSERT query and entity structure
   * ```
   */
  async createPledge(
    dto: CreatePledgeDto,
    showToast: boolean = true
  ): Promise<BackendCryptoPledge> {
    // Generate pledge ID
    const pledgeId = uuidv4();

    // Create pledge entity
    const pledge: BackendCryptoPledge = {
      id: pledgeId,
      otcTransactionHash: dto.otcTransactionHash,
      pledgerUserId: dto.pledgerUserId,
      inputToken: dto.inputToken,
      inputAmount: dto.inputAmount,
      destinationOrgId: dto.destinationOrgId,
      status: dto.status || PledgeStatus.PendingLiquidation,
      centralizedExchangeDonationStatus:
        dto.centralizedExchangeDonationStatus ||
        CentralizedExchangeStatus.Completed,
      centralizedExchangeTransactionId: dto.centralizedExchangeTransactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (showToast) {
      safeToast(() =>
        showApiCallToast({
          method: "POST",
          endpoint: "/v1/robinhood/pledge/create",
          headers: {
            Authorization: "Bearer <user-jwt-token>",
            "Content-Type": "application/json",
          },
          body: {
            otcTransactionHash: dto.otcTransactionHash,
            pledgerUserId: dto.pledgerUserId,
            inputToken: dto.inputToken,
            inputAmount: dto.inputAmount,
            destinationOrgId: dto.destinationOrgId,
            asset: dto.asset,
            network: dto.network,
          },
          query: `
INSERT INTO crypto_donation_pledge (
  id,
  otc_transaction_hash,
  pledger_user_id,
  input_token,
  input_amount,
  destination_org_id,
  status,
  centralized_exchange_donation_status,
  centralized_exchange_transaction_id,
  created_at,
  updated_at
) VALUES (
  '${pledgeId}',
  '${dto.otcTransactionHash}',
  ${dto.pledgerUserId ? `'${dto.pledgerUserId}'` : "NULL"},
  ${dto.inputToken},
  '${dto.inputAmount}',
  '${dto.destinationOrgId}',
  '${pledge.status}',
  '${pledge.centralizedExchangeDonationStatus}',
  ${
    dto.centralizedExchangeTransactionId
      ? `'${dto.centralizedExchangeTransactionId}'`
      : "NULL"
  },
  NOW(),
  NOW()
) RETURNING *;
        `.trim(),
          explanation:
            "Backend would insert pledge into database and trigger notifications",
          expectedResponse: pledge,
          duration: 12000,
        })
      );

      // Show success toast after delay
      setTimeout(() => {
        safeToast(() =>
          showBackendSuccess("Pledge Created", {
            pledgeId,
            status: pledge.status,
            amount: dto.inputAmount,
          })
        );
      }, 1000);
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return pledge;
  }

  /**
   * Get pledge by transaction hash
   */
  async getPledgeByTxHash(
    txHash: string,
    showToast: boolean = true
  ): Promise<BackendCryptoPledge | null> {
    if (showToast) {
      safeToast(() =>
        showApiCallToast({
          method: "GET",
          endpoint: `/v1/robinhood/pledge/by-tx/${txHash}`,
          query: `
SELECT * FROM crypto_donation_pledge 
WHERE otc_transaction_hash = '${txHash}' 
LIMIT 1;
        `.trim(),
          explanation:
            "Backend would query for existing pledge by transaction hash",
        })
      );
    }

    // Mock: assume not found for demonstration
    return null;
  }
}

// Singleton instance
export const mockPledgeService = new MockPledgeService();

