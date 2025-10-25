"use client";

import { BackendCryptoPledge } from "./types";
import { showApiCallToast, safeToast } from "./toast-logger";

/**
 * Mock implementation of backend DonationPledgeNotificationService
 *
 * Simulates Discord/Slack notifications
 * Shows what backend would do via toasts
 */
export class MockNotificationService {
  /**
   * Send notification for created crypto pledge
   *
   * Simulates backend notification to Discord
   *
   * @param pledge - Created pledge entity
   * @param showToast - Whether to show toast (default: true)
   */
  async notifyCryptoPledgeCreated(
    pledge: BackendCryptoPledge,
    showToast: boolean = true
  ): Promise<void> {
    const discordPayload = {
      embeds: [
        {
          title: "💰 New Robinhood Crypto Donation",
          color: 0x00ff00,
          fields: [
            {
              name: "Pledge ID",
              value: pledge.id,
              inline: true,
            },
            {
              name: "Amount",
              value: pledge.inputAmount,
              inline: true,
            },
            {
              name: "Status",
              value: pledge.status,
              inline: true,
            },
            {
              name: "Transaction",
              value: pledge.otcTransactionHash,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    if (showToast) {
      safeToast(() =>
        showApiCallToast({
          method: "POST",
          endpoint: "Discord Webhook: /donations-channel",
          headers: {
            "Content-Type": "application/json",
          },
          body: discordPayload,
          explanation:
            "Backend would send Discord notification to #donations channel",
          duration: 8000,
        })
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

// Singleton instance
export const mockNotificationService = new MockNotificationService();

