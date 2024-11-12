import { Type } from "class-transformer";
import { ValidateNested, IsOptional } from "class-validator";

/**
 * Creates a new DTO class that wraps a partial version of the base DTO.
 * This utility ensures proper validation and type reflection when working with partial DTOs.
 *
 * @template T - The type of the base DTO
 * @param BaseDTO - The constructor of the base DTO class
 * @returns A new class that wraps a partial version of the base DTO
 */
export function createPartialDTO<T>(
  BaseDTO: new () => T
): new () => { data: Partial<T> } {
  class PartialDTO {
    @Type(() => BaseDTO)
    @ValidateNested()
    @IsOptional()
    data!: Partial<T>;
  }

  return PartialDTO;
}
