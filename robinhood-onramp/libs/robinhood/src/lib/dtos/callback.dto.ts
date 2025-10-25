import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsNumberString,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * DTO for Robinhood callback URL parameters
 *
 * Validates query parameters received from Robinhood after transaction
 */
export class RobinhoodCallbackDto {
  /**
   * Asset symbol (e.g., 'BTC')
   */
  @IsString()
  @IsNotEmpty({ message: "Asset is required" })
  @Matches(/^[A-Z0-9]+$/, { message: "Asset must be uppercase alphanumeric" })
  @Transform(({ value }) => value?.toUpperCase())
  asset!: string;

  /**
   * Network name (e.g., 'BITCOIN')
   */
  @IsString()
  @IsNotEmpty({ message: "Network is required" })
  @Matches(/^[A-Z0-9_]+$/, {
    message: "Network must be uppercase alphanumeric",
  })
  @Transform(({ value }) => value?.toUpperCase())
  network!: string;

  /**
   * ConnectId from initial URL generation
   */
  @IsString()
  @IsNotEmpty({ message: "ConnectId is required" })
  connectId!: string;

  /**
   * Robinhood order ID
   */
  @IsString()
  @IsNotEmpty({ message: "Order ID is required" })
  orderId!: string;

  /**
   * Optional amount (may not always be provided)
   */
  @IsOptional()
  @IsNumberString()
  amount?: string;

  /**
   * Optional status from Robinhood
   */
  @IsOptional()
  @IsString()
  status?: string;

  /**
   * Optional user identifier passed through
   */
  @IsOptional()
  @IsString()
  userIdentifier?: string;

  /**
   * Optional destination fund ID passed through
   */
  @IsOptional()
  @IsString()
  destinationFundId?: string;
}


