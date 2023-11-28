import { router } from "../trpc";

import { mongoConnect } from "@/db/mongo";
import { userRouter } from "@/server/router/user";

mongoConnect();

export const appRouter = router({
    user: userRouter,
});

export type AppRouter = typeof appRouter;
