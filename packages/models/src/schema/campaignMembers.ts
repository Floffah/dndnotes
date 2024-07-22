import {
    int,
    mysqlTable,
    serial,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";

import { generatePublicId } from "@/lib";
import { campaignMemberTypeEnum } from "@/schema/enums";

export const campaignMembers = mysqlTable(
    "campaign_members",
    {
        id: serial("id").primaryKey(),
        publicId: varchar("public_id", { length: 36 })
            .notNull()
            .unique()
            .$defaultFn(() => generatePublicId()),
        campaignId: int("campaign_id").notNull(),
        userId: int("user_id").notNull(),
        type: campaignMemberTypeEnum,
    },
    (campaignMembers) => {
        return {};
    },
);

export type CampaignMember = typeof campaignMembers.$inferSelect;
