import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CalendarProvider } from '../calendar/calendar.service';

export class CalendarAuthDto {
  @ApiProperty({
    description: 'Calendar provider',
    enum: CalendarProvider,
    example: CalendarProvider.GOOGLE,
  })
  @IsEnum(CalendarProvider)
  @IsNotEmpty()
  provider: CalendarProvider;

  @ApiProperty({
    description: 'Authorization code from OAuth flow',
    example: '4/0AX4XfWh...',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class GetAuthUrlDto {
  @ApiProperty({
    description: 'Calendar provider',
    enum: CalendarProvider,
    example: CalendarProvider.GOOGLE,
  })
  @IsEnum(CalendarProvider)
  @IsNotEmpty()
  provider: CalendarProvider;
}
