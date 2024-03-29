import { ObjectId } from "mongodb";
import { z } from "zod";

import { ServerError } from "@dndnotes/backend-framework";
import {
    CampaignAPIModel,
    CampaignError,
    CampaignMemberType,
} from "@dndnotes/models";

import { CampaignFilter } from "@/enums";
import { ensureAuthenticated } from "@/lib/ensureAuthenticated";
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

        const campaignMembers = await CampaignMemberModel.find({
            user: new ObjectId(opts.ctx.session!.user.id),
        });

        const campaigns = await CampaignModel.find({
            _id: {
                $in: campaignMembers.map((cm) => cm.campaign),
            },
        })
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
});
