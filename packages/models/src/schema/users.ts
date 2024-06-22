import { sql } from "drizzle-orm";
import {
    datetime,
    mysqlTable,
    serial,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
    "users",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 256 }).notNull(),
        email: varchar("email", { length: 320 }),
        createdAt: datetime("created_at")
            .notNull()
            .default(sql`now()`),
        lastActiveAt: datetime("last_active_at").default(sql`now()`),
    },
    (users) => {
        return {
            nameIndex: uniqueIndex("name_idx").on(users.name),
            emailIndex: uniqueIndex("email_idx").on(users.email),
        };
    },
);

export type User = typeof users.$inferSelect;
