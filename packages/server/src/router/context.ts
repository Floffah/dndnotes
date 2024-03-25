import {
    FetchHandlerContext,
    createProtoBuilder,
} from "@dndnotes/backend-framework/server";
import { SESSION_TOKEN } from "@dndnotes/lib";
import { UserSession, registerTransformerTypes } from "@dndnotes/models";
import { parse } from "cookie";

import { mongoConnect } from "@/lib/mongoDB";
import { UserSessionModel } from "@/models/UserSessionModel";

const connectionPromise = mongoConnect();

export const createContext = async (opts: FetchHandlerContext) => {
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
        session: session as UserSession,
    };
};
export type Context = Awaited<ReturnType<typeof createContext>>;

registerTransformerTypes();

export const { procedure, router } = createProtoBuilder().context<Context>();
