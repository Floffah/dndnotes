import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { RepeatInterval } from "@/db/enums/RepeatInterval";
import { CampaignError } from "@/db/models/Campaign/error";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignMemberError } from "@/db/models/CampaignMember/error";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { CampaignSessionAPIModel } from "@/db/models/CampaignSession/consumers";
import { CampaignSessionModel } from "@/db/models/CampaignSession/model";
import { CampaignSessionScheduleAPIModel } from "@/db/models/CampaignSessionSchedule/consumers";
import { CampaignSessionScheduleError } from "@/db/models/CampaignSessionSchedule/error";
import { CampaignSessionScheduleModel } from "@/db/models/CampaignSessionSchedule/model";
import { ensureAuthenticated } from "@/server/lib/ensureAuthenticated";
import { procedure, router } from "@/server/trpc";

export const campaignSessionRouter = router({
    getSchedules: procedure
        .input(
            z.object({
                campaignId: z.string(),
            }),
        )
        .query(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            const campaign = await CampaignModel.findById(
                new ObjectId(opts.input.campaignId),
            );

            if (!campaign) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignError.NOT_FOUND,
                });
            }

            const campaignMember = await CampaignMemberModel.findOne({
                campaign: campaign._id,
                user: new ObjectId(opts.ctx.session!.user.id),
            });

            if (!campaignMember) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignError.NO_CAMPAIGN_MEMBER,
                });
            }

            const schedules = await CampaignSessionScheduleModel.find({
                campaign: campaign._id,
            });

            return schedules.map((schedule) =>
                new CampaignSessionScheduleAPIModel(schedule).toObject({
                    currentUser: opts.ctx.session!.user,
                    currentMember: campaignMember,
                }),
            );
        }),
    createSchedule: procedure
        .input(
            z.object({
                campaignId: z.string(),
                name: z.string(),
                type: z.nativeEnum(CampaignSessionType),

                firstSessionAt: z.date(),
                repeat: z.nativeEnum(RepeatInterval).optional(),
                length: z.number().optional(),
            }),
        )
        .mutation(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            const campaign = await CampaignModel.findById(
                new ObjectId(opts.input.campaignId),
            );

            if (!campaign) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignError.NOT_FOUND,
                });
            }

            const campaignMember = await CampaignMemberModel.findOne({
                campaign: campaign._id,
                user: new ObjectId(opts.ctx.session!.user.id),
            });

            if (!campaignMember) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignError.NO_CAMPAIGN_MEMBER,
                });
            }

            if (campaignMember.type !== CampaignMemberType.DM) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignMemberError.NOT_OWNER,
                });
            }

            const schedule = new CampaignSessionScheduleModel({
                name: opts.input.name,
                type: opts.input.type,
                campaign: campaign._id,
                firstSessionAt: new Date(opts.input.firstSessionAt),
                repeat: opts.input.repeat ?? null,
                length: opts.input.length ?? null,
            });

            await schedule.save();

            return new CampaignSessionScheduleAPIModel(schedule).toObject({
                currentUser: opts.ctx.session!.user,
                currentMember: campaignMember,
            });
        }),
    startSchedule: procedure
        .input(
            z.object({
                name: z.string(),
                campaignId: z.string(),
                scheduleId: z.string().optional(),
            }),
        )
        .mutation(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            const campaign = await CampaignModel.findById(
                new ObjectId(opts.input.campaignId),
            );

            if (!campaign) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignError.NOT_FOUND,
                });
            }

            const campaignMember = await CampaignMemberModel.findOne({
                campaign: campaign._id,
                user: new ObjectId(opts.ctx.session!.user.id),
            });

            if (!campaignMember) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignError.NO_CAMPAIGN_MEMBER,
                });
            }

            if (campaignMember.type !== CampaignMemberType.DM) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignMemberError.NOT_OWNER,
                });
            }

            const schedule = await CampaignSessionScheduleModel.findById(
                new ObjectId(opts.input.scheduleId),
            );

            if (!schedule) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignSessionScheduleError.NOT_FOUND,
                });
            }

            const session = new CampaignSessionModel({
                name: opts.input.name,
                type: schedule.type,
                campaign: campaign._id,
                schedule: schedule._id,
                startedAt: new Date(),
            });

            await session.save();

            return new CampaignSessionAPIModel(session).toObject({
                currentUser: opts.ctx.session!.user,
                currentMember: campaignMember,
            });
        }),
});
