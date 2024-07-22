import { db } from "./db";
import { beforeAll } from "bun:test";
import { migrate } from "drizzle-orm/planetscale-serverless/migrator";
import { resolve } from "path";

beforeAll(async () => {
    await migrate(db, {
        migrationsFolder: resolve(
            __dirname,
            "../../../packages/models/drizzle",
        ),
    });
});
