import { Nunito } from "next/font/google";

import "@/app/globals.css";
import { populateMetadata } from "@/app/lib/populateMetadata";
import { DialogProvider } from "@/app/providers/DialogProvider";
import { RootHydrationProvider } from "@/app/providers/RootHydrationProvider";
import { UserProvider } from "@/app/providers/UserProvider";

export const metadata = populateMetadata({
    title: "Floffah's DND Notes",
    description: "Advanced DND note taking app for both sides of the equation",
});

const nunito = Nunito({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={nunito.variable}>
            <body className={nunito.className}>
                <RootHydrationProvider>
                    <UserProvider>
                        <DialogProvider>{children}</DialogProvider>
                    </UserProvider>
                </RootHydrationProvider>
            </body>
        </html>
    );
}
