import { Type } from "class-transformer";
import { ValidateNested, IsOptional } from "class-validator";

export function createPartialDTO<T>(BaseDTO: new () => T): any {
  class PartialDTO {
    @Type(() => BaseDTO)
    @ValidateNested()
    @IsOptional()
    data!: Partial<T>;
  }

  return PartialDTO;
}
