import { Schema, model } from "mongoose";

import { Campaign } from "@/db/models/Campaign/index";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";

export const CampaignSchema = new Schema<Campaign>({
    name: {
        type: String,
        required: true,
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: CampaignMemberModel,
        },
    ],
});

export const CampaignModel = model("Campaign", CampaignSchema, undefined, {
    overwriteModels: true,
});
