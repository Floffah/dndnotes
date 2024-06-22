import {
    index,
    int,
    mysqlTable,
    serial,
    varchar,
} from "drizzle-orm/mysql-core";

export const campaigns = mysqlTable(
    "campaigns",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 256 }).notNull(),
        createdByUserId: int("created_by_user_id").notNull(),
        totalSessions: int("total_sessions").notNull().default(0),
    },
    (campaigns) => {
        return {
            createdByUserIdIndex: index("created_by_user_id_idx").on(
                campaigns.createdByUserId,
            ),
        };
    },
);

export type Campaign = typeof campaigns.$inferSelect;
