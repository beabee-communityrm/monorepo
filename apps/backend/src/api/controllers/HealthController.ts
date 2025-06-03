import { Get, JsonController } from "routing-controllers";
import { getRepository } from "@beabee/core/database";
import { Contact } from "@beabee/core/models";
import { GetHealthDto } from "@api/dto/HealthDto";

@JsonController("/health")
export class HealthController {
  @Get("/")
  async getHealth(): Promise<GetHealthDto> {
    let databaseStatus = false;

    try {
      // Simple database connectivity check
      await getRepository(Contact).count();
      databaseStatus = true;
    } catch (error) {
      console.error("Database health check failed:", error);
    }

    return {
      status: databaseStatus ? "ok" : "error",
      timestamp: new Date(),
      services: {
        database: databaseStatus
      }
    };
  }
}
