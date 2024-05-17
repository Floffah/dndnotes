import { nanoid } from "nanoid";

import { ClientMessageDraft, LinkLike } from "@/client/link";
import { ProtoBuilderRouter } from "@/server";
import {
    FlattenProcedureNames,
    ProcedureFromPath,
    ProcedureType,
    ResponseStatus,
    ServerError,
    SocketMessageType,
    SocketRequestType,
    socketRequestTypeMap,
} from "@/shared";

export interface CreateSRPCClientOptions {
    links: LinkLike[];
}

export function createSRPCClient<Router extends ProtoBuilderRouter<any>>(
    opts: CreateSRPCClientOptions,
) {
    return new SRPCClient<Router>(opts);
}

export class SRPCClient<Router extends ProtoBuilderRouter<any>> {
    public authenticated = false;

    constructor(private opts: CreateSRPCClientOptions) {}

    private async sendRequest<Path extends FlattenProcedureNames<Router>>(
        path: Path,
        type: ProcedureType,
        payload: ProcedureFromPath<Router, Path>,
    ) {
        const id = nanoid();

        const request: ClientMessageDraft = {
            type: "request",
            message: {
                type: SocketMessageType.REQUEST,
                id,
                content: {
                    path: path as string,
                    type: socketRequestTypeMap[type],
                    payload,
                },
            },
            decorations: {},
        };

        for (const link of this.opts.links) {
            if (link.decorateMessage) {
                await link.decorateMessage(request);
            } else if (link.handleMessage) {
                const response = await link.handleMessage(request);

                if (response.type !== SocketMessageType.RESPONSE) {
                    throw new Error(
                        "Expected response but got something else.",
                    );
                }

                if (response.content.status === ResponseStatus.ERROR) {
                    let error = response.content.error;

                    if (!(error instanceof Error)) {
                        error = new ServerError({
                            code: error.code,
                            message: error.message,
                            cause: error,
                        });
                    }

                    throw error;
                }

                return response.content;
            }
        }

        throw new Error(
            "No link was found to handle the request. Are you missing a link that handles the message?",
        );
    }

    public query<Path extends FlattenProcedureNames<Router>>(
        path: Path,
        payload: ProcedureFromPath<Router, Path>,
    ) {
        return this.sendRequest(path, ProcedureType.Query, payload);
    }

    public mutation<Path extends FlattenProcedureNames<Router>>(
        path: Path,
        payload: ProcedureFromPath<Router, Path>,
    ) {
        return this.sendRequest(path, ProcedureType.Mutation, payload);
    }

    public async subscribe<Path extends FlattenProcedureNames<Router>>(
        path: Path,
        payload: ProcedureFromPath<Router, Path>,
    ) {
        const id = nanoid();

        const request: ClientMessageDraft = {
            type: "subscription",
            message: {
                type: SocketMessageType.REQUEST,
                id,
                content: {
                    type: SocketRequestType.SUBSCRIPTION,
                    path,
                    payload,
                },
            },
            decorations: {},
        };

        for (const link of this.opts.links) {
            if (link.decorateMessage) {
                await link.decorateMessage(request);
            } else if (link.handleSubscription) {
                return link.handleSubscription(request);
            }
        }

        throw new Error(
            "No link was found to handle the subscription. Are you missing a link that handles the message?",
        );
    }
}
