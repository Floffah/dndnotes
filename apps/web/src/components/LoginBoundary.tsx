"use client";

import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

import { LoginWithDiscordButton } from "@/components/LoginWithDiscordButton";
import { useUser } from "@/state/user";

export function LoginBoundary({
    redirect,
    children,
}: PropsWithChildren<{ redirect?: boolean }>) {
    const router = useRouter();
    const user = useUser();

    useEffect(() => {
        if (redirect && !user.isLoading && !user.isAuthenticated) {
            router.push("/");
        }
    }, [redirect, router, user.isAuthenticated, user.isLoading]);

    return (
        <>
            {(user.isLoading || user.isAuthenticated) && children}

            {!user.isLoading && !user.isAuthenticated && !redirect && (
                <LoginWithDiscordButton className="mx-auto w-fit" />
            )}
        </>
    );
}
