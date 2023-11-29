import { Schema, model } from "mongoose";

import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignMember } from "@/db/models/CampaignMember/index";
import { UserModel } from "@/db/models/User/model";
import { decorateSchema } from "@/db/models/decorateSchema";
import { CampaignMemberType } from "@/db/types/CampaignMemberType";

export const CampaignMemberSchema = decorateSchema(
    new Schema<CampaignMember>({
        type: {
            type: String,
            enum: CampaignMemberType,
            required: true,
        },
        campaign: {
            type: Schema.Types.ObjectId,
            ref: CampaignModel,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: UserModel,
            required: true,
        },
    }),
);

export const CampaignMemberModel = model(
    "CampaignMember",
    CampaignMemberSchema,
    undefined,
    {
        overwriteModels: true,
    },
);
