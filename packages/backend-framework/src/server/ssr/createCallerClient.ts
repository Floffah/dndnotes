import {
    DehydratedState,
    dehydrate as rqDehydrate,
} from "@tanstack/react-query";
import { z } from "zod";

import { getQueryKey } from "@/client/react/queryKeys";
import { getQueryClient } from "@/client/react/reactQuery";
import {
    InferProcedureInput,
    ProtoBuilderProcedure,
    ProtoBuilderRouter,
    ProtoBuilderType,
} from "@/server";
import { TransformerLike, defaultTransformer } from "@/shared";

interface RouteClientFunctions<
    Procedure extends ProtoBuilderProcedure<any, any>,
> {
    fetch: (
        input: InferProcedureInput<Procedure["_defs"]["input"]>,
    ) => Promise<Procedure["_defs"]["output"]>;
    prefetch: (
        input: InferProcedureInput<Procedure["_defs"]["input"]>,
    ) => Promise<void>;
}

export type RouterClient<Router extends ProtoBuilderRouter<any>> = {
    [K in keyof Router["_defs"]["fields"]]: Router["_defs"]["fields"][K]["_defs"]["builderType"] extends ProtoBuilderType.Router
        ? RouterClient<Router["_defs"]["fields"][K]>
        : RouteClientFunctions<Router["_defs"]["fields"][K]>;
};

interface CallerClientOpts<Router extends ProtoBuilderRouter<any>> {
    router: Router;
    ctx: Router["_defs"]["context"];
    transformer?: TransformerLike;
}

export function createCallerClient<Router extends ProtoBuilderRouter<any>>(
    opts: CallerClientOpts<Router>,
): RouterClient<Router> & {
    dehydrate: () => DehydratedState;
} {
    const queryClient = getQueryClient();
    const transformer = opts.transformer ?? defaultTransformer;

    const getProcedureMethods = (path: string[]) => {
        const procedure = path.reduce(
            (acc, key) => acc._defs.fields[key],
            opts.router,
        ) as any;

        return {
            fetch: (input: any) => {
                return queryClient.fetchQuery({
                    queryKey: getQueryKey(path, input),
                    queryFn: () => {
                        return procedure._defs.executor({
                            ctx: opts.ctx,
                            input,
                        });
                    },
                });
            },
            prefetch: (input: any) => {
                return queryClient.prefetchQuery({
                    queryKey: getQueryKey(path, input),
                    queryFn: () => {
                        return procedure._defs.executor({
                            ctx: opts.ctx,
                            input,
                        });
                    },
                });
            },
        };
    };

    const dehydrate = () => {
        const dehydratedState = rqDehydrate(queryClient);

        return transformer.serialize(dehydratedState);
    };

    const createCallerProxy = (parent: string[]) => {
        return new Proxy(() => void 0, {
            get(_original, key) {
                if (
                    typeof key !== "string" ||
                    key === "then" ||
                    key === "catch"
                ) {
                    return undefined;
                }

                if (key === "dehydrate") {
                    return dehydrate;
                }

                return createCallerProxy([...parent, String(key)]);
            },
            apply(_original, _thisArg, args) {
                const path = [...parent];
                const fnName = path.pop();

                if (!fnName) {
                    throw new Error("Invalid path");
                }

                const methods = getProcedureMethods(path);

                if (!methods[fnName]) {
                    return undefined;
                }

                return methods[fnName](...args);
            },
        });
    };

    const proxy = createCallerProxy([]);

    return proxy;
}
