"use client";

import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DiscordIcon from "~icons/ic/baseline-discord";
import LoadingIcon from "~icons/mdi/loading";

import { authenticateUser } from "@/lib/auth/authenticateUser";
import { useUser } from "@/state/user";

export default function RootPage() {
    const router = useRouter();

    const user = useUser();

    const authenticateMutation = useMutation({
        mutationKey: ["authenticate", "discord"],
        mutationFn: authenticateUser,
    });

    const isLoading = authenticateMutation.isPending || user.isLoading;

    useEffect(() => {
        router.prefetch("/home");
    }, [router]);

    useEffect(() => {
        if (!user.isLoading && user.authenticated) {
            router.push("/home");
        }
    }, [router, user.authenticated, user.isLoading]);

    useEffect(() => {
        if (authenticateMutation.isSuccess && !authenticateMutation.isError) {
            router.push("/home");
        }
    }, [authenticateMutation.isError, authenticateMutation.isSuccess, router]);

    return (
        <div className="absolute inset-0 flex h-screen w-screen flex-col items-center justify-center gap-2">
            <button
                className={clsx(
                    "flex items-center gap-2 rounded-lg bg-[#5865F2] p-2 opacity-100 transition-[transform,opacity] duration-150 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50",
                    {
                        "scale-90": isLoading,
                    },
                )}
                onClick={() => authenticateMutation.mutate()}
                disabled={isLoading}
            >
                {isLoading ? (
                    <LoadingIcon className="h-8 w-8 animate-spin p-1" />
                ) : (
                    <DiscordIcon className="h-8 w-8" />
                )}
                <span className="font-semibold">Login with Discord</span>
            </button>

            {authenticateMutation.isError && (
                <p className="text-red-500">
                    {authenticateMutation.error.message}
                </p>
            )}
        </div>
    );
}
