import {
    datetime,
    int,
    mysqlTable,
    serial,
    varchar,
} from "drizzle-orm/mysql-core";

import { campaignSessionTypeEnum } from "@/schema/enums";

export const campaignSessions = mysqlTable("campaign_sessions", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    campaignId: int("campaign_id").notNull(),
    scheduleId: int("schedule_id"),
    type: campaignSessionTypeEnum,
    startedAt: datetime("started_at").notNull(),
});

export type CampaignSession = typeof campaignSessions.$inferSelect;
