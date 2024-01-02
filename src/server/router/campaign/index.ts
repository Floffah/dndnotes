import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { RepeatInterval } from "@/db/enums/RepeatInterval";
import { CampaignAPIModel } from "@/db/models/Campaign/consumers";
import { CampaignError } from "@/db/models/Campaign/error";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { SessionError } from "@/db/models/Session/error";
import { CampaignFilter } from "@/server/enums/CampaignFilter";
import { campaignMemberRouter } from "@/server/router/campaign/member";
import { procedure, router } from "@/server/trpc";

export const campaignRouter = router({
    member: campaignMemberRouter,

    get: procedure.input(z.string()).query(async (opts) => {
        const campaign = await CampaignModel.findById(new ObjectId(opts.input))
            .populate("createdBy")
            .exec();

        if (!campaign) return null;

        return new CampaignAPIModel(campaign).toObject({
            currentUser: opts.ctx.session?.user,
        });
    }),

    list: procedure
        .input(
            z.object({
                filter: z.nativeEnum(CampaignFilter),
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
                user: new ObjectId(opts.ctx.session.user.id),
            });

            const campaigns = await CampaignModel.find({
                _id: {
                    $in: campaignMembers.map((cm) => cm.campaign),
                },
            })
                .populate("createdBy")
                .exec();

            return campaigns.map((campaign) =>
                new CampaignAPIModel(campaign).toObject({
                    currentUser: opts.ctx.session?.user,
                    currentMember: campaignMembers.find(
                        (cm) =>
                            cm.campaign.toString() === campaign._id.toString(),
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
            if (!opts.ctx.session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: SessionError.NOT_AUTHENTICATED,
                });
            }

            const campaign = await CampaignModel.create({
                name: opts.input.name,
                createdBy: new ObjectId(opts.ctx.session.user.id),
            });

            const campaignMember = await CampaignMemberModel.create({
                campaign: campaign,
                user: opts.ctx.session.user,
                type: CampaignMemberType.DM,
            });

            return new CampaignAPIModel(campaign).toObject({
                currentUser: opts.ctx.session.user,
                currentMember: campaignMember,
            });
        }),

    update: procedure
        .input(
            z.object({
                id: z.string(),
                name: z.optional(z.string()),
                schedule: z.optional(
                    z.object({
                        manual: z.optional(z.boolean()),
                        start: z.optional(z.string()),
                        repeat: z.optional(z.nativeEnum(RepeatInterval)),
                        dayOfWeek: z.optional(z.array(z.number())),

                        nextSession: z.optional(z.string()),
                    }),
                ),
            }),
        )
        .mutation(async (opts) => {
            if (!opts.ctx.session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: SessionError.NOT_AUTHENTICATED,
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
                user: new ObjectId(opts.ctx.session.user.id),
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

            if (opts.input.schedule) {
                if (!campaign.schedule) {
                    campaign.schedule = {} as any;
                }

                if (opts.input.schedule.manual) {
                    campaign.schedule.manual = opts.input.schedule.manual;
                }
                if (opts.input.schedule.start) {
                    campaign.schedule.start = new Date(
                        opts.input.schedule.start,
                    );
                }
                if (opts.input.schedule.repeat) {
                    campaign.schedule.repeat = opts.input.schedule.repeat;
                }
                if (opts.input.schedule.dayOfWeek) {
                    campaign.schedule.dayOfWeek = opts.input.schedule.dayOfWeek;
                }

                if (opts.input.schedule.nextSession) {
                    campaign.schedule.nextSession = new Date(
                        opts.input.schedule.nextSession,
                    );
                }
            }

            const updatedCampaign = await campaign.save();

            return new CampaignAPIModel(updatedCampaign).toObject({
                currentUser: opts.ctx.session.user,
            });
        }),

    delete: procedure.input(z.string()).mutation(async (opts) => {
        if (!opts.ctx.session) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: SessionError.NOT_AUTHENTICATED,
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
            user: new ObjectId(opts.ctx.session.user.id),
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
