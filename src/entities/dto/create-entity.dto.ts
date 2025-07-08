import { ApiProperty } from '@nestjs/swagger';

export class CreateEntityDto {
  @ApiProperty({ description: 'Entity name', example: 'new entity' })
  name: string;

  @ApiProperty({
    description: 'Section ID to which the entity belongs',
    example: 1,
  })
  sectionId: number;
}
