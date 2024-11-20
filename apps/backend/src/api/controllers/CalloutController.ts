import { Response } from "express";
import {
  Authorized,
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  NotFoundError,
  OnUndefined,
  Param,
  Patch,
  Post,
  QueryParam,
  QueryParams,
  Res
} from "routing-controllers";

import CalloutsService from "@beabee/core/services/CalloutsService";

import { getRepository } from "@beabee/core/database";
import { verify } from "@core/lib/captchafox";

import { GetExportQuery } from "@api/dto/BaseDto";

import {
  CreateCalloutDto,
  GetCalloutDto,
  GetCalloutOptsDto,
  ListCalloutsDto
} from "@api/dto/CalloutDto";
import {
  CreateCalloutResponseDto,
  GetCalloutResponseDto,
  GetCalloutResponseMapDto,
  ListCalloutResponsesDto
} from "@api/dto/CalloutResponseDto";
import { CreateCalloutTagDto, GetCalloutTagDto } from "@api/dto/CalloutTagDto";
import { PaginatedDto } from "@api/dto/PaginatedDto";

import { CalloutId } from "@api/decorators/CalloutId";
import { CurrentAuth } from "@api/decorators/CurrentAuth";
import PartialBody from "@api/decorators/PartialBody";
import { InvalidCalloutResponse, UnauthorizedError } from "@beabee/core/errors";
import { calloutTagTransformer } from "@api/transformers/TagTransformer";
import CalloutTransformer from "@api/transformers/CalloutTransformer";
import CalloutResponseExporter from "@api/transformers/CalloutResponseExporter";
import CalloutResponseMapTransformer from "@api/transformers/CalloutResponseMapTransformer";
import CalloutResponseTransformer from "@api/transformers/CalloutResponseTransformer";
import { validateOrReject } from "@api/utils";

import {
  Callout,
  CalloutResponseTag,
  CalloutTag,
  Contact
} from "@beabee/core/models";

import { CalloutCaptcha } from "@beabee/beabee-common";

import { AuthInfo } from "@type/auth-info";
import { ListTagsDto } from "@api/dto";

@JsonController("/callout")
export class CalloutController {
  @Get("/")
  async getCallouts(
    @CurrentAuth() auth: AuthInfo,
    @QueryParams() query: ListCalloutsDto
  ): Promise<PaginatedDto<GetCalloutDto>> {
    return CalloutTransformer.fetch(auth, query);
  }

  @Authorized("admin")
  @Post("/")
  async createCallout(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParam("fromId", { required: false }) fromId: string,
    @Body({ validate: false, required: false }) data: CreateCalloutDto
  ): Promise<GetCalloutDto> {
    // Allow partial body if duplicating
    await validateOrReject(data, { skipMissingProperties: !!fromId });

    let id;
    if (fromId) {
      id = await CalloutsService.duplicateCallout(fromId);
      if (Object.keys(data).length > 0) {
        await CalloutsService.updateCallout(id, data);
      }
    } else {
      id = await CalloutsService.createCallout(data, data.slug ? false : 0);
    }

    return CalloutTransformer.fetchOneByIdOrFail(auth, id);
  }

  @Get("/:id")
  async getCallout(
    @CurrentAuth() auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: GetCalloutOptsDto
  ): Promise<GetCalloutDto | undefined> {
    return CalloutTransformer.fetchOneById(auth, id, {
      ...query,
      showHiddenForAll: true
    });
  }

  @Authorized("admin")
  @Patch("/:id")
  async updateCallout(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @PartialBody() data: CreateCalloutDto // Actually Partial<CreateCalloutDto>
  ): Promise<GetCalloutDto | undefined> {
    await CalloutsService.updateCallout(id, data);
    return CalloutTransformer.fetchOneById(auth, id);
  }

  @Authorized("admin")
  @OnUndefined(204)
  @Delete("/:id")
  async deleteCallout(@CalloutId() id: string): Promise<void> {
    const deleted = await CalloutsService.deleteCallout(id);
    if (!deleted) {
      throw new NotFoundError();
    }
  }

  @Get("/:id/responses")
  async getCalloutResponses(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: ListCalloutResponsesDto
  ): Promise<PaginatedDto<GetCalloutResponseDto>> {
    return await CalloutResponseTransformer.fetchForCallout(auth, id, query);
  }

  @Get("/:id/responses.csv")
  async exportCalloutResponses(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: GetExportQuery,
    @Res() res: Response
  ): Promise<Response> {
    const [exportName, exportData] = await CalloutResponseExporter.export(
      auth,
      id,
      query
    );
    res.attachment(exportName).send(exportData);
    return res;
  }

  @Get("/:id/responses/map")
  async getCalloutResponsesMap(
    @CurrentAuth() auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: ListCalloutResponsesDto
  ): Promise<PaginatedDto<GetCalloutResponseMapDto>> {
    return await CalloutResponseMapTransformer.fetchForCallout(auth, id, query);
  }

  @Post("/:id/responses")
  @OnUndefined(204)
  async createCalloutResponse(
    @CurrentUser({ required: false }) caller: Contact | undefined,
    @CalloutId() id: string,
    @Body() data: CreateCalloutResponseDto,
    @QueryParam("captchaToken", { required: false }) captchaToken: string
  ): Promise<void> {
    const callout = await getRepository(Callout).findOneBy({ id });
    if (!callout) {
      throw new NotFoundError();
    }

    if (caller && (data.guestEmail || data.guestName)) {
      throw new InvalidCalloutResponse("logged-in-guest-fields");
    }

    if (
      callout.captcha === CalloutCaptcha.All ||
      (callout.captcha === CalloutCaptcha.Guest && !caller)
    ) {
      if (!captchaToken) {
        throw new UnauthorizedError({ code: "captcha-required" });
      }

      const error = await verify(captchaToken);
      if (error) {
        throw new UnauthorizedError({
          code: "captcha-failed",
          message: "Captcha failed with error " + error
        });
      }
    }

    // TODO: support assignee/bucket/tags on create
    if (!caller || callout.access === "only-anonymous") {
      await CalloutsService.setGuestResponse(
        callout,
        data.guestName,
        data.guestEmail,
        data.answers
      );
    } else {
      await CalloutsService.setResponse(callout, caller, data.answers);
    }
  }

  // TODO: move to CalloutTagController like we did for contact tags?
  @Get("/:id/tags")
  async getCalloutTags(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: ListTagsDto
  ): Promise<GetCalloutTagDto[]> {
    const result = await calloutTagTransformer.fetch(auth, {
      ...query,
      rules: {
        condition: "AND",
        rules: [{ field: "calloutId", operator: "equal", value: [id] }]
      }
    });

    return result.items;
  }

  // TODO: move to CalloutTagController like we did for contact tags?
  @Post("/:id/tags")
  async createCalloutTag(
    @CalloutId() id: string,
    @Body() data: CreateCalloutTagDto
  ): Promise<GetCalloutTagDto> {
    // TODO: handle foreign key error
    const tag = await getRepository(CalloutTag).save({
      name: data.name,
      description: data.description,
      calloutId: id
    });
    return calloutTagTransformer.convert(tag);
  }

  // TODO: move to CalloutTagController like we did for contact tags?
  @Get("/:id/tags/:tagId")
  async getCalloutTag(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param("tagId") tagId: string
  ): Promise<GetCalloutTagDto | undefined> {
    return calloutTagTransformer.fetchOneById(auth, tagId);
  }

  // TODO: move to CalloutTagController like we did for contact tags?
  @Patch("/:id/tags/:tagId")
  async updateCalloutTag(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @Param("tagId") tagId: string,
    @PartialBody() data: CreateCalloutTagDto // Partial<TagCreateData>
  ): Promise<GetCalloutTagDto | undefined> {
    await getRepository(CalloutTag).update({ id: tagId, calloutId: id }, data);

    return calloutTagTransformer.fetchOneById(auth, tagId);
  }

  // TODO: move to CalloutTagController like we did for contact tags?
  @Delete("/:id/tags/:tagId")
  @OnUndefined(204)
  async deleteCalloutTag(
    @CalloutId() id: string,
    @Param("tagId") tagId: string
  ): Promise<void> {
    await calloutTagTransformer.delete(tagId, CalloutResponseTag);
  }
}
