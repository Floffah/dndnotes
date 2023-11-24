"use client";

import "./docs.css";
import { PropsWithChildren } from "react";

import { NavList } from "@/app/docs/NavList";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <div className="flex h-full w-full flex-col gap-4 p-4 md:flex-row md:justify-center">
            <NavList />
            <main className="docs-root-layout w-full flex-auto px-4 py-4">
                {children}
            </main>
        </div>
    );
}
