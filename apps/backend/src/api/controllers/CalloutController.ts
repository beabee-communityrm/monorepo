import { CalloutCaptcha } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { InvalidCalloutResponse, UnauthorizedError } from '@beabee/core/errors';
import { Callout, Contact } from '@beabee/core/models';
import { calloutsService } from '@beabee/core/services/CalloutsService';
import { AuthInfo } from '@beabee/core/type';

import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import {
  Authorized,
  BadRequestError,
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
  Res,
} from 'routing-controllers';

import { CalloutId } from '#api/decorators/CalloutId';
import { CurrentAuth } from '#api/decorators/CurrentAuth';
import PartialBody from '#api/decorators/PartialBody';
import { ListTagsDto } from '#api/dto';
import { GetExportQuery } from '#api/dto/BaseDto';
import {
  CreateCalloutDto,
  GetCalloutDto,
  GetCalloutOptsDto,
  ListCalloutsDto,
} from '#api/dto/CalloutDto';
import {
  CreateCalloutResponseDto,
  GetCalloutResponseDto,
  GetCalloutResponseMapDto,
  GetGuestCalloutResponseDto,
  ListCalloutResponsesDto,
} from '#api/dto/CalloutResponseDto';
import {
  CreateCalloutResponseSegmentDto,
  GetCalloutResponseSegmentDto,
  GetCalloutResponseSegmentWith,
  ListCalloutResponseSegmentsDto,
} from '#api/dto/CalloutResponseSegmentDto';
import {
  CreateCalloutReviewerDto,
  GetCalloutReviewerDto,
  UpdateCalloutReviewerDto,
} from '#api/dto/CalloutReviewerDto';
import { CreateCalloutTagDto, GetCalloutTagDto } from '#api/dto/CalloutTagDto';
import { PaginatedDto } from '#api/dto/PaginatedDto';
import CalloutResponseExporter from '#api/transformers/CalloutResponseExporter';
import CalloutResponseMapTransformer from '#api/transformers/CalloutResponseMapTransformer';
import CalloutResponseSegmentTransformer from '#api/transformers/CalloutResponseSegmentTransformer';
import CalloutResponseTransformer from '#api/transformers/CalloutResponseTransformer';
import CalloutReviewerTransformer from '#api/transformers/CalloutReviewerTransformer';
import calloutTagTransformer from '#api/transformers/CalloutTagTransformer';
import CalloutTransformer from '#api/transformers/CalloutTransformer';
import CalloutVariantTransformer from '#api/transformers/CalloutVariantTransformer';
import { validateOrReject } from '#api/utils/validation';
import { verify } from '#core/lib/captchafox';

@JsonController('/callout')
export class CalloutController {
  @Get('/')
  async getCallouts(
    @CurrentAuth() auth: AuthInfo,
    @QueryParams() query: ListCalloutsDto
  ): Promise<PaginatedDto<GetCalloutDto>> {
    return CalloutTransformer.fetch(auth, query);
  }

  @Authorized('admin')
  @Post('/')
  async createCallout(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParam('fromId', { required: false }) fromId: string,
    @Body({ validate: false, required: false, options: { limit: '900kb' } })
    data: CreateCalloutDto
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
      if (!data.variants.default) {
        throw new BadRequestError(
          'Default variant is required to create a callout'
        );
      }

      id = await calloutsService.createCallout(
        {
          ...data,
          // Tell TypeScript that variants.default is always present
          variants: { default: data.variants.default, ...data.variants },
        },
        data.slug ? false : 0
      );
    }

    return CalloutTransformer.fetchOneByIdOrFail(auth, id);
  }

  @Get('/:id')
  async getCallout(
    @CurrentAuth() auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: GetCalloutOptsDto
  ): Promise<GetCalloutDto | undefined> {
    return CalloutTransformer.fetchOneById(auth, id, {
      ...query,
      showHiddenForAll: true,
    });
  }

  @Patch('/:id')
  async updateCallout(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @PartialBody({ options: { limit: '900kb' } }) data: CreateCalloutDto // Actually Partial<CreateCalloutDto>
  ): Promise<GetCalloutDto | undefined> {
    const { variants, ...calloutData } = data;

    const didUpdate = await CalloutTransformer.updateById(
      auth,
      id,
      calloutData
    );
    if (!didUpdate) {
      throw new NotFoundError();
    }

    if (variants) {
      await CalloutVariantTransformer.delete(auth, {
        condition: 'AND',
        rules: [{ field: 'calloutId', operator: 'equal', value: [id] }],
      });
      await CalloutVariantTransformer.create(
        auth,
        Object.entries(variants).map(([name, variant]) => ({
          calloutId: id,
          name,
          ...variant,
        }))
      );
    }

    return CalloutTransformer.fetchOneById(auth, id);
  }

  @Authorized('admin')
  @OnUndefined(204)
  @Delete('/:id')
  async deleteCallout(@CalloutId() id: string): Promise<void> {
    const deleted = await calloutsService.deleteCallout(id);
    if (!deleted) {
      throw new NotFoundError();
    }
  }

  @Get('/:id/responses')
  async getCalloutResponses(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: ListCalloutResponsesDto
  ): Promise<PaginatedDto<GetCalloutResponseDto>> {
    return await CalloutResponseTransformer.fetchForCallout(auth, id, query);
  }

  @Get('/:id/responses.csv')
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

  @Get('/:id/responses/map')
  async getCalloutResponsesMap(
    @CurrentAuth() auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: ListCalloutResponsesDto
  ): Promise<PaginatedDto<GetCalloutResponseMapDto>> {
    return await CalloutResponseMapTransformer.fetchForCallout(auth, id, query);
  }

  @Post('/:id/responses')
  async createCalloutResponse(
    @CurrentUser({ required: false }) caller: Contact | undefined,
    @CurrentAuth() auth: AuthInfo,
    @CalloutId() id: string,
    @Body() data: CreateCalloutResponseDto,
    @QueryParam('captchaToken', { required: false }) captchaToken: string
  ): Promise<GetGuestCalloutResponseDto | GetCalloutResponseDto> {
    const callout = await getRepository(Callout).findOneBy({ id });
    if (!callout) {
      throw new NotFoundError();
    }

    if (caller && data.guest) {
      throw new InvalidCalloutResponse('logged-in-guest-fields');
    }

    if (
      callout.captcha === CalloutCaptcha.All ||
      (callout.captcha === CalloutCaptcha.Guest && !caller)
    ) {
      if (!captchaToken) {
        throw new UnauthorizedError({ code: 'captcha-required' });
      }

      const error = await verify(captchaToken);
      if (error) {
        throw new UnauthorizedError({
          code: 'captcha-failed',
          message: 'Captcha failed with error ' + error,
        });
      }
    }

    if (!caller || callout.access === 'only-anonymous') {
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
  @Get('/:id/tags')
  async getCalloutTags(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: ListTagsDto
  ): Promise<GetCalloutTagDto[]> {
    const result = await calloutTagTransformer.fetch(auth, {
      limit: -1,
      ...query,
      rules: {
        condition: 'AND',
        rules: [
          ...(query.rules ? [query.rules] : []),
          { field: 'calloutId', operator: 'equal', value: [id] },
        ],
      },
    });

    return result.items;
  }

  // TODO: move to CalloutTagController like we did for contact tags?
  @Post('/:id/tags')
  async createCalloutTag(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @Body() data: CreateCalloutTagDto
  ): Promise<GetCalloutTagDto> {
    // TODO: handle foreign key error
    return calloutTagTransformer.createOne(auth, {
      ...data,
      calloutId: id,
    });
  }

  // TODO: move to CalloutTagController like we did for contact tags?
  @Get('/:id/tags/:tagId')
  async getCalloutTag(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param('tagId') tagId: string
  ): Promise<GetCalloutTagDto | undefined> {
    return calloutTagTransformer.fetchOneById(auth, tagId);
  }

  // TODO: move to CalloutTagController like we did for contact tags?
  @Patch('/:id/tags/:tagId')
  async updateCalloutTag(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param('tagId') tagId: string,
    @PartialBody() data: CreateCalloutTagDto // Partial<TagCreateData>
  ): Promise<GetCalloutTagDto | undefined> {
    if (!(await calloutTagTransformer.updateById(auth, tagId, data))) {
      throw new NotFoundError();
    }

    return calloutTagTransformer.fetchOneById(auth, tagId);
  }

  // TODO: move to CalloutTagController like we did for contact tags?
  @Delete('/:id/tags/:tagId')
  @OnUndefined(204)
  async deleteCalloutTag(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param('tagId') tagId: string
  ): Promise<void> {
    if (!(await calloutTagTransformer.deleteById(auth, tagId))) {
      throw new NotFoundError();
    }
  }

  @Get('/:id/reviewers')
  async getCalloutReviewers(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: ListCalloutResponsesDto
  ): Promise<GetCalloutReviewerDto[]> {
    const result = await CalloutReviewerTransformer.fetch(auth, {
      limit: -1,
      ...query,
      rules: {
        condition: 'AND',
        rules: [
          ...(query.rules ? [query.rules] : []),
          { field: 'calloutId', operator: 'equal', value: [id] },
        ],
      },
    });

    return result.items;
  }

  @Post('/:id/reviewers')
  async createCalloutReviewer(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @Body() data: CreateCalloutReviewerDto
  ): Promise<GetCalloutReviewerDto> {
    return CalloutReviewerTransformer.createOne(auth, {
      ...data,
      calloutId: id,
    });
  }

  @Get('/:id/reviewers/:reviewerId')
  async getCalloutReviewer(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param('reviewerId') reviewerId: string
  ): Promise<GetCalloutReviewerDto | undefined> {
    return CalloutReviewerTransformer.fetchOneById(auth, reviewerId);
  }

  @Patch('/:id/reviewers/:reviewerId')
  async updateCalloutReviewer(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param('reviewerId') reviewerId: string,
    @Body() data: UpdateCalloutReviewerDto
  ): Promise<GetCalloutReviewerDto | undefined> {
    await CalloutReviewerTransformer.updateById(auth, reviewerId, data);
    return CalloutReviewerTransformer.fetchOneById(auth, reviewerId);
  }

  @Delete('/:id/reviewers/:reviewerId')
  @OnUndefined(204)
  async deleteCalloutReviewer(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param('reviewerId') reviewerId: string
  ): Promise<void> {
    if (!(await CalloutReviewerTransformer.deleteById(auth, reviewerId))) {
      throw new NotFoundError();
    }
  }

  @Get('/:id/segments')
  async getCalloutResponseSegments(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @QueryParams() query: ListCalloutResponseSegmentsDto
  ): Promise<GetCalloutResponseSegmentDto[]> {
    const result = await CalloutResponseSegmentTransformer.fetch(auth, {
      ...query,
      calloutId: id,
      includeGlobalSegments: true,
    });
    return result.items;
  }

  @Post('/:id/segments')
  async createCalloutResponseSegment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @Body() data: CreateCalloutResponseSegmentDto
  ): Promise<GetCalloutResponseSegmentDto> {
    if (data.order === undefined) {
      const segment = await CalloutResponseSegmentTransformer.fetchOne(auth, {
        calloutId: id,
        sort: 'order',
        order: 'DESC',
      });
      data.order = segment ? (segment.order ?? -1) + 1 : 0;
    }
    const segment = await CalloutResponseSegmentTransformer.createOne(auth, {
      calloutId: id,
      ...data,
    });
    return await CalloutResponseSegmentTransformer.fetchOneByIdOrFail(
      auth,
      segment.id,
      {
        calloutId: id,
        with: [GetCalloutResponseSegmentWith.itemCount],
      }
    );
  }

  @Patch('/:id/segments/:segmentId')
  async updateCalloutResponseSegment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @CalloutId() id: string,
    @Param('segmentId') segmentId: string,
    @Body() data: CreateCalloutResponseSegmentDto
  ): Promise<GetCalloutResponseSegmentDto | undefined> {
    await CalloutResponseSegmentTransformer.updateById(auth, segmentId, data);
    return CalloutResponseSegmentTransformer.fetchOneById(auth, segmentId, {
      calloutId: id,
      with: [GetCalloutResponseSegmentWith.itemCount],
    });
  }

  @Delete('/:id/segments/:segmentId')
  @OnUndefined(204)
  async deleteCalloutResponseSegment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param('segmentId') segmentId: string
  ): Promise<void> {
    const result = await CalloutResponseSegmentTransformer.deleteById(
      auth,
      segmentId
    );
    if (!result) {
      throw new NotFoundError();
    }
  }
}
