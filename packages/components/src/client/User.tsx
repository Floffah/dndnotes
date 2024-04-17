"use client";

import clsx from "clsx";
import {
    ComponentProps,
    PropsWithChildren,
    createContext,
    forwardRef,
    useContext,
} from "react";

import { User } from "@dndnotes/models";

export interface UserComponentContextValue extends User {}

const UserComponentContext = createContext<UserComponentContextValue>(null!);

export const UserAvatar = forwardRef<
    HTMLDivElement,
    Omit<ComponentProps<"div">, "ref" | "children">
>(({ className, ...props }, ref) => {
    const user = useContext(UserComponentContext);

    return (
        <div
            className={clsx(
                className,
                "flex h-8 w-8 select-none items-center justify-center rounded-full bg-white/10",
            )}
        >
            <p className="text-sm font-bold">{user.name[0].toUpperCase()}</p>
        </div>
    );
});

export const UserName = forwardRef<
    HTMLDivElement,
    Omit<ComponentProps<"div">, "ref" | "children">
>(({ className, ...props }, ref) => {
    const user = useContext(UserComponentContext);

    return <p className={clsx(className, "font-semibold")}>{user.name}</p>;
});

export const UserRoot = Object.assign(
    ({ user, children }: PropsWithChildren<{ user: User }>) => {
        return (
            <UserComponentContext.Provider value={user}>
                {children}
            </UserComponentContext.Provider>
        );
    },
    {
        Avatar: UserAvatar,
        Name: UserName,
    },
);

export { UserRoot as User };
