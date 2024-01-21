import { Schema } from "mongoose";

import { createModel } from "@/db/lib/createModel";
import { UserModel } from "@/db/models/User/model";
import { UserSession } from "@/db/models/UserSession/index";

export const UserSessionSchema = new Schema<UserSession>({
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
});

export const UserSessionModel = createModel("UserSession", UserSessionSchema);
