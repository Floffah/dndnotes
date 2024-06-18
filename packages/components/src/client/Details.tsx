import clsx from "clsx";
import { ComponentProps, forwardRef } from "react";

import { LegacyIcon } from "@/client/LegacyIcon";

export interface DetailsItemProps extends Omit<ComponentProps<"div">, "ref"> {
    icon: string;
    label?: string;
}

const Item = forwardRef<HTMLDivElement, DetailsItemProps>(
    ({ icon, label, className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={clsx(
                className,
                "flex items-center gap-1 overflow-hidden",
            )}
            {...props}
        >
            <LegacyIcon
                className="flex-shrink-0"
                icon={icon}
                label={label ?? icon.split(":")[1]}
            />
            <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap uppercase">
                {children}
            </p>
        </div>
    ),
);

export const Details = Object.assign(
    forwardRef<HTMLDivElement, Omit<ComponentProps<"div">, "ref">>(
        ({ children, className, ...props }, ref) => (
            <div
                ref={ref}
                className={clsx(
                    className,
                    "flex items-center gap-2 text-xs text-white/50",
                )}
                {...props}
            >
                {children}
            </div>
        ),
    ),
    {
        Item,
    },
);
