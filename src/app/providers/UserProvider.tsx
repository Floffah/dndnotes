"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext } from "react";

import { trpc } from "@/app/lib/api/trpc";
import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";
import { FriendshipRequest } from "@/db/models/FriendshipRequest";
import { User } from "@/db/models/User";

export interface UserContextValue extends User {
    loading: boolean;
    authenticated: boolean;

    friendsLoading: boolean;
    friends: FriendshipRequest[];
    incomingRequests: FriendshipRequest[];

    addFriend: (username: string) => Promise<void>;
    updateIncomingRequest: (
        id: string,
        data: Omit<Partial<FriendshipRequest>, "id">,
    ) => void;
}

export const UserContext = createContext<UserContextValue>(null!);

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const utils = trpc.useUtils();

    const userQuery = trpc.user.me.useQuery();

    const friends = trpc.user.friends.getAccepted.useQuery(
        {
            user: userQuery.data?.id,
        },
        {
            enabled: !!userQuery.data?.id,
        },
    );

    const incomingRequests = trpc.user.friends.getPending.useQuery(
        {
            to: userQuery.data?.id,
        },
        {
            enabled: !!userQuery.data?.id && pathname === "/home",
        },
    );

    const addFriendMutation = trpc.user.friends.sendRequest.useMutation();
    const updateIncomingRequestMutation =
        trpc.user.friends.updateRequest.useMutation();

    const addFriend = async (username: string) => {
        const request = await addFriendMutation.mutateAsync({
            to: {
                username,
            },
        });

        const existingOutgoingRequests = utils.user.friends.getPending.getData({
            from: userQuery.data?.id,
        });

        utils.user.friends.getPending.setData(
            {
                from: userQuery.data?.id,
            },
            existingOutgoingRequests
                ? [...existingOutgoingRequests, request]
                : [request],
        );
    };

    const updateIncomingRequest = async (
        id: string,
        data: Omit<FriendshipRequest, "id">,
    ) => {
        const updatedRequest = await updateIncomingRequestMutation.mutateAsync({
            id,
            ...data,
        });

        if (
            data.state === FriendshipRequestState.ACCEPTED ||
            data.state === FriendshipRequestState.DELETED ||
            data.state === FriendshipRequestState.DENIED
        ) {
            const existingIncomingRequests =
                utils.user.friends.getPending.getData({
                    to: userQuery.data?.id,
                }) ?? [];

            utils.user.friends.getPending.setData(
                {
                    to: userQuery.data?.id,
                },
                existingIncomingRequests.filter((request) => request.id !== id),
            );

            if (data.state === FriendshipRequestState.ACCEPTED) {
                await friends.refetch();
            }
        } else {
            const existingIncomingRequests =
                utils.user.friends.getPending.getData({
                    to: userQuery.data?.id,
                }) ?? [];

            utils.user.friends.getPending.setData(
                {
                    to: userQuery.data?.id,
                },
                existingIncomingRequests.map((request) =>
                    request.id === id ? updatedRequest : request,
                ),
            );
        }
    };

    return (
        <UserContext.Provider
            value={
                {
                    ...(userQuery.data ?? {}),
                    loading: userQuery.isPending,
                    authenticated: !userQuery.isPending && !!userQuery.data?.id,
                    friendsLoading:
                        friends.isPending || incomingRequests.isPending,
                    friends: friends.data ?? [],
                    incomingRequests: incomingRequests.data ?? [],

                    addFriend,
                    updateIncomingRequest,
                } as UserContextValue
            }
        >
            {children}
        </UserContext.Provider>
    );
}
