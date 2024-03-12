import { Schema } from "mongoose";

import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";
import { createModel } from "@/db/lib/createModel";
import { FriendshipRequest } from "@/db/models/FriendshipRequest/index";

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
