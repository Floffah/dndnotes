import * as schema from "./schema";
import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

export const PlanetScaleClient = new Client({
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
});

export const db = drizzle(PlanetScaleClient, {
    logger: process.env.NODE_ENV !== "production",
    schema,
});
