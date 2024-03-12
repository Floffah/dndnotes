import { Schema } from "mongoose";

import { createModel } from "@/db/lib/createModel";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { Character } from "@/db/models/Character/index";

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
