import { ObjectId } from "mongodb";
import { FilterQuery } from "mongoose";
import { z } from "zod";

import { ServerError } from "@dndnotes/backend-framework";
import {
    Campaign,
    CampaignAPIModel,
    CampaignError,
    CampaignMember,
    CampaignMemberType,
    DiscordGuild,
} from "@dndnotes/models";

import { CampaignFilter } from "@/enums";
import { ensureAuthenticated } from "@/lib/ensureAuthenticated";
import { DiscordGuildModel } from "@/models";
import { CampaignMemberModel } from "@/models/CampaignMemberModel";
import { CampaignModel } from "@/models/CampaignModel";
import { campaignCharacterRouter } from "@/router/campaign/character";
import { campaignInviteRouter } from "@/router/campaign/invite";
import { campaignMemberRouter } from "@/router/campaign/member";
import { campaignSessionRouter } from "@/router/campaign/session";
import { procedure, router } from "@/router/context";

export const campaignRouter = router({
    character: campaignCharacterRouter,
    invite: campaignInviteRouter,
    member: campaignMemberRouter,
    session: campaignSessionRouter,

    get: procedure(z.string()).query(async (opts) => {
        if (!ObjectId.isValid(opts.input)) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        const campaign = await CampaignModel.findById(new ObjectId(opts.input))
            .populate("createdBy")
            .exec();

        if (!campaign) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        return new CampaignAPIModel(campaign, {
            user: opts.ctx.session?.user,
        });
    }),

    list: procedure(
        z.object({
            filter: z.nativeEnum(CampaignFilter),
        }),
    ).query(async (opts) => {
        await ensureAuthenticated(opts.ctx);

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
                throw new ServerError({
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
            throw new ServerError({
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
                            cm.campaign.toString() === campaign._id.toString(),
                    ),
                }),
        );
    }),

    create: procedure(
        z.object({
            name: z.string(),
        }),
    ).mutation(async (opts) => {
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

    update: procedure(
        z.object({
            id: z.string(),
            name: z.optional(z.string()),
        }),
    ).mutation(async (opts) => {
        await ensureAuthenticated(opts.ctx);

        if (!ObjectId.isValid(opts.input.id)) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        const campaign = await CampaignModel.findById(
            new ObjectId(opts.input.id),
        );

        if (!campaign) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        const campaignMember = await CampaignMemberModel.findOne({
            campaign: campaign._id,
            user: new ObjectId(opts.ctx.session!.user.id),
        });

        if (!campaignMember) {
            throw new ServerError({
                code: "FORBIDDEN",
                message: CampaignError.NO_CAMPAIGN_MEMBER,
            });
        }

        if (campaignMember.type !== CampaignMemberType.DM) {
            throw new ServerError({
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

    delete: procedure(z.string()).mutation(async (opts) => {
        await ensureAuthenticated(opts.ctx);

        if (!ObjectId.isValid(opts.input)) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        const campaign = await CampaignModel.findById(new ObjectId(opts.input));

        if (!campaign) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        const campaignMember = await CampaignMemberModel.findOne({
            campaign: campaign._id,
            user: new ObjectId(opts.ctx.session!.user.id),
        });

        if (!campaignMember) {
            throw new ServerError({
                code: "FORBIDDEN",
                message: CampaignError.NO_CAMPAIGN_MEMBER,
            });
        }

        if (campaignMember.type !== CampaignMemberType.DM) {
            throw new ServerError({
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

    linkGuild: procedure(
        z.object({
            campaignId: z.string(),
        }),
    ).mutation(async (opts) => {
        await ensureAuthenticated(opts.ctx);

        if (!ObjectId.isValid(opts.input.campaignId)) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        if (!opts.ctx.guild) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignError.NO_GUILD_ID,
            });
        }

        const campaign = await CampaignModel.findById(
            new ObjectId(opts.input.campaignId),
        );

        if (!campaign) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        const guild = await DiscordGuildModel.findOneAndUpdate(
            {
                guildId: opts.ctx.guild.id,
            },
            {
                guildId: opts.ctx.guild.id,
            },
            {
                upsert: true,
                new: true,
            },
        );

        if (campaign.discordGuild.toString() !== guild._id.toString()) {
            campaign.discordGuild = guild._id as any;

            await campaign.save();
        }

        return true;
    }),
});
