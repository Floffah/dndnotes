import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { parse } from "cookie";
import { eq } from "drizzle-orm";

import { SESSION_TOKEN } from "@dndnotes/lib";
import { db, userSessions, users } from "@dndnotes/models";

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
    if (
        !opts.req.headers.has("cookie") &&
        !opts.req.headers.has("x-session-token")
    ) {
        return {
            req: opts.req,
            resHeaders: opts.resHeaders,
        };
    }

    let token = "";

    if (opts.req.headers.has("x-session-token")) {
        token = opts.req.headers.get("x-session-token") as string;
    } else {
        const cookies = parse(opts.req.headers.get("cookie") as string);
        token = cookies[SESSION_TOKEN];
    }

    if (!token || !token.trim() || token.length < 10) {
        return {
            req: opts.req,
            resHeaders: opts.resHeaders,
        };
    }

    const session = await db.query.userSessions.findFirst({
        where: (userSessions) => eq(userSessions.token, token),
    });

    if (!session) {
        return {
            req: opts.req,
            resHeaders: opts.resHeaders,
        };
    }

    db.update(users)
        .set({
            lastActiveAt: new Date(),
        })
        .where(eq(users.id, session.userId));

    db.update(userSessions)
        .set({
            lastUsedAt: new Date(),
        })
        .where(eq(userSessions.id, session.id));

    if (opts.req.headers.has("x-access-token")) {
        // TODO: implement Discord activity token validation
    }

    return {
        req: opts.req,
        resHeaders: opts.resHeaders,
        session,
    };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
