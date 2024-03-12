import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { CampaignMemberType } from "@/db/enums/CampaignMemberType";
import { CampaignError } from "@/db/models/Campaign/error";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { characterSheet } from "@/db/models/Character";
import { CharacterAPIModel } from "@/db/models/Character/consumers";
import { CharacterError } from "@/db/models/Character/error";
import { CharacterModel } from "@/db/models/Character/model";
import { ensureAuthenticated } from "@/server/lib/ensureAuthenticated";
import { procedure, router } from "@/server/trpc";

export const campaignCharacterRouter = router({
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

            const characters = await CharacterModel.find({
                campaign: new ObjectId(opts.input.campaignId),
            })
                .populate("user")
                .exec();

            return characters.map(
                (character) =>
                    new CharacterAPIModel(character, {
                        user: opts.ctx.session!.user,
                    }),
            );
        }),

    get: procedure
        .input(
            z.object({
                characterId: z.string(),
            }),
        )
        .query(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            if (!ObjectId.isValid(opts.input.characterId)) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CharacterError.NOT_FOUND,
                });
            }

            const character = await CharacterModel.findById(
                new ObjectId(opts.input.characterId),
            )
                .populate("user")
                .exec();

            if (!character) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CharacterError.NOT_FOUND,
                });
            }

            return new CharacterAPIModel(character, {
                user: opts.ctx.session!.user,
            });
        }),

    create: procedure
        .input(
            z.object({
                campaignId: z.string(),
                name: z.string(),
                content: z.optional(characterSheet),
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
            ).exec();

            if (!campaign) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CampaignError.NOT_FOUND,
                });
            }

            const campaignMember = await CampaignMemberModel.findOne({
                campaign: new ObjectId(opts.input.campaignId),
                user: new ObjectId(opts.ctx.session!.user.id),
            }).exec();

            if (!campaignMember) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: CharacterError.NO_CREATE_PERMISSION,
                });
            }

            const contentParseResult = await characterSheet.safeParseAsync(
                opts.input.content,
            );

            if (!contentParseResult.success) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: CharacterError.INVALID_CONTENT,
                    cause: contentParseResult.error,
                });
            }

            const character = new CharacterModel({
                name: opts.input.name,
                campaign: new ObjectId(opts.input.campaignId),
                content: opts.input.content,
            });

            await character.save();

            return new CharacterAPIModel(character, {
                user: opts.ctx.session!.user,
            });
        }),

    update: procedure
        .input(
            z.object({
                characterId: z.string(),
                name: z.optional(z.string()),
                content: z.optional(characterSheet),
            }),
        )
        .mutation(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            if (!ObjectId.isValid(opts.input.characterId)) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CharacterError.NOT_FOUND,
                });
            }

            const character = await CharacterModel.findById(
                new ObjectId(opts.input.characterId),
            )
                .populate("createdBy")
                .exec();

            if (!character) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: CharacterError.NOT_FOUND,
                });
            }

            if (
                character.createdBy.user.toString() !==
                    opts.ctx.session!.user.id &&
                character.createdBy.type !== CampaignMemberType.DM
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: CharacterError.NO_UPDATE_PERMISSION,
                });
            }

            if (opts.input.name) {
                character.name = opts.input.name;
            }

            if (opts.input.content) {
                const contentParseResult = await characterSheet.safeParseAsync(
                    opts.input.content,
                );

                if (!contentParseResult.success) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: CharacterError.INVALID_CONTENT,
                        cause: contentParseResult.error,
                    });
                }

                character.content = opts.input.content;
            }

            await character.save();

            return new CharacterAPIModel(character, {
                user: opts.ctx.session!.user,
            });
        }),
});
