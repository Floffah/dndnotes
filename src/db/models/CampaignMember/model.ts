import { Schema, model } from "mongoose";

import { CampaignMember } from "@/db/models/CampaignMember/index";
import { CampaignMemberType } from "@/db/types/CampaignMemberType";

export const CampaignMemberSchema = new Schema<CampaignMember>({
    type: {
        type: String,
        enum: CampaignMemberType,
        required: true,
    },
});

export const CampaignMemberModel = model(
    "CampaignMember",
    CampaignMemberSchema,
    undefined,
    {
        overwriteModels: true,
    },
);
