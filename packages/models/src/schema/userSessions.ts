import {
    datetime,
    index,
    int,
    mysqlTable,
    serial,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";

export const userSessions = mysqlTable(
    "user_sessions",
    {
        id: serial("id").primaryKey(),
        userId: int("user_id").notNull(),
        token: varchar("token", { length: 256 }).notNull().unique(),
        expiresAt: datetime("expires_at").notNull(),
        lastUsedAt: datetime("last_used_at"),
    },
    (userSessions) => {
        return {
            userIdIndex: index("user_id_idx").on(userSessions.userId),
        };
    },
);

export type UserSession = typeof userSessions.$inferSelect;
