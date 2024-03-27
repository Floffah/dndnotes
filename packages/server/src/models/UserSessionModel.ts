import { Schema } from "mongoose";

import { UserSession } from "@dndnotes/models";
import { UserSessionType } from "@dndnotes/models";

import { createModel } from "@/lib/createModel";

export const UserSessionSchema = new Schema<UserSession>({
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
    type: {
        type: String,
        enum: UserSessionType,
        required: true,
        default: UserSessionType.WEB,
    },
});

export const UserSessionModel = createModel("UserSession", UserSessionSchema);
