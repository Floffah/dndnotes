import clsx from "clsx";
import { ComponentProps, forwardRef } from "react";

import { Icon } from "@/app/components/Icon";

const Item = forwardRef<
    HTMLDivElement,
    Omit<ComponentProps<"div">, "ref"> & {
        icon: string;
        label?: string;
    }
>(({ icon, label, className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={clsx(className, "flex items-center gap-1")}
        {...props}
    >
        <Icon icon={icon} label={label ?? icon.split(":")[1]} />
        <p>{children}</p>
    </div>
));

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
