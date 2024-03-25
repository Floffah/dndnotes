export enum FriendshipRequestError {
    NOT_FOUND = "Friendship request not found",
    CANNOT_VIEW_OTHERS_PENDING = "Cannot view other users' pending friend requests",
    CANNOT_SEND_TO_SELF = "Cannot send a friend request to yourself",
    CANNOT_ACCEPT_OTHERS = "Cannot accept a request that was not sent to you",
    CANNOT_DENY_OTHERS = "Cannot deny a request that was not sent to you",
    CANNOT_DELETE_OTHERS = "Cannot delete a request that you did not send",
    CANNOT_SET_TO_PENDING = "Cannot set a friend request to pending",
    REQUEST_ALREADY_SENT = "Friend request already sent",
    BAD_INPUT = "Bad input",
}
