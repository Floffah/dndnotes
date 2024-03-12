import { Schema } from "mongoose";

import { createModel } from "@/db/lib/createModel";
import { CampaignInvite } from "@/db/models/CampaignInvite/index";

export const CampaignInviteSchema = new Schema<CampaignInvite>({
    campaign: {
        type: Schema.Types.ObjectId,
        ref: "Campaign",
        required: true,
    },
    viewedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: [],
        },
    ],
    acceptedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: [],
        },
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
});

export const CampaignInviteModel = createModel(
    "CampaignInvite",
    CampaignInviteSchema,
);
