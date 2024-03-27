import { Schema } from "mongoose";

import { Campaign } from "@dndnotes/models";

import { createModel } from "@/lib/createModel";

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
    discordGuild: {
        type: Schema.Types.ObjectId,
        ref: "DiscordGuild",
        required: true,
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
