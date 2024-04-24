import { ProtoBuilderRouter } from "@/server";
import { MaybePromise } from "@/shared";

export interface CreateWebSocketHandlerOptions<
    Router extends ProtoBuilderRouter<any>,
> {
    router: Router;
    createContext: (
        socket: WebSocketHandle,
    ) => MaybePromise<Router["_defs"]["context"]>;
}

export interface WebSocketHandle {
    send: (data: string) => void;
    close: (code?: number, reason?: string) => void;
    onMessage: (cb: (data: string) => void) => void;
    onClose: (cb: (code: number, reason?: any) => void) => void;
}

export * from "./node";
export * from "./connection";
export * from "./handler";
