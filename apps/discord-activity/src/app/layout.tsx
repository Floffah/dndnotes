import { Nunito } from "next/font/google";

import { DialogProvider } from "@dndnotes/components";

import "@/app/globals.css";
import { APIProvider } from "@/providers/APIProvider";
import { DiscordProvider } from "@/providers/DiscordProvider";
import { FeaturesProvider } from "@/providers/FeaturesProvider";
import { GuildCampaignsProvider } from "@/providers/GuildCampaignsProvider";
import { RealtimeProvider } from "@/providers/RealtimeProvider";
import { UserProvider } from "@/providers/UserProvider";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={nunito.variable}>
            <body className={nunito.className}>
                <APIProvider>
                    <DiscordProvider>
                        <UserProvider>
                            <RealtimeProvider>
                                <FeaturesProvider>
                                    <GuildCampaignsProvider>
                                        <DialogProvider>
                                            <div className="bg-pattern-topography fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-gray-900 p-16 text-center sm:hidden">
                                                <p>
                                                    Please maximise this window
                                                </p>
                                            </div>

                                            {children}
                                        </DialogProvider>
                                    </GuildCampaignsProvider>
                                </FeaturesProvider>
                            </RealtimeProvider>
                        </UserProvider>
                    </DiscordProvider>
                </APIProvider>
            </body>
        </html>
    );
}
