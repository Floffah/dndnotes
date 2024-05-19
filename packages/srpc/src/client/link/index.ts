import { z } from "zod";

import { SRPCClient } from "@/client";
import {
    MaybePromise,
    socketAuthRequest,
    socketAuthResponse,
    socketRequest,
    socketResponse,
} from "@/shared";

export type ClientMessageAuthRequestDraft = {
    message: z.infer<typeof socketAuthRequest>;
    decorations: any;
    client: SRPCClient<any>;
};

export type ClientMessageRequestDraft = {
    message: z.infer<typeof socketRequest>;
    decorations: any;
    client: SRPCClient<any>;
};

export type ClientMessageSubscriptionDraft = {
    message: z.infer<typeof socketRequest>;
    decorations: any;
    client: SRPCClient<any>;
};

export interface LinkLike {
    /**
     * Implement this to modify an authentication request before it is sent. More links will be called after this.
     */
    decorateAuthRequest?(
        request: ClientMessageAuthRequestDraft,
    ): MaybePromise<void>;

    /**
     * Implement this to modify a message before it is sent. More links will be called after this.
     */
    decorateMessage?(request: ClientMessageRequestDraft): MaybePromise<void>;

    /**
     * Implement this to modify a subscription request before it is sent. More links will be called after this.
     */
    decorateSubscription?(
        request: ClientMessageSubscriptionDraft,
    ): MaybePromise<void>;

    /**
     * Implement this to handle an authentication request. No further links will be called after this.
     */
    handleAuthRequest?(
        request: ClientMessageAuthRequestDraft,
    ): MaybePromise<z.infer<typeof socketAuthResponse>>;

    /**
     * Implement this to handle sending the message. No further links will be called after this.
     */
    handleMessage?(
        request: ClientMessageRequestDraft,
    ): MaybePromise<z.infer<typeof socketResponse>>;

    /**
     * Implement this to handle a subscription. No further links will be called after this.
     * This should return an async generator that yields messages when they are received.
     */
    handleSubscription?(
        request: ClientMessageSubscriptionDraft,
    ): AsyncGenerator<z.infer<typeof socketResponse>, void>;

    /**
     * Effectively a destructor. Implement this to clean up any resources when the link is removed.
     */
    close?(opts: { client: SRPCClient<any> }): MaybePromise<void>;
}

export * from "./ws";
