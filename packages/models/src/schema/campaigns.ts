import {
    index,
    int,
    mysqlTable,
    serial,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";

import { generatePublicId } from "@/lib";

export const campaigns = mysqlTable(
    "campaigns",
    {
        id: serial("id").primaryKey(),
        publicId: varchar("public_id", { length: 36 })
            .notNull()
            .unique()
            .$defaultFn(() => generatePublicId()),
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
