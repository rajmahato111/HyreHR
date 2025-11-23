import {
  IsDateString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsInt,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetAvailabilityDto {
  @ApiProperty({
    description: 'Start date for availability check',
    example: '2025-11-20T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'End date for availability check',
    example: '2025-11-27T23:59:59Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

export class FindCommonAvailabilityDto extends GetAvailabilityDto {
  @ApiProperty({
    description: 'Array of user IDs to check availability for',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  userIds: string[];

  @ApiProperty({
    description: 'Duration of the meeting in minutes',
    example: 60,
    minimum: 15,
  })
  @IsNumber()
  @Min(15)
  @IsNotEmpty()
  durationMinutes: number;

  @ApiProperty({
    description: 'Target timezone for displaying results',
    example: 'America/New_York',
    required: false,
  })
  @IsString()
  @IsOptional()
  targetTimezone?: string;
}

export class WorkingHoursDto {
  @ApiProperty({
    description: 'Day of week (0 = Sunday, 6 = Saturday)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Start time in HH:mm format',
    example: '09:00',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:mm format',
    example: '17:00',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class UpdateWorkingHoursDto {
  @ApiProperty({
    description: 'Array of working hours for each day',
    type: [WorkingHoursDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDto)
  @IsNotEmpty()
  workingHours: WorkingHoursDto[];
}

export class UpdateTimezoneDto {
  @ApiProperty({
    description: 'IANA timezone identifier',
    example: 'America/New_York',
  })
  @IsString()
  @IsNotEmpty()
  timezone: string;
}

export class CheckConflictsDto {
  @ApiProperty({
    description: 'Start time to check for conflicts',
    example: '2025-11-20T14:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  start: string;

  @ApiProperty({
    description: 'End time to check for conflicts',
    example: '2025-11-20T15:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  end: string;

  @ApiProperty({
    description: 'Array of user IDs to check conflicts for',
    example: ['uuid-1', 'uuid-2'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userIds?: string[];
}
