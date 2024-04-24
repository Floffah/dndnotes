import { ZodType, z } from "zod";

import {
    ProcedureType,
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
    serverBoundSocketMessage,
    socketMessage,
    socketRequest,
    socketRequestTypeMap,
    socketResponse,
} from "@/shared";
import { extractTypeInfo } from "@/shared/typeInfo";

export class WebSocketConnection<Router extends ProtoBuilderRouter<any>> {
    context!: Router["_defs"]["context"];

    constructor(
        public handler: WebSocketHandler<Router>,
        public socket: WebSocketHandle,
    ) {}

    public async open() {
        try {
            this.context = await this.handler.opts.createContext(this.socket);
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
        let message: z.infer<typeof serverBoundSocketMessage>;

        try {
            message = await serverBoundSocketMessage.parseAsync(
                this.handler.transformer.deserialize(JSON.parse(data)),
            );
        } catch (e: any) {
            let partialMessage: any | null = null;

            try {
                partialMessage = this.handler.transformer.deserialize(
                    JSON.parse(data),
                );
            } catch (e) {}

            const error = new ServerError({
                code: ServerErrorCode.BAD_REQUEST,
                cause: e,
            });

            if (partialMessage && "id" in partialMessage) {
                this.send({
                    type: SocketMessageType.RESPONSE,
                    id: partialMessage.id,
                    content: {
                        status: ResponseStatus.ERROR,
                        error,
                    },
                });
            } else {
                this.sendConnectionError(error);
            }
            return;
        }

        if (message.type === SocketMessageType.REQUEST) {
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
                            error: new ServerError({
                                code: ServerErrorCode.BAD_REQUEST,
                                message: `Procedure not found: ${message.content.path}`,
                            }),
                        },
                    });
                    return;
                }

                if (
                    procedure._defs.type !==
                    socketRequestTypeMap[message.content.type]
                ) {
                    this.send({
                        type: SocketMessageType.RESPONSE,
                        id: message.id,
                        content: {
                            status: ResponseStatus.ERROR,
                            error: new ServerError({
                                code: ServerErrorCode.BAD_REQUEST,
                                message: `Procedure type mismatch: ${message.content.path}`,
                            }),
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
                                error: new ServerError({
                                    code: ServerErrorCode.BAD_REQUEST,
                                    cause: e,
                                }),
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
                            error,
                        },
                    });
                }
            }
        }
    }

    private sendConnectionError(error: ServerError, fatal = true) {
        this.send({
            type: SocketMessageType.CONNECTION_ERROR,
            content: {
                error,
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

    public cleanup() {}
}
