import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { parse } from "cookie";
import superjson from "superjson";

import { SESSION_TOKEN } from "@/app/api/lib/storage";
import { registerTransformerTypes } from "@/db/lib/registerTransformerTypes";
import { UserSessionModel } from "@/db/models/UserSession/model";
import { mongoConnect } from "@/db/mongo";

const connectionPromise = mongoConnect();

export const createContext = async (opts: FetchCreateContextFnOptions) => {
    if (!opts.req.headers.has("cookie")) {
        return {
            session: null,
        };
    }

    const cookies = parse(opts.req.headers.get("cookie") as string);
    const token = cookies[SESSION_TOKEN];

    if (!token || token.trim() === "" || token.length < 10) {
        return {
            session: null,
        };
    }

    await connectionPromise;

    const session = await UserSessionModel.findOne({
        token,
    })
        .populate("user")
        .exec();

    if (!session) {
        return {
            session: null,
        };
    }

    return {
        session,
    };
};
export type Context = Awaited<ReturnType<typeof createContext>>;

registerTransformerTypes();

const trpc = initTRPC.context<typeof createContext>().create({
    transformer: superjson,
});

export const { router, procedure, createCallerFactory } = trpc;
