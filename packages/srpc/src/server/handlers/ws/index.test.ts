import { createProtoBuilder } from "../../../../dist/server";
import {
    ResponseStatus,
    ServerErrorCode,
    SocketMessageType,
    SocketRequestType,
    socketAuthResponse,
    socketConnectionError,
    socketResponse,
} from "../../../../dist/shared";
import { createServer } from "http";
import { z } from "zod";

import {
    createTestableSRPCServer,
    createTestableWebSocketClient,
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

describe("Server with no authentication", () => {
    let server: ReturnType<typeof createServer>;

    beforeAll(async () => {
        server = await createTestableSRPCServer({
            router: appRouter,
            createContext,
        });
    });

    test("Open a connection", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.socket.close();
    });

    test("Send a non-json message", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.socket.send("test");

        const nextMessage = (await ws.getNextMessage()) as z.infer<
            typeof socketConnectionError
        >;

        expect(nextMessage.content.error.code).toBe(
            ServerErrorCode.BAD_REQUEST,
        );

        ws.socket.close();
    });

    test("Send an invalid message", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.socket.send(JSON.stringify({ type: "invalid" }));

        const nextMessage = (await ws.getNextMessage()) as z.infer<
            typeof socketConnectionError
        >;

        expect(nextMessage.content.error.code).toBe(
            ServerErrorCode.BAD_REQUEST,
        );

        ws.socket.close();
    });

    test("Execute an auth-dependent procedure", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.socket.send(
            JSON.stringify({
                type: SocketMessageType.REQUEST,
                id: "1",
                content: {
                    type: SocketRequestType.QUERY,
                    path: "user.me",
                },
            }),
        );

        const nextMessage = (await ws.getNextMessage()) as z.infer<
            typeof socketResponse
        >;

        expect(nextMessage.content.status).toBe(ResponseStatus.OK);
        expect(
            nextMessage.content.status === ResponseStatus.OK &&
                nextMessage.content.payload,
        ).toEqual(null);

        ws.socket.close();
    });

    afterAll(() => {
        server.close();
    });
});

describe("Server with required authentication", () => {
    let server: ReturnType<typeof createServer>;

    beforeAll(async () => {
        server = await createTestableSRPCServer({
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

    test("Connect without authenticating", async () => {
        const ws = await createTestableWebSocketClient(server);

        const nextMessage = (await ws.getNextMessage()) as z.infer<
            typeof socketConnectionError
        >;

        expect(nextMessage.content.error.message).toBe(
            "Authentication timeout",
        );

        ws.socket.close();
    });

    test("Connect with invalid authentication payload shape", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.socket.send(
            JSON.stringify({
                type: SocketMessageType.AUTH_REQUEST,
                content: {
                    invalid: "shape",
                },
            }),
        );

        const nextMessage = (await ws.getNextMessage()) as z.infer<
            typeof socketAuthResponse
        > & {
            status: ResponseStatus.ERROR;
        };

        expect(nextMessage.status).toBe(ResponseStatus.ERROR);
        expect(nextMessage.error.code).toBe(ServerErrorCode.UNAUTHORIZED);

        ws.socket.close();
    });

    test("Connect with incorrect authentication payload", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.socket.send(
            JSON.stringify({
                type: SocketMessageType.AUTH_REQUEST,
                content: "incorrect",
            }),
        );

        const nextMessage = (await ws.getNextMessage()) as z.infer<
            typeof socketAuthResponse
        > & {
            status: ResponseStatus.ERROR;
        };

        expect(nextMessage.status).toBe(ResponseStatus.ERROR);
        expect(nextMessage.error.code).toBe(ServerErrorCode.UNAUTHORIZED);

        ws.socket.close();
    });

    describe("Connect with correct authentication payload", () => {
        let ws: Awaited<ReturnType<typeof createTestableWebSocketClient>>;

        beforeAll(async () => {
            ws = await createTestableWebSocketClient(server);
        });

        test("Authenticate", async () => {
            ws.socket.send(
                JSON.stringify({
                    type: SocketMessageType.AUTH_REQUEST,
                    content: "Bearer test",
                }),
            );

            const nextMessage = (await ws.getNextMessage()) as z.infer<
                typeof socketAuthResponse
            >;

            expect(nextMessage.type).toBe(SocketMessageType.AUTH_RESPONSE);
            expect(nextMessage.status).toBe(ResponseStatus.OK);
        });

        test("Attempt to authenticate again", async () => {
            ws.socket.send(
                JSON.stringify({
                    type: SocketMessageType.AUTH_REQUEST,
                    content: "Bearer test",
                }),
            );

            const nextMessage = (await ws.getNextMessage()) as z.infer<
                typeof socketAuthResponse
            > & {
                status: ResponseStatus.ERROR;
            };

            expect(nextMessage.status).toBe(ResponseStatus.ERROR);
            expect(nextMessage.error.code).toBe(ServerErrorCode.BAD_REQUEST);
        });

        test("Execute an auth-dependent procedure", async () => {
            ws.socket.send(
                JSON.stringify({
                    type: SocketMessageType.REQUEST,
                    id: "1",
                    content: {
                        type: SocketRequestType.QUERY,
                        path: "user.me",
                    },
                }),
            );

            const nextMessage = (await ws.getNextMessage()) as z.infer<
                typeof socketResponse
            >;

            expect(nextMessage.content.status).toBe(ResponseStatus.OK);
            expect(
                nextMessage.content.status === ResponseStatus.OK &&
                    nextMessage.content.payload,
            ).toEqual({ id: 1 });
        });

        afterAll(() => {
            ws.socket.close();
        });
    });

    afterAll(() => {
        server.close();
    });
});
