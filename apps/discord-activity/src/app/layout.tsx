import { Nunito } from "next/font/google";

import { DialogProvider } from "@dndnotes/components";

import "@/app/globals.css";
import { APIProvider } from "@/providers/APIProvider";
import { DiscordProvider } from "@/providers/DiscordProvider";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={nunito.variable}>
            <body className={nunito.className}>
                <APIProvider>
                    <DiscordProvider>
                        <DialogProvider>{children}</DialogProvider>
                    </DiscordProvider>
                </APIProvider>
            </body>
        </html>
    );
}
