import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Matches,
  IsNumberString,
  MinLength,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * DTO for generating Robinhood onramp URL
 *
 * Validates all required parameters for URL generation
 */
export class GenerateUrlDto {
  /**
   * ConnectId from Robinhood API
   * Must be non-empty string
   */
  @IsString()
  @IsNotEmpty({ message: "ConnectId is required" })
  @MinLength(10, { message: "ConnectId must be at least 10 characters" })
  connectId!: string;

  /**
   * Asset symbol (e.g., 'BTC', 'ETH')
   * Must be uppercase alphanumeric
   */
  @IsString()
  @IsNotEmpty({ message: "Asset symbol is required" })
  @Matches(/^[A-Z0-9]+$/, { message: "Asset must be uppercase alphanumeric" })
  @MaxLength(10, { message: "Asset symbol too long" })
  @Transform(({ value }) => value?.toUpperCase())
  asset!: string;

  /**
   * Network name (e.g., 'BITCOIN', 'ETHEREUM')
   * Must be uppercase alphanumeric with underscores
   */
  @IsString()
  @IsNotEmpty({ message: "Network is required" })
  @Matches(/^[A-Z0-9_]+$/, {
    message: "Network must be uppercase alphanumeric with underscores",
  })
  @Transform(({ value }) => value?.toUpperCase())
  network!: string;

  /**
   * Amount in asset units (e.g., '0.5' for 0.5 BTC)
   * Must be positive number string
   */
  @IsNumberString({}, { message: "Amount must be a valid number string" })
  @IsNotEmpty({ message: "Amount is required" })
  @Matches(/^\d+\.?\d*$/, { message: "Amount must be positive" })
  amount!: string;

  /**
   * Callback URL for after transaction completes
   * Must be valid HTTPS URL
   */
  @IsUrl(
    {
      protocols: ["https"],
      require_protocol: true,
    },
    { message: "Callback URL must be valid HTTPS URL" }
  )
  @IsNotEmpty({ message: "Callback URL is required" })
  callbackUrl!: string;

  /**
   * Optional destination fund/organization ID
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  destinationFundId?: string;

  /**
   * Optional user identifier (email, user ID, etc.)
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  userIdentifier?: string;
}

