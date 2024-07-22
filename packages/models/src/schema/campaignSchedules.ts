//
// export interface CampaignSessionSchedule extends IBaseModel {
//     name: string;
//     type: CampaignSessionType;
//     campaign: Campaign;
//     sessions: CampaignSession[]; // virtual
//
//     firstSessionAt: Date;
//     repeat?: RepeatInterval;
//     length: number; // millis
//     nextSessionAt: Date; // virtual
// }
import {
    datetime,
    int,
    mysqlTable,
    serial,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";

import { generatePublicId } from "@/lib";
import { repeatIntervalEnum } from "@/schema/enums";

export const campaignSchedules = mysqlTable(
    "campaign_schedules",
    {
        id: serial("id").primaryKey(),
        publicId: varchar("public_id", { length: 36 })
            .notNull()
            .unique()
            .$defaultFn(() => generatePublicId()),
        name: varchar("name", { length: 256 }).notNull(),
        campaignId: int("campaign_id").notNull(),

        firstSessionAt: datetime("first_session_at").notNull(),
        repeatInterval: repeatIntervalEnum,
        length: int("length").notNull(),
    },
    (campaignSchedules) => {
        return {};
    },
);

export type CampaignSchedule = typeof campaignSchedules.$inferSelect;
