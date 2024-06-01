import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { FilterQuery } from "mongoose";
import { z } from "zod";

import {
    Campaign,
    CampaignAPIModel,
    CampaignError,
    CampaignFilter,
    CampaignMember,
    CampaignMemberType,
} from "@dndnotes/models";

import { DiscordGuildModel } from "@/models";
import { CampaignMemberModel } from "@/models/CampaignMemberModel";
import { CampaignModel } from "@/models/CampaignModel";
import { campaignCharacterRouter } from "@/trpc/router/campaign/character";
import { campaignInviteRouter } from "@/trpc/router/campaign/invite";
import { campaignMemberRouter } from "@/trpc/router/campaign/member";
import { campaignSessionRouter } from "@/trpc/router/campaign/session";
import { authedProcedure, procedure, router } from "@/trpc/trpc";

export const campaignRouter = router({
    character: campaignCharacterRouter,
    invite: campaignInviteRouter,
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

    list: authedProcedure
        .input(
            z.object({
                filter: z.nativeEnum(CampaignFilter),
            }),
        )
        .query(async (opts) => {
            let filter: FilterQuery<Campaign> = {};
            const campaignMembers: CampaignMember[] = [];

            if (
                !opts.input.filter ||
                opts.input.filter === CampaignFilter.MEMBER_OF
            ) {
                campaignMembers.push(
                    ...(await CampaignMemberModel.find({
                        user: new ObjectId(opts.ctx.session!.user.id),
                    })),
                );

                filter = {
                    _id: {
                        $in: campaignMembers.map((cm) => cm.campaign),
                    },
                };
            } else if (opts.input.filter === CampaignFilter.GUILD_LINKED) {
                if (!opts.ctx.guild) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: CampaignError.GUILD_NOT_FOUND,
                    });
                }

                filter = {
                    discordGuild: opts.ctx.guild._id,
                };
            } else if (opts.input.filter === CampaignFilter.CREATED) {
                campaignMembers.push(
                    ...(await CampaignMemberModel.find({
                        user: new ObjectId(opts.ctx.session!.user.id),
                        type: CampaignMemberType.DM,
                    })),
                );

                filter = {
                    _id: {
                        $in: campaignMembers.map((cm) => cm.campaign),
                    },
                };
            } else {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid filter",
                });
            }

            const campaigns = await CampaignModel.find(filter)
                .populate("createdBy")
                .populate("schedules")
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

    create: authedProcedure
        .input(
            z.object({
                name: z.string(),
            }),
        )
        .mutation(async (opts) => {
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

    update: authedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.optional(z.string()),
            }),
        )
        .mutation(async (opts) => {
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

    delete: authedProcedure.input(z.string()).mutation(async (opts) => {
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

    linkGuild: authedProcedure
        .input(
            z.object({
                campaignId: z.string(),
            }),
        )
        .mutation(async (opts) => {
            if (!ObjectId.isValid(opts.input.campaignId)) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignError.NOT_FOUND,
                });
            }

            if (!opts.ctx.guild && !opts.ctx.guild_id) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignError.NO_GUILD_ID,
                });
            }

            const campaign = await CampaignModel.findById(
                new ObjectId(opts.input.campaignId),
            );

            if (!campaign) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignError.NOT_FOUND,
                });
            }

            const guild = await DiscordGuildModel.findOneAndUpdate(
                {
                    guildId: opts.ctx.guild_id as string,
                },
                {
                    guildId: opts.ctx.guild_id as string,
                },
                {
                    upsert: true,
                    new: true,
                },
            );

            if (campaign.discordGuild?.toString() !== guild._id.toString()) {
                campaign.discordGuild = guild._id as any;

                await campaign.save();
            }

            return true;
        }),

    unlinkGuilds: authedProcedure
        .input(
            z.object({
                campaignId: z.string(),
            }),
        )
        .mutation(async (opts) => {
            if (!ObjectId.isValid(opts.input.campaignId)) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignError.NOT_FOUND,
                });
            }

            const campaign = await CampaignModel.findById(
                new ObjectId(opts.input.campaignId),
            );

            if (!campaign) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignError.NOT_FOUND,
                });
            }

            campaign.discordGuild = null!;

            await campaign.save();

            return true;
        }),
});
