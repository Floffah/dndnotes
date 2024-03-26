"use client";

import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";
import { ComponentProps, forwardRef } from "react";

import { Details } from "@/Details";

export const CardTitle = forwardRef<HTMLHeadingElement, ComponentProps<"h1">>(
    ({ className, children, ...props }, ref) => (
        <h1
            ref={ref}
            className={clsx(
                className,
                "overflow-ellipsis whitespace-nowrap text-lg font-semibold",
            )}
            {...props}
        >
            {children}
        </h1>
    ),
);

export const CardSubtitle = forwardRef<
    HTMLParagraphElement,
    ComponentProps<"p">
>(({ className, children, ...props }, ref) => (
    <p
        ref={ref}
        className={clsx(className, "-mt-2.5 text-sm text-white/75")}
        {...props}
    >
        {children}
    </p>
));

export interface Card extends Omit<ComponentProps<"div">, "ref" | "color"> {
    asChild?: boolean;
    color: "default";
}

export const Card = Object.assign(
    forwardRef<HTMLDivElement, Card>(
        (
            { asChild, color = "default", className, children, ...props },
            ref,
        ) => {
            "use client";

            const Component = asChild ? Slot : "div";

            return (
                <Component
                    className={clsx(
                        className,
                        "relative flex w-full flex-col gap-1.5 rounded-lg p-3",
                        {
                            "border border-white/10": color === "default",
                        },
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </Component>
            );
        },
    ),
    {
        Title: CardTitle,
        Subtitle: CardSubtitle,
        Details,
    },
);
