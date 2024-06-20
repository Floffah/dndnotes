import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/schema",
    out: "./drizzle",
    dialect: "mysql",
    verbose: true,
    dbCredentials: {
        host: process.env.PLANETSCALE_DB_HOST!,
        user: process.env.PLANETSCALE_DB_USERNAME!,
        password: process.env.PLANETSCALE_DB_PASSWORD!,
        database: process.env.PLANETSCALE_DB!,
    },
});
