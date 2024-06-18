import { authenticationRouter } from "@/trpc/router/authentication";
import { router } from "@/trpc/trpc";

export const appRouter = router({
    authentication: authenticationRouter,
});

export type AppRouter = typeof appRouter;
