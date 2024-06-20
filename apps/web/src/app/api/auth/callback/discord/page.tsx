"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
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

    const authSentRef = useRef(false);

    const { isError, data, mutate } =
        api.authentication.loginWithDiscord.useMutation({
            onSettled: (user, error) => {
                if (error) {
                    window.opener.callback(stringify(error));
                } else if (user) {
                    window.opener.callback(stringify(user));
                }

                window.close();
            },
        });

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
            return;
        }

        if (!authSentRef.current && code) {
            authSentRef.current = true;
            mutate({ code });
        }
    }, [callbackError, callbackErrorDescription, code, mutate, router]);

    return (
        <div className="fixed inset-0 flex h-screen w-screen items-center justify-center">
            {!data && !isError && (
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
