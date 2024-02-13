import { router } from "../trpc";

import { mongoConnect } from "@/db/mongo";
import { campaignRouter } from "@/server/router/campaign";
import { thirdPartyRouter } from "@/server/router/thirdParty";
import { userRouter } from "@/server/router/user";

export const appRouter = router({
    user: userRouter,
    campaign: campaignRouter,
    thirdParty: thirdPartyRouter,
});

export type AppRouter = typeof appRouter;
