"use client";

import { DiscordLoginButton } from "@/app/components/DiscordLoginButton";
import { NavBar } from "@/app/components/NavBar";
import { CampaignsList } from "@/app/home/CampaignsList";
import { FriendsList } from "@/app/home/FriendsList";
import { useUser } from "@/app/providers/UserProvider";

export default function HomePage() {
    const user = useUser();

    return (
        <>
            <div className="flex h-full w-full flex-col gap-3 p-3">
                <NavBar />

                <div className="flex h-full flex-1 gap-3">
                    {user.authenticated && <FriendsList />}

                    <div className="flex w-full flex-col gap-3">
                        {!user.authenticated && (
                            <div className="flex h-full w-full flex-auto items-center justify-center">
                                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 p-6">
                                    <p className="text-lg font-bold text-white/80">
                                        You must be logged in to see your
                                        campaigns
                                    </p>
                                    <DiscordLoginButton />
                                </div>
                            </div>
                        )}

                        {user.authenticated && <CampaignsList />}
                    </div>
                </div>
            </div>
        </>
    );
}
