import { RequestMethod } from "@discordjs/rest";
import { Schema } from "mongoose";

import { createModel } from "@/lib/createModel";

export const CachedDiscordResponseSchema = new Schema({
    path: {
        type: String,
        required: true,
    },
    method: {
        type: String,
        enum: RequestMethod,
        required: true,
    },
    context: {
        type: String,
        required: false,
        default: null,
    },
    requestBody: {
        type: String,
        required: false,
        default: null,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    response: {
        type: Object,
        required: true,
    },
});

export const CachedDiscordResponseModel = createModel(
    "CachedDiscordResponse",
    CachedDiscordResponseSchema,
);
