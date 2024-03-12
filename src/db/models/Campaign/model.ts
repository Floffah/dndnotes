import { Schema } from "mongoose";

import { createModel } from "@/db/lib/createModel";
import { Campaign } from "@/db/models/Campaign/index";

export const CampaignSchema = new Schema<Campaign>({
    name: {
        type: String,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    totalSessions: {
        type: Number,
        required: true,
        default: 0,
    },
});

CampaignSchema.virtual("sessions", {
    ref: "CampaignSession",
    localField: "_id",
    foreignField: "campaign",
});

CampaignSchema.virtual("schedules", {
    ref: "CampaignSessionSchedule",
    localField: "_id",
    foreignField: "campaign",
});

export const CampaignModel = createModel("Campaign", CampaignSchema);
