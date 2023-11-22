import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { parse } from "cookie";

import { SessionModel } from "@/db/models/Session/mongo";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
    if (!opts.req.headers.has("cookie")) {
        return {
            session: null,
        };
    }

    const cookies = parse(opts.req.headers.get("cookie") as string);
    const token = cookies["dndnotes-session-token"];

    if (!token) {
        return {
            session: null,
        };
    }

    const session = await SessionModel.findOne({
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

const trpc = initTRPC.context<typeof createContext>().create();

export const { router, procedure } = trpc;
