import { ClientProvider } from "@dndnotes/backend-framework/client";
import { Nunito } from "next/font/google";

import "@/app/globals.css";
import { api } from "@/app/lib/api";
import { populateMetadata } from "@/app/lib/populateMetadata";
import { DialogProvider } from "@/app/providers/DialogProvider";

export const metadata = populateMetadata({
    title: "Floffah's DND Notes",
    description: "Advanced DND note taking app for both sides of the equation",
});

const nunito = Nunito({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={nunito.variable}>
            <body className={nunito.className}>
                <ClientProvider environment={api}>
                    <DialogProvider>{children}</DialogProvider>
                </ClientProvider>
            </body>
        </html>
    );
}
