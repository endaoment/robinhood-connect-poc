"use client";

import { useState } from "react";
import { AssetMetadata } from "@/types/robinhood";
import { AssetSelector } from "./asset-selector";
import { Button } from "./ui/button";

/**
 * Example usage of AssetSelector component
 * Use this for development and testing
 */
export function AssetSelectorExample() {
  const [selectedAsset, setSelectedAsset] = useState<AssetMetadata | null>(
    null
  );

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Asset Selector Examples</h1>

      {/* Selected Asset Display */}
      {selectedAsset && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold mb-2">Selected Asset:</h2>
          <p className="font-mono">
            {selectedAsset.symbol} - {selectedAsset.name} (
            {selectedAsset.network})
          </p>
          <Button
            onClick={() => setSelectedAsset(null)}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Grid Variant */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Grid Layout (Default)</h2>
        <AssetSelector
          selectedAsset={selectedAsset?.symbol}
          onSelect={setSelectedAsset}
          variant="grid"
        />
      </section>

      {/* List Variant */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">List Layout</h2>
        <AssetSelector
          selectedAsset={selectedAsset?.symbol}
          onSelect={setSelectedAsset}
          variant="list"
        />
      </section>

      {/* Compact Variant */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Compact Layout</h2>
        <div className="max-w-md">
          <AssetSelector
            selectedAsset={selectedAsset?.symbol}
            onSelect={setSelectedAsset}
            variant="compact"
          />
        </div>
      </section>
    </div>
  );
}

