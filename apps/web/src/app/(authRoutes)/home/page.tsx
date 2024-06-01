"use client";

import { NavBar } from "@dndnotes/components";

import { logout } from "@/actions/logout";
import { CampaignsList } from "@/app/(authRoutes)/home/CampaignsList";
import { FriendsList } from "@/app/(authRoutes)/home/FriendsList";
import { DiscordLoginButton } from "@/app/components/DiscordLoginButton";
import { useUser } from "@/app/providers/UserProvider";

export default function HomePage() {
    const user = useUser();

    return (
        <div className="relative flex h-screen w-screen flex-col gap-3 p-3">
            <NavBar
                onLogout={async () => {
                    await logout();

                    window.location.href = "/";
                }}
            />

            <div className="flex h-full flex-1 gap-3">
                {user.authenticated && <FriendsList />}

                <main className="flex w-full flex-col gap-3">
                    {!user.authenticated && (
                        <div className="flex h-full w-full flex-auto items-center justify-center">
                            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 p-6">
                                <p className="text-lg font-bold text-white/80">
                                    You must be logged in to see your campaigns
                                </p>
                                <DiscordLoginButton />
                            </div>
                        </div>
                    )}

                    {user.authenticated && <CampaignsList />}
                </main>
            </div>
        </div>
    );
}
