import { ServerError } from "@dndnotes/backend-framework";
import {
    CampaignError,
    CampaignInviteAPIModel,
    CampaignInviteError,
    CampaignMemberType,
    isPopulated,
} from "@dndnotes/models";
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";
import { z } from "zod";

import { ensureAuthenticated } from "@/lib/ensureAuthenticated";
import { CampaignInviteModel } from "@/models/CampaignInviteModel";
import { CampaignMemberModel } from "@/models/CampaignMemberModel";
import { procedure, router } from "@/router/context";

export const campaignInviteRouter = router({
    get: procedure(
        z.object({
            campaignId: z.string(),
            inviteCode: z.string(),
        }),
    ).query(async (opts) => {
        await ensureAuthenticated(opts.ctx);

        if (!ObjectId.isValid(opts.input.campaignId)) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignError.NOT_FOUND,
            });
        }

        const invite = await CampaignInviteModel.findOne({
            campaign: new ObjectId(opts.input.campaignId),
            code: opts.input.inviteCode,
        })
            .populate("campaign")
            .exec();

        if (!invite) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignInviteError.NOT_FOUND,
            });
        }

        if (
            !invite.viewedBy.some((user) =>
                isPopulated(user)
                    ? user.id === opts.ctx.session!.user.id
                    : user.toString() === opts.ctx.session!.user.id,
            )
        ) {
            invite.viewedBy.push(opts.ctx.session!.user);
            await invite.save();
        }

        const campaignMember = await CampaignMemberModel.findOne({
            campaign: new ObjectId(opts.input.campaignId),
            user: new ObjectId(opts.ctx.session!.user.id),
        });

        if (campaignMember) {
            throw new ServerError({
                code: "BAD_REQUEST",
                message: CampaignInviteError.ALREADY_MEMBER,
            });
        }

        return new CampaignInviteAPIModel(invite, {
            user: opts.ctx.session!.user,
        });
    }),

    create: procedure(
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

        const existingInvite = await CampaignInviteModel.findOne({
            campaign: new ObjectId(opts.input.campaignId),
            createdBy: new ObjectId(opts.ctx.session!.user.id),
        });

        if (existingInvite) {
            return new CampaignInviteAPIModel(existingInvite, {
                user: opts.ctx.session!.user,
            });
        }

        const campaignInvite = await CampaignInviteModel.create({
            campaign: new ObjectId(opts.input.campaignId),
            createdBy: new ObjectId(opts.ctx.session!.user.id),
            code: nanoid(16),
        });

        return new CampaignInviteAPIModel(campaignInvite, {
            user: opts.ctx.session!.user,
        });
    }),

    accept: procedure(
        z.object({
            code: z.string(),
        }),
    ).mutation(async (opts) => {
        await ensureAuthenticated(opts.ctx);

        const campaignInvite = await CampaignInviteModel.findOne({
            code: opts.input.code,
        });

        if (!campaignInvite) {
            throw new ServerError({
                code: "NOT_FOUND",
                message: CampaignInviteError.NOT_FOUND,
            });
        }

        const campaignMember = await CampaignMemberModel.findOne({
            campaign: campaignInvite.campaign,
            user: new ObjectId(opts.ctx.session!.user.id),
        });

        if (campaignMember) {
            await campaignInvite.deleteOne();

            throw new ServerError({
                code: "BAD_REQUEST",
                message: CampaignInviteError.ALREADY_MEMBER,
            });
        }

        await CampaignMemberModel.create({
            campaign: campaignInvite.campaign,
            user: new ObjectId(opts.ctx.session!.user.id),
            type: CampaignMemberType.PLAYER,
        });

        campaignInvite.acceptedBy.push(
            new ObjectId(opts.ctx.session!.user.id) as any,
        );

        await campaignInvite.save();

        return true;
    }),
});
