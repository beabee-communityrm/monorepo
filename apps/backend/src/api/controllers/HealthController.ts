import { Get, JsonController } from "routing-controllers";
import { GetHealthDto } from "@api/dto/HealthDto";
import ContentTransformer from "@api/transformers/ContentTransformer";

@JsonController("/health")
export class HealthController {
  @Get("/")
  async getHealth(): Promise<GetHealthDto> {
    let databaseStatus = false;

    try {
      // Check database connectivity via ContentTransformer
      await ContentTransformer.fetchOne("general");
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
