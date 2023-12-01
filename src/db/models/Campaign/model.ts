import { Schema, model } from "mongoose";

import { Campaign } from "@/db/models/Campaign/index";
import { UserModel } from "@/db/models/User/model";
import { decorateSchema } from "@/db/models/decorateSchema";

export const CampaignSchema = decorateSchema(
    new Schema<Campaign>({
        name: {
            type: String,
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: UserModel,
            required: true,
        },
    }),
);

export const CampaignModel = model("Campaign", CampaignSchema, undefined, {
    overwriteModels: true,
});
