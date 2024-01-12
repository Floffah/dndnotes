import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { CampaignSessionStartType } from "@/db/enums/CampaignSessionStartType";
import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { CampaignError } from "@/db/models/Campaign/error";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignMemberError } from "@/db/models/CampaignMember/error";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { CampaignSessionAPIModel } from "@/db/models/CampaignSession/consumers";
import { CampaignSessionModel } from "@/db/models/CampaignSession/model";
import { ensureAuthenticated } from "@/server/lib/ensureAuthenticated";
import { procedure, router } from "@/server/trpc";

export const campaignSessionRouter = router({
    create: procedure
        .input(
            z.object({
                campaignId: z.string(),
                type: z.nativeEnum(CampaignSessionType),
                name: z.string(),
            }),
        )
        .query(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            const campaign = await CampaignModel.findById(
                new ObjectId(opts.input.campaignId),
            );

            if (!campaign) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignError.NOT_FOUND,
                });
            }

            if (campaign.createdBy.toString() !== opts.ctx.session!.user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: CampaignMemberError.NOT_OWNER,
                });
            }

            const campaignMember = await CampaignMemberModel.findOne({
                campaign: new ObjectId(opts.input.campaignId),
                user: new ObjectId(opts.ctx.session!.user.id),
            });

            if (!campaignMember) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: CampaignError.NO_CAMPAIGN_MEMBER,
                });
            }

            let startType: CampaignSessionStartType =
                CampaignSessionStartType.IMMEDIATE;

            // if campaign nextSession was within the last 2 hours
            if (
                campaign.schedule.nextSession &&
                Date.now() > campaign.schedule.nextSession.getTime() &&
                Date.now() - campaign.schedule.nextSession.getTime() <
                    1000 * 60 * 60 * 2
            ) {
                startType = CampaignSessionStartType.SCHEDULED;
            }

            const session = new CampaignSessionModel({
                type: opts.input.type,
                name: opts.input.name,
                campaign: campaign._id,
                startedBy: campaignMember._id,
                startedAt: new Date(),
                startType,
            });

            await session.save();

            return new CampaignSessionAPIModel(session).toObject({
                currentUser: opts.ctx.session!.user,
                currentMember: campaignMember,
            });
        }),
});
