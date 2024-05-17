import {
    CreateWebSocketHandlerOptions,
    createNodeWebSocketHandler,
    createProtoBuilder,
} from "../../../../dist/server";
import {
    SocketMessageType,
    clientBoundSocketMessage,
    socketAuthResponse,
    socketConnectionError,
} from "../../../../dist/shared";
import { ServerErrorCode } from "../../../../dist/shared";
import { ResponseStatus } from "../../../../dist/shared";
import { SocketRequestType, socketResponse } from "../../../../dist/shared";
import { createServer } from "http";
import { AddressInfo } from "ws";
import { z } from "zod";

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

function createWebSocketServer(
    opts: Omit<
        CreateWebSocketHandlerOptions<typeof appRouter>,
        "server" | "router" | "createContext"
    >,
) {
    return new Promise<ReturnType<typeof createServer>>((resolve, reject) => {
        const server = createServer();

        createNodeWebSocketHandler({
            ...opts,
            server,
            router: appRouter,
            createContext,
        });

        server.on("listening", () => {
            resolve(server);
        });

        server.on("error", reject);

        server.listen(0);
    });
}

function createTestableWebSocketClient(
    server: ReturnType<typeof createServer>,
) {
    return new Promise<{
        ws: WebSocket;
        getNextMessage: (opts?: {
            condition?: (
                message: z.infer<typeof clientBoundSocketMessage>,
            ) => boolean;
            timeout?: number;
        }) => Promise<z.infer<typeof clientBoundSocketMessage>>;
    }>((resolve, reject) => {
        const address = `ws://localhost:${(server.address() as AddressInfo).port}`;

        const ws = new WebSocket(address);

        function getNextMessage(
            opts: {
                condition?: (
                    message: z.infer<typeof clientBoundSocketMessage>,
                ) => boolean;
                timeout?: number;
            } = {},
        ) {
            return new Promise<z.infer<typeof clientBoundSocketMessage>>(
                (resolve, reject) => {
                    const onMessage = (event: MessageEvent) => {
                        const message = JSON.parse(event.data);

                        if (!opts.condition || opts.condition(message)) {
                            ws.removeEventListener("message", onMessage);
                            resolve(message);
                        }
                    };

                    ws.addEventListener("message", onMessage);

                    if (opts.timeout) {
                        setTimeout(() => {
                            ws.removeEventListener("message", onMessage);
                            reject(new Error("Timeout"));
                        }, opts.timeout);
                    }
                },
            );
        }

        const onError = (event: Event) => {
            ws.close();
            reject(event);
        };

        ws.addEventListener("open", () => {
            ws.removeEventListener("error", onError);
            resolve({ ws, getNextMessage });
        });

        ws.addEventListener("error", onError);
    });
}

describe("Server with no authentication", () => {
    let server: ReturnType<typeof createServer>;

    beforeAll(async () => {
        server = await createWebSocketServer({});
    });

    test("Open a connection", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.ws.close();
    });

    test("Send a non-json message", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.ws.send("test");

        const nextMessage = (await ws.getNextMessage({
            timeout: 1000,
        })) as z.infer<typeof socketConnectionError>;

        expect(nextMessage.content.error.code).toBe(
            ServerErrorCode.BAD_REQUEST,
        );

        ws.ws.close();
    });

    test("Send an invalid message", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.ws.send(JSON.stringify({ type: "invalid" }));

        const nextMessage = (await ws.getNextMessage({
            timeout: 1000,
        })) as z.infer<typeof socketConnectionError>;

        expect(nextMessage.content.error.code).toBe(
            ServerErrorCode.BAD_REQUEST,
        );

        ws.ws.close();
    });

    test("Execute an auth-dependent procedure", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.ws.send(
            JSON.stringify({
                type: SocketMessageType.REQUEST,
                id: "1",
                content: {
                    type: SocketRequestType.QUERY,
                    path: "user.me",
                },
            }),
        );

        const nextMessage = (await ws.getNextMessage({
            timeout: 1000,
        })) as z.infer<typeof socketResponse>;

        expect(nextMessage.content.status).toBe(ResponseStatus.OK);
        expect(
            nextMessage.content.status === ResponseStatus.OK &&
                nextMessage.content.payload,
        ).toEqual(null);

        ws.ws.close();
    });

    afterAll(() => {
        server.close();
    });
});

describe("Server with required authentication", () => {
    let server: ReturnType<typeof createServer>;

    beforeAll(async () => {
        server = await createWebSocketServer({
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

        ws.ws.close();
    });

    test("Connect with invalid authentication payload shape", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.ws.send(
            JSON.stringify({
                type: SocketMessageType.AUTH_REQUEST,
                content: {
                    invalid: "shape",
                },
            }),
        );

        const nextMessage = (await ws.getNextMessage({
            timeout: 1000,
        })) as z.infer<typeof socketAuthResponse> & {
            status: ResponseStatus.ERROR;
        };

        expect(nextMessage.status).toBe(ResponseStatus.ERROR);
        expect(nextMessage.error.code).toBe(ServerErrorCode.UNAUTHORIZED);

        ws.ws.close();
    });

    test("Connect with incorrect authentication payload", async () => {
        const ws = await createTestableWebSocketClient(server);

        ws.ws.send(
            JSON.stringify({
                type: SocketMessageType.AUTH_REQUEST,
                content: "incorrect",
            }),
        );

        const nextMessage = (await ws.getNextMessage({
            timeout: 1000,
        })) as z.infer<typeof socketAuthResponse> & {
            status: ResponseStatus.ERROR;
        };

        expect(nextMessage.status).toBe(ResponseStatus.ERROR);
        expect(nextMessage.error.code).toBe(ServerErrorCode.UNAUTHORIZED);

        ws.ws.close();
    });

    describe("Connect with correct authentication payload", () => {
        let ws: Awaited<ReturnType<typeof createTestableWebSocketClient>>;

        beforeAll(async () => {
            ws = await createTestableWebSocketClient(server);
        });

        test("Authenticate", async () => {
            ws.ws.send(
                JSON.stringify({
                    type: SocketMessageType.AUTH_REQUEST,
                    content: "Bearer test",
                }),
            );

            const nextMessage = (await ws.getNextMessage({
                timeout: 1000,
            })) as z.infer<typeof socketAuthResponse>;

            expect(nextMessage.type).toBe(SocketMessageType.AUTH_RESPONSE);
            expect(nextMessage.status).toBe(ResponseStatus.OK);
        });

        test("Attempt to authenticate again", async () => {
            ws.ws.send(
                JSON.stringify({
                    type: SocketMessageType.AUTH_REQUEST,
                    content: "Bearer test",
                }),
            );

            const nextMessage = (await ws.getNextMessage({
                timeout: 1000,
            })) as z.infer<typeof socketAuthResponse> & {
                status: ResponseStatus.ERROR;
            };

            expect(nextMessage.status).toBe(ResponseStatus.ERROR);
            expect(nextMessage.error.code).toBe(ServerErrorCode.BAD_REQUEST);
        });

        test("Execute an auth-dependent procedure", async () => {
            ws.ws.send(
                JSON.stringify({
                    type: SocketMessageType.REQUEST,
                    id: "1",
                    content: {
                        type: SocketRequestType.QUERY,
                        path: "user.me",
                    },
                }),
            );

            const nextMessage = (await ws.getNextMessage({
                timeout: 1000,
            })) as z.infer<typeof socketResponse>;

            expect(nextMessage.content.status).toBe(ResponseStatus.OK);
            expect(
                nextMessage.content.status === ResponseStatus.OK &&
                    nextMessage.content.payload,
            ).toEqual({ id: 1 });
        });

        afterAll(() => {
            ws.ws.close();
        });
    });

    afterAll(() => {
        server.close();
    });
});
