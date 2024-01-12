"use client";

import { InferQueryLikeInput } from "@trpc/react-query/shared";
import { PropsWithChildren, createContext, useContext } from "react";

import { trpc } from "@/app/api/lib/client/trpc";
import { serializableClone } from "@/app/lib/serializableClone";
import { useUser } from "@/app/providers/UserProvider";
import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";
import { FriendshipRequestAPIType } from "@/db/models/FriendshipRequest/consumers";

export interface CacheContextValue {
    campaign: {
        upsertCampaign: (
            queryInput: InferQueryLikeInput<typeof trpc.campaign.get>,
            data: any,
        ) => void;
    };
    user: {
        friends: {
            upsertPending: (
                queryInput: InferQueryLikeInput<
                    typeof trpc.user.friends.getPending
                >,
                data: FriendshipRequestAPIType,
            ) => void;
            upsertAccepted: (
                queryInput: InferQueryLikeInput<
                    typeof trpc.user.friends.getAccepted
                >,
                data: FriendshipRequestAPIType,
            ) => void;
        };
    };
}

export const CacheContext = createContext<CacheContextValue>(null!);

export const useCache = () => useContext(CacheContext);

export function CacheProvider({ children }: PropsWithChildren) {
    const user = useUser();
    const utils = trpc.useUtils();

    return (
        <CacheContext.Provider
            value={{
                campaign: {
                    upsertCampaign(queryInput, data) {
                        const campaignsCachedData =
                            utils.campaign.get.getData(queryInput);

                        if (!campaignsCachedData) {
                            utils.campaign.get.setData(queryInput, data);
                            return;
                        }

                        const clonedData = serializableClone(data);

                        if (campaignsCachedData.createdBy && !data.createdBy) {
                            clonedData.createdBy = serializableClone(
                                campaignsCachedData.createdBy,
                            );
                        }

                        utils.campaign.get.setData(queryInput, clonedData);
                    },
                },
                user: {
                    friends: {
                        upsertPending(queryInput, data) {
                            const pendingRequestsCachedData =
                                utils.user.friends.getPending.getData(
                                    queryInput,
                                );
                            const pendingRequests = pendingRequestsCachedData
                                ? pendingRequestsCachedData
                                : [];

                            if (
                                pendingRequests.find(
                                    (request) => request.id === data.id,
                                )
                            ) {
                                if (
                                    data.state ===
                                        FriendshipRequestState.DENIED ||
                                    data.state ===
                                        FriendshipRequestState.DELETED
                                ) {
                                    const index = pendingRequests.findIndex(
                                        (request) => request.id === data.id,
                                    );
                                    pendingRequests.splice(index, 1);
                                } else if (
                                    data.state ===
                                        FriendshipRequestState.ACCEPTED &&
                                    (queryInput.to === user.id ||
                                        data.recipient?.id === user.id)
                                ) {
                                    this.upsertAccepted(
                                        {
                                            user: user.id,
                                        },
                                        data,
                                    );

                                    const index = pendingRequests.findIndex(
                                        (request) => request.id === data.id,
                                    );
                                    pendingRequests.splice(index, 1);
                                } else {
                                    const index = pendingRequests.findIndex(
                                        (request) => request.id === data.id,
                                    );
                                    pendingRequests[index] = data;
                                }
                            } else {
                                pendingRequests.push(data);
                            }

                            utils.user.friends.getPending.setData(
                                queryInput,
                                pendingRequests,
                            );
                        },
                        upsertAccepted(queryInput, data) {
                            const acceptedRequestsCachedData =
                                utils.user.friends.getAccepted.getData();
                            const acceptedRequests = acceptedRequestsCachedData
                                ? acceptedRequestsCachedData
                                : [];

                            if (
                                acceptedRequests.find(
                                    (request) => request.id === data.id,
                                )
                            ) {
                                if (
                                    data.state ===
                                        FriendshipRequestState.DENIED ||
                                    data.state ===
                                        FriendshipRequestState.DELETED
                                ) {
                                    const index = acceptedRequests.findIndex(
                                        (request) => request.id === data.id,
                                    );
                                    acceptedRequests.splice(index, 1);
                                } else {
                                    const index = acceptedRequests.findIndex(
                                        (request) => request.id === data.id,
                                    );
                                    acceptedRequests[index] = data;
                                }
                            } else {
                                acceptedRequests.push(data);
                            }

                            utils.user.friends.getAccepted.setData(
                                queryInput,
                                acceptedRequests,
                            );
                        },
                    },
                },
            }}
        >
            {children}
        </CacheContext.Provider>
    );
}
