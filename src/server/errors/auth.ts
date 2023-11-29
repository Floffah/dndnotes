import { TRPCError } from "@trpc/server";

export const getNotAuthenticatedError = () =>
    new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authenticated",
    });

export const getNoPermissionError = () =>
    new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to do this",
    });
