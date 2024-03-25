import { ServerError } from "@dndnotes/backend-framework";
import { CampaignError, CampaignMemberAPIModel } from "@dndnotes/models";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { ensureAuthenticated } from "@/lib/ensureAuthenticated";
import { CampaignMemberModel } from "@/models/CampaignMemberModel";
import { procedure, router } from "@/router/context";

export const campaignMemberRouter = router({
    list: procedure(
        z.object({
            campaignId: z.string(),
        }),
    ).query(async (opts) => {
        await ensureAuthenticated(opts.ctx);

        if (!ObjectId.isValid(opts.input.campaignId)) {
            throw new ServerError({
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
