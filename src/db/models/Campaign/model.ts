import { Schema, model } from "mongoose";

import { Campaign } from "@/db/models/Campaign/index";
import { decorateSchema } from "@/db/models/decorateSchema";

export const CampaignSchema = decorateSchema(
    new Schema<Campaign>({
        name: {
            type: String,
            required: true,
        },
    }),
);

export const CampaignModel = model("Campaign", CampaignSchema, undefined, {
    overwriteModels: true,
});
