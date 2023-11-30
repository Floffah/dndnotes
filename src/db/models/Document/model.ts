import { Schema, model } from "mongoose";

import { DocumentType } from "@/db/enums/DocumentType";
import { Document } from "@/db/models/Document/index";
import { UserModel } from "@/db/models/User/model";
import { decorateSchema } from "@/db/models/decorateSchema";

export const DocumentSchema = decorateSchema(
    new Schema<Document>({
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
            ref: "Campaign",
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
    }),
);

export const DocumentModel = model("Document", DocumentSchema, undefined, {
    overwriteModels: true,
});
