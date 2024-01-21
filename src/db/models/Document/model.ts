import { Schema } from "mongoose";

import { DocumentType } from "@/db/enums/DocumentType";
import { createModel } from "@/db/lib/createModel";
import { CampaignModel } from "@/db/models/Campaign/model";
import { Document } from "@/db/models/Document/index";
import { UserModel } from "@/db/models/User/model";

export const DocumentSchema = new Schema<Document>({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: DocumentType,
        required: true,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: UserModel,
        required: true,
    },
    campaign: {
        type: Schema.Types.ObjectId,
        ref: CampaignModel,
        required: true,
    },
    notionId: {
        type: String,
        required: false,
    },
    recordMap: {
        type: [
            {
                type: String,
                value: String,
            },
        ],
        required: false,
        default: [],
    },
});

export const DocumentModel = createModel("Document", DocumentSchema);
