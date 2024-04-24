import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";

import {
    CreateWebSocketHandlerOptions,
    ProtoBuilderRouter,
    WebSocketHandle,
    WebSocketHandler,
} from "@/server";

function wrapWebSocket(socket: WebSocket): WebSocketHandle {
    return {
        close: (code?: number, reason?: string) => socket.close(code, reason),
        send: (data: string) => socket.send(data),
        onMessage: (cb: (data: string) => void) => {
            socket.on("message", cb);
        },
        onClose: (cb: (code: number, reason: string) => void) => {
            socket.on("close", cb);
        },
    };
}

export function createNodeWebSocketHandler<
    Router extends ProtoBuilderRouter<any>,
>(
    opts: CreateWebSocketHandlerOptions<Router> & {
        server: Server;
        path?: string;
    },
) {
    const handler = new WebSocketHandler<Router>(opts);

    const ws = new WebSocketServer({
        server: opts.server,
        path: opts.path,
    });

    ws.on("connection", (socket) =>
        handler.handleConnection(wrapWebSocket(socket)),
    );

    return { ws, handler };
}
