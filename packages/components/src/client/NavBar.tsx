"use client";

import clsx from "clsx";
import Link from "next/link";
import { EventHandler, MouseEvent, useEffect, useState } from "react";

import { Icon } from "@/client/Icon";

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
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setActive(window.location.pathname === link);
        }
    }, [link]);

    const button = (
        <button
            className={clsx(
                "flex w-fit select-none items-center gap-1 p-2 hover:bg-white/5",
                active && "cursor-default bg-white/5",
            )}
            onClick={onClick}
        >
            <Icon label={children} icon={icon} /> {children}
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

export function NavBar() {
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
            <NavLink
                icon="mdi:logout"
                onClick={async () => {
                    await fetch("/api/logout");

                    window.location.href = "/";
                }}
            >
                Logout
            </NavLink>
        </nav>
    );
}
