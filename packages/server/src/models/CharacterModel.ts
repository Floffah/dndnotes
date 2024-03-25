import { Character, ViewableBy } from "@dndnotes/models";
import { Schema } from "mongoose";

import { createModel } from "@/lib/createModel";

export const CharacterSchema = new Schema<Character>({
    name: {
        type: String,
        required: true,
    },
    campaign: {
        type: Schema.Types.ObjectId,
        ref: "Campaign",
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "CampaignMemberModel",
        required: true,
    },
    viewableBy: {
        type: String,
        enum: ViewableBy,
        required: true,
        default: ViewableBy.CREATOR,
    },
    describer: {
        type: Schema.Types.ObjectId,
        ref: "Document",
        required: false,
    },
    content: {
        type: Object,
        required: false,
    },
});

export const CharacterModel = createModel("Character", CharacterSchema);
