import { procedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";
import { z } from "zod";

import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { isPopulated } from "@/db/lib/isPopulated";
import { CampaignError } from "@/db/models/Campaign/error";
import { CampaignInviteAPIModel } from "@/db/models/CampaignInvite/consumers";
import { CampaignInviteError } from "@/db/models/CampaignInvite/error";
import { CampaignInviteModel } from "@/db/models/CampaignInvite/model";
import { CampaignMemberAPIModel } from "@/db/models/CampaignMember/consumers";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { ensureAuthenticated } from "@/server/lib/ensureAuthenticated";

export const campaignMemberRouter = router({
    list: procedure
        .input(
            z.object({
                campaignId: z.string(),
            }),
        )
        .query(async (opts) => {
            await ensureAuthenticated(opts.ctx);

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
