import { parse } from "cookie";
import superjson from "superjson";

import {
    FetchHandlerContext,
    createProtoBuilder,
} from "@dndnotes/backend-framework/server";
import { SESSION_TOKEN } from "@dndnotes/lib";
import { UserSession, registerTransformerTypes } from "@dndnotes/models";

import { mongoConnect } from "@/lib/mongoDB";
import { UserSessionModel } from "@/models/UserSessionModel";

const connectionPromise = mongoConnect();

export const createContext = async (opts: FetchHandlerContext) => {
    if (
        !opts.req.headers.has("cookie") &&
        !opts.req.headers.has("x-session-token")
    ) {
        return {
            session: null,
            access_token: null,
        };
    }

    let token = "";

    if (opts.req.headers.has("x-session-token")) {
        token = opts.req.headers.get("x-session-token") as string;
    } else {
        const cookies = parse(opts.req.headers.get("cookie") as string);
        token = cookies[SESSION_TOKEN];
    }

    if (!token || token.trim() === "" || token.length < 10) {
        return {
            session: null,
            access_token: null,
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
            access_token: null,
        };
    }

    let access_token: string | null = null;

    if (opts.req.headers.has("x-access-token")) {
        access_token = opts.req.headers.get("x-access-token") as string;
    }

    return {
        session: session as UserSession,
        access_token,
    };
};
export type Context = Awaited<ReturnType<typeof createContext>>;

registerTransformerTypes();

export const { procedure, router } = createProtoBuilder({
    transformer: superjson,
}).context<Context>();
