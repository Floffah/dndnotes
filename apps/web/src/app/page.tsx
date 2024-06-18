"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DiscordIcon from "~icons/ic/baseline-discord";
import LoadingIcon from "~icons/mdi/loading";

import { api } from "@/lib/api";
import { authenticateUser } from "@/lib/auth/authenticateUser";

export default function RootPage() {
    const router = useRouter();

    const userQuery = api.user.me.useQuery();

    const authenticateMutation = useMutation({
        mutationKey: ["authenticate", "discord"],
        mutationFn: authenticateUser,
    });

    const isLoading = authenticateMutation.isPending || userQuery.isLoading;

    useEffect(() => {
        if (!userQuery.isLoading && userQuery.data) {
            router.push("/home");
        }
    }, [router, userQuery.data, userQuery.isLoading]);

    useEffect(() => {
        if (authenticateMutation.isSuccess && !authenticateMutation.isError) {
            router.push("/home");
        }
    }, [authenticateMutation.isError, authenticateMutation.isSuccess, router]);

    return (
        <div className="absolute inset-0 flex h-screen w-screen flex-col items-center justify-center gap-2">
            <button
                className="flex items-center gap-2 rounded-lg bg-[#5865F2] p-2 opacity-100 transition-[transform,opacity] duration-150 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
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
