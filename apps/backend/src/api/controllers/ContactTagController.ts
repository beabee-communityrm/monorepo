import { getRepository } from "@beabee/core/database";
import {
  Authorized,
  Body,
  Get,
  JsonController,
  Post,
  Patch,
  Param,
  OnUndefined,
  Delete,
  NotFoundError
} from "routing-controllers";
import PartialBody from "@api/decorators/PartialBody";

import { CreateContactTagDto, GetContactTagDto } from "@api/dto/ContactTagDto";
import { CurrentAuth } from "@api/decorators/CurrentAuth";
import ContactTagService from "@beabee/core/services/ContactTagService";
import ContactTagTransformer from "@api/transformers/ContactTagTransformer";
import { AuthInfo } from "@type/auth-info";

@JsonController("/contact-tags")
@Authorized()
export class ContactTagController {
  @Authorized("admin")
  @Get("/")
  async getAllContactTags(
    @CurrentAuth({ required: true }) auth: AuthInfo
  ): Promise<GetContactTagDto[]> {
    const result = await ContactTagTransformer.fetch(auth, {
      limit: -1,
      rules: {
        condition: "AND",
        rules: []
      }
    });

    return result.items;
  }

  @Authorized("admin")
  @Post("/")
  async createGlobalContactTag(
    @Body() data: CreateContactTagDto
  ): Promise<GetContactTagDto> {
    const tag = await ContactTagService.create(data);
    return ContactTagTransformer.convert(tag);
  }

  @Authorized("admin")
  @Patch("/:tagId")
  async updateContactTag(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param("tagId") tagId: string,
    @PartialBody() data: CreateContactTagDto // Partial<TagCreateData>
  ): Promise<GetContactTagDto | undefined> {
    await ContactTagService.update(tagId, data);
    return ContactTagTransformer.fetchOneById(auth, tagId);
  }

  @Authorized("admin")
  @OnUndefined(204)
  @Delete("/:tagId")
  async deleteContactTag(@Param("tagId") tagId: string): Promise<void> {
    await ContactTagService.delete(tagId);
  }
}
