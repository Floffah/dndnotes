import { z } from "zod";

import {
    MaybePromise,
    clientBoundSocketMessage,
    serverBoundSocketMessage,
} from "@/shared";

export type ClientMessageDraft = {
    type: "request" | "subscription";
    message: z.infer<typeof serverBoundSocketMessage>;
    decorations: any;
};

export interface LinkLike {
    /**
     * Implement this to modify the message before it is sent. More links will be called after this.
     */
    decorateMessage?(request: ClientMessageDraft): MaybePromise<void>;

    /**
     * Implement this to handle sending the message. No further links will be called after this.
     */
    handleMessage?(
        request: ClientMessageDraft,
    ): MaybePromise<z.infer<typeof clientBoundSocketMessage>>;

    /**
     * Implement this to handle a subscription. No further links will be called after this.
     * This should return an async generator that yields messages when they are received.
     */
    handleSubscription?(
        request: ClientMessageDraft,
    ): AsyncGenerator<z.infer<typeof clientBoundSocketMessage>, void>;
}
