import { Nunito } from "next/font/google";

import "@/app/globals.css";
import { populateMetadata } from "@/app/lib/populateMetadata";
import { CacheProvider } from "@/app/providers/CacheProvider";
import { HydrationProvider } from "@/app/providers/HydrationProvider";
import { UserProvider } from "@/app/providers/UserProvider";

export const metadata = populateMetadata({
    title: "Floffah's DND Notes",
    description: "Advanced DND note taking app for both sides of the equation",
});

const nunito = Nunito({ subsets: ["latin"] });

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={nunito.className}>
                <HydrationProvider>
                    <UserProvider>
                        <CacheProvider>{children}</CacheProvider>
                    </UserProvider>
                </HydrationProvider>
            </body>
        </html>
    );
}
