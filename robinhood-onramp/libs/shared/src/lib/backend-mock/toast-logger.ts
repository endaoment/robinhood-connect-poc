"use client";

import { toast } from "sonner";

/**
 * Parameters for showing a backend API call toast
 */
export interface ApiCallToastParams {
  /**
   * HTTP method (GET, POST, etc.)
   */
  method?: string;

  /**
   * Backend endpoint or service method
   */
  endpoint: string;

  /**
   * Request headers (sanitized)
   */
  headers?: Record<string, string>;

  /**
   * Request body
   */
  body?: unknown;

  /**
   * Expected response from backend
   */
  expectedResponse?: unknown;

  /**
   * Database query that would be executed
   */
  query?: string;

  /**
   * Explanation of what backend would do
   */
  explanation?: string;

  /**
   * Duration in milliseconds (optional)
   */
  duration?: number;
}

/**
 * Show a toast demonstrating a backend API call
 *
 * Displays detailed information about what the backend would do
 * if this was integrated into endaoment-backend
 *
 * @param params - API call parameters
 *
 * @example
 * ```typescript
 * showApiCallToast({
 *   method: 'POST',
 *   endpoint: '/v1/robinhood/pledge/create',
 *   body: { connectId: 'abc-123', amount: '0.5' },
 *   expectedResponse: { pledgeId: 'uuid-...', status: 'PENDING_LIQUIDATION' },
 * });
 * ```
 */
export function showApiCallToast(params: ApiCallToastParams): void {
  const {
    method = "CALL",
    endpoint,
    headers,
    body,
    expectedResponse,
    query,
    explanation,
    duration = 10000,
  } = params;

  // Format the toast message
  const title = `🎯 Backend API: ${method} ${endpoint}`;

  let description = "";

  if (explanation) {
    description += `📝 ${explanation}\n\n`;
  }

  if (headers) {
    description += "**Headers:**\n```\n";
    Object.entries(headers).forEach(([key, value]) => {
      description += `${key}: ${value}\n`;
    });
    description += "```\n\n";
  }

  if (body) {
    description += "**Request Body:**\n```json\n";
    description += JSON.stringify(body, null, 2);
    description += "\n```\n\n";
  }

  if (query) {
    description += "**Database Query:**\n```sql\n";
    description += query;
    description += "\n```\n\n";
  }

  if (expectedResponse) {
    description += "**Expected Response:**\n```json\n";
    description += JSON.stringify(expectedResponse, null, 2);
    description += "\n```";
  }

  // Show toast with rich content
  toast.info(title, {
    description,
    duration,
    closeButton: true,
  });
}

/**
 * Show success toast for backend operation
 */
export function showBackendSuccess(operation: string, details?: unknown): void {
  toast.success(`✅ Backend: ${operation}`, {
    description: details ? JSON.stringify(details, null, 2) : undefined,
    duration: 5000,
  });
}

/**
 * Show error toast for backend operation
 */
export function showBackendError(operation: string, error: string): void {
  toast.error(`❌ Backend Error: ${operation}`, {
    description: error,
    duration: 8000,
  });
}

/**
 * Client-side check to ensure toast functions only run in browser
 */
export const isClient = typeof window !== "undefined";

/**
 * Safe wrapper for toast functions (handles SSR)
 */
export function safeToast(fn: () => void): void {
  if (isClient) {
    fn();
  }
}

