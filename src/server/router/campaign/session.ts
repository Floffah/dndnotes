import { JSONContent, getSchema } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import { TRPCError } from "@trpc/server";
import { addDays } from "date-fns";
import { ObjectId } from "mongodb";
import { HydratedDocument } from "mongoose";
import { z } from "zod";

import { tiptapExtensions } from "@/app/lib/tiptapExtensions";
import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { DocumentFormat } from "@/db/enums/DocumentFormat";
import { RepeatInterval } from "@/db/enums/RepeatInterval";
import { CampaignError } from "@/db/models/Campaign/error";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignMemberError } from "@/db/models/CampaignMember/error";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { CampaignSessionAPIModel } from "@/db/models/CampaignSession/consumers";
import { CampaignSessionError } from "@/db/models/CampaignSession/error";
import { CampaignSessionModel } from "@/db/models/CampaignSession/model";
import { CampaignSessionScheduleAPIModel } from "@/db/models/CampaignSessionSchedule/consumers";
import { CampaignSessionScheduleError } from "@/db/models/CampaignSessionSchedule/error";
import { CampaignSessionScheduleModel } from "@/db/models/CampaignSessionSchedule/model";
import { Document } from "@/db/models/Document";
import { DocumentModel } from "@/db/models/Document/model";
import { CampaignSessionScheduleFilter } from "@/server/enums/CampaignSessionScheduleFilter";
import { CampaignSessionSort } from "@/server/enums/CampaignSessionSort";
import { ensureAuthenticated } from "@/server/lib/ensureAuthenticated";
import { procedure, router } from "@/server/trpc";

export const campaignSessionRouter = router({
    get: procedure
        .input(
            z.object({
                campaignId: z.string(),
                sessionId: z.string(),
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

            if (!ObjectId.isValid(opts.input.sessionId)) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignSessionError.NOT_FOUND,
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

            const session = await CampaignSessionModel.findById(
                new ObjectId(opts.input.sessionId),
            )
                .populate("schedule")
                .populate("campaign")
                .populate("summary")
                .exec();

            if (!session) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignSessionError.NOT_FOUND,
                });
            }

            return new CampaignSessionAPIModel(session, {
                user: opts.ctx.session!.user,
                campaignMember: campaignMember,
            });
        }),

    list: procedure
        .input(
            z.object({
                campaignId: z.string(),
                sort: z
                    .nativeEnum(CampaignSessionSort)
                    .optional()
                    .default(CampaignSessionSort.CREATED_AT_DESC),
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

            const campaign = await CampaignModel.findById(
                new ObjectId(opts.input.campaignId),
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
                    code: "BAD_REQUEST",
                    message: CampaignError.NO_CAMPAIGN_MEMBER,
                });
            }

            const sessionsQuery = CampaignSessionModel.find({
                campaign: campaign._id,
            });

            if (opts.input.sort === CampaignSessionSort.CREATED_AT_DESC) {
                sessionsQuery.sort({ createdAt: -1 });
            }

            const sessions = await sessionsQuery.exec();

            return sessions.map(
                (session) =>
                    new CampaignSessionAPIModel(session, {
                        user: opts.ctx.session!.user,
                        campaignMember: campaignMember,
                    }),
            );
        }),

    getSchedules: procedure
        .input(
            z.object({
                campaignId: z.string(),
                filter: z
                    .nativeEnum(CampaignSessionScheduleFilter)
                    .optional()
                    .default(CampaignSessionScheduleFilter.ALL),
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

            const scheduleFilter = {
                campaign: campaign._id,
            };

            if (opts.input.filter === CampaignSessionScheduleFilter.PAST) {
                scheduleFilter["firstSessionAt"] = {
                    $lte: addDays(new Date(), 1),
                };
            } else if (
                opts.input.filter === CampaignSessionScheduleFilter.UPCOMING
            ) {
                scheduleFilter["firstSessionAt"] = {
                    $gte: new Date(),
                };
            }

            const schedules =
                await CampaignSessionScheduleModel.find(scheduleFilter);

            return schedules.map(
                (schedule) =>
                    new CampaignSessionScheduleAPIModel(schedule, {
                        user: opts.ctx.session!.user,
                        campaignMember: campaignMember,
                    }),
            );
        }),

    updateSummary: procedure
        .input(
            z.object({
                campaignId: z.string(),
                sessionId: z.string(),
                richText: z.any().optional() as z.ZodOptional<
                    z.ZodType<JSONContent>
                >,
                notionId: z.string().optional(),
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

            if (!ObjectId.isValid(opts.input.sessionId)) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignSessionError.NOT_FOUND,
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

            const session = await CampaignSessionModel.findById(
                new ObjectId(opts.input.sessionId),
            )
                .populate("summary")
                .exec();

            if (!session) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignSessionError.NOT_FOUND,
                });
            }

            if (session.campaign.toString() !== campaign._id.toString()) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignSessionError.NOT_FOUND,
                });
            }

            if (campaignMember.type !== CampaignMemberType.DM) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignMemberError.NOT_OWNER,
                });
            }

            let document = session.summary as HydratedDocument<Document>;

            if (!session.summary) {
                document = new DocumentModel({
                    name: session.name,
                    creator: new ObjectId(opts.ctx.session!.user.id),
                    campaign: campaign._id,
                });
                session.summary = document;
            }

            if (opts.input.richText) {
                if (
                    !Node.fromJSON(
                        getSchema(tiptapExtensions),
                        opts.input.richText,
                    )
                ) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: CampaignSessionError.INVALID_SUMMARY,
                    });
                }

                document.richText = opts.input.richText;
                document.notionId = null!;
                document.format = DocumentFormat.RICH_TEXT;
            } else if (opts.input.notionId) {
                document.notionId = opts.input.notionId;
                document.richText = null!;
                document.format = DocumentFormat.NOTION;
            } else {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignSessionError.INVALID_SUMMARY,
                });
            }

            await document.save();
            await session.save();

            return new CampaignSessionAPIModel(session, {
                user: opts.ctx.session!.user,
                campaignMember: campaignMember,
            });
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

            return new CampaignSessionScheduleAPIModel(schedule, {
                user: opts.ctx.session!.user,
                campaignMember: campaignMember,
            });
        }),

    deleteSchedule: procedure
        .input(
            z.object({
                campaignId: z.string(),
                scheduleId: z.string(),
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

            if (!ObjectId.isValid(opts.input.scheduleId)) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignSessionScheduleError.NOT_FOUND,
                });
            }

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

            await schedule.deleteOne();

            return;
        }),

    start: procedure
        .input(
            z.object({
                name: z.string(),
                type: z.nativeEnum(CampaignSessionType),
                scheduleId: z.string().optional(),
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

            let scheduleId: ObjectId | undefined = undefined;
            let sessionType = opts.input.type;

            if (opts.input.scheduleId) {
                if (!ObjectId.isValid(opts.input.scheduleId)) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: CampaignSessionScheduleError.NOT_FOUND,
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

                if (schedule.campaign.toString() !== campaign._id.toString()) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: CampaignSessionScheduleError.NOT_FOUND,
                    });
                }

                if (schedule.nextSessionAt > new Date()) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: CampaignSessionScheduleError.NOT_READY,
                    });
                }

                scheduleId = schedule._id;
                sessionType = schedule.type;
            }

            if (!scheduleId && !opts.input.type) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CampaignSessionError.TYPE_REQUIRED,
                });
            }

            const session = new CampaignSessionModel({
                name: opts.input.name,
                campaign: campaign._id,
                schedule: scheduleId,
                startedAt: new Date(),
                type: sessionType,
            });

            await session.save();

            campaign.totalSessions += 1;

            await campaign.save();

            return new CampaignSessionAPIModel(session, {
                user: opts.ctx.session!.user,
                campaignMember: campaignMember,
            });
        }),
});
