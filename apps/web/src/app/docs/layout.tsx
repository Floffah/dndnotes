"use client";

import "./docs.css";
import clsx from "clsx";
import { JetBrains_Mono } from "next/font/google";
import { PropsWithChildren } from "react";

import { NavBar } from "@dndnotes/components";

import { NavList } from "@/app/docs/NavList";

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export default function Layout({ children }: PropsWithChildren) {
    return (
        <div className="flex h-full w-full flex-col gap-3 p-3">
            <NavBar />
            <div className="flex flex-1 flex-col md:flex-row">
                <NavList />
                <main
                    className={clsx(
                        jetbrainsMono.variable,
                        "prose prose-sky prose-invert w-full max-w-none flex-auto overflow-y-auto overflow-x-hidden px-3 py-3",
                    )}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
