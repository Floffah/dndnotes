import { Schema, model } from "mongoose";

import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignMember } from "@/db/models/CampaignMember/index";
import { CharacterModel } from "@/db/models/Character/model";
import { UserModel } from "@/db/models/User/model";
import { decorateSchema } from "@/db/models/decorateSchema";

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
        character: {
            type: Schema.Types.ObjectId,
            ref: CharacterModel,
            required: false,
        },
    }),
);

CampaignMemberSchema.index(
    {
        campaign: 1,
        user: 1,
    },
    {
        unique: true,
    },
);

export const CampaignMemberModel = model(
    "CampaignMember",
    CampaignMemberSchema,
    undefined,
    {
        overwriteModels: true,
    },
);
