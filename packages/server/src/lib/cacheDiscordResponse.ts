import { REST, RequestData, RequestMethod, RouteLike } from "@discordjs/rest";

import { CachedDiscordResponseModel } from "@/models/CachedDiscordResponseModel";

export async function cacheDiscordResponse<ResponseType>(
    restClient: REST,
    method: RequestMethod,
    route: RouteLike,
    options?: RequestData,
) {
    const existingResponse = await CachedDiscordResponseModel.findOne({
        path: route,
        method: method,
        requestBody: options?.body ?? null,
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
            ...options,
            fullRoute: route,
            method: method,
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
            path: route,
            method: method,
            requestBody: options?.body ?? null,
        },
        {
            path: route,
            method: method,
            requestBody: options?.body ?? null,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            response: response,
        },
        {
            upsert: true,
        },
    );

    return response as ResponseType;
}
