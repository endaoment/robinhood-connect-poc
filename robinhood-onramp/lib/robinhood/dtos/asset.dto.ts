import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO for asset network information
 */
export class AssetNetworkDto {
  /**
   * Network name (e.g., 'ETHEREUM', 'BITCOIN')
   */
  @IsString()
  @IsNotEmpty()
  networkName!: string;

  /**
   * Robinhood's internal network code
   */
  @IsString()
  @IsNotEmpty()
  networkCode!: string;

  /**
   * Whether network is currently active
   */
  @IsBoolean()
  isActive!: boolean;

  /**
   * Prime wallet address for this network (if available)
   */
  @IsOptional()
  @IsString()
  primeWalletAddress?: string;
}

/**
 * DTO for asset information from Robinhood
 *
 * Represents assets available for donation via Robinhood Connect
 */
export class AssetDto {
  /**
   * Asset symbol (e.g., 'BTC', 'ETH')
   */
  @IsString()
  @IsNotEmpty({ message: "Asset symbol is required" })
  symbol!: string;

  /**
   * Full asset name (e.g., 'Bitcoin', 'Ethereum')
   */
  @IsString()
  @IsNotEmpty({ message: "Asset name is required" })
  name!: string;

  /**
   * Robinhood's internal asset code
   */
  @IsString()
  @IsNotEmpty()
  assetCode!: string;

  /**
   * Number of decimal places for this asset
   */
  @IsOptional()
  @Type(() => Number)
  decimals?: number;

  /**
   * Whether asset is currently available for trading
   */
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  /**
   * Available networks for this asset
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetNetworkDto)
  @IsOptional()
  networks?: AssetNetworkDto[];

  /**
   * Icon URL for asset display
   */
  @IsOptional()
  @IsString()
  iconUrl?: string;

  /**
   * Description of the asset
   */
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO for asset registry response
 */
export class AssetRegistryDto {
  /**
   * Array of available assets
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetDto)
  assets!: AssetDto[];

  /**
   * Total count of assets
   */
  @Type(() => Number)
  totalCount!: number;

  /**
   * Whether Prime addresses are included
   */
  @IsBoolean()
  includePrimeAddresses!: boolean;

  /**
   * Timestamp of registry initialization
   */
  @IsOptional()
  @IsString()
  initializedAt?: string;
}

