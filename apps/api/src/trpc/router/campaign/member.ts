import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { CampaignError, CampaignMemberAPIModel } from "@dndnotes/models";

import { CampaignMemberModel } from "@/models/CampaignMemberModel";
import { authedProcedure, router } from "@/trpc/trpc";

export const campaignMemberRouter = router({
    list: authedProcedure
        .input(
            z.object({
                campaignId: z.string(),
            }),
        )
        .query(async (opts) => {
            if (!ObjectId.isValid(opts.input.campaignId)) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignError.NOT_FOUND,
                });
            }

            const campaignMembers = await CampaignMemberModel.find({
                campaign: new ObjectId(opts.input.campaignId),
            })
                .populate("user")
                .exec();

            return campaignMembers.map(
                (campaignMember) =>
                    new CampaignMemberAPIModel(campaignMember, {
                        user: opts.ctx.session!.user,
                    }),
            );
        }),
});
