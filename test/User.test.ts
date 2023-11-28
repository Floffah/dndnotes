import { TRPCTestClient, initTRPCForTesting } from "./utils/trpc";

import { SESSION_TOKEN } from "@/app/api/lib/storage";
import { Session } from "@/db/models/Session";
import { SessionModel } from "@/db/models/Session/model";
import { User } from "@/db/models/User";
import { UserModel } from "@/db/models/User/model";

describe("User", () => {
    describe("Authentication", () => {
        let user1: User;
        let session1: Session;

        beforeAll(async () => {
            user1 = await UserModel.create({
                name: "TestUser",
                email: "example@example.com",
            });

            session1 = await SessionModel.create({
                user: user1,
                token: "abc123",
                expiresAt: new Date(Date.now() + 1000 * 60),
            });
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

                expect({
                    id: response?.id,
                    name: response?.name,
                    email: response?.email,
                }).toMatchObject({
                    id: user1.id,
                    name: user1.name,
                    email: user1.email,
                });
            });
        });
    });
});
