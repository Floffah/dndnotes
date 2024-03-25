import { SESSION_TOKEN } from "@dndnotes/lib";
import { User, UserSession } from "@dndnotes/models";

import {
    TRPCServerCaller,
    createBackendCaller,
} from "@/lib/createBackendCaller";
import { resetDatabase } from "@/tests/utils/mongo";
import { createUser } from "@/tests/utils/user";

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
            trpc = await createBackendCaller({
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
            trpc = await createBackendCaller({
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
            let userResponse: User | null;

            beforeAll(async () => {
                const trpc = await createBackendCaller({
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
            let userResponse: User | null;

            beforeAll(async () => {
                const trpc = await createBackendCaller({
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
