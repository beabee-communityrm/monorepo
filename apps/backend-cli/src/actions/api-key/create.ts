import { runApp } from "@beabee/core/server";
import { Contact } from "@beabee/core/models";
import { getRepository } from "@beabee/core/database";
import { apiKeyService } from "@beabee/core/services/ApiKeyService";

import type { CreateApiKeyArgs } from "../../types/index.js";

export const createApiKey = async (argv: CreateApiKeyArgs): Promise<void> => {
  await runApp(async () => {
    // Create a system user for API key creation
    const systemUser = await getRepository(Contact).findOneOrFail({
      where: { email: argv.email }
    });

    const expiryDate = argv.expires === "never" ? null : new Date(argv.expires);

    const token = await apiKeyService.create(
      systemUser,
      argv.description,
      expiryDate
    );

    console.log("API key created successfully!");
    console.log("Token:", token);
  });
};
