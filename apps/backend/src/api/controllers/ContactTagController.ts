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
  QueryParams
} from "routing-controllers";
import PartialBody from "@api/decorators/PartialBody";

import { CreateContactTagDto, GetContactTagDto, ListTagsDto } from "@api/dto";
import { CurrentAuth } from "@api/decorators/CurrentAuth";
import { AuthInfo } from "@beabee/core/type";
import { contactTagTransformer } from "@api/transformers/TagTransformer";
import { ContactTagAssignment } from "@beabee/core/models";
import { DuplicateTagNameError } from "@beabee/core/errors";

/**
 * Controller for managing contact tags.
 * Provides CRUD operations for global contact tags.
 * All operations require admin privileges.
 *
 * @remarks
 * Contact tags can be assigned to contacts to categorize and group them.
 * Tags are managed globally and can be assigned to multiple contacts.
 */
@JsonController("/contact-tags")
@Authorized()
export class ContactTagController {
  /**
   * Retrieves all contact tags.
   *
   * @param auth - Current user's authentication information
   * @returns Array of contact tag DTOs
   *
   * @example
   * GET /contact-tags
   * Returns: [{ id: "...", name: "Important", description: "..." }, ...]
   */
  @Authorized("admin")
  @Get("/")
  async getAllContactTags(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListTagsDto
  ): Promise<GetContactTagDto[]> {
    const result = await contactTagTransformer.fetch(auth, {
      limit: -1,
      ...query
    });

    return result.items;
  }

  /**
   * Creates a new global contact tag.
   *
   * @param data - Tag creation data containing name and optional description
   * @returns The created contact tag DTO
   *
   * @example
   * POST /contact-tags
   * Body: { name: "VIP", description: "Very important contacts" }
   */
  @Authorized("admin")
  @Post("/")
  async createGlobalContactTag(
    @Body() data: CreateContactTagDto
  ): Promise<GetContactTagDto> {
    try {
      const tag = await contactTagTransformer.create(data);
      return contactTagTransformer.convert(tag);
    } catch (error) {
      if (DuplicateTagNameError.isPostgresError(error)) {
        throw new DuplicateTagNameError(data.name);
      }
      throw error;
    }
  }

  /**
   * Updates an existing contact tag.
   *
   * @param auth - Current user's authentication information
   * @param tagId - ID of the tag to update
   * @param data - Updated tag data
   * @returns The updated contact tag DTO
   *
   * @example
   * PATCH /contact-tags/:tagId
   * Body: { name: "Updated Name", description: "Updated description" }
   */
  @Authorized("admin")
  @Patch("/:tagId")
  async updateContactTag(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param("tagId") tagId: string,
    @PartialBody() data: CreateContactTagDto
  ): Promise<GetContactTagDto | undefined> {
    await contactTagTransformer.update(tagId, data);
    return contactTagTransformer.fetchOneById(auth, tagId);
  }

  /**
   * Deletes a contact tag and removes all its assignments.
   *
   * @param tagId - ID of the tag to delete
   * @returns void - Returns 204 No Content on success
   *
   * @example
   * DELETE /contact-tags/:tagId
   */
  @Authorized("admin")
  @OnUndefined(204)
  @Delete("/:tagId")
  async deleteContactTag(@Param("tagId") tagId: string): Promise<void> {
    await contactTagTransformer.delete(tagId, ContactTagAssignment);
  }
}
