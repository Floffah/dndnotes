import { z } from "zod";

import { ProtoBuilderRouter, ProtoBuilderType } from "@/server";

export type RouterCaller<Router extends ProtoBuilderRouter<any>> = {
    [K in keyof Router["_defs"]["fields"]]: Router["_defs"]["fields"][K]["_defs"]["builderType"] extends ProtoBuilderType.Router
        ? RouterCaller<Router["_defs"]["fields"][K]>
        : (
              input: z.infer<Router["_defs"]["fields"][K]["_defs"]["input"]>,
          ) => Router["_defs"]["fields"][K]["_defs"]["output"];
};

function createCallerProxy(
    caller: (path: string[], ...args: any[]) => any,
    parent: string[],
) {
    return new Proxy(() => void 0, {
        get(_original, key) {
            if (typeof key !== "string" || key === "then" || key === "catch") {
                return undefined;
            }

            return createCallerProxy(caller, [...parent, String(key)]);
        },
        apply(_original, _thisArg, args) {
            return caller(parent, ...args);
        },
    });
}

export function createRouterCaller<Router extends ProtoBuilderRouter<any>>(
    router: Router,
    context: Router["_defs"]["context"],
): RouterCaller<Router> {
    return createCallerProxy((path, ...args) => {
        const procedure = path.reduce((acc, key) => acc[key], router) as any;

        if (!procedure) {
            throw new Error("Invalid path");
        }

        if (procedure._defs.builderType !== ProtoBuilderType.Procedure) {
            throw new Error("Invalid path");
        }

        return procedure._defs.executor({
            ctx: context,
            input: args[0],
        });
    }, []);
}
