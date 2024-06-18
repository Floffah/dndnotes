import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/schema",
    out: "./drizzle",
    dialect: "mysql",
    verbose: true,
    dbCredentials: {
        host: process.env.DATABASE_HOST!,
        user: process.env.DATABASE_USERNAME!,
        password: process.env.DATABASE_PASSWORD!,
        database: "dndnotes",
    },
});
