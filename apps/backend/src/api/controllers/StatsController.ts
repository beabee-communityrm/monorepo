import { PaymentStatus } from "@beabee/beabee-common";
import { plainToInstance } from "class-transformer";
import {
  Authorized,
  Get,
  InternalServerError,
  JsonController,
  QueryParams
} from "routing-controllers";

import { database } from "@beabee/core";

import { GetStatsDto, GetStatsOptsDto } from "@api/dto/StatsDto";

import { Contact, Payment } from "@beabee/models";

@JsonController("/stats")
export class StatsController {
  @Authorized("admin")
  @Get("/")
  async getStats(@QueryParams() query: GetStatsOptsDto): Promise<GetStatsDto> {
    const newContacts = await database.createQueryBuilder(Contact, "m")
      .where("m.joined BETWEEN :from AND :to", query)
      .getCount();

    const payments = await database.createQueryBuilder(Payment, "p")
      .select("SUM(p.amount)", "total")
      .addSelect("AVG(p.amount)", "average")
      .where("p.chargeDate BETWEEN :from AND :to AND status = :status", {
        ...query,
        status: PaymentStatus.Successful
      })
      .getRawOne<{ total: number | null; average: number | null }>();

    if (!payments) {
      throw new InternalServerError("No payment data");
    }

    return plainToInstance(GetStatsDto, {
      newContacts,
      averageContribution: payments.average,
      totalRevenue: payments.total
    });
  }
}
