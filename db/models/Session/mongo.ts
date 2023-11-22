import { Schema, model, models } from "mongoose";

import { Session } from "@/db/models/Session/index";
import { decorateSchema } from "@/db/models/decorateSchema";

export const SessionSchema = decorateSchema(
    new Schema<Session>({
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        token: {
            type: String,
            required: true,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    }),
);

export const SessionModel = model("Session", SessionSchema, undefined, {
    overwriteModels: true,
});
