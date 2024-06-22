import { mysqlEnum } from "drizzle-orm/mysql-core";

export const oAuthProviderEnum = mysqlEnum("oauth_provider", ["DISCORD"]);

export const campaignMemberTypeEnum = mysqlEnum("campaign_member_type", [
    "PLAYER",
    "DM",
]);

export const repeatIntervalEnum = mysqlEnum("repeat_interval", [
    "WEEKLY",
    "FORTNIGHTLY",
    "MONTHLY",
]);

export const campaignSessionTypeEnum = mysqlEnum("campaign_session_type", [
    "ONE_SHOT",
    "MAIN",
]);
