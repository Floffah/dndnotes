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
        token: varchar("token", { length: 256 }).notNull(),
        expiresAt: datetime("expires_at").notNull(),
    },
    (userSessions) => {
        return {
            userIdIndex: index("user_id_idx").on(userSessions.userId),
            tokenIndex: uniqueIndex("token_idx").on(userSessions.token),
        };
    },
);

export type UserSession = typeof userSessions.$inferSelect;
