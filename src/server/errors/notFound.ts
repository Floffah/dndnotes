import { TRPCError } from "@trpc/server";

export const getNotFoundError = (resource: string) =>
    new TRPCError({
        code: "NOT_FOUND",
        message: `Could not find ${resource}`,
    });
