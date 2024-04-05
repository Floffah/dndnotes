import {
    UseMutationOptions,
    UseMutationResult,
    UseQueryOptions,
    UseQueryResult,
    useMutation,
    useQuery,
} from "@tanstack/react-query";
import { ZodVoid, z } from "zod";

import { useCache } from "@/client";
import { getQueryKey } from "@/client/react/queryKeys";
import {
    InferProcedureInput,
    ProcedureType,
    ProtoBuilderProcedure,
    ProtoBuilderRouter,
    ProtoBuilderType,
} from "@/server";
import { ServerError, TransformerLike, defaultTransformer } from "@/shared";

export interface ReactQueryProcedureCall<
    Procedure extends ProtoBuilderProcedure<any, any>,
    Input = z.infer<Procedure["_defs"]["input"]>,
> {
    useQuery: (
        input: InferProcedureInput<Input>,
        opts?: Omit<
            UseQueryOptions<
                Awaited<Procedure["_defs"]["output"]>,
                ServerError,
                InferProcedureInput<Procedure["_defs"]["input"]>
            >,
            "queryKey" | "queryFn"
        >,
    ) => UseQueryResult<Awaited<Procedure["_defs"]["output"]>, ServerError>;
}

export interface ReactMutationProcedureCall<
    Procedure extends ProtoBuilderProcedure<any, any>,
> {
    useMutation: (
        opts?: Omit<
            UseMutationOptions<
                Awaited<Procedure["_defs"]["output"]>,
                ServerError,
                InferProcedureInput<Procedure["_defs"]["input"]>
            >,
            "mutationKey" | "mutationFn"
        >,
    ) => UseMutationResult<
        Awaited<Procedure["_defs"]["output"]>,
        ServerError,
        InferProcedureInput<Procedure["_defs"]["input"]>
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

    const headers = {
        "Content-Type": "application/json",
    };

    return {
        addQuery: (query: BatchedQuery) => {
            batchedQueries.push(query);
        },
        setHeader: (key: string, value: string) => {
            headers[key] = value;
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
            const rawInputs = currentBatch.map(({ input }) => input);
            const stringifiedInputs = JSON.stringify(
                opts.transformer.serialize(rawInputs),
            );

            const method = currentBatch.some(
                (query) => query.type === "mutation",
            )
                ? "POST"
                : "GET";

            const url = new URL(opts.url);

            url.pathname = url.pathname + "/" + paths;

            if (method === "GET") {
                url.searchParams.set("inputs", stringifiedInputs);
            }

            const res = await fetch(url.toString(), {
                method,
                headers,
                body: method === "POST" ? stringifiedInputs : void 0,
            });

            const results = opts.transformer.deserialize(await res.json());

            if (results?.error) {
                currentBatch.forEach(({ reject }) => reject(results.error));
            } else {
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
            }
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

    const procedureFunctions = <
        Procedure extends ProtoBuilderProcedure<any, any>,
    >(
        path: string[],
    ) => ({
        useQuery: (input, opts) => {
            return useQuery({
                ...opts,
                queryKey: getQueryKey(path, input),
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
        useMutation: (opts) => {
            return useMutation({
                ...opts,
                mutationKey: getQueryKey(path),
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
        toJSON: () => path,
    });

    const nonProxiedKeys = {
        _internals: {
            transformer: opts.transformer ?? defaultTransformer,
            url: opts.url,
            batcher,
        },
        useCache: useCache<Router>,
        setHeader: batcher.setHeader,
    };

    const createCallerProxy = (parent: string[], base: any = () => void 0) => {
        return new Proxy(base, {
            get(_original, key) {
                if (
                    typeof key !== "string" ||
                    key === "then" ||
                    key === "catch"
                ) {
                    return undefined;
                }

                if (nonProxiedKeys[key]) {
                    return nonProxiedKeys[key];
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
                    throw new Error(`Unknown function ${fnName}`);
                }

                return functions[fnName](...args);
            },
        });
    };

    return createCallerProxy(
        [],
        nonProxiedKeys,
    ) as ReactProcedureCaller<Router> & typeof nonProxiedKeys;
}
