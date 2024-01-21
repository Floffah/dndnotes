import { Schema } from "mongoose";

import { createModel } from "@/db/lib/createModel";
import { Campaign } from "@/db/models/Campaign/index";
import { UserModel } from "@/db/models/User/model";

export const CampaignSchema = new Schema<Campaign>({
    name: {
        type: String,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: UserModel,
        required: true,
    },
    totalSessions: {
        type: Number,
        required: true,
        default: 0,
    },
});

export const CampaignModel = createModel("Campaign", CampaignSchema);
