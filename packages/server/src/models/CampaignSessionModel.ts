import { CampaignSession, CampaignSessionType } from "@dndnotes/models";
import { Schema } from "mongoose";

import { createModel } from "@/lib/createModel";

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
