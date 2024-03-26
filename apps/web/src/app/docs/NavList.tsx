"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@dndnotes/components";

import { DocsStructure, docsStructure } from "@/app/docs/structure";
import { toSentenceCase } from "@/app/lib/toSentenceCase";

function NavLinksList({
    list,
    isChild,
    parentLink,
}: {
    list: DocsStructure;
    isChild?: boolean;
    parentLink: string;
}) {
    const pathname = usePathname();

    return (
        <ul
            className={clsx("m-0 flex list-none flex-col gap-0.5", {
                "ml-4": !isChild,
                "ml-3 border-l-2 border-white/10 pl-3": isChild,
            })}
        >
            {list.map((item, key) => {
                const name = typeof item === "string" ? item : item.link;
                const link = parentLink + "/" + name;

                return (
                    <li key={key} className="m-0">
                        <Link
                            href={link}
                            className={clsx(
                                "flex w-fit select-none items-center transition-colors duration-150",
                                {
                                    "mt-1": typeof item !== "string",
                                    "cursor-default font-bold text-blue-400":
                                        pathname === link,
                                    "text-white/75 hover:text-white":
                                        pathname !== link,
                                },
                            )}
                        >
                            {typeof item !== "string" && "label" in item
                                ? item.label
                                : toSentenceCase(name)}
                            {typeof item !== "string" && item.children && (
                                <Icon label="down" icon="mdi:chevron-down" />
                            )}
                        </Link>
                        {typeof item !== "string" && item.children && (
                            <NavLinksList
                                list={item.children}
                                parentLink={link}
                                isChild
                            />
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

export function NavList() {
    return (
        <div className="w-full max-w-[17rem] rounded-lg border border-white/10 bg-white/5 py-4">
            <NavLinksList list={docsStructure} parentLink="/docs" />
        </div>
    );
}
