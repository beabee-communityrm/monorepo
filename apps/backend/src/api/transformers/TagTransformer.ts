import { BaseTransformer } from "./BaseTransformer";
import { TransformPlainToInstance } from "class-transformer";
import {
  calloutTagFilters,
  contactTagFilters,
  RoleType
} from "@beabee/beabee-common";
import { ContactTag } from "@beabee/core/models";
import { GetTagDto } from "@api/dto/TagDto";
import { CalloutTag } from "@beabee/core/models";
import { GetCalloutTagDto } from "@api/dto/CalloutTagDto";
import { GetContactTagDto } from "@api/dto/ContactTagDto";

class TagTransformer<
  TModel extends { id: string; name: string },
  TDto extends { id: string; name: string },
  TFilterName extends string
> extends BaseTransformer<TModel, TDto, TFilterName> {
  constructor(
    protected model: any,
    protected filters: Record<TFilterName, any>,
    protected dtoType: new () => TDto
  ) {
    super();
  }

  protected allowedRoles: RoleType[] = ["admin"];

  @TransformPlainToInstance(GetTagDto)
  convert(tag: TModel): TDto {
    return {
      id: tag.id,
      name: tag.name
    } as TDto;
  }
}

export const calloutTagTransformer = new TagTransformer(
  CalloutTag,
  calloutTagFilters,
  GetCalloutTagDto
);

export const contactTagTransformer = new TagTransformer(
  ContactTag,
  contactTagFilters,
  GetContactTagDto
);
