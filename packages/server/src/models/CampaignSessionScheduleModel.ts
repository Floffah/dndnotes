import {
    CampaignSessionSchedule,
    CampaignSessionType,
    RepeatInterval,
    calculateNextDateInSeries,
} from "@dndnotes/models";
import { Schema } from "mongoose";

import { createModel } from "@/lib/createModel";

export const CampaignSessionScheduleSchema =
    new Schema<CampaignSessionSchedule>({
        name: { type: String, required: true },
        type: { type: String, enum: CampaignSessionType, required: true },
        campaign: {
            type: Schema.Types.ObjectId,
            ref: "Campaign",
            required: true,
        },

        firstSessionAt: {
            type: Date,
            required: true,
        },
        repeat: {
            type: String,
            enum: RepeatInterval,
            required: false,
        },
        length: {
            type: Number,
            required: true,
            default: 2 * 60 * 60 * 1000,
        },
    });

CampaignSessionScheduleSchema.virtual("sessions", {
    ref: "CampaignSession",
    localField: "_id",
    foreignField: "schedule",
});

CampaignSessionScheduleSchema.virtual("nextSessionAt").get(function (
    this: CampaignSessionSchedule,
) {
    if (!this.repeat) {
        return this.firstSessionAt;
    }

    return calculateNextDateInSeries(
        this.repeat,
        this.firstSessionAt,
        this.length,
    );
});

export const CampaignSessionScheduleModel = createModel(
    "CampaignSessionSchedule",
    CampaignSessionScheduleSchema,
);
