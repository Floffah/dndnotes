import {
    datetime,
    int,
    mysqlTable,
    serial,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";

import { generatePublicId } from "@/lib";
import { campaignSessionTypeEnum } from "@/schema/enums";

export const campaignSessions = mysqlTable(
    "campaign_sessions",
    {
        id: serial("id").primaryKey(),
        publicId: varchar("public_id", { length: 36 })
            .notNull()
            .unique()
            .$defaultFn(() => generatePublicId()),
        name: varchar("name", { length: 256 }).notNull(),
        campaignId: int("campaign_id").notNull(),
        scheduleId: int("schedule_id"),
        type: campaignSessionTypeEnum,
        startedAt: datetime("started_at").notNull(),
    },
    (campaignSessions) => {
        return {};
    },
);

export type CampaignSession = typeof campaignSessions.$inferSelect;
