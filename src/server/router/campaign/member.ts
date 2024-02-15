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
import { User } from "@/db/models/User";
import { UserError } from "@/db/models/User/error";
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

    getInvite: procedure
        .input(
            z.object({
                campaignId: z.string(),
                inviteCode: z.string(),
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

            const invite = await CampaignInviteModel.findOne({
                campaign: new ObjectId(opts.input.campaignId),
                code: opts.input.inviteCode,
            })
                .populate("campaign")
                .exec();

            if (!invite) {
                throw new TRPCError({
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
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignInviteError.ALREADY_MEMBER,
                });
            }

            return new CampaignInviteAPIModel(invite, {
                user: opts.ctx.session!.user,
            });
        }),

    createInvite: procedure
        .input(
            z.object({
                campaignId: z.string(),
            }),
        )
        .mutation(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            if (!ObjectId.isValid(opts.input.campaignId)) {
                throw new TRPCError({
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

    acceptInvite: procedure
        .input(
            z.object({
                code: z.string(),
            }),
        )
        .mutation(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            const campaignInvite = await CampaignInviteModel.findOne({
                code: opts.input.code,
            });

            if (!campaignInvite) {
                throw new TRPCError({
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

                throw new TRPCError({
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
