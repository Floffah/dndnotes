import { Schema } from "mongoose";

import { FriendshipRequest, FriendshipRequestState } from "@dndnotes/models";

import { createModel } from "@/lib/createModel";

export const FriendshipRequestSchema = new Schema<FriendshipRequest>({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    state: {
        type: String,
        enum: FriendshipRequestState,
        required: true,
        default: FriendshipRequestState.PENDING,
    },
});

export const FriendshipRequestModel = createModel(
    "FriendshipRequest",
    FriendshipRequestSchema,
);
