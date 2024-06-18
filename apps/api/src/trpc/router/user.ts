import { eq } from "drizzle-orm";

import { db } from "@dndnotes/models";

import { procedure, router } from "@/trpc/trpc";

export const userRouter = router({
    me: procedure.query(async (input) => {
        if (!input.ctx.session) {
            return null;
        }

        const user = db.query.users.findFirst({
            where: (users) => eq(users.id, input.ctx.session!.userId),
        });

        return user ?? null;
    }),
});
