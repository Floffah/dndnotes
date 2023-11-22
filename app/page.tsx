"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { DiscordLoginButton } from "@/app/DiscordLoginButton";
import { useUser } from "@/app/providers/UserProvider";

export default function RootPage() {
    const user = useUser();
    const router = useRouter();

    useEffect(() => {
        if (user.authenticated) {
            router.push("/home");
        }
    }, [user.authenticated, router]);

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <main className="flex max-w-md flex-col gap-2 rounded-lg bg-white/10 p-4 shadow-md">
                <h1>DND Notes</h1>
                <p>
                    This site allows DMs and players alike to manage their
                    campaigns in a synchronised and dynamic way.
                </p>
                <DiscordLoginButton />
            </main>
        </div>
    );
}
