import { Schema, model } from "mongoose";

import { Session } from "@/db/models/Session/index";
import { UserModel } from "@/db/models/User/model";
import { decorateSchema } from "@/db/models/decorateSchema";

export const SessionSchema = decorateSchema(
    new Schema<Session>({
        user: {
            type: Schema.Types.ObjectId,
            ref: UserModel,
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
