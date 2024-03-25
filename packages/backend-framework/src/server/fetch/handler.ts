import {
    FetchHandlerContext,
    ProcedureType,
    ProtoBuilderProcedure,
    ProtoBuilderRouter,
    ProtoBuilderType,
} from "@/server";
import { ServerError } from "@/shared";

const getProcedureByPath = <TraversingRouter extends ProtoBuilderRouter<any>>(
    path: string,
    currentRouter: TraversingRouter,
): ProtoBuilderProcedure | undefined => {
    const parts = path.split(".");
    const currentPart = parts.shift();

    if (!currentPart) {
        return;
    }

    const currentField = currentRouter._defs.fields[currentPart];

    if (!currentField) {
        return;
    }

    if (
        "_defs" in currentField &&
        currentField._defs.builderType === ProtoBuilderType.Procedure
    ) {
        return currentField;
    }

    if (
        "_defs" in currentField &&
        currentField._defs.builderType === "Router"
    ) {
        return getProcedureByPath(parts.join("."), currentField);
    }
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

        const context = await options.createContext({
            req,
            resHeaders,
        });

        const url = new URL(req.url);

        if (url.pathname.trim() === "/") {
            return new Response("No procedures specified", { status: 400 });
        }

        if (!url.searchParams.has("inputs")) {
            return new Response("No inputs specified", { status: 400 });
        }

        let pathname = url.pathname;

        if (options.prefix) {
            if (!pathname.startsWith(options.prefix)) {
                return new Response("Invalid prefix", { status: 400 });
            }

            pathname = pathname.slice(options.prefix.length);
        }

        const procedureNames = decodeURIComponent(pathname.slice(1)).split(",");
        const procedures = procedureNames.map((name) => {
            const procedure = getProcedureByPath(name, options.appRouter);

            if (!procedure) {
                throw new Error(`Procedure ${name} not found`);
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
            return new Response("Mutations must be sent as POST requests", {
                status: 400,
            });
        }

        let queryInputs: any[] = [];

        if (req.method === "POST") {
            queryInputs = options.appRouter._defs.transformer.deserialize(
                await req.json(),
            );
        } else {
            queryInputs = options.appRouter._defs.transformer.deserialize(
                JSON.parse(decodeURIComponent(url.searchParams.get("inputs")!)),
            );
        }

        const results = await Promise.all(
            procedures.map(([name, procedure], index) => {
                const input = queryInputs[index];

                if (!input) {
                    throw new Error(`No input provided for query ${name}`);
                }

                let result;
                try {
                    result = procedure._defs.executor({
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
    };
}
