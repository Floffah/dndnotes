import { discordActivitiesRouter } from "@/router/activities";
import { campaignRouter } from "@/router/campaign";
import { router } from "@/router/context";
import { thirdPartyRouter } from "@/router/thirdParty";
import { userRouter } from "@/router/user";

export const appRouter = router({
    activities: discordActivitiesRouter,
    campaign: campaignRouter,
    thirdParty: thirdPartyRouter,
    user: userRouter,
});

export type AppRouter = typeof appRouter;

export { createContext } from "@/router/context";
