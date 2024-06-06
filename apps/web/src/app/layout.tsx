import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Nunito } from "next/font/google";

import { DialogProvider } from "@dndnotes/components";

import "@/app/globals.css";
import { populateMetadata } from "@/app/lib/populateMetadata";
import { APIProvider } from "@/app/providers/APIProvider";

export const metadata = populateMetadata({
    title: "Floffah's DND Notes",
    description: "Advanced DND note taking app for both sides of the equation",
});

const nunito = Nunito({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={nunito.variable}>
            <body className={nunito.className}>
                <APIProvider>
                    <DialogProvider>{children}</DialogProvider>
                </APIProvider>

                <SpeedInsights />
                <Analytics />
            </body>
        </html>
    );
}
