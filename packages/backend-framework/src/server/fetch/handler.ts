import { ZodVoid } from "zod";

import {
    FetchHandlerContext,
    ProcedureType,
    ProtoBuilderProcedure,
    ProtoBuilderRouter,
    ProtoBuilderType,
} from "@/server";
import { ServerError, ServerErrorCode } from "@/shared";

const getProcedureByPath = <TraversingRouter extends ProtoBuilderRouter<any>>(
    path: string,
    currentRouter: TraversingRouter,
): ProtoBuilderProcedure<any, any> | undefined => {
    const parts = path.split(".");

    const field = parts.reduce<
        ProtoBuilderRouter<any> | ProtoBuilderProcedure<any, any>
    >(
        (acc, part) =>
            acc._defs.builderType === ProtoBuilderType.Router
                ? acc?._defs.fields[part]
                : null,
        currentRouter,
    );

    if (!field || field._defs.builderType !== ProtoBuilderType.Procedure) {
        return undefined;
    }

    return field as ProtoBuilderProcedure<any, any>;
};

interface FetchHandlerOpts<Router extends ProtoBuilderRouter<any>> {
    appRouter: Router;
    createContext: (
        context: FetchHandlerContext,
    ) => Promise<Router["_defs"]["context"]> | Router["_defs"]["context"];
    prefix?: string;
}

export function createFetchHandler<Router extends ProtoBuilderRouter<any>>(
    options: FetchHandlerOpts<Router>,
) {
    return async (req: Request) => {
        const resHeaders = new Headers({
            "Content-Type": "application/json",
        });

        try {
            const context = await options.createContext({
                req,
                resHeaders,
            });

            const url = new URL(req.url);

            if (url.pathname.trim() === "/") {
                throw new ServerError({
                    code: "BAD_REQUEST",
                    message: "No procedure provided",
                });
            }

            if (req.method === "GET" && !url.searchParams.has("inputs")) {
                throw new ServerError({
                    code: "BAD_REQUEST",
                    message: "No inputs provided",
                });
            }

            let pathname = url.pathname;

            if (options.prefix) {
                if (!pathname.startsWith(options.prefix)) {
                    throw new ServerError({
                        code: "BAD_REQUEST",
                        message: `Path does not start with prefix ${options.prefix}`,
                    });
                }

                pathname = pathname.slice(options.prefix.length);
            }

            const procedureNames = decodeURIComponent(pathname.slice(1)).split(
                ",",
            );
            const procedures = procedureNames.map((name) => {
                const procedure = getProcedureByPath(name, options.appRouter);

                if (!procedure) {
                    throw new ServerError({
                        code: "BAD_REQUEST",
                        message: `Procedure ${name} not found`,
                    });
                }

                return [name, procedure] as const;
            });

            if (
                procedures.some(
                    ([_, procedure]) =>
                        procedure._defs.type === ProcedureType.Mutation,
                ) &&
                req.method !== "POST"
            ) {
                throw new ServerError({
                    code: "BAD_REQUEST",
                    message: "Mutations must be called with POST method",
                });
            }

            let queryInputs: any[] = [];

            if (req.method === "POST") {
                queryInputs = options.appRouter._defs.transformer.deserialize(
                    await req.json(),
                );
            } else {
                queryInputs = options.appRouter._defs.transformer.deserialize(
                    JSON.parse(
                        decodeURIComponent(url.searchParams.get("inputs")!),
                    ),
                );
            }

            const results = await Promise.all(
                procedures.map(async ([name, procedure], index) => {
                    const input = queryInputs[index];

                    if (
                        !input &&
                        (!procedure._defs.input ||
                            !(procedure._defs.input instanceof ZodVoid))
                    ) {
                        throw new ServerError({
                            code: "BAD_REQUEST",
                            message: `No input provided for query ${name}`,
                        });
                    }

                    let result;
                    try {
                        result = await procedure._defs.executor({
                            input,
                            ctx: context,
                        });
                    } catch (e: any) {
                        let error: ServerError;

                        if (e instanceof ServerError) {
                            error = e;
                        } else {
                            error = new ServerError({
                                code: "INTERNAL_SERVER_ERROR",
                                cause: e,
                            });
                        }

                        result = error;
                    }

                    if (result instanceof ServerError) {
                        return {
                            status: "error",
                            error: {
                                type: "ServerError",
                                code: result.code,
                                message: result.message,
                                cause: result.cause,
                            },
                        };
                    }

                    return {
                        status: "ok",
                        data: result,
                    };
                }),
            );

            return new Response(
                JSON.stringify(
                    options.appRouter._defs.transformer.serialize(results),
                ),
                {
                    headers: resHeaders,
                },
            );
        } catch (error: any) {
            let status = 500;

            if (error instanceof ServerError) {
                switch (error.code) {
                    case ServerErrorCode.BAD_REQUEST:
                        status = 400;
                        break;
                    case ServerErrorCode.UNAUTHORIZED:
                        status = 401;
                        break;
                    case ServerErrorCode.FORBIDDEN:
                        status = 403;
                        break;
                    case ServerErrorCode.NOT_FOUND:
                        status = 404;
                        break;
                    case ServerErrorCode.CONFLICT:
                        status = 409;
                        break;
                    case ServerErrorCode.INTERNAL_SERVER_ERROR:
                        status = 500;
                        break;
                    default:
                        status = 500;
                        break;
                }
            }

            return new Response(
                JSON.stringify(
                    options.appRouter._defs.transformer.serialize({
                        rawError: error,
                        error: error?.message ?? error.toString(),
                    }),
                ),
                { status, headers: resHeaders },
            );
        }
    };
}
