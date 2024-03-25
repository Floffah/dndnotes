import { SESSION_TOKEN } from "@dndnotes/lib";
import {
    FriendshipRequest,
    FriendshipRequestState,
    User,
    UserSession,
} from "@dndnotes/models";

import {
    TRPCServerCaller,
    createBackendCaller,
} from "@/lib/createBackendCaller";
import { FriendshipRequestModel } from "@/models/FriendshipRequestModel";
import { resetDatabase } from "@/tests/utils/mongo";
import { createUser } from "@/tests/utils/user";

let user1: User;
let session1: UserSession;
let user2: User;
let session2: UserSession;

beforeAll(async () => {
    await resetDatabase();

    const { user: _user1, session: _session1 } = await createUser(true);
    user1 = _user1;
    session1 = _session1;

    const { user: _user2, session: _session2 } = await createUser(true);
    user2 = _user2;
    session2 = _session2;
});

describe("No friends", () => {
    let trpc: TRPCServerCaller;

    beforeAll(async () => {
        trpc = await createBackendCaller({
            headers: new Headers({
                cookie: `${SESSION_TOKEN}=${session1.token}`,
            }),
        });
    });

    test("User has no pending requests", async () => {
        const friends = await trpc.user.friends.getPending({
            to: user1.id,
        });

        expect(friends).toEqual([]);
    });

    test("User has no friends", async () => {
        const friends = await trpc.user.friends.getAccepted({
            user: user1.id,
        });

        expect(friends).toEqual([]);
    });
});

describe("Other user sends friend request", () => {
    let trpcUser1: TRPCServerCaller;
    let trpcUser2: TRPCServerCaller;
    let request: FriendshipRequest;

    beforeAll(async () => {
        trpcUser1 = await createBackendCaller({
            headers: new Headers({
                cookie: `${SESSION_TOKEN}=${session1.token}`,
            }),
        });
        trpcUser2 = await createBackendCaller({
            headers: new Headers({
                cookie: `${SESSION_TOKEN}=${session2.token}`,
            }),
        });
    });

    beforeEach(async () => {
        if (request) {
            await FriendshipRequestModel.findByIdAndDelete(request.id);
        }

        request = await trpcUser2.user.friends.sendRequest({
            to: {
                id: user1.id,
            },
        });
    });

    test("Accept friend request", async () => {
        await trpcUser1.user.friends.updateRequest({
            id: request.id,
            state: FriendshipRequestState.ACCEPTED,
        });

        const friends = await trpcUser1.user.friends.getAccepted({
            user: user1.id,
        });

        expect(friends).toHaveLength(1);
        expect(friends[0].sender.id).toEqual(user2.id);
    });

    test("Accept friend request sent to another user", () => {
        return expect(
            trpcUser2.user.friends.updateRequest({
                id: request.id,
                state: FriendshipRequestState.ACCEPTED,
            }),
        ).rejects.toMatchSnapshot();
    });

    test("Reject friend request", async () => {
        await trpcUser1.user.friends.updateRequest({
            id: request.id,
            state: FriendshipRequestState.DENIED,
        });

        const friends = await trpcUser1.user.friends.getAccepted({
            user: user1.id,
        });

        expect(friends).toEqual([]);

        const friendshipRequest = await FriendshipRequestModel.findById(
            request.id,
        );

        expect(friendshipRequest).toBeNull();
    });

    test("Reject friend request sent to another user", () => {
        return expect(
            trpcUser2.user.friends.updateRequest({
                id: request.id,
                state: FriendshipRequestState.DENIED,
            }),
        ).rejects.toMatchSnapshot();
    });

    test("Delete friend request", async () => {
        await trpcUser2.user.friends.updateRequest({
            id: request.id,
            state: FriendshipRequestState.DELETED,
        });

        const friends = await trpcUser1.user.friends.getAccepted({
            user: user1.id,
        });

        expect(friends).toEqual([]);

        const friendshipRequest = await FriendshipRequestModel.findById(
            request.id,
        );

        expect(friendshipRequest).toBeNull();
    });

    test("Delete friend request current user did not send", () => {
        return expect(
            trpcUser1.user.friends.updateRequest({
                id: request.id,
                state: FriendshipRequestState.DELETED,
            }),
        ).rejects.toMatchSnapshot();
    });
});
