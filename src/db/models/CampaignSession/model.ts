import { Schema } from "mongoose";

import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { createModel } from "@/db/lib/createModel";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignSession } from "@/db/models/CampaignSession/index";
import { CampaignSessionScheduleModel } from "@/db/models/CampaignSessionSchedule/model";
import { DocumentModel } from "@/db/models/Document/model";

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
        ref: CampaignModel,
        required: true,
    },
    startedAt: {
        type: Date,
        required: true,
    },
    summary: {
        type: Schema.Types.ObjectId,
        ref: DocumentModel,
        required: false,
    },
    schedule: {
        type: Schema.Types.ObjectId,
        ref: CampaignSessionScheduleModel,
        required: false,
    },
});

export const CampaignSessionModel = createModel(
    "CampaignSession",
    CampaignSessionSchema,
);
