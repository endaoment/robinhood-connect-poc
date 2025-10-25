"use client";

import React, { useState, useMemo } from "react";
import {
  getEnabledAssets,
  getFeaturedAssets,
  searchAssets,
  getAssetsByCategory,
  type RobinhoodAssetConfig,
  type AssetCategory,
} from "@/libs/robinhood";
import { AssetCard, AssetCardCompact } from "./asset-card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// Category display information
const CATEGORY_INFO: Record<AssetCategory, { name: string; description: string }> = {
  layer1: {
    name: "Layer 1 Blockchains",
    description: "Original blockchain networks",
  },
  layer2: {
    name: "Layer 2 Solutions",
    description: "Scaling solutions for existing blockchains",
  },
  stablecoin: {
    name: "Stablecoins",
    description: "Cryptocurrencies pegged to stable assets",
  },
  defi: {
    name: "DeFi Tokens",
    description: "Decentralized finance protocols",
  },
  meme: {
    name: "Meme Coins",
    description: "Community-driven cryptocurrencies",
  },
  other: {
    name: "Other Assets",
    description: "Additional supported cryptocurrencies",
  },
};

interface AssetSelectorProps {
  /** Currently selected asset symbol */
  selectedAsset?: string;
  /** Callback when asset is selected */
  onSelect: (asset: RobinhoodAssetConfig) => void;
  /** Display mode */
  variant?: "grid" | "list" | "compact";
  /** Show search bar */
  showSearch?: boolean;
  /** Show category tabs */
  showCategories?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * Complete asset selection interface with search and filtering
 */
export function AssetSelector({
  selectedAsset,
  onSelect,
  variant = "grid",
  showSearch = true,
  showCategories = true,
  className = "",
}: AssetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "popular" | AssetCategory
  >("all");

  // Get assets based on active filter
  const assets = useMemo(() => {
    // Search takes priority
    if (searchQuery.trim()) {
      return searchAssets(searchQuery);
    }

    // Then category filter
    if (activeCategory === "popular") {
      return getFeaturedAssets();
    } else if (activeCategory === "all") {
      return getEnabledAssets();
    } else {
      return getAssetsByCategory(activeCategory);
    }
  }, [searchQuery, activeCategory]);

  // Group assets by category for display
  const assetsByCategory = useMemo(() => {
    const groups: Record<string, RobinhoodAssetConfig[]> = {};
    assets.forEach((asset) => {
      if (!groups[asset.category]) {
        groups[asset.category] = [];
      }
      groups[asset.category].push(asset);
    });
    return groups;
  }, [assets]);

  const handleAssetSelect = (asset: RobinhoodAssetConfig) => {
    onSelect(asset);
  };

  const CardComponent = variant === "compact" ? AssetCardCompact : AssetCard;

  return (
    <div className={className}>
      {/* Search Bar */}
      {showSearch && (
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by name or symbol (e.g., 'Bitcoin' or 'BTC')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            aria-label="Search assets"
          />
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {assets.length} asset{assets.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* Category Tabs */}
      {showCategories && !searchQuery && (
        <Tabs
          value={activeCategory}
          onValueChange={(value) =>
            setActiveCategory(value as typeof activeCategory)
          }
          className="mb-6"
        >
          <TabsList className="w-full justify-start flex-wrap h-auto">
            <TabsTrigger value="all">All Assets</TabsTrigger>
            <TabsTrigger value="popular">
              Popular
              <Badge variant="secondary" className="ml-2">
                {getFeaturedAssets().length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="layer1">Layer 1</TabsTrigger>
            <TabsTrigger value="stablecoin">Stablecoins</TabsTrigger>
            <TabsTrigger value="defi">DeFi</TabsTrigger>
            <TabsTrigger value="layer2">Layer 2</TabsTrigger>
            <TabsTrigger value="meme">Meme</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Asset Grid/List */}
      {assets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No assets found matching &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-blue-600 hover:underline mt-2"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div
          className={
            variant === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {assets.map((asset) => (
            <CardComponent
              key={`${asset.symbol}-${asset.network}`}
              asset={asset}
              selected={selectedAsset === asset.symbol}
              onSelect={handleAssetSelect}
            />
          ))}
        </div>
      )}

      {/* Asset Count */}
      {!searchQuery && assets.length > 0 && (
        <p className="text-sm text-muted-foreground mt-6 text-center">
          Showing {assets.length}{" "}
          {activeCategory === "all"
            ? ""
            : CATEGORY_INFO[
                activeCategory as AssetCategory
              ]?.name.toLowerCase() || ""}{" "}
          asset{assets.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

/**
 * Asset selector with modal-style presentation
 */
export function AssetSelectorModal({
  selectedAsset,
  onSelect,
  onClose,
}: AssetSelectorProps & { onClose?: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Select Asset to Donate</h2>
            <p className="text-muted-foreground mt-1">
              Choose which cryptocurrency you&apos;d like to contribute
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AssetSelector
            selectedAsset={selectedAsset}
            onSelect={(asset) => {
              onSelect(asset);
              onClose?.();
            }}
            variant="grid"
          />
        </div>
      </div>
    </div>
  );
}

