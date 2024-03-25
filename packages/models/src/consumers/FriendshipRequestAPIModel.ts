import { FriendshipRequestState } from "@/enums/FriendshipRequestState";
import { isPopulated } from "@/lib/isPopulated";
import { FriendshipRequest } from "@/models/FriendshipRequest";
import { User } from "@/models/User";
import { UserAPIModel } from "@/consumers/UserAPIModel";
import { BaseAPIModel } from "@/types/baseModel";
import { ConsumerContext } from "@/types/consumerContext";

export class FriendshipRequestAPIModel
    extends BaseAPIModel
    implements FriendshipRequest
{
    sender: User;
    recipient: User;
    state: FriendshipRequestState;

    constructor(friendshipRequest: FriendshipRequest, ctx: ConsumerContext) {
        super(friendshipRequest, ctx);

        this.recipient = isPopulated(friendshipRequest.recipient)
            ? new UserAPIModel(friendshipRequest.recipient, ctx)
            : null!;
        this.sender = isPopulated(friendshipRequest.sender)
            ? new UserAPIModel(friendshipRequest.sender, ctx)
            : null!;
        this.state = friendshipRequest.state;
    }
}
