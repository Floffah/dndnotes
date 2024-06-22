"use client";

import dndnotes from "../../public/logos/dndnotes.png";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import LoadingIcon from "~icons/mdi/loading";
import LoginIcon from "~icons/mdi/login";

import { useUser } from "@/state/user";

export function NavBar({ className }: { className?: string }) {
    const user = useUser();

    return (
        <nav
            className={clsx(
                "flex w-full items-center gap-2 rounded-lg bg-gray-700 px-4 py-2",
                className,
            )}
        >
            <Image
                src={dndnotes}
                alt="dndnotes logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg"
            />

            <h1 className="text-xl font-bold text-white">DNDNotes</h1>

            <div className="flex-grow" />

            {user.isLoading && (
                <LoadingIcon className="h-6 w-6 animate-spin text-white" />
            )}
            {!user.isAuthenticated && !user.isLoading && (
                <Link
                    href="/?forceLogin"
                    className="flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1 transition-transform duration-150 hover:scale-110"
                >
                    <LoginIcon />
                    Login
                </Link>
            )}
        </nav>
    );
}
