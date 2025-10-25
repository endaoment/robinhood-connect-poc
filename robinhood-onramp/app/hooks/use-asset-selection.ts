"use client";

import { useState, useCallback } from "react";
import type { RobinhoodAssetConfig } from "@/libs/robinhood/lib/types";

export interface AssetSelection {
  /** Selected asset metadata */
  asset: RobinhoodAssetConfig;
  /** Wallet address for this asset */
  walletAddress: string;
}

/**
 * Hook for managing asset selection state
 */
export function useAssetSelection() {
  const [selection, setSelection] = useState<AssetSelection | null>(null);

  /**
   * Select an asset
   * The asset comes from the API and already has all needed info including depositAddress
   */
  const selectAsset = useCallback((asset: RobinhoodAssetConfig) => {
    // The asset from the API already has depositAddress
    if (!asset.depositAddress?.address) {
      console.error(`Asset ${asset.symbol} has no deposit address`);
      return;
    }

    setSelection({
      asset,
      walletAddress: asset.depositAddress.address,
    });
  }, []);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  /**
   * Check if an asset is selected
   */
  const isSelected = useCallback(
    (symbol: string) => {
      return selection?.asset.symbol === symbol;
    },
    [selection]
  );

  return {
    selection,
    selectAsset,
    clearSelection,
    isSelected,
  };
}

