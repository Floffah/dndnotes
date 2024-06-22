import { authenticationRouter } from "@/trpc/router/authentication";
import { campaignRouter } from "@/trpc/router/campaign";
import { userRouter } from "@/trpc/router/user";
import { router } from "@/trpc/trpc";

export const appRouter = router({
    authentication: authenticationRouter,
    campaign: campaignRouter,
    user: userRouter,
});

export type AppRouter = typeof appRouter;
