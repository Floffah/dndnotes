import {
    InternalRequest,
    REST,
    RequestData,
    RequestMethod,
    RouteLike,
} from "@discordjs/rest";

import { User, UserSession } from "@dndnotes/models";

import { CachedDiscordResponseModel } from "@/models/server/CachedDiscordResponseModel";

export async function cacheDiscordResponse<ResponseType>(
    restClient: REST,
    request: InternalRequest,
    ctx?: {
        session?: UserSession & { user: User };
        guild_id?: string;
    },
) {
    let context: string | null = null;

    if (ctx?.session) {
        context = ctx.session.user.id;
    }

    if (ctx?.guild_id) {
        context = (context ? context + ":" : "") + ctx.guild_id;
    }

    const existingResponse = await CachedDiscordResponseModel.findOne({
        path: request.fullRoute,
        method: request.method,
        requestBody: request.body ?? null,
        context,
    });

    if (existingResponse && existingResponse.expiresAt > new Date()) {
        return existingResponse.response as ResponseType;
    }

    let response: unknown;

    const abortController = new AbortController();
    const timeout = setTimeout(() => {
        abortController.abort("Request timed out");
    }, 10000);

    try {
        response = await restClient.request({
            ...request,
            signal: abortController.signal,
        });
    } catch (e) {
        clearTimeout(timeout);

        if (existingResponse) {
            return existingResponse.response as ResponseType;
        }

        throw e;
    }

    clearTimeout(timeout);

    await CachedDiscordResponseModel.updateOne(
        {
            path: request.fullRoute,
            method: request.method,
            requestBody: request.body ?? null,
            context,
        },
        {
            path: request.fullRoute,
            method: request.method,
            requestBody: request.body ?? null,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            response: response,
            context,
        },
        {
            upsert: true,
        },
    );

    return response as ResponseType;
}
