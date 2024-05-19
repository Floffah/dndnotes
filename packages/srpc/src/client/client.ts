import { nanoid } from "nanoid";

import {
    ClientMessageAuthRequestDraft,
    ClientMessageRequestDraft,
    ClientMessageSubscriptionDraft,
    LinkLike,
} from "@/client/link";
import { InferInput, ProtoBuilderRouter } from "@/server";
import {
    FlattenProcedureNames,
    ProcedureFromPath,
    ProcedureType,
    ResponseStatus,
    ServerError,
    SocketMessageType,
    SocketRequestType,
    TransformerLike,
    defaultTransformer,
    deserializeError,
    isSerializedError,
    socketRequestTypeMap,
} from "@/shared";

export interface CreateSRPCClientOptions {
    links: LinkLike[];
    transformer?: TransformerLike;
}

export function createSRPCClient<Router extends ProtoBuilderRouter<any>>(
    opts: CreateSRPCClientOptions,
) {
    return new SRPCClient<Router>(opts);
}

export class SRPCClient<Router extends ProtoBuilderRouter<any>> {
    public authenticated = false;

    public transformer: TransformerLike;

    constructor(private opts: CreateSRPCClientOptions) {
        this.transformer = opts.transformer ?? defaultTransformer;
    }

    private async sendRequest<Path extends FlattenProcedureNames<Router>>(
        path: Path,
        type: ProcedureType,
        payload: ProcedureFromPath<Router, Path>,
    ) {
        const id = nanoid();

        const request: ClientMessageRequestDraft = {
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
            client: this,
        };

        for (const link of this.opts.links) {
            if (link.decorateMessage) {
                await link.decorateMessage(request);
            }
            if (link.handleMessage) {
                const response = await link.handleMessage(request);

                if (response.type !== SocketMessageType.RESPONSE) {
                    throw new Error(
                        "Expected response but got something else.",
                    );
                }

                if (response.content.status === ResponseStatus.ERROR) {
                    let error = response.content.error;

                    if (isSerializedError(error)) {
                        error = deserializeError(error);
                    } else if (!(error instanceof Error)) {
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
        return this.sendRequest(path, ProcedureType.QUERY, payload);
    }

    public mutation<Path extends FlattenProcedureNames<Router>>(
        path: Path,
        payload: ProcedureFromPath<Router, Path>,
    ) {
        return this.sendRequest(path, ProcedureType.MUTATION, payload);
    }

    public async subscribe<Path extends FlattenProcedureNames<Router>>(
        path: Path,
        payload: ProcedureFromPath<Router, Path>,
    ) {
        const id = nanoid();

        const request: ClientMessageSubscriptionDraft = {
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
            client: this,
        };

        for (const link of this.opts.links) {
            if (link.decorateMessage) {
                await link.decorateMessage(request);
            }
            if (link.handleSubscription) {
                return link.handleSubscription(request);
            }
        }

        throw new Error(
            "No link was found to handle the subscription. Are you missing a link that handles the message?",
        );
    }

    public async authenticate(
        authInput: InferInput<Router["_defs"]["authInput"]>,
    ) {
        const request: ClientMessageAuthRequestDraft = {
            message: {
                type: SocketMessageType.AUTH_REQUEST,
                content: authInput ?? undefined,
            },
            decorations: {},
            client: this,
        };

        for (const link of this.opts.links) {
            if (link.decorateAuthRequest) {
                await link.decorateAuthRequest(request);
            }
            if (link.handleAuthRequest) {
                const response = await link.handleAuthRequest(request);

                if (response.type !== SocketMessageType.AUTH_RESPONSE) {
                    throw new Error(
                        "Expected auth response but got something else.",
                    );
                }

                if (response.status === ResponseStatus.ERROR) {
                    let error = response.error;

                    if (isSerializedError(error)) {
                        error = deserializeError(error);
                    } else if (!(error instanceof Error)) {
                        error = new ServerError({
                            code: error.code,
                            message: error.message,
                            cause: error,
                        });
                    }

                    throw error;
                }

                this.authenticated = true;
                return;
            }
        }

        throw new Error(
            "No link was found to handle the authentication request. Are you missing a link that handles the message?",
        );
    }

    public close() {
        return Promise.all(
            this.opts.links.map((link) => {
                if (link.close) {
                    return link.close({ client: this });
                }
            }),
        );
    }
}
