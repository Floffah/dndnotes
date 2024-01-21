import type { InferSchemaType } from "mongoose";

import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";
import { FriendshipRequest } from "@/db/models/FriendshipRequest/index";
import type { FriendshipRequestSchema } from "@/db/models/FriendshipRequest/model";
import { User } from "@/db/models/User";
import {
    UserAPIModel,
    UserAPIType,
    UserClientModel,
} from "@/db/models/User/consumers";
import { BaseAPIModel, BaseClientModel } from "@/db/types/baseModel";
import { ModelLike, RemoveAPIFields, ToObjectType } from "@/db/types/utils";

export class FriendshipRequestAPIModel
    extends BaseAPIModel
    implements Omit<FriendshipRequest, "sender" | "recipient">
{
    recipient: User | null;
    sender: User | null;
    state: FriendshipRequestState;

    constructor(
        friendshipRequest: InferSchemaType<typeof FriendshipRequestSchema>,
    ) {
        super(friendshipRequest);

        this.recipient = friendshipRequest.recipient;
        this.sender = friendshipRequest.sender;
        this.state = friendshipRequest.state;
    }

    toObject(opts: { currentUser?: User } = {}) {
        const base = super.toObject();

        return {
            ...base,
            recipient:
                this.recipient && "name" in this.recipient
                    ? new UserAPIModel(this.recipient).toObject(opts)
                    : null,
            sender:
                this.sender && "name" in this.sender
                    ? new UserAPIModel(this.sender).toObject(opts)
                    : null,
            state: this.state,
        };
    }
}

export type FriendshipRequestAPIType = ToObjectType<FriendshipRequestAPIModel>;

export class FriendshipRequestClientModel
    extends BaseClientModel
    implements RemoveAPIFields<FriendshipRequestAPIType>
{
    recipient: UserAPIType | null;
    sender: UserAPIType | null;
    state: FriendshipRequestState;

    constructor(friendshipRequest: FriendshipRequestAPIType) {
        super(friendshipRequest);

        this.recipient = friendshipRequest.recipient;
        this.sender = friendshipRequest.sender;
        this.state = friendshipRequest.state;
    }

    toObject(opts: { currentUser?: ModelLike<User> } = {}) {
        return {
            ...super.toObject(),
            recipient: this.recipient
                ? new UserClientModel(this.recipient).toObject(opts)
                : null,
            sender: this.sender
                ? new UserClientModel(this.sender).toObject(opts)
                : null,
            state: this.state,
        };
    }
}

export type FriendshipRequestClientType =
    ToObjectType<FriendshipRequestClientModel>;
