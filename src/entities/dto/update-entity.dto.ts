import { PartialType } from '@nestjs/mapped-types';
import { CreateEntityDto } from './create-entity.dto';

export class UpdateEntityDto extends PartialType(CreateEntityDto) {}

// export class UpdateEntityDto {
//   name?: string;
//   sectionId?: number;
// }
