import { resetDatabase } from "./utils/mongo";
import { createUser } from "./utils/user";
import { inferProcedureOutput } from "@trpc/server";
import { UserSession } from "src/db/models/UserSession";

import { trpc } from "@/app/api/lib/client/trpc";
import { SESSION_TOKEN } from "@/app/api/lib/storage";
import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";
import { FriendshipRequest } from "@/db/models/FriendshipRequest";
import { FriendshipRequestError } from "@/db/models/FriendshipRequest/error";
import { FriendshipRequestModel } from "@/db/models/FriendshipRequest/model";
import { User } from "@/db/models/User";
import {
    TRPCServerCaller,
    createTRPCServerCaller,
} from "@/server/lib/createTRPCServerCaller";
import { AppRouter } from "@/server/router";

describe("User", () => {
    describe("Authentication", () => {
        let user1: User;
        let session1: UserSession;

        beforeAll(async () => {
            await resetDatabase();

            const { user, session } = await createUser(true);
            user1 = user;
            session1 = session;
        });

        describe("Not authenticated", () => {
            let trpc: TRPCServerCaller;

            beforeAll(async () => {
                trpc = await createTRPCServerCaller({
                    headers: new Headers({
                        cookie: "",
                    }),
                });
            });

            test("User is not authenticated", async () => {
                const response = await trpc.user.me();
                expect(response).toEqual(null);
            });
        });

        describe("Authenticated", () => {
            let trpc: TRPCServerCaller;

            beforeAll(async () => {
                trpc = await createTRPCServerCaller({
                    headers: new Headers({
                        cookie: `${SESSION_TOKEN}=${session1.token}`,
                    }),
                });
            });

            test("User is authenticated", async () => {
                const response = await trpc.user.me();

                expect(response?.id).toEqual(user1.id);
            });

            test("API does expose email", async () => {
                const response = await trpc.user.me();

                expect(response?.email).toEqual(user1.email);
            });
        });
    });

    describe("Fetching", () => {
        let user1: User;
        let session1: UserSession;
        let user2: User;

        beforeAll(async () => {
            await resetDatabase();

            const { user, session } = await createUser(true);
            user1 = user;
            session1 = session;

            const { user: _user2 } = await createUser(false);
            user2 = _user2;
        });

        describe("Fetching user by ID", () => {
            describe("When authenticated", () => {
                let userResponse: inferProcedureOutput<
                    AppRouter["user"]["get"]
                >;

                beforeAll(async () => {
                    const trpc = await createTRPCServerCaller({
                        headers: new Headers({
                            cookie: `${SESSION_TOKEN}=${session1.token}`,
                        }),
                    });

                    userResponse = await trpc.user.get({
                        id: user2.id,
                    });
                });

                test("User is returned", () => {
                    expect(userResponse?.id).toEqual(user2.id);
                });

                test("API does not expose email", () => {
                    expect(userResponse?.email).not.toEqual(user2.email);
                });
            });

            describe("When not authenticated", () => {
                let userResponse: inferProcedureOutput<
                    AppRouter["user"]["get"]
                >;

                beforeAll(async () => {
                    const trpc = await createTRPCServerCaller({
                        headers: new Headers({
                            cookie: "",
                        }),
                    });

                    userResponse = await trpc.user.get({
                        id: user2.id,
                    });
                });

                test("User is returned", () => {
                    expect(userResponse?.id).toEqual(user2.id);
                });

                test("Sanitizer does remove email", () => {
                    expect(userResponse?.email).toBeNull();
                });
            });
        });
    });
});

describe("Friends", () => {
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
            trpc = await createTRPCServerCaller({
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
            trpcUser1 = await createTRPCServerCaller({
                headers: new Headers({
                    cookie: `${SESSION_TOKEN}=${session1.token}`,
                }),
            });
            trpcUser2 = await createTRPCServerCaller({
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
});
