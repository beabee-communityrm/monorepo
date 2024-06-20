import { database } from "@beabee/core";

// This is used by the TypeORM CLI to run migrations
export const dataSource = database.dataSource;
