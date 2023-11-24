"use client";

import clsx from "clsx";
import Link from "next/link";
import { PropsWithChildren } from "react";

import { Icon } from "@/app/components/Icon";

function NavLink({
    icon,
    link,
    children,
}: {
    icon: string;
    link: string;
    children: string;
}) {
    return (
        <Link href={link}>
            <div
                className={clsx(
                    "flex w-fit select-none items-center gap-1 p-2 hover:bg-white/5",
                    typeof window !== "undefined" && {
                        "cursor-default bg-white/5":
                            window.location.pathname === link,
                    },
                )}
            >
                <Icon label={children} icon={icon} /> {children}
            </div>
        </Link>
    );
}

export function NavBar() {
    return (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
            <NavLink icon="mdi:home" link="/home">
                Home
            </NavLink>
        </div>
    );
}
