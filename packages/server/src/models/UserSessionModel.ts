import { UserSession } from "@dndnotes/models";
import { Schema } from "mongoose";

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
});

export const UserSessionModel = createModel("UserSession", UserSessionSchema);
