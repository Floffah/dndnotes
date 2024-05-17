import { Schema } from "mongoose";

import { UserSession, UserSessionType } from "@dndnotes/models";
import { RealtimeToken } from "@dndnotes/models";

import { createModel } from "@/lib/createModel";

const RealtimeTokenSchema = new Schema<RealtimeToken>({
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    channels: {
        type: [String],
        required: true,
    },
});

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
    realTimeToken: {
        type: RealtimeTokenSchema,
        required: false,
    },
});

export const UserSessionModel = createModel("UserSession", UserSessionSchema);
