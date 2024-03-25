import { campaignRouter } from "@/router/campaign";
import { router } from "@/router/context";
import { thirdPartyRouter } from "@/router/thirdParty";
import { userRouter } from "@/router/user";

export const appRouter = router({
    user: userRouter,
    campaign: campaignRouter,
    thirdParty: thirdPartyRouter,
});

export type AppRouter = typeof appRouter;

export { createContext } from "@/router/context";
