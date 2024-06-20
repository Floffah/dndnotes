import * as schema from "./schema";
import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

export const PlanetScaleClient = new Client({
    host: process.env.PLANETSCALE_DB_HOST,
    username: process.env.PLANETSCALE_DB_USERNAME,
    password: process.env.PLANETSCALE_DB_PASSWORD,
});

export const db = drizzle(PlanetScaleClient, {
    logger: process.env.NODE_ENV !== "production",
    schema,
});
