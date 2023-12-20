import { Schema, model } from "mongoose";

import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";
import { FriendshipRequest } from "@/db/models/FriendshipRequest/index";
import { UserModel } from "@/db/models/User/model";
import { decorateSchema } from "@/db/models/decorateSchema";

export const FriendshipRequestSchema = decorateSchema(
    new Schema<FriendshipRequest>({
        sender: {
            type: Schema.Types.ObjectId,
            ref: UserModel,
            required: true,
            index: true,
        },
        recipient: {
            type: Schema.Types.ObjectId,
            ref: UserModel,
            required: true,
            index: true,
        },
        state: {
            type: String,
            enum: FriendshipRequestState,
            required: true,
            default: FriendshipRequestState.PENDING,
        },
    }),
);

export const FriendshipRequestModel = model(
    "FriendshipRequest",
    FriendshipRequestSchema,
    undefined,
    {
        overwriteModels: true,
    },
);
