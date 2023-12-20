import { procedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { CampaignMemberAPIModel } from "@/db/models/CampaignMember/consumers";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { SessionError } from "@/db/models/Session/error";

export const campaignMemberRouter = router({
    list: procedure
        .input(
            z.object({
                campaignId: z.string(),
            }),
        )
        .query(async (opts) => {
            if (!opts.ctx.session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: SessionError.NOT_AUTHENTICATED,
                });
            }

            const campaignMembers = await CampaignMemberModel.find({
                campaign: new ObjectId(opts.input.campaignId),
            })
                .populate("user")
                .exec();

            return campaignMembers.map((campaignMember) =>
                new CampaignMemberAPIModel(campaignMember).toObject({
                    currentUser: opts.ctx.session?.user,
                }),
            );
        }),
});
