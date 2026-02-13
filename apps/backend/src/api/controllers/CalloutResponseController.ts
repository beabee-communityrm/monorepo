import { AuthInfo } from '@beabee/core/type';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import PartialBody from '#api/decorators/PartialBody';
import {
  BatchUpdateCalloutResponseDto,
  BatchUpdateCalloutResponseResultDto,
  GetCalloutResponseDto,
  GetCalloutResponseOptsDto,
  ListCalloutResponsesDto,
  UpdateCalloutResponseDto,
} from '#api/dto/CalloutResponseDto';
import { PaginatedDto } from '#api/dto/PaginatedDto';
import { UUIDParams } from '#api/params/UUIDParams';
import CalloutResponseTransformer from '#api/transformers/CalloutResponseTransformer';
import { plainToInstance } from 'class-transformer';
import {
  Get,
  JsonController,
  Params,
  Patch,
  QueryParams,
} from 'routing-controllers';

@JsonController('/callout-responses')
export class CalloutResponseController {
  @Get('/')
  async getCalloutResponses(
    @CurrentAuth() auth: AuthInfo,
    @QueryParams() query: ListCalloutResponsesDto
  ): Promise<PaginatedDto<GetCalloutResponseDto>> {
    return CalloutResponseTransformer.fetch(auth, query);
  }

  @Patch('/')
  async updateCalloutResponses(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @PartialBody() data: BatchUpdateCalloutResponseDto
  ): Promise<BatchUpdateCalloutResponseResultDto> {
    const affected = await CalloutResponseTransformer.updateWithTags(
      auth,
      data
    );
    return plainToInstance(BatchUpdateCalloutResponseResultDto, { affected });
  }

  @Get('/:id')
  async getCalloutResponse(
    @CurrentAuth() auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @QueryParams() query: GetCalloutResponseOptsDto
  ): Promise<GetCalloutResponseDto | undefined> {
    return await CalloutResponseTransformer.fetchOneById(auth, id, query);
  }
  @Patch('/:id')
  async updateCalloutResponse(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @PartialBody() data: UpdateCalloutResponseDto
  ): Promise<GetCalloutResponseDto | undefined> {
    await CalloutResponseTransformer.updateWithTagsById(auth, id, data);
    return await CalloutResponseTransformer.fetchOneById(auth, id);
  }
}
