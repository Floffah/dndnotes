import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@dndnotes/models";

import { authedProcedure, router } from "@/trpc/trpc";

export const campaignRouter = router({
    list: authedProcedure.query(async (opts) => {
        const campaignMembers = await db.query.campaignMembers.findMany({
            where: (campaignMembers) =>
                eq(campaignMembers.userId, opts.ctx.session.userId),
        });

        if (!campaignMembers.length) {
            return [];
        }

        const campaignIds = campaignMembers.map((member) => member.campaignId);

        return db.query.campaigns.findMany({
            where: (campaigns) => inArray(campaigns.id, campaignIds),
        });
    }),

    create: authedProcedure
        .input(
            z.object({
                name: z.string(),
            }),
        )
        .mutation(async (opts) => {}),
});
