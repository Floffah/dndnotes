import { FriendshipRequestState } from "@/enums/FriendshipRequestState";
import { User } from "@/models/User";
import { IBaseModel } from "@/types/baseModel";

export interface FriendshipRequest extends IBaseModel {
    sender: User;
    recipient: User;
    state: FriendshipRequestState;
}
