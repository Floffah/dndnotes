import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { FilterQuery } from "mongoose";
import { z } from "zod";

import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";
import { FriendshipRequestAPIModel } from "@/db/models/FriendshipRequest/consumers";
import { FriendshipRequestError } from "@/db/models/FriendshipRequest/error";
import {
    FriendshipRequestModel,
    FriendshipRequestSchema,
} from "@/db/models/FriendshipRequest/model";
import { UserError } from "@/db/models/User/error";
import { UserModel } from "@/db/models/User/model";
import { ensureAuthenticated } from "@/server/lib/ensureAuthenticated";
import { procedure, router } from "@/server/trpc";

export const userFriendsRouter = router({
    getAccepted: procedure
        .input(
            z.object({
                user: z.string().optional(),
                // TODO: implement sorting (default, last active, name, etc)
                // TODO: implement pagination
            }),
        )
        .query(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            const userId = opts.input.user ?? opts.ctx.session!.user.id;

            const requests = await FriendshipRequestModel.find({
                $or: [
                    { sender: new ObjectId(userId) },
                    { recipient: new ObjectId(userId) },
                ],
                state: FriendshipRequestState.ACCEPTED,
            })
                .populate("sender")
                .populate("recipient")
                .exec();

            return requests.map((request) =>
                new FriendshipRequestAPIModel(request).toObject({
                    currentUser: opts.ctx.session!.user,
                }),
            );
        }),

    getPending: procedure
        .input(
            z.object({
                to: z.string().optional(),
                from: z.string().optional(),
            }),
        )
        .query(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            if (!opts.input.to && !opts.input.from) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: FriendshipRequestError.BAD_INPUT,
                });
            }

            if (opts.input.to && opts.input.to !== opts.ctx.session!.user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: FriendshipRequestError.CANNOT_VIEW_OTHERS_PENDING,
                });
            }

            if (
                opts.input.from &&
                opts.input.from !== opts.ctx.session!.user.id
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: FriendshipRequestError.CANNOT_VIEW_OTHERS_PENDING,
                });
            }

            const query: FilterQuery<typeof FriendshipRequestSchema> = {
                state: FriendshipRequestState.PENDING,
            };

            if (opts.input.to) {
                query.recipient = new ObjectId(opts.input.to);
            } else if (opts.input.from) {
                query.sender = new ObjectId(opts.input.from);
            }

            const requests = await FriendshipRequestModel.find(query)
                .populate("sender")
                .populate("recipient")
                .exec();

            return requests.map((request) =>
                new FriendshipRequestAPIModel(request).toObject({
                    currentUser: opts.ctx.session!.user,
                }),
            );
        }),

    sendRequest: procedure
        .input(
            z.object({
                to: z.object({
                    id: z.string().optional(),
                    username: z.string().optional(),
                }),
            }),
        )
        .mutation(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            if (
                opts.input.to.id === opts.ctx.session!.user.id ||
                opts.input.to.username === opts.ctx.session!.user.name
            ) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: FriendshipRequestError.CANNOT_SEND_TO_SELF,
                });
            }

            let recipientId = opts.input.to.id;

            if (!recipientId) {
                const toUser = await UserModel.findOne({
                    name: opts.input.to.username,
                });

                if (!toUser) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: UserError.NOT_FOUND,
                    });
                }

                recipientId = toUser.id;
            }

            const existingRequest = await FriendshipRequestModel.findOne({
                sender: new ObjectId(opts.ctx.session!.user.id),
                recipient: recipientId,
            });

            if (existingRequest) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: FriendshipRequestError.REQUEST_ALREADY_SENT,
                });
            }

            const request = new FriendshipRequestModel({
                sender: new ObjectId(opts.ctx.session!.user.id),
                recipient: recipientId,
            });

            await request.populate("sender");
            await request.populate("recipient");

            await request.save();

            return new FriendshipRequestAPIModel(request).toObject({
                currentUser: opts.ctx.session!.user,
            });
        }),

    updateRequest: procedure
        .input(
            z.object({
                id: z.string(),
                state: z.nativeEnum(FriendshipRequestState),
            }),
        )
        .mutation(async (opts) => {
            await ensureAuthenticated(opts.ctx);

            const request = await FriendshipRequestModel.findById(
                new ObjectId(opts.input.id),
            );

            if (!request) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: FriendshipRequestError.NOT_FOUND,
                });
            }

            if (opts.input.state === FriendshipRequestState.PENDING) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: FriendshipRequestError.CANNOT_SET_TO_PENDING,
                });
            }

            if (
                opts.input.state === FriendshipRequestState.ACCEPTED &&
                request.recipient.toString() !== opts.ctx.session!.user.id
            ) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: FriendshipRequestError.CANNOT_ACCEPT_OTHERS,
                });
            }

            if (
                opts.input.state === FriendshipRequestState.DENIED &&
                request.recipient.toString() !== opts.ctx.session!.user.id
            ) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: FriendshipRequestError.CANNOT_DENY_OTHERS,
                });
            }

            if (
                opts.input.state === FriendshipRequestState.DELETED &&
                request.sender.toString() !== opts.ctx.session!.user.id
            ) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: FriendshipRequestError.CANNOT_DELETE_OTHERS,
                });
            }

            request.state = opts.input.state;

            if (
                opts.input.state === FriendshipRequestState.DENIED ||
                opts.input.state === FriendshipRequestState.DELETED
            ) {
                await request.deleteOne();
            } else {
                await request.save();
            }

            return new FriendshipRequestAPIModel(request).toObject({
                currentUser: opts.ctx.session!.user,
            });
        }),
});
