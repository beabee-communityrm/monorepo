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

import { calloutsService } from "@beabee/core/services/CalloutsService";

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
  GetGuestCalloutResponseDto,
  ListCalloutResponsesDto
} from "@api/dto/CalloutResponseDto";
import { CreateCalloutTagDto, GetCalloutTagDto } from "@api/dto/CalloutTagDto";
import { PaginatedDto } from "@api/dto/PaginatedDto";

import { CalloutId } from "@api/decorators/CalloutId";
import { CurrentAuth } from "@api/decorators/CurrentAuth";
import PartialBody from "@api/decorators/PartialBody";
import { InvalidCalloutResponse, UnauthorizedError } from "@beabee/core/errors";
import CalloutTransformer from "@api/transformers/CalloutTransformer";
import CalloutResponseExporter from "@api/transformers/CalloutResponseExporter";
import CalloutResponseMapTransformer from "@api/transformers/CalloutResponseMapTransformer";
import CalloutResponseTransformer from "@api/transformers/CalloutResponseTransformer";
import { validateOrReject } from "@api/utils/validation";

import { Callout, Contact } from "@beabee/core/models";

import { CalloutCaptcha } from "@beabee/beabee-common";

import { AuthInfo } from "@beabee/core/type";
import { ListTagsDto } from "@api/dto";
import CalloutReviewerTransformer from "@api/transformers/CalloutReviewerTransformer";
import {
  CreateCalloutReviewerDto,
  GetCalloutReviewerDto
} from "@api/dto/CalloutReviewerDto";
import calloutTagTransformer from "@api/transformers/CalloutTagTransformer";
import { plainToInstance } from "class-transformer";

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
      id = await calloutsService.duplicateCallout(fromId);
      if (Object.keys(data).length > 0) {
        await calloutsService.updateCallout(id, data);
      }
    } else {
      id = await calloutsService.createCallout(data, data.slug ? false : 0);
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
    await calloutsService.updateCallout(id, data);
    return CalloutTransformer.fetchOneById(auth, id);
  }

  @Authorized("admin")
  @OnUndefined(204)
  @Delete("/:id")
  async deleteCallout(@CalloutId() id: string): Promise<void> {
    const deleted = await calloutsService.deleteCallout(id);
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
  async createCalloutResponse(
    @CurrentUser({ required: false }) caller: Contact | undefined,
    @CurrentAuth() auth: AuthInfo,
    @CalloutId() id: string,
    @Body() data: CreateCalloutResponseDto,
    @QueryParam("captchaToken", { required: false }) captchaToken: string
  ): Promise<GetGuestCalloutResponseDto | GetCalloutResponseDto> {
    const callout = await getRepository(Callout).findOneBy({ id });
    if (!callout) {
      throw new NotFoundError();
    }

    if (caller && data.guest) {
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

    if (!caller || callout.access === "only-anonymous") {
      const id = await calloutsService.setGuestResponse(
        callout,
        data.guest,
        data.answers,
        data.newsletter
      );
      return plainToInstance(GetGuestCalloutResponseDto, { id });
    } else {
      const response = await calloutsService.setResponse(
        callout,
        caller,
        data.answers,
        data.newsletter
      );
      return CalloutResponseTransformer.convert(response, auth, {});
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
      limit: -1,
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
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @Body() data: CreateCalloutTagDto
  ): Promise<GetCalloutTagDto> {
    // TODO: handle foreign key error
    return calloutTagTransformer.create(auth, {
      ...data,
      calloutId: id
    });
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
    @Param("tagId") tagId: string,
    @PartialBody() data: CreateCalloutTagDto // Partial<TagCreateData>
  ): Promise<GetCalloutTagDto | undefined> {
    if (!(await calloutTagTransformer.updateById(auth, tagId, data))) {
      throw new NotFoundError();
    }

    return calloutTagTransformer.fetchOneById(auth, tagId);
  }

  // TODO: move to CalloutTagController like we did for contact tags?
  @Delete("/:id/tags/:tagId")
  @OnUndefined(204)
  async deleteCalloutTag(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param("tagId") tagId: string
  ): Promise<void> {
    if (!(await calloutTagTransformer.deleteById(auth, tagId))) {
      throw new NotFoundError();
    }
  }

  @Get("/:id/reviewers")
  async getCalloutReviewers(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: ListCalloutResponsesDto
  ): Promise<GetCalloutReviewerDto[]> {
    const result = await CalloutReviewerTransformer.fetch(auth, {
      ...query,
      rules: {
        condition: "AND",
        rules: [{ field: "calloutId", operator: "equal", value: [id] }]
      }
    });

    return result.items;
  }

  @Post("/:id/reviewers")
  async createCalloutReviewer(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @Body() data: CreateCalloutReviewerDto
  ): Promise<GetCalloutReviewerDto> {
    return CalloutReviewerTransformer.create(auth, {
      calloutId: id,
      ...data
    });
  }

  @Get("/:id/reviewers/:reviewerId")
  async getCalloutReviewer(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param("reviewerId") reviewerId: string
  ): Promise<GetCalloutReviewerDto | undefined> {
    return CalloutReviewerTransformer.fetchOneById(auth, reviewerId);
  }

  @Delete("/:id/reviewers/:reviewerId")
  @OnUndefined(204)
  async deleteCalloutReviewer(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param("reviewerId") reviewerId: string
  ): Promise<void> {
    if (!(await CalloutReviewerTransformer.deleteById(auth, reviewerId))) {
      throw new NotFoundError();
    }
  }
}
