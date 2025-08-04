import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsNumber()
  @IsPositive()
  entityId: number;
}
