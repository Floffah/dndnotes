import { Schema, model } from "mongoose";

import { CampaignModel } from "@/db/models/Campaign/model";
import { Character } from "@/db/models/Character/index";
import { DocumentModel } from "@/db/models/Document/model";
import { decorateSchema } from "@/db/models/decorateSchema";

export const CharacterSchema = decorateSchema(
    new Schema<Character>({
        name: {
            type: String,
            required: true,
        },
        campaign: {
            type: Schema.Types.ObjectId,
            ref: CampaignModel,
            required: true,
        },
        describer: {
            type: Schema.Types.ObjectId,
            ref: DocumentModel,
            required: false,
        },
    }),
);

export const CharacterModel = model("Character", CharacterSchema, undefined, {
    overwriteModels: true,
});
