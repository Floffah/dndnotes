import { sql } from "drizzle-orm";
import {
    datetime,
    mysqlTable,
    serial,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";

import { generatePublicId } from "@/lib";

export const users = mysqlTable(
    "users",
    {
        id: serial("id").primaryKey(),
        publicId: varchar("public_id", { length: 36 })
            .notNull()
            .unique()
            .$defaultFn(() => generatePublicId()),
        name: varchar("name", { length: 256 }).notNull().unique(),
        email: varchar("email", { length: 320 }).unique(),
        createdAt: datetime("created_at")
            .notNull()
            .default(sql`now()`),
        lastActiveAt: datetime("last_active_at").default(sql`now()`),
    },
    (users) => {
        return {};
    },
);

export type User = typeof users.$inferSelect;
