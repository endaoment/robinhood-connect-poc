"use client";

import { useState, useCallback } from "react";
import { AssetMetadata } from "@/types/robinhood";
import { getAssetConfig } from "@/lib/robinhood-asset-config";

export interface AssetSelection {
  /** Selected asset metadata */
  asset: AssetMetadata;
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
   */
  const selectAsset = useCallback((asset: AssetMetadata) => {
    const config = getAssetConfig(asset.symbol);

    if (!config) {
      console.error(`No configuration found for asset: ${asset.symbol}`);
      return;
    }

    setSelection({
      asset,
      walletAddress: config.walletAddress,
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

