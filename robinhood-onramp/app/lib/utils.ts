/**
 * Frontend Utility Functions
 *
 * NOTE: This is the FRONTEND lib/ directory.
 * Backend libraries are in /libs/ (plural) at the root.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS class name merger
 * Used by shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add other frontend-only utilities here

