import {
    CreateWebSocketHandlerOptions,
    ProtoBuilderRouter,
    WebSocketConnection,
    WebSocketHandle,
} from "@/server";
import { defaultTransformer } from "@/shared";

export class WebSocketHandler<Router extends ProtoBuilderRouter<any>> {
    connections: WebSocketConnection<Router>[] = [];
    transformer = defaultTransformer;

    constructor(public opts: CreateWebSocketHandlerOptions<Router>) {}

    async handleConnection(socket: WebSocketHandle) {
        const connection = new WebSocketConnection<Router>(this, socket);
        this.connections.push(connection);
        await connection.open();

        socket.onClose(() => {
            connection.cleanup();
            this.connections = this.connections.filter((c) => c !== connection);
        });
    }
}
