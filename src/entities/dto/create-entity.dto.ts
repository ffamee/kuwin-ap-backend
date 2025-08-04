import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateEntityDto {
  @ApiProperty({ description: 'Entity name', example: 'new entity' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Section ID to which the entity belongs',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  sectionId: number;
}
