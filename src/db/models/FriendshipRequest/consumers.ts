import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";
import { isPopulated } from "@/db/lib/isPopulated";
import { FriendshipRequest } from "@/db/models/FriendshipRequest/index";
import { User } from "@/db/models/User";
import { UserAPIModel } from "@/db/models/User/consumers";
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

        this.recipient = isPopulated(friendshipRequest.recipient)
            ? new UserAPIModel(friendshipRequest.recipient, ctx)
            : null!;
        this.sender = isPopulated(friendshipRequest.sender)
            ? new UserAPIModel(friendshipRequest.sender, ctx)
            : null!;
        this.state = friendshipRequest.state;
    }
}
