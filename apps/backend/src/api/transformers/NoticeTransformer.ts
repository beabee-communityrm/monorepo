import {
  ItemStatus,
  NoticeFilterName,
  RuleGroup,
  noticeFilters,
} from '@beabee/beabee-common';
import { statusFilterHandler } from '@beabee/core/filter-handlers';
import { Notice } from '@beabee/core/models';

import { GetNoticeDto } from '@api/dto/NoticeDto';
import { BaseTransformer } from '@api/transformers/BaseTransformer';
import { TransformPlainToInstance } from 'class-transformer';

export class NoticeTransformer extends BaseTransformer<
  Notice,
  GetNoticeDto,
  NoticeFilterName
> {
  protected model = Notice;
  protected filters = noticeFilters;
  protected filterHandlers = { status: statusFilterHandler };

  @TransformPlainToInstance(GetNoticeDto)
  convert(notice: Notice): GetNoticeDto {
    return {
      id: notice.id,
      createdAt: notice.createdAt,
      updatedAt: notice.updatedAt,
      name: notice.name,
      text: notice.text,
      starts: notice.starts,
      expires: notice.expires,
      status: notice.status,
      ...(notice.buttonText !== null && { buttonText: notice.buttonText }),
      ...(notice.url !== null && { url: notice.url }),
    };
  }

  protected async getNonAdminAuthRules(): Promise<RuleGroup> {
    return {
      condition: 'AND',
      rules: [{ field: 'status', operator: 'equal', value: [ItemStatus.Open] }],
    };
  }
}

export default new NoticeTransformer();
