import { AuthInfo } from '@beabee/core/type';

import { Response } from 'express';
import {
  Authorized,
  Get,
  JsonController,
  QueryParams,
  Res,
} from 'routing-controllers';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import {
  GetActivityEventDto,
  ListActivityEventsDto,
} from '#api/dto/ActivityFeedDto';
import { GetExportQuery } from '#api/dto/BaseDto';
import { PaginatedDto } from '#api/dto/PaginatedDto';
import ActivityEventExporter from '#api/transformers/ActivityEventExporter';
import ActivityEventTransformer from '#api/transformers/ActivityEventTransformer';

@JsonController('/activity')
@Authorized()
export class ActivityFeedController {
  /**
   * Get all activity feed events
   */
  @Get('/')
  async getEvents(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListActivityEventsDto
  ): Promise<PaginatedDto<GetActivityEventDto>> {
    return await ActivityEventTransformer.fetch(auth, query);
  }

  /**
   * Export all activity feed events as CSV
   */
  @Get('.csv')
  async exportEvents(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: GetExportQuery,
    @Res() res: Response
  ): Promise<Response> {
    const [exportName, exportData] = await ActivityEventExporter.export(
      auth,
      query
    );
    res.attachment(exportName).send(exportData);
    return res;
  }
}
