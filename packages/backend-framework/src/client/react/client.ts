import {
    UseMutationOptions,
    UseMutationResult,
    UseQueryOptions,
    UseQueryResult,
    useMutation,
    useQuery,
} from "@tanstack/react-query";
import { z } from "zod";

import { useCache } from "@/client";
import {
    ProcedureType,
    ProtoBuilderProcedure,
    ProtoBuilderRouter,
    ProtoBuilderType,
} from "@/server";
import { ServerError, TransformerLike, defaultTransformer } from "@/shared";

export interface ReactQueryProcedureCall<
    Procedure extends ProtoBuilderProcedure,
> {
    useQuery: (
        input: z.infer<Procedure["_defs"]["input"]>,
        opts?: Omit<
            UseQueryOptions<
                Awaited<Procedure["_defs"]["output"]>,
                ServerError,
                z.infer<Procedure["_defs"]["input"]>
            >,
            "queryKey" | "queryFn"
        >,
    ) => UseQueryResult<Awaited<Procedure["_defs"]["output"]>, ServerError>;
}

export interface ReactMutationProcedureCall<
    Procedure extends ProtoBuilderProcedure,
> {
    useMutation: (
        opts?: Omit<
            UseMutationOptions<
                Awaited<Procedure["_defs"]["output"]>,
                ServerError,
                z.infer<Procedure["_defs"]["input"]>
            >,
            "mutationKey" | "mutationFn"
        >,
    ) => UseMutationResult<
        Awaited<Procedure["_defs"]["output"]>,
        ServerError,
        z.infer<Procedure["_defs"]["input"]>
    >;
}

export type ReactProcedureCaller<Router extends ProtoBuilderRouter<any>> = {
    [K in keyof Router["_defs"]["fields"]]: Router["_defs"]["fields"][K]["_defs"]["builderType"] extends ProtoBuilderType.Router
        ? ReactProcedureCaller<Router["_defs"]["fields"][K]>
        : Router["_defs"]["fields"][K]["_defs"]["type"] extends ProcedureType.Query
          ? ReactQueryProcedureCall<Router["_defs"]["fields"][K]>
          : ReactMutationProcedureCall<Router["_defs"]["fields"][K]>;
};

interface BatchedQuery {
    type: "query" | "mutation";
    path: string[];
    input: any;
    resolve: (data: any) => void;
    reject: (error: any) => void;
}

interface BatcherOptions {
    transformer: TransformerLike;
    url: string;
}

function createBatcher(opts: BatcherOptions) {
    let batchedQueries: BatchedQuery[] = [];

    return {
        addQuery: (query: BatchedQuery) => {
            batchedQueries.push(query);
        },
        execute: async () => {
            if (batchedQueries.length === 0) {
                return;
            }

            const currentBatch = [...batchedQueries];
            batchedQueries = [];

            const paths = currentBatch
                .map(({ path }) => path.join("."))
                .join(",");
            const inputs = opts.transformer.serialize(
                currentBatch.map(({ input }) => input),
            );

            const method = currentBatch.some(
                (query) => query.type === "mutation",
            )
                ? "POST"
                : "GET";

            const url = new URL(opts.url);

            url.pathname = url.pathname + "/" + paths;

            if (method === "GET") {
                url.searchParams.set("inputs", inputs);
            }

            const res = await fetch(url.toString(), {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: method === "POST" ? JSON.stringify(inputs) : void 0,
            });

            const results = opts.transformer.deserialize(await res.json());

            currentBatch.forEach(({ resolve, reject }, i) => {
                const response = results[i];

                if (response.status === "ok") {
                    resolve(response.data);
                } else if (response.error.type === "ServerError") {
                    const error = new ServerError({
                        code: response.error.code,
                        message: response.error.message,
                        cause: response.error.cause,
                    });

                    reject(error);
                } else {
                    reject(response.error);
                }
            });
        },
    };
}

export interface ReactQueryClientOptions {
    transformer?: TransformerLike;
    url: string;
}

export function createReactEnvironment<Router extends ProtoBuilderRouter<any>>(
    opts: ReactQueryClientOptions,
) {
    const transformer = opts.transformer ?? defaultTransformer;

    const batcher = createBatcher({
        transformer,
        url: opts.url,
    });

    const procedureFunctions = <Procedure extends ProtoBuilderProcedure>(
        path: string[],
    ) => ({
        useQuery: (
            input: z.infer<Procedure["_defs"]["input"]>,
            opts: Omit<
                UseQueryOptions<
                    Awaited<Procedure["_defs"]["output"]>,
                    unknown,
                    z.infer<Procedure["_defs"]["input"]>
                >,
                "queryKey" | "queryFn"
            > = {},
        ): UseQueryResult<Awaited<Procedure["_defs"]["output"]>, unknown> => {
            return useQuery({
                ...opts,
                queryKey: [...path, input],
                queryFn: () =>
                    new Promise<Awaited<Procedure["_defs"]["output"]>>(
                        (resolve, reject) => {
                            batcher.addQuery({
                                type: "query",
                                path,
                                input,
                                resolve,
                                reject,
                            });
                        },
                    ),
            });
        },
        useMutation: (
            opts: Omit<
                UseMutationOptions<
                    Awaited<Procedure["_defs"]["output"]>,
                    unknown,
                    z.infer<Procedure["_defs"]["input"]>
                >,
                "mutationKey" | "mutationFn"
            > = {},
        ): UseMutationResult<
            Awaited<Procedure["_defs"]["output"]>,
            unknown,
            z.infer<Procedure["_defs"]["input"]>
        > => {
            return useMutation({
                ...opts,
                mutationKey: path,
                mutationFn: (input) =>
                    new Promise<Awaited<Procedure["_defs"]["output"]>>(
                        (resolve, reject) => {
                            batcher.addQuery({
                                type: "mutation",
                                path,
                                input,
                                resolve,
                                reject,
                            });
                        },
                    ),
            });
        },
    });

    const nonProxiedKeys = {
        _internals: {
            transformer: opts.transformer ?? defaultTransformer,
            url: opts.url,
            batcher,
        },
        useCache: useCache<Router>,
    };

    const createCallerProxy = (parent: string[]) => {
        return new Proxy(() => void 0, {
            get(_original, key) {
                if (key in nonProxiedKeys) {
                    return nonProxiedKeys[key as keyof typeof nonProxiedKeys];
                }

                return createCallerProxy([...parent, String(key)]);
            },
            apply(_original, _thisArg, args) {
                const path = [...parent];
                const fnName = path.pop();

                if (!fnName) {
                    throw new Error("Invalid path");
                }

                const functions = procedureFunctions(path);

                if (!functions[fnName]) {
                    throw new Error("Invalid path");
                }

                return functions[fnName](...args);
            },
        });
    };

    return createCallerProxy([]) as ReactProcedureCaller<Router> &
        typeof nonProxiedKeys;
}
