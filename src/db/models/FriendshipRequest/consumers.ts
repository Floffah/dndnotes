import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";
import { FriendshipRequest } from "@/db/models/FriendshipRequest/index";
import { User } from "@/db/models/User";
import { BaseAPIModel } from "@/db/types/baseModel";
import { ConsumerContext } from "@/db/types/consumerContext";

export class FriendshipRequestAPIModel
    extends BaseAPIModel
    implements FriendshipRequest
{
    sender: User;
    recipient: User;
    state: FriendshipRequestState;

    constructor(friendshipRequest: FriendshipRequest, ctx: ConsumerContext) {
        super(friendshipRequest, ctx);

        this.recipient = friendshipRequest.recipient;
        this.sender = friendshipRequest.sender;
        this.state = friendshipRequest.state;
    }
}
