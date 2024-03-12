import { Schema } from "mongoose";

import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { createModel } from "@/db/lib/createModel";
import { CampaignSession } from "@/db/models/CampaignSession/index";

export const CampaignSessionSchema = new Schema<CampaignSession>({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: CampaignSessionType,
        required: true,
    },
    campaign: {
        type: Schema.Types.ObjectId,
        ref: "Campaign",
        required: true,
    },
    startedAt: {
        type: Date,
        required: true,
    },
    summary: {
        type: Schema.Types.ObjectId,
        ref: "Document",
        required: false,
    },
    schedule: {
        type: Schema.Types.ObjectId,
        ref: "CampaignSessionSchedule",
        required: false,
    },
});

export const CampaignSessionModel = createModel(
    "CampaignSession",
    CampaignSessionSchema,
);
