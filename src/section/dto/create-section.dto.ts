import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ description: 'Section name', example: 'new section' })
  secType: string;
}
