import { resetDatabase } from "./utils/mongo";
import { TRPCTestClient, initTRPCForTesting } from "./utils/trpc";
import { createUser } from "./utils/user";
import { inferProcedureOutput } from "@trpc/server";

import { SESSION_TOKEN } from "@/app/api/lib/storage";
import { Session } from "@/db/models/Session";
import { SessionModel } from "@/db/models/Session/model";
import { User } from "@/db/models/User";
import { UserModel } from "@/db/models/User/model";
import { AppRouter } from "@/server/router";

describe("User", () => {
    describe("Authentication", () => {
        let user1: User;
        let session1: Session;

        beforeAll(async () => {
            await resetDatabase();

            const { user, session } = await createUser(true);
            user1 = user;
            session1 = session;
        });

        describe("Not authenticated", () => {
            let trpc: TRPCTestClient;

            beforeAll(async () => {
                trpc = await initTRPCForTesting({
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
            let trpc: TRPCTestClient;

            beforeAll(async () => {
                trpc = await initTRPCForTesting({
                    headers: new Headers({
                        cookie: `${SESSION_TOKEN}=${session1.token}`,
                    }),
                });
            });

            test("User is authenticated", async () => {
                const response = await trpc.user.me();

                expect(response?.id).toEqual(user1.id);
            });

            test("Sanitizer does not remove email", async () => {
                const response = await trpc.user.me();

                expect(response?.email).toEqual(user1.email);
            });
        });
    });

    describe("Fetching", () => {
        let user1: User;
        let session1: Session;
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
                    const trpc = await initTRPCForTesting({
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

                test("Sanitizer does remove email", () => {
                    expect(userResponse?.email).toBeNull();
                });
            });

            describe("When not authenticated", () => {
                let userResponse: inferProcedureOutput<
                    AppRouter["user"]["get"]
                >;

                beforeAll(async () => {
                    const trpc = await initTRPCForTesting({
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
