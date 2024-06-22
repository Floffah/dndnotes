import { int, json, mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";

export const campaignInvites = mysqlTable("campaign_invites", {
    id: serial("id").primaryKey(),
    campaignId: int("campaign_id").notNull(),
    acceptedBy: json("accepted_by").$type<number[]>().notNull().default([]),
    code: varchar("code", { length: 32 }).notNull(),
});

export type CampaignInvite = typeof campaignInvites.$inferSelect;
