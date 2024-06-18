"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EventHandler, MouseEvent, useEffect, useState } from "react";

import { LegacyIcon } from "@/client/LegacyIcon";

function NavLink({
    icon,
    link,
    onClick,
    children,
}: {
    icon: string;
    link?: string;
    onClick?: EventHandler<MouseEvent<HTMLButtonElement>>;
    children: string;
}) {
    const pathName = usePathname();
    const active = pathName === link;

    const button = (
        <button
            className={clsx(
                "flex w-fit select-none items-center gap-1 p-2 hover:bg-white/5",
                active && "cursor-default bg-white/5",
            )}
            onClick={onClick}
        >
            <LegacyIcon label={children} icon={icon} /> {children}
        </button>
    );

    if (link) {
        return (
            <Link
                href={link}
                target={link.startsWith("/") ? undefined : "_blank"}
            >
                {button}
            </Link>
        );
    }

    return button;
}

export function NavBar({ onLogout }: { onLogout?: () => void }) {
    return (
        <nav className="flex flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
            <NavLink icon="mdi:home" link="/home">
                Home
            </NavLink>

            <div className="flex-1" />

            <NavLink
                icon="mdi:github"
                link="https://github.com/floffah/dndnotes"
            >
                GitHub
            </NavLink>
            <NavLink icon="mdi:book" link="/docs">
                Docs
            </NavLink>
            {onLogout && (
                <NavLink icon="mdi:logout" onClick={onLogout}>
                    Logout
                </NavLink>
            )}
        </nav>
    );
}
