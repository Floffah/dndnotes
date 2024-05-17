import { ZodType, z } from "zod";

import {
    ProtoBuilderRouter,
    WebSocketHandle,
    WebSocketHandler,
    getProcedureByPath,
} from "@/server";
import {
    ResponseStatus,
    ServerError,
    ServerErrorCode,
    SocketMessageType,
    SocketRequestType,
    clientBoundSocketMessage,
    procedureTypeMap,
    serializeError,
    serverBoundSocketMessage,
    socketAuthRequest,
    socketRequest,
    socketRequestTypeMap,
} from "@/shared";
import { extractTypeInfo } from "@/shared/typeInfo";

export class WebSocketConnection<Router extends ProtoBuilderRouter<any>> {
    context!: Router["_defs"]["context"];

    authenticated = false;
    authTimeout: NodeJS.Timeout | null = null;

    constructor(
        public handler: WebSocketHandler<Router>,
        public socket: WebSocketHandle,
    ) {}

    public async open() {
        if (this.handler.opts.authentication?.required) {
            this.authTimeout = setTimeout(() => {
                if (!this.authenticated) {
                    this.sendConnectionError(
                        new ServerError({
                            code: ServerErrorCode.UNAUTHORIZED,
                            message: "Authentication timeout",
                        }),
                        true,
                    );
                }
            }, this.handler.opts.authentication?.timeout || 5000);
        }

        try {
            this.context = await this.handler.opts.createContext({
                socket: this.socket,
            });
        } catch (e: any) {
            let error: ServerError = e;

            if (!(e instanceof ServerError)) {
                error = new ServerError({
                    code: ServerErrorCode.INTERNAL_SERVER_ERROR,
                    cause: e,
                });
            }

            this.sendConnectionError(error);
        }
    }

    public async handleMessage(data: string) {
        let rawMessage: any;

        try {
            rawMessage = JSON.parse(data);
        } catch (e) {
            this.sendConnectionError(
                new ServerError({
                    code: ServerErrorCode.BAD_REQUEST,
                    cause: e,
                }),
                false,
            );
            return;
        }

        try {
            rawMessage = this.handler.transformer.deserialize(rawMessage);
        } catch (e) {
            this.sendConnectionError(
                new ServerError({
                    code: ServerErrorCode.BAD_REQUEST,
                    cause: e,
                }),
                false,
            );
            return;
        }

        let message: z.infer<typeof serverBoundSocketMessage>;

        try {
            message = await serverBoundSocketMessage.parseAsync(rawMessage);
        } catch (e: any) {
            const error = new ServerError({
                code: ServerErrorCode.BAD_REQUEST,
                cause: e,
            });

            if ("id" in rawMessage) {
                this.send({
                    type: SocketMessageType.RESPONSE,
                    id: rawMessage.id,
                    content: {
                        status: ResponseStatus.ERROR,
                        error: serializeError(error),
                    },
                });
            } else {
                this.sendConnectionError(error, false);
            }
            return;
        }

        if (message.type === SocketMessageType.REQUEST) {
            await this.handleRequest(message);
        } else if (message.type === SocketMessageType.AUTH_REQUEST) {
            await this.handleAuthRequest(message);
        }
    }

    private async handleRequest(message: z.infer<typeof socketRequest>) {
        if (this.handler.opts.authentication?.required && !this.authenticated) {
            this.send({
                type: SocketMessageType.RESPONSE,
                id: message.id,
                content: {
                    status: ResponseStatus.ERROR,
                    error: serializeError(
                        new ServerError({
                            code: ServerErrorCode.UNAUTHORIZED,
                            message: "Not authenticated",
                        }),
                    ),
                },
            });
            return;
        }

        if (
            message.content.type === SocketRequestType.QUERY ||
            message.content.type === SocketRequestType.MUTATION
        ) {
            const procedure = getProcedureByPath(
                message.content.path,
                this.handler.opts.router,
            );

            if (!procedure) {
                this.send({
                    type: SocketMessageType.RESPONSE,
                    id: message.id,
                    content: {
                        status: ResponseStatus.ERROR,
                        error: serializeError(
                            new ServerError({
                                code: ServerErrorCode.BAD_REQUEST,
                                message: `Procedure '${message.content.path}' not found`,
                            }),
                        ),
                    },
                });
                return;
            }

            if (
                procedure._defs.type !== procedureTypeMap[message.content.type]
            ) {
                this.send({
                    type: SocketMessageType.RESPONSE,
                    id: message.id,
                    content: {
                        status: ResponseStatus.ERROR,
                        error: serializeError(
                            new ServerError({
                                code: ServerErrorCode.BAD_REQUEST,
                                message: `Procedure type mismatch for procedure '${message.content.path}'`,
                            }),
                        ),
                    },
                });
                return;
            }

            if (procedure._defs.input instanceof ZodType) {
                try {
                    await procedure._defs.input.parseAsync(
                        message.content.payload,
                    );
                } catch (e: any) {
                    this.send({
                        type: SocketMessageType.RESPONSE,
                        id: message.id,
                        content: {
                            status: ResponseStatus.ERROR,
                            error: serializeError(
                                new ServerError({
                                    code: ServerErrorCode.BAD_REQUEST,
                                    message: `Invalid input for procedure '${message.content.path}'`,
                                    cause: e,
                                }),
                            ),
                        },
                    });
                    return;
                }
            }

            try {
                const result = await procedure._defs.executor({
                    input: message.content.payload,
                    ctx: this.context,
                });

                this.send({
                    type: SocketMessageType.RESPONSE,
                    id: message.id,
                    content: {
                        status: ResponseStatus.OK,
                        payload: result,
                        typeInfo: extractTypeInfo(result),
                    },
                });
            } catch (e: any) {
                let error: ServerError = e;

                if (!(e instanceof ServerError)) {
                    error = new ServerError({
                        code: ServerErrorCode.INTERNAL_SERVER_ERROR,
                        cause: e,
                    });
                }

                this.send({
                    type: SocketMessageType.RESPONSE,
                    id: message.id,
                    content: {
                        status: ResponseStatus.ERROR,
                        error: serializeError(error),
                    },
                });
            }
        }
    }

    private async handleAuthRequest(
        message: z.infer<typeof socketAuthRequest>,
    ) {
        if (this.authenticated) {
            this.send({
                type: SocketMessageType.AUTH_RESPONSE,
                status: ResponseStatus.ERROR,
                error: serializeError(
                    new ServerError({
                        code: ServerErrorCode.BAD_REQUEST,
                        message: "Already authenticated",
                    }),
                ),
            });
            return;
        }

        try {
            if (this.handler.opts.router._defs.authInput instanceof ZodType) {
                try {
                    await this.handler.opts.router._defs.authInput.parseAsync(
                        message.content,
                    );
                } catch (e: any) {
                    throw new ServerError({
                        code: ServerErrorCode.BAD_REQUEST,
                        cause: e,
                    });
                }
            }

            if (this.handler.opts.authentication?.handler) {
                const result = await this.handler.opts.authentication.handler({
                    socket: this.socket,
                    input: message.content,
                });

                if (!result) {
                    this.send({
                        type: SocketMessageType.AUTH_RESPONSE,
                        status: ResponseStatus.ERROR,
                        error: new ServerError({
                            code: ServerErrorCode.UNAUTHORIZED,
                            message: "Authentication failed",
                        }),
                    });
                    return;
                }
            }

            this.context = await this.handler.opts.createContext({
                socket: this.socket,
                authInput: message.content,
            });

            this.authenticated = true;
            if (this.authTimeout) {
                clearTimeout(this.authTimeout);
                this.authTimeout = null;
            }

            this.send({
                type: SocketMessageType.AUTH_RESPONSE,
                status: ResponseStatus.OK,
            });
        } catch (e: any) {
            let error: ServerError = e;

            if (!(e instanceof ServerError)) {
                error = new ServerError({
                    code: ServerErrorCode.INTERNAL_SERVER_ERROR,
                    cause: e,
                });
            }

            this.send({
                type: SocketMessageType.AUTH_RESPONSE,
                status: ResponseStatus.ERROR,
                error: serializeError(error),
            });
        }
    }

    private sendConnectionError(error: ServerError, fatal = true) {
        this.send({
            type: SocketMessageType.CONNECTION_ERROR,
            content: {
                error: serializeError(error),
            },
        });

        if (fatal) {
            this.close(1008, error.message);
        }
    }

    private send(data: z.infer<typeof clientBoundSocketMessage>) {
        this.socket.send(
            JSON.stringify(this.handler.transformer.serialize(data)),
        );
    }

    private close(code?: number, reason?: string) {
        this.socket.close(code, reason);
    }

    public cleanup() {
        if (this.authTimeout) {
            clearTimeout(this.authTimeout);
            this.authTimeout = null;
        }
    }
}
