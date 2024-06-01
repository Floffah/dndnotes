import { discordActivitiesRouter } from "@/trpc/router/activities";
import { campaignRouter } from "@/trpc/router/campaign";
import { thirdPartyRouter } from "@/trpc/router/thirdParty";
import { userRouter } from "@/trpc/router/user";
import { router } from "@/trpc/trpc";

export const appRouter = router({
    activities: discordActivitiesRouter,
    campaign: campaignRouter,
    thirdParty: thirdPartyRouter,
    user: userRouter,
});

export type AppRouter = typeof appRouter;
