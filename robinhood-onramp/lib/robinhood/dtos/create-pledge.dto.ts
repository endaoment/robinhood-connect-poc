import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Matches,
} from "class-validator";
import { Transform, Type } from "class-transformer";

/**
 * Status enum for crypto donation pledges
 */
export enum PledgeStatus {
  PendingLiquidation = "PENDING_LIQUIDATION",
  Liquidated = "LIQUIDATED",
  Failed = "FAILED",
}

/**
 * Status enum for centralized exchange donations
 */
export enum CentralizedExchangeStatus {
  Completed = "Completed",
  Pending = "Pending",
  Failed = "Failed",
}

/**
 * DTO for creating a crypto donation pledge from Robinhood callback
 *
 * Maps to CryptoDonationPledge entity in backend
 */
export class CreatePledgeDto {
  /**
   * Robinhood ConnectId used as transaction hash
   * Prefixed with 'robinhood:' to distinguish from blockchain tx hashes
   */
  @IsString()
  @IsNotEmpty({ message: "ConnectId is required" })
  @Matches(/^robinhood:/, {
    message: 'OTC transaction hash must start with "robinhood:"',
  })
  otcTransactionHash!: string;

  /**
   * ID of the user making the donation
   * Optional - may be anonymous donation
   */
  @IsOptional()
  @IsString()
  pledgerUserId?: string;

  /**
   * Input token ID from backend token registry
   * Resolved via TokenService.resolveTokenBySymbol()
   */
  @IsNumber()
  @Min(1, { message: "Input token ID must be valid" })
  @Type(() => Number)
  inputToken!: number;

  /**
   * Amount in smallest unit (e.g., satoshis for BTC)
   * Must be positive integer
   */
  @IsString()
  @Matches(/^\d+$/, { message: "Input amount must be positive integer string" })
  @IsNotEmpty({ message: "Input amount is required" })
  inputAmount!: string;

  /**
   * Destination organization/fund ID
   * From DEFAULT_FUND_ID or user selection
   */
  @IsString()
  @IsNotEmpty({ message: "Destination organization ID is required" })
  destinationOrgId!: string;

  /**
   * Current status of the pledge
   */
  @IsEnum(PledgeStatus)
  @IsOptional()
  status?: PledgeStatus;

  /**
   * Status of the centralized exchange donation
   */
  @IsEnum(CentralizedExchangeStatus)
  @IsOptional()
  centralizedExchangeDonationStatus?: CentralizedExchangeStatus;

  /**
   * Robinhood order ID from callback
   * Used to track transaction on Robinhood side
   */
  @IsOptional()
  @IsString()
  centralizedExchangeTransactionId?: string;

  /**
   * Asset symbol (e.g., 'BTC')
   * For logging and debugging
   */
  @IsOptional()
  @IsString()
  asset?: string;

  /**
   * Network name (e.g., 'BITCOIN')
   * For logging and debugging
   */
  @IsOptional()
  @IsString()
  network?: string;
}


