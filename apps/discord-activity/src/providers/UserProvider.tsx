"use client";

import { PropsWithChildren, createContext, useContext } from "react";

import { User } from "@dndnotes/models";

import { api } from "@/lib/api";

export interface UserContextValue extends User {
    loading: boolean;
    authenticated: boolean;
}

export const UserContext = createContext<UserContextValue>(null!);

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: PropsWithChildren) {
    const userQuery = api.user.me.useQuery();

    return (
        <UserContext.Provider
            value={
                {
                    ...(userQuery.data ?? {}),
                    loading: userQuery.isPending,
                    authenticated: !userQuery.isPending && !!userQuery.data?.id,
                } as UserContextValue
            }
        >
            {children}
        </UserContext.Provider>
    );
}
