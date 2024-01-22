"use client";

import { createContext, useContext } from "react";

import { trpc } from "@/app/api/lib/client/trpc";
import { User } from "@/db/models/User";

export interface UserContextValue extends User {
    loading: boolean;
    authenticated: boolean;
}

export const UserContext = createContext<UserContextValue>(null!);

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const userQuery = trpc.user.me.useQuery();

    return (
        <UserContext.Provider
            value={
                {
                    ...(userQuery.data ?? {}),
                    loading: userQuery.isLoading,
                    authenticated: !userQuery.isLoading && !!userQuery.data?.id,
                } as UserContextValue
            }
        >
            {children}
        </UserContext.Provider>
    );
}
