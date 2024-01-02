import { Schema, model } from "mongoose";

import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignInvite } from "@/db/models/CampaignInvite/index";
import { UserModel } from "@/db/models/User/model";
import { decorateSchema } from "@/db/models/decorateSchema";

export const CampaignInviteSchema = decorateSchema(
    new Schema<CampaignInvite>({
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
        code: {
            type: String,
            required: true,
        },
    }),
);

export const CampaignInviteModel = model(
    "CampaignInvite",
    CampaignInviteSchema,
    undefined,
    {
        overwriteModels: true,
    },
);
