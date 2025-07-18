import { PaymentStatus } from '@beabee/beabee-common';
import { createQueryBuilder } from '@beabee/core/database';
import { Contact, Payment } from '@beabee/core/models';

import { GetStatsDto, GetStatsOptsDto } from '@api/dto/StatsDto';
import { plainToInstance } from 'class-transformer';
import {
  Authorized,
  Get,
  InternalServerError,
  JsonController,
  QueryParams,
} from 'routing-controllers';

@JsonController('/stats')
export class StatsController {
  @Authorized('admin')
  @Get('/')
  async getStats(@QueryParams() query: GetStatsOptsDto): Promise<GetStatsDto> {
    const newContacts = await createQueryBuilder(Contact, 'm')
      .where('m.joined BETWEEN :from AND :to', query)
      .getCount();

    const payments = await createQueryBuilder(Payment, 'p')
      .select('SUM(p.amount)', 'total')
      .addSelect('AVG(p.amount)', 'average')
      .where('p.chargeDate BETWEEN :from AND :to AND status = :status', {
        ...query,
        status: PaymentStatus.Successful,
      })
      .getRawOne<{ total: number | null; average: number | null }>();

    if (!payments) {
      throw new InternalServerError('No payment data');
    }

    return plainToInstance(GetStatsDto, {
      newContacts,
      averageContribution: payments.average,
      totalRevenue: payments.total,
    });
  }
}
