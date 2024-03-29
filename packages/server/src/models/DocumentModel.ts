import { Schema } from "mongoose";

import { Document, DocumentFormat } from "@dndnotes/models";

import { createModel } from "@/lib/createModel";

export const DocumentSchema = new Schema<Document>({
    name: {
        type: String,
        required: true,
    },
    format: {
        type: String,
        enum: DocumentFormat,
        required: true,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
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
    richText: {
        type: Object,
        required: false,
    },
});

export const DocumentModel = createModel("Document", DocumentSchema);
