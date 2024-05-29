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

    let _currentSocket: WebSocket | null = null;
    let lastMessageSent = Date.now();
    const subscriptionIds: string[] = [];

    async function getSocket() {
        if (_currentSocket) {
            return _currentSocket;
        }

        return new Promise<WebSocket>((resolve, reject) => {
            _currentSocket = new WebSocket(url.toString());

            if (!_currentSocket.readyState) {
                _currentSocket.addEventListener("error", (e) => {
                    reject(e);
                });
                _currentSocket.addEventListener("open", () => {
                    resolve(_currentSocket as WebSocket);
                });
            } else {
                resolve(_currentSocket);
            }
        });
    }

    // TODO: implement socket reconnection
    // const disconnectInterval = setInterval(() => {
    //     if (
    //         subscriptionIds.length === 0 &&
    //         _currentSocket &&
    //         Date.now() - lastMessageSent > 10000
    //     ) {
    //         _currentSocket.close();
    //         _currentSocket = null;
    //     }
    // }, 10000);

    return {
        handleAuthRequest(request) {
            return new Promise(async (resolve) => {
                const ws = await getSocket();

                ws.send(
                    JSON.stringify(
                        request.client.transformer.serialize(request.message),
                    ),
                );
                lastMessageSent = Date.now();

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
                lastMessageSent = Date.now();

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
            lastMessageSent = Date.now();

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
            // clearInterval(disconnectInterval);

            subscriptionIds.splice(0, subscriptionIds.length);

            if (_currentSocket) {
                _currentSocket.close();
                _currentSocket = null;
            }
        },
    };
}
