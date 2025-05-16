import { PartialType } from '@nestjs/swagger';
import { CreateAccesspointDto } from './create-accesspoint.dto';

export class UpdateAccesspointDto extends PartialType(CreateAccesspointDto) {}
