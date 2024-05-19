import { createProtoBuilder } from "../../../dist/server";
import { z } from "zod";

import {
    createTestableSRPCClient,
    createTestableSRPCServer,
} from "@/testUtils/ws";

const createContext = async ({ authInput }: any) => {
    if (!authInput) {
        return {
            user: null,
        };
    }

    return {
        user: {
            id: 1,
        },
    };
};

const { router, procedure } = createProtoBuilder()
    .context<Awaited<ReturnType<typeof createContext>>>()
    .authInput(z.string());

const appRouter = router({
    user: router({
        me: procedure().query(async (opts) => {
            return opts.ctx.user;
        }),
    }),
});
type AppRouter = typeof appRouter;

describe("Test WebSocket link", () => {
    let wss: Awaited<ReturnType<typeof createTestableSRPCServer>>;

    beforeAll(async () => {
        wss = await createTestableSRPCServer({
            router: appRouter,
            createContext,
            authentication: {
                required: true,
                timeout: 1000,
                handler: (opts) => {
                    return opts.input === "Bearer test";
                },
            },
        });
    });

    test("Authenticate with no payload", async () => {
        const client = createTestableSRPCClient({
            server: wss,
        });

        // @ts-ignore
        await expect(() => client.authenticate()).rejects.toThrow();

        await client.close();
    });

    test("Authenticate with invalid payload", async () => {
        const client = createTestableSRPCClient({
            server: wss,
        });

        await expect(() =>
            client.authenticate({
                token: "Bearer invalid",
            }),
        ).rejects.toThrow();

        await client.close();
    });

    test("Authenticate with valid payload", async () => {
        const client = createTestableSRPCClient<AppRouter>({
            server: wss,
        });

        await client.authenticate("Bearer test");

        await client.close();
    });

    afterAll(() => {
        wss.close();
    });
});
