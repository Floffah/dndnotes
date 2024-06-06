"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { deserialize, stringify } from "superjson";

import { Loader } from "@dndnotes/components";

import { authenticateDiscord } from "@/app/api/discord/redirect/action";

export default function DiscordRedirectPage({
    searchParams: { code },
}: {
    searchParams: {
        code?: string;
        error?: string;
        error_description?: string;
    };
}) {
    const router = useRouter();

    const { isLoading, isError, error, data } = useQuery({
        queryKey: ["authenticate", "discord", code],

        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,

        enabled: !!code,

        queryFn: async () => deserialize(await authenticateDiscord(code!)),
    });

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        if (typeof window.opener === "undefined") {
            router.replace("/");
            return;
        }

        if (isError) {
            window.opener.callback(stringify(error));
            window.close();
        } else if (!isLoading) {
            window.opener.callback(stringify(data));
            window.close();
        }
    }, [isLoading, isError]);

    return (
        <div className="fixed inset-0 flex h-screen w-screen items-center justify-center">
            {isLoading && (
                <div className="flex items-center gap-2">
                    <Loader />
                    <span className="text-sm font-semibold text-white/75">
                        Authenticating...
                    </span>
                </div>
            )}

            {isError && (
                <p className="text-sm font-semibold text-red-500/75">
                    An error occurred. Redirecting...
                </p>
            )}
        </div>
    );
}
