import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";
import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/types/baseModel";

export interface FriendshipRequest extends IBaseModel {
    sender: User;
    recipient: User;
    state: FriendshipRequestState;
}
