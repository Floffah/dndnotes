import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@dndnotes/models";
import { campaignMembers, campaigns } from "@dndnotes/models";

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
                name: z.string().min(5).max(50),
            }),
        )
        .mutation(async (opts) => {
            const createCampaignResult = await db.insert(campaigns).values({
                name: opts.input.name,
                createdByUserId: opts.ctx.session.userId,
            });
            const campaignId = parseInt(createCampaignResult.insertId);

            const campaign = await db.query.campaigns.findFirst({
                where: (campaigns) => eq(campaigns.id, campaignId),
            });

            if (!campaign) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Campaign not found",
                });
            }

            await db.insert(campaignMembers).values({
                campaignId,
                userId: opts.ctx.session.userId,
                type: "DM",
            });

            return campaign.publicId;
        }),
});
