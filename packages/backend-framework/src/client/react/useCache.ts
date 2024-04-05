import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { z } from "zod";

import { getQueryKey } from "@/client/react/queryKeys";
import {
    InferProcedureInput,
    ProtoBuilderProcedure,
    ProtoBuilderRouter,
    ProtoBuilderType,
} from "@/server";

export interface CacheProcedureFunctions<
    Procedure extends ProtoBuilderProcedure<any, any>,
> {
    setData: (
        input: InferProcedureInput<Procedure["_defs"]["input"]>,
        data: Awaited<Procedure["_defs"]["output"]>,
    ) => void;
    getData: (
        input: InferProcedureInput<Procedure["_defs"]["input"]>,
    ) => Awaited<Procedure["_defs"]["output"]>;
}

export type CacheProcedures<Router extends ProtoBuilderRouter<any>> = {
    [K in keyof Router["_defs"]["fields"]]: Router["_defs"]["fields"][K]["_defs"]["builderType"] extends ProtoBuilderType.Router
        ? CacheProcedures<Router["_defs"]["fields"][K]>
        : CacheProcedureFunctions<Router["_defs"]["fields"][K]>;
};
export function useCache<Router extends ProtoBuilderRouter<any>>() {
    const queryClient = useQueryClient();

    const getProcedureFunctions = useCallback((paths: string[]) => {
        return {
            setData: (input: any, data: any) => {
                queryClient.setQueryData(getQueryKey(paths, input), data);
            },
            getData: (input: any) => {
                return queryClient.getQueryData(getQueryKey(paths, input));
            },
        };
    }, []);

    const callerProxy = useMemo(() => {
        const createCallerProxy = (parent: string[]) => {
            return new Proxy(() => void 0, {
                get: (_, key) => {
                    return createCallerProxy([...parent, key as string]);
                },
                apply: (_, __, args) => {
                    const path = [...parent];
                    const fnName = path.pop();

                    const functions = getProcedureFunctions(path);

                    return functions[fnName as string](...args);
                },
            });
        };

        return createCallerProxy([]);
    }, []);

    return callerProxy as CacheProcedures<Router>;
}
