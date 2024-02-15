import { Schema } from "mongoose";

import { createModel } from "@/db/lib/createModel";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignInvite } from "@/db/models/CampaignInvite/index";
import { UserModel } from "@/db/models/User/model";

export const CampaignInviteSchema = new Schema<CampaignInvite>({
    campaign: {
        type: Schema.Types.ObjectId,
        ref: CampaignModel,
        required: true,
    },
    viewedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: UserModel,
            default: [],
        },
    ],
    acceptedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: UserModel,
            default: [],
        },
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: UserModel,
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
