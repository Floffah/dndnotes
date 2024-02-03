import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { CampaignAPIModel } from "@/db/models/Campaign/consumers";
import { CampaignError } from "@/db/models/Campaign/error";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { CampaignFilter } from "@/server/enums/CampaignFilter";
import { ensureAuthenticated } from "@/server/lib/ensureAuthenticated";
import { campaignMemberRouter } from "@/server/router/campaign/member";
import { campaignSessionRouter } from "@/server/router/campaign/session";
import { procedure, router } from "@/server/trpc";

export const campaignRouter = router({
    member: campaignMemberRouter,
    session: campaignSessionRouter,

    get: procedure.input(z.string()).query(async (opts) => {
        if (!ObjectId.isValid(opts.input)) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        const campaign = await CampaignModel.findById(new ObjectId(opts.input))
            .populate("createdBy")
            .exec();

        if (!campaign) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        return new CampaignAPIModel(campaign, {
            user: opts.ctx.session?.user,
        });
    }),

    list: procedure
        .input(
            z.object({
                filter: z.nativeEnum(CampaignFilter),
            }),
        )
        .query(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            const campaignMembers = await CampaignMemberModel.find({
                user: new ObjectId(opts.ctx.session!.user.id),
            });

            const campaigns = await CampaignModel.find({
                _id: {
                    $in: campaignMembers.map((cm) => cm.campaign),
                },
            })
                .populate("createdBy")
                .exec();

            return campaigns.map(
                (campaign) =>
                    new CampaignAPIModel(campaign, {
                        user: opts.ctx.session?.user,
                        campaignMember: campaignMembers.find(
                            (cm) =>
                                cm.campaign.toString() ===
                                campaign._id.toString(),
                        ),
                    }),
            );
        }),

    create: procedure
        .input(
            z.object({
                name: z.string(),
            }),
        )
        .mutation(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            const campaign = await CampaignModel.create({
                name: opts.input.name,
                createdBy: new ObjectId(opts.ctx.session!.user.id),
            });

            const campaignMember = await CampaignMemberModel.create({
                campaign: campaign,
                user: opts.ctx.session!.user,
                type: CampaignMemberType.DM,
            });

            return new CampaignAPIModel(campaign, {
                user: opts.ctx.session!.user,
                campaignMember: campaignMember,
            });
        }),

    update: procedure
        .input(
            z.object({
                id: z.string(),
                name: z.optional(z.string()),
            }),
        )
        .mutation(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            if (!ObjectId.isValid(opts.input.id)) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignError.NOT_FOUND,
                });
            }

            const campaign = await CampaignModel.findById(
                new ObjectId(opts.input.id),
            );

            if (!campaign) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignError.NOT_FOUND,
                });
            }

            const campaignMember = await CampaignMemberModel.findOne({
                campaign: campaign._id,
                user: new ObjectId(opts.ctx.session!.user.id),
            });

            if (!campaignMember) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: CampaignError.NO_CAMPAIGN_MEMBER,
                });
            }

            if (campaignMember.type !== CampaignMemberType.DM) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: CampaignError.NO_UPDATE_PERMISSION,
                });
            }

            if (opts.input.name) {
                campaign.name = opts.input.name;
            }

            const updatedCampaign = await campaign.save();

            return new CampaignAPIModel(updatedCampaign, {
                user: opts.ctx.session!.user,
            });
        }),

    delete: procedure.input(z.string()).mutation(async (opts) => {
        await ensureAuthenticated(opts.ctx);

        if (!ObjectId.isValid(opts.input)) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        const campaign = await CampaignModel.findById(new ObjectId(opts.input));

        if (!campaign) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        const campaignMember = await CampaignMemberModel.findOne({
            campaign: campaign._id,
            user: new ObjectId(opts.ctx.session!.user.id),
        });

        if (!campaignMember) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: CampaignError.NO_CAMPAIGN_MEMBER,
            });
        }

        if (campaignMember.type !== CampaignMemberType.DM) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: CampaignError.NO_UPDATE_PERMISSION,
            });
        }

        await CampaignMemberModel.deleteMany({
            campaign: campaign._id,
        });

        await campaign.deleteOne();

        return true;
    }),
});
