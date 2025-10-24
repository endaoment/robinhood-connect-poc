"use client";

import React from "react";
import { AssetMetadata } from "@/types/robinhood";
import { AssetIcon } from "./asset-icon";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface AssetCardProps {
  /** Asset metadata to display */
  asset: AssetMetadata;
  /** Whether this asset is currently selected */
  selected?: boolean;
  /** Callback when asset is selected */
  onSelect?: (asset: AssetMetadata) => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Individual asset card for selection
 */
export function AssetCard({
  asset,
  selected = false,
  onSelect,
  className,
}: AssetCardProps) {
  const handleClick = () => {
    if (onSelect && asset.enabled) {
      onSelect(asset);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && asset.enabled) {
      e.preventDefault();
      onSelect?.(asset);
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        !asset.enabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={asset.enabled ? 0 : -1}
      role="button"
      aria-pressed={selected}
      aria-disabled={!asset.enabled}
      aria-label={`Select ${asset.name} (${asset.symbol})`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Asset Icon */}
          <AssetIcon
            symbol={asset.symbol}
            icon={asset.icon}
            size={48}
            className="flex-shrink-0"
          />

          {/* Asset Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{asset.name}</h3>
              {asset.isPopular && (
                <Badge variant="secondary" className="text-xs">
                  Popular
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-muted-foreground font-mono">
                {asset.symbol}
              </p>
              <Badge variant="outline" className="text-xs">
                {asset.network}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">
              {asset.description}
            </p>
          </div>

          {/* Selection Indicator */}
          {selected && (
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact asset card for dense lists
 */
export function AssetCardCompact({
  asset,
  selected,
  onSelect,
  className,
}: AssetCardProps) {
  return (
    <button
      onClick={() => onSelect?.(asset)}
      className={cn(
        "w-full p-3 rounded-lg border transition-all",
        "hover:bg-accent hover:border-blue-300",
        "flex items-center gap-3",
        selected && "bg-blue-50 border-blue-500",
        !asset.enabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={!asset.enabled}
      aria-pressed={selected}
    >
      <AssetIcon symbol={asset.symbol} icon={asset.icon} size={32} />
      <div className="flex-1 text-left">
        <p className="font-medium">{asset.symbol}</p>
        <p className="text-xs text-muted-foreground">{asset.name}</p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

