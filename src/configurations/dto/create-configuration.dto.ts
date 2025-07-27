import { ApiProperty } from '@nestjs/swagger';
import {
  IsIP,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateConfigurationDto {
  @ApiProperty({
    description: 'Configuration IP address',
    example: '192.168.1.1',
  })
  @IsString()
  @IsIP(4)
  ip: string;

  @ApiProperty({
    description: 'Configuration location name',
    example: 'Main Office',
  })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Building ID where the configuration is located',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  buildingId: number;
}
