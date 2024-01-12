import { Schema, model } from "mongoose";

import { CampaignSessionStartType } from "@/db/enums/CampaignSessionStartType";
import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { CampaignSession } from "@/db/models/CampaignSession/index";
import { decorateSchema } from "@/db/models/decorateSchema";

export const CampaignSessionSchema = decorateSchema(
    new Schema<CampaignSession>({
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
        startedBy: {
            type: Schema.Types.ObjectId,
            ref: CampaignMemberModel,
            required: true,
        },
        startedAt: {
            type: Date,
            required: true,
        },
        startType: {
            type: String,
            enum: CampaignSessionStartType,
            required: true,
        },
    }),
);

export const CampaignSessionModel = model(
    "CampaignSession",
    CampaignSessionSchema,
    undefined,
    {
        overwriteModels: true,
    },
);
