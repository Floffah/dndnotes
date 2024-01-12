import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { parse } from "cookie";

import { SESSION_TOKEN } from "@/app/api/lib/storage";
import { UserSessionModel } from "@/db/models/UserSession/model";

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

const trpc = initTRPC.context<typeof createContext>().create();

export const { router, procedure } = trpc;
