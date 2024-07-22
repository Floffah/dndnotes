"use client";

import dndnotes from "../../public/logos/dndnotes.png";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

import AddIcon from "~icons/ic/round-add";
import ChevronDownIcon from "~icons/mdi/chevron-down";
import LoadingIcon from "~icons/mdi/loading";
import LoginIcon from "~icons/mdi/login";

import { DropdownMenu } from "@dndnotes/components";

import { useUser } from "@/state/user";

export function NavBar({ className }: { className?: string }) {
    const user = useUser();

    return (
        <nav
            className={clsx(
                "flex w-full items-center gap-2 rounded-lg bg-gray-800 px-4 py-2",
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
                    className="flex items-center gap-2 rounded-lg border border-white/10 px-2 py-1 transition-[background-color,transform] duration-150 hover:scale-110 hover:bg-white/10"
                >
                    <LoginIcon />
                    Login
                </Link>
            )}
            {user.isAuthenticated && !user.isLoading && (
                <>
                    <DropdownMenu>
                        <DropdownMenu.Trigger className="flex items-center rounded-lg border border-white/10 px-2 py-1 transition-colors duration-150 hover:bg-white/10">
                            <AddIcon />
                            <ChevronDownIcon />
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end">
                            <DropdownMenu.Item asChild>
                                <Link href="/campaign/create">
                                    Create Campaign
                                </Link>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu>
                </>
            )}
        </nav>
    );
}
