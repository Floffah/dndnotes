export enum FriendshipRequestState {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    DENIED = "DENIED", // only used by api, will never be stored in the db. if client sets this state, the record will be deleted.
    DELETED = "DELETED", // same as above, but for the sending user. only exists for readability.
}
