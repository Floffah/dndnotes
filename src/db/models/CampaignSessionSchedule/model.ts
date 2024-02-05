import { Schema } from "mongoose";

import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { RepeatInterval } from "@/db/enums/RepeatInterval";
import { createModel } from "@/db/lib/createModel";
import { CampaignModel } from "@/db/models/Campaign/model";
import { calculateNextDateInSeries } from "@/db/models/CampaignSessionSchedule/calculateNextDateInSeries";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule/index";

export const CampaignSessionScheduleSchema =
    new Schema<CampaignSessionSchedule>({
        name: { type: String, required: true },
        type: { type: String, enum: CampaignSessionType, required: true },
        campaign: {
            type: Schema.Types.ObjectId,
            ref: CampaignModel,
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
