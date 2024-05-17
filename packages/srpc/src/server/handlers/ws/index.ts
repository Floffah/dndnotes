import { ProtoBuilderRouter } from "@/server";
import { MaybePromise } from "@/shared";

export interface CreateWebSocketHandlerOptions<
    Router extends ProtoBuilderRouter<any>,
> {
    router: Router;
    /**
     * Create a context object for the connection.
     * This will be called twice, once for the initial connection and once for the authentication request.
     */
    createContext: (opts: {
        socket: WebSocketHandle;
        authInput?: Router["_defs"]["authInput"];
    }) => MaybePromise<Router["_defs"]["context"]>;
    authentication?: {
        required?: boolean;
        timeout?: number;
        /**
         * Note that when authentication.handler is set, both this AND createContext are called on authentication request.
         * This should only be used for validation.
         */
        handler?: (opts: {
            socket: WebSocketHandle;
            input: Router["_defs"]["authInput"];
        }) => MaybePromise<boolean>;
    };
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
