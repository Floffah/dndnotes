"use client";

import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import DiscordIcon from "~icons/ic/baseline-discord";
import WarningIcon from "~icons/ic/round-warning-amber";
import LoadingIcon from "~icons/mdi/loading";

import { Tooltip } from "@dndnotes/components";

import { api } from "@/lib/api";
import { authenticateUser } from "@/lib/auth/authenticateUser";
import { useUser } from "@/state/user";

export function LoginWithDiscordButton() {
    const trpcUtils = api.useUtils();
    const router = useRouter();

    const user = useUser();

    const authenticateMutation = useMutation({
        mutationKey: ["authenticate", "discord"],
        mutationFn: authenticateUser,
    });

    const triedForceLoginRef = useRef(false);

    const isLoading = authenticateMutation.isPending || user.isLoading;

    let Icon = DiscordIcon;

    if (authenticateMutation.isError) {
        Icon = WarningIcon;
    } else if (isLoading) {
        Icon = LoadingIcon;
    }

    useEffect(() => {
        router.prefetch("/home");
    }, [router]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        if (
            searchParams.has("forceLogin") &&
            !user.isLoading &&
            !user.isAuthenticated &&
            !triedForceLoginRef.current
        ) {
            triedForceLoginRef.current = true;
            authenticateMutation.mutate();
        }
    }, [authenticateMutation, user.isAuthenticated, user.isLoading]);

    useEffect(() => {
        if (!user.isLoading && user.isAuthenticated) {
            router.push("/home");
        }
    }, [router, user.isAuthenticated, user.isLoading]);

    useEffect(() => {
        if (authenticateMutation.isSuccess && !authenticateMutation.isError) {
            trpcUtils.user.me.setData(undefined, authenticateMutation.data!);
            router.push("/home");
        }
    }, [
        authenticateMutation.data,
        authenticateMutation.isError,
        authenticateMutation.isSuccess,
        router,
        trpcUtils.user.me,
    ]);

    return (
        <Tooltip
            title={authenticateMutation.error?.message!}
            enabled={authenticateMutation.isError}
        >
            <button
                className={clsx(
                    "flex items-center gap-2 rounded-lg p-2 opacity-100 transition-[transform,opacity] duration-150 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50",
                    {
                        "scale-90": isLoading,
                        "bg-discord-blurple": !authenticateMutation.isError,
                        "bg-red-700": authenticateMutation.isError,
                    },
                )}
                onClick={() => authenticateMutation.mutate()}
                disabled={isLoading}
            >
                <Icon
                    className={clsx("h-8 w-8", {
                        "animate-spin p-1": isLoading,
                    })}
                />
                <span className="font-semibold">Login with Discord</span>
            </button>
        </Tooltip>
    );
}
