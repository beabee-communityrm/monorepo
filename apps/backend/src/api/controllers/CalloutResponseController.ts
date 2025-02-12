import { plainToInstance } from "class-transformer";
import {
  Get,
  JsonController,
  Params,
  Patch,
  QueryParams
} from "routing-controllers";

import { CurrentAuth } from "@api/decorators/CurrentAuth";
import PartialBody from "@api/decorators/PartialBody";
import { UUIDParams } from "@api/params/UUIDParams";

import {
  BatchUpdateCalloutResponseDto,
  BatchUpdateCalloutResponseResultDto,
  UpdateCalloutResponseDto,
  GetCalloutResponseDto,
  GetCalloutResponseOptsDto,
  ListCalloutResponsesDto,
  PaginatedDto
} from "@beabee/core/api/dto";
import {
  CalloutResponseTransformer,
  calloutResponseTransformer
} from "@beabee/core/api/transformers";

import { AuthInfo } from "@beabee/core/type";

@JsonController("/callout-responses")
export class CalloutResponseController {
  @Get("/")
  async getCalloutResponses(
    @CurrentAuth() auth: AuthInfo,
    @QueryParams() query: ListCalloutResponsesDto
  ): Promise<PaginatedDto<GetCalloutResponseDto>> {
    return calloutResponseTransformer.fetch(auth, query);
  }

  @Patch("/")
  async updateCalloutResponses(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @PartialBody() data: BatchUpdateCalloutResponseDto
  ): Promise<BatchUpdateCalloutResponseResultDto> {
    const affected = await calloutResponseTransformer.updateWithTags(
      auth,
      data
    );
    return plainToInstance(BatchUpdateCalloutResponseResultDto, { affected });
  }

  @Get("/:id")
  async getCalloutResponse(
    @CurrentAuth() auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @QueryParams() query: GetCalloutResponseOptsDto
  ): Promise<GetCalloutResponseDto | undefined> {
    return await calloutResponseTransformer.fetchOneById(auth, id, query);
  }
  @Patch("/:id")
  async updateCalloutResponse(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @PartialBody() data: UpdateCalloutResponseDto
  ): Promise<GetCalloutResponseDto | undefined> {
    await calloutResponseTransformer.updateWithTagsById(auth, id, data);
    return await calloutResponseTransformer.fetchOneById(auth, id);
  }
}
