import { Schema, model } from "mongoose";

import { UserModel } from "@/db/models/User/model";
import { UserSession } from "@/db/models/UserSession/index";
import { decorateSchema } from "@/db/models/decorateSchema";

export const UserSessionSchema = decorateSchema(
    new Schema<UserSession>({
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

export const UserSessionModel = model(
    "UserSession",
    UserSessionSchema,
    undefined,
    {
        overwriteModels: true,
    },
);
