"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { stringify } from "superjson";

import { Loader } from "@dndnotes/components";

import { api } from "@/lib/api";

export default function DiscordRedirectPage({
    searchParams: {
        code,
        error: callbackError,
        error_description: callbackErrorDescription,
    },
}) {
    const router = useRouter();

    const { isPending, isError, error, data, mutate } =
        api.authentication.loginWithDiscord.useMutation();

    useEffect(() => {
        if (!isPending && !isError && !data && code) {
            mutate({ code });
        }
    }, [code, data, isError, isPending, mutate]);

    useEffect(() => {
        if (typeof window.opener === "undefined") {
            router.replace("/");
            return;
        }

        if (callbackError && callbackErrorDescription) {
            window.opener.callback(
                stringify(new Error(callbackErrorDescription)),
            );
            window.close();
        } else if (isError) {
            window.opener.callback(stringify(error));
            window.close();
        } else if (!isPending) {
            window.opener.callback(stringify(data));
            window.close();
        }
    }, [
        isPending,
        isError,
        router,
        error,
        data,
        callbackError,
        callbackErrorDescription,
    ]);

    return (
        <div className="fixed inset-0 flex h-screen w-screen items-center justify-center">
            {isPending && (
                <div className="flex items-center gap-2">
                    <Loader />
                    <span className="text-sm font-semibold text-white/75">
                        Authenticating...
                    </span>
                </div>
            )}

            {(isError || callbackError) && (
                <p className="text-sm font-semibold text-red-500/75">
                    An error occurred. Redirecting...
                </p>
            )}
        </div>
    );
}
