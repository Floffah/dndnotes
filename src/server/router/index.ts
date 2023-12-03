import { router } from "../trpc";

import { mongoConnect } from "@/db/mongo";
import { campaignRouter } from "@/server/router/campaign";
import { campaignMemberRouter } from "@/server/router/campaignMember";
import { userRouter } from "@/server/router/user";

await mongoConnect();

export const appRouter = router({
    user: userRouter,
    campaign: campaignRouter,
    campaignMember: campaignMemberRouter,
});

export type AppRouter = typeof appRouter;
