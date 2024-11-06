import { getRepository } from "@beabee/core/database";
import {
  Authorized,
  Body,
  Get,
  JsonController,
  Post,
  Patch,
  Param
} from "routing-controllers";
import PartialBody from "@api/decorators/PartialBody";

import { ContactTag } from "@beabee/core/models";
import { CreateContactTagDto, GetContactTagDto } from "@api/dto/ContactTagDto";
import { CurrentAuth } from "@api/decorators/CurrentAuth";
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
    const tag = await getRepository(ContactTag).save({
      name: data.name,
      description: data.description
    });

    return ContactTagTransformer.convert(tag);
  }

  @Authorized("admin")
  @Patch("/:tagId")
  async updateContactTag(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param("tagId") tagId: string,
    @PartialBody() data: CreateContactTagDto // Partial<TagCreateData>
  ): Promise<GetContactTagDto | undefined> {
    await getRepository(ContactTag).update({ id: tagId }, data);
    return ContactTagTransformer.fetchOneById(auth, tagId);
  }
}
