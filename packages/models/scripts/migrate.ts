import { migrate } from "drizzle-orm/planetscale-serverless/migrator";

import { db } from "@/client";

migrate(db, {
    migrationsFolder: "./drizzle",
});
