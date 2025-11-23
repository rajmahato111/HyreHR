import {
  IsUUID,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EquityDetailsDto {
  @ApiProperty({ enum: ['stock_options', 'rsu', 'equity_grant'] })
  @IsEnum(['stock_options', 'rsu', 'equity_grant'])
  type: 'stock_options' | 'rsu' | 'equity_grant';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vestingSchedule?: string;
}

export class OfferApproverDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  order: number;
}

export class CreateOfferDto {
  @ApiProperty()
  @IsUUID()
  applicationId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  jobTitle: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salary: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => EquityDetailsDto)
  equity?: EquityDetailsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [OfferApproverDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfferApproverDto)
  approvalWorkflow?: OfferApproverDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  expiryDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  customFields?: Record<string, any>;
}
