import { z } from "zod";

import { LinkLike } from "@/client";
import { SocketMessageType, clientBoundSocketMessage } from "@/shared";

export interface CreateWebSocketLinkOptions {
    /**
     * The URL to connect to. Shouldn't include the protocol. E.g. `localhost:8080`, `localhost:8080/path`
     */
    url: string;
    /**
     * Whether to use secure websockets (wss://) or not (ws://)
     */
    secure?: boolean;
}

export function createWebSocketLink(
    opts: CreateWebSocketLinkOptions,
): LinkLike {
    let secure = opts.secure ?? true;

    if (typeof opts.secure !== "boolean" && opts.url.startsWith("localhost")) {
        secure = false;
    }

    const url = new URL(`${secure ? "wss" : "ws"}://` + opts.url);

    let _ws: WebSocket | null = null;
    let lastMessageSent = Date.now();
    const subscriptionIds: string[] = [];

    async function getSocket() {
        if (_ws) {
            return _ws;
        }

        return new Promise<WebSocket>((resolve) => {
            _ws = new WebSocket(url.toString());

            if (!_ws.readyState) {
                _ws.addEventListener("error", (e) => {
                    console.error("WebSocket error", e);
                });
                _ws.addEventListener("open", () => {
                    resolve(_ws as WebSocket);
                });
            }
        });
    }

    const disconnectInterval = setInterval(() => {
        if (
            subscriptionIds.length === 0 &&
            _ws &&
            Date.now() - lastMessageSent > 10000
        ) {
            _ws.close();
            _ws = null;
        }
    }, 10000);

    return {
        handleAuthRequest(request) {
            return new Promise(async (resolve) => {
                const ws = await getSocket();

                ws.send(
                    JSON.stringify(
                        request.client.transformer.serialize(request.message),
                    ),
                );

                const onMessage = Object.assign(
                    (event: MessageEvent) => {
                        let message: z.infer<typeof clientBoundSocketMessage>;

                        try {
                            message = request.client.transformer.deserialize(
                                JSON.parse(event.data),
                            );
                        } catch (e) {
                            console.debug(
                                "Ignoring unparseable socket message",
                                event,
                                e,
                            );
                            return;
                        }

                        if (message.type === SocketMessageType.AUTH_RESPONSE) {
                            ws.removeEventListener("message", onMessage);
                            resolve(message);
                        }
                    },
                    {
                        request,
                    },
                );

                ws.addEventListener("message", onMessage);
            });
        },
        handleMessage: async (request) => {
            return new Promise(async (resolve) => {
                const ws = await getSocket();

                ws.send(
                    JSON.stringify(
                        request.client.transformer.serialize(request.message),
                    ),
                );

                const onMessage = Object.assign(
                    (event: MessageEvent) => {
                        let message: z.infer<typeof clientBoundSocketMessage>;

                        try {
                            message = request.client.transformer.deserialize(
                                JSON.parse(event.data),
                            );
                        } catch (e) {
                            console.debug(
                                "Ignoring unparseable socket message",
                                event,
                                e,
                            );
                            return;
                        }

                        if (
                            message.type === SocketMessageType.RESPONSE &&
                            message.id === request.message.id
                        ) {
                            ws.removeEventListener("message", onMessage);
                            resolve(message);
                        }
                    },
                    {
                        request,
                    },
                );

                ws.addEventListener("message", onMessage);
            });
        },
        async *handleSubscription(request) {
            const ws = await getSocket();

            ws.send(
                JSON.stringify(
                    request.client.transformer.serialize(request.message),
                ),
            );

            subscriptionIds.push(request.message.id);

            const queue: any[] = [];
            let resolve: (value: void) => void;
            const promise = new Promise((r) => (resolve = r));

            const onMessage = Object.assign(
                (event: MessageEvent) => {
                    let message: z.infer<typeof clientBoundSocketMessage>;

                    try {
                        message = request.client.transformer.deserialize(
                            JSON.parse(event.data),
                        );
                    } catch (e) {
                        console.debug(
                            "Ignoring unparseable socket message",
                            event,
                            e,
                        );
                        return;
                    }

                    if (
                        message.type === SocketMessageType.RESPONSE &&
                        message.id === request.message.id
                    ) {
                        queue.push(message);
                        resolve();
                        return;
                    }
                },
                {
                    request,
                },
            );

            ws.addEventListener("message", onMessage);

            try {
                // infinite loop is broken by running .throw() or .return() on the generator which skips to the finally block
                while (true) {
                    if (queue.length > 0) {
                        yield queue.shift();
                    } else {
                        await promise;
                    }
                }
            } finally {
                subscriptionIds.splice(
                    subscriptionIds.indexOf(request.message.id),
                    1,
                );
                ws.removeEventListener("message", onMessage);
            }
        },
        async close() {
            clearInterval(disconnectInterval);

            if (_ws) {
                _ws.close();
                _ws = null;
            }
        },
    };
}
