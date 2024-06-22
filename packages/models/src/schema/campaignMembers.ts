import { int, mysqlTable, serial } from "drizzle-orm/mysql-core";

import { campaignMemberTypeEnum } from "@/schema/enums";

export const campaignMembers = mysqlTable(
    "campaign_members",
    {
        id: serial("id").primaryKey(),
        campaignId: int("campaign_id").notNull(),
        userId: int("user_id").notNull(),
        type: campaignMemberTypeEnum,
    },
    (campaignMembers) => {
        return {};
    },
);

export type CampaignMember = typeof campaignMembers.$inferSelect;
