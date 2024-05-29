import { LinkLike, createWebSocketLink } from "../../dist/client";
import { SRPCClient } from "../../dist/client";
import {
    CreateWebSocketHandlerOptions,
    ProtoBuilderRouter,
    createNodeWebSocketHandler,
} from "../../dist/server";
import {
    clientBoundSocketMessage,
    serverBoundSocketMessage,
} from "../../dist/shared";
import { createServer } from "http";
import { AddressInfo, WebSocketServer } from "ws";
import { z } from "zod";

export function createTestableSRPCServer<
    Router extends ProtoBuilderRouter<any, any>,
>(opts: Omit<CreateWebSocketHandlerOptions<Router>, "server">) {
    return new Promise<ReturnType<typeof createServer>>((resolve, reject) => {
        const server = createServer();

        createNodeWebSocketHandler({
            ...opts,
            server,
        });

        server.on("listening", () => {
            resolve(server);
        });

        server.on("error", reject);

        server.listen(0);
    });
}

interface GetNextWebSocketServerMessageOptions {
    condition?: (message: z.infer<typeof serverBoundSocketMessage>) => boolean;
}

export function createTestableWebSocketServer() {
    return new Promise<{
        server: ReturnType<typeof createServer>;
        getNextMessage: (
            opts?: GetNextWebSocketServerMessageOptions,
        ) => Promise<z.infer<typeof serverBoundSocketMessage>>;
    }>((resolve, reject) => {
        const server = createServer();
        const wss = new WebSocketServer({ server });

        const onMessageHandlers: Array<
            (message: z.infer<typeof serverBoundSocketMessage>) => void
        > = [];

        wss.on("connection", (socket) => {
            socket.on("message", (data) => {
                const message = JSON.parse(data.toString());
                onMessageHandlers.forEach((handler) => handler(message));
            });
        });

        function getNextMessage(
            opts: GetNextWebSocketServerMessageOptions = {},
        ) {
            return new Promise<z.infer<typeof serverBoundSocketMessage>>(
                (resolve, reject) => {
                    onMessageHandlers.push((message) => {
                        if (!opts.condition || opts.condition(message)) {
                            resolve(message);
                        }
                    });
                },
            );
        }

        server.on("listening", () => {
            resolve({
                server,
                getNextMessage,
            });
        });
        server.on("error", reject);
        wss.on("error", reject);

        server.listen(0);
    });
}

interface GetNextWebSocketClientMessageOptions {
    condition?: (message: z.infer<typeof clientBoundSocketMessage>) => boolean;
}

export function createTestableWebSocketClient(
    server: ReturnType<typeof createServer>,
) {
    return new Promise<{
        socket: WebSocket;
        getNextMessage: (
            opts?: GetNextWebSocketClientMessageOptions,
        ) => Promise<z.infer<typeof clientBoundSocketMessage>>;
    }>((resolve, reject) => {
        const address = `ws://localhost:${(server.address() as AddressInfo).port}`;

        const ws = new WebSocket(address);

        function getNextMessage(
            opts: GetNextWebSocketClientMessageOptions = {},
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
                },
            );
        }

        const onError = (event: Event) => {
            ws.close();
            reject(event);
        };

        ws.addEventListener("open", () => {
            ws.removeEventListener("error", onError);
            resolve({ socket: ws, getNextMessage });
        });

        ws.addEventListener("error", onError);
    });
}

export function createTestableSRPCClient<
    Router extends ProtoBuilderRouter<any, any>,
>(opts: {
    server: ReturnType<typeof createServer>;
    links?: (opts: { url: string }) => LinkLike[];
}) {
    const url = `localhost:${(opts.server.address() as AddressInfo).port}`;

    return new SRPCClient<Router>({
        links: opts.links
            ? opts.links({ url })
            : [createWebSocketLink({ url })],
    });
}
