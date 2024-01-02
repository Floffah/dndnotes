import "./docs.css";
import clsx from "clsx";
import { JetBrains_Mono } from "next/font/google";
import { PropsWithChildren } from "react";

import { NavList } from "@/app/docs/NavList";

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export default function Layout({ children }: PropsWithChildren) {
    return (
        <div className="flex h-full w-full flex-col gap-4 p-4 md:flex-row md:justify-center">
            <NavList />
            <main
                className={clsx(
                    jetbrainsMono.variable,
                    "docs-root-layout w-full flex-auto overflow-y-auto overflow-x-hidden px-4 py-4",
                )}
            >
                {children}
            </main>
        </div>
    );
}
