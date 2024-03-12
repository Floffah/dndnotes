import { Schema } from "mongoose";

import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { createModel } from "@/db/lib/createModel";
import { CampaignMember } from "@/db/models/CampaignMember/index";

export const CampaignMemberSchema = new Schema<CampaignMember>({
    type: {
        type: String,
        enum: CampaignMemberType,
        required: true,
    },
    campaign: {
        type: Schema.Types.ObjectId,
        ref: "Campaign",
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    character: {
        type: Schema.Types.ObjectId,
        ref: "Character",
        required: false,
    },
});

CampaignMemberSchema.index(
    {
        campaign: 1,
        user: 1,
    },
    {
        unique: true,
    },
);

export const CampaignMemberModel = createModel(
    "CampaignMember",
    CampaignMemberSchema,
);
