import { Schema } from "mongoose";

import { createModel } from "@/db/lib/createModel";
import { UserSession } from "@/db/models/UserSession/index";

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
