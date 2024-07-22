import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { schema } from "@dndnotes/models";

export const client = new Client({
    host: process.env.TEST_DB_HOST,
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
});

export const db = drizzle(client, {
    logger: false,
    schema,
});
