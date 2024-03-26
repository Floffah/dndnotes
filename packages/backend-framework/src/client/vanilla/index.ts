import { z } from "zod";

import { getQueryClient } from "@/client/react/reactQuery";
import {
    ProcedureType,
    ProtoBuilderProcedure,
    ProtoBuilderRouter,
    ProtoBuilderType,
} from "@/server";
import { TransformerLike, defaultTransformer } from "@/shared";

export interface VanillaQueryProcedureCall<
    Procedure extends ProtoBuilderProcedure,
> {
    query: (
        input: z.infer<Procedure["_defs"]["input"]>,
    ) => Promise<Procedure["_defs"]["output"]>;
    getData: () => Procedure["_defs"]["output"];
    setData: (data: Procedure["_defs"]["output"]) => void;
}

export interface VanillaMutationProcedureCall<
    Procedure extends ProtoBuilderProcedure,
> {
    mutate: (
        input: z.infer<Procedure["_defs"]["input"]>,
    ) => Promise<Procedure["_defs"]["output"]>;
    getData: () => Procedure["_defs"]["output"];
    setData: (data: Procedure["_defs"]["output"]) => void;
}

export type VanillaProcedureCaller<Router extends ProtoBuilderRouter<any>> = {
    [K in keyof Router["_defs"]["fields"]]: Router["_defs"]["fields"][K]["_defs"]["builderType"] extends ProtoBuilderType.Router
        ? VanillaProcedureCaller<Router["_defs"]["fields"][K]>
        : Router["_defs"]["fields"][K]["_defs"]["type"] extends ProcedureType.Query
          ? VanillaQueryProcedureCall<Router["_defs"]["fields"][K]>
          : VanillaMutationProcedureCall<Router["_defs"]["fields"][K]>;
};

interface BatchedQuery {
    type: "query" | "mutation";
    path: string[];
    input: any;
    resolve: (data: any) => void;
}

export function createVanillaClient(opts: {
    batch: boolean;
    transformer: TransformerLike;
    url: string;
}) {
    const queryClient = getQueryClient();
    const transformer = opts.transformer ?? defaultTransformer;

    const batchedQueries: BatchedQuery[] = [];

    const fetchBatch = async (batch: BatchedQuery[]) => {
        const paths = batch.map(({ path }) => path.join(".")).join(",");
        const inputs = transformer.serialize(batch.map(({ input }) => input));

        const method = batchedQueries.some((query) => query.type === "mutation")
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

        const results = transformer.deserialize(await res.json());

        batch.forEach(({ resolve }, i) => {
            resolve(results[i]);
        });
    };

    const createCallerProxy = (parent: string[]) => {
        return new Proxy(() => void 0, {
            get(_original, key) {
                return createCallerProxy([...parent, String(key)]);
            },
            apply(_original, _thisArg, args) {
                const path = [...parent];
                const key = path.pop();

                if (!key) {
                    throw new Error("Invalid path");
                }

                if (key === "query" || key === "mutate") {
                    const type = key === "query" ? "query" : "mutation";
                    const resolve = args.pop();

                    if (!resolve) {
                        throw new Error("Invalid call");
                    }

                    const queryFn = () =>
                        new Promise((resolve) => {
                            const query: BatchedQuery = {
                                type,
                                path,
                                input: args[0],
                                resolve,
                            };

                            if (opts.batch) {
                                batchedQueries.push(query);
                            } else {
                                fetchBatch([query]);
                            }
                        });

                    if (type === "query") {
                        return queryClient.fetchQuery({
                            queryKey: path,
                            queryFn,
                        });
                    } else {
                        return queryClient.fetchQuery<any>({
                            queryKey: path,
                            queryFn,
                        });
                    }
                }
            },
        });
    };

    return createCallerProxy([]);
}
