import React from "react";
import Image from "next/image";

interface AssetIconProps {
  /** Asset symbol (e.g., 'ETH') */
  symbol: string;
  /** Icon filename or URL */
  icon: string;
  /** Size in pixels */
  size?: number;
  /** CSS class name */
  className?: string;
}

/**
 * Asset icon with fallback to symbol text
 */
export function AssetIcon({
  symbol,
  icon,
  size = 40,
  className = "",
}: AssetIconProps) {
  const [imageError, setImageError] = React.useState(false);

  // Try to load icon from public/assets/crypto-icons/
  const iconPath = `/assets/crypto-icons/${icon}`;

  if (imageError) {
    // Fallback to symbol text in colored circle
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-label={`${symbol} icon`}
      >
        {symbol.slice(0, 3)}
      </div>
    );
  }

  return (
    <Image
      src={iconPath}
      alt={`${symbol} icon`}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setImageError(true)}
      priority={false}
    />
  );
}

/**
 * Small asset icon for compact displays
 */
export function AssetIconSmall(props: Omit<AssetIconProps, "size">) {
  return <AssetIcon {...props} size={24} />;
}

/**
 * Large asset icon for featured displays
 */
export function AssetIconLarge(props: Omit<AssetIconProps, "size">) {
  return <AssetIcon {...props} size={64} />;
}

