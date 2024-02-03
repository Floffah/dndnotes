import clsx from "clsx";
import NextLink from "next/link";
import { ComponentProps, forwardRef } from "react";

import { Tooltip } from "@/app/components/Tooltip";

interface LinkProps extends ComponentProps<typeof NextLink> {
    label?: string;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
    ({ href, label, className, children }, ref) => {
        const link = (
            <NextLink
                href={href}
                className={clsx(className, "text-blue-500 hover:underline", {
                    "indicate-action indicate-blue-500/50": label,
                })}
            >
                {children}
            </NextLink>
        );

        if (label) {
            return <Tooltip title={label}>{link}</Tooltip>;
        }

        return link;
    },
);
