import { Response } from 'express';
import { Get, JsonController, Res } from 'routing-controllers';

import { GetHealthDto } from '#api/dto/HealthDto';
import ContentTransformer from '#api/transformers/ContentTransformer';

@JsonController('/health')
export class HealthController {
  @Get('/')
  async getHealth(@Res() response: Response): Promise<Response> {
    let databaseStatus = false;

    try {
      // Check database connectivity via ContentTransformer
      await ContentTransformer.fetchOne('general');
      databaseStatus = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    const healthData: GetHealthDto = {
      status: databaseStatus ? 'ok' : 'error',
      timestamp: new Date(),
      services: {
        database: databaseStatus,
      },
    };

    // Return appropriate HTTP status code
    const statusCode = healthData.status === 'ok' ? 200 : 503;
    return response.status(statusCode).json(healthData);
  }
}
