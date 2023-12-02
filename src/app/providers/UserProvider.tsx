"use client";

import { createContext, useContext } from "react";

import { trpc } from "@/app/api/lib/client/trpc";
import type { UserClientType } from "@/db/models/User/consumers";
import { UserClientModel } from "@/db/models/User/consumers";

export interface UserContextValue extends UserClientType {
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
                userQuery.isLoading
                    ? ({ loading: true } as UserContextValue)
                    : {
                          ...new UserClientModel(userQuery.data!).toObject(),
                          loading: userQuery.isLoading,
                          authenticated:
                              !userQuery.isLoading && !!userQuery.data?.id,
                      }
            }
        >
            {children}
        </UserContext.Provider>
    );
}
