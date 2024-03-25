"use client";

import {
    FriendshipRequest,
    FriendshipRequestState,
    User,
} from "@dndnotes/models";
import { usePathname } from "next/navigation";
import { createContext, useContext } from "react";

import { api } from "@/app/lib/api";

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

    const cache = api.useCache();

    const userQuery = api.user.me.useQuery();

    const friends = api.user.friends.getAccepted.useQuery(
        {
            user: userQuery.data?.id,
        },
        {
            enabled: !!userQuery.data?.id,
        },
    );

    const incomingRequests = api.user.friends.getPending.useQuery(
        {
            to: userQuery.data?.id,
        },
        {
            enabled: !!userQuery.data?.id && pathname === "/home",
        },
    );

    const addFriendMutation = api.user.friends.sendRequest.useMutation();
    const updateIncomingRequestMutation =
        api.user.friends.updateRequest.useMutation();

    const addFriend = async (username: string) => {
        const request = await addFriendMutation.mutateAsync({
            to: {
                username,
            },
        });

        const existingOutgoingRequests = cache.user.friends.getPending.getData({
            from: userQuery.data?.id,
        });

        cache.user.friends.getPending.setData(
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
                cache.user.friends.getPending.getData({
                    to: userQuery.data?.id,
                }) ?? [];

            cache.user.friends.getPending.setData(
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
                cache.user.friends.getPending.getData({
                    to: userQuery.data?.id,
                }) ?? [];

            cache.user.friends.getPending.setData(
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
