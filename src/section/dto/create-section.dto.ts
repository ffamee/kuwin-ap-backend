import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ description: 'Section name', example: 'new section' })
  @IsString()
  @MaxLength(30)
  name: string;
}
