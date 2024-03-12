import { Schema } from "mongoose";

import { createModel } from "@/db/lib/createModel";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { Character } from "@/db/models/Character/index";
import { DocumentModel } from "@/db/models/Document/model";

export const CharacterSchema = new Schema<Character>({
    name: {
        type: String,
        required: true,
    },
    campaign: {
        type: Schema.Types.ObjectId,
        ref: CampaignModel,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: CampaignMemberModel,
        required: true,
    },
    describer: {
        type: Schema.Types.ObjectId,
        ref: DocumentModel,
        required: false,
    },
    content: {
        type: Object,
        required: false,
    },
});

export const CharacterModel = createModel("Character", CharacterSchema);
