"use client";

import * as RUIToast from "@radix-ui/react-toast";
import { animated, useTransition } from "@react-spring/web";
import { useLayoutEffect, useState } from "react";

import { Button, ButtonProps } from "@/client/Button";
import { Icon } from "@/client/Icon";

export interface ToastProps {
    open: boolean;
    title: string;
    description?: string;
    closable?: boolean;
    actions?: {
        label: string;
        alt?: string;
        color?: ButtonProps["color"];
        onClick: () => void;
    }[];
}

export function Toast({
    open: propsOpen,
    title,
    description,
    closable = true,
    actions,
}: ToastProps) {
    const [open, setOpen] = useState(propsOpen);

    const transition = useTransition(open, {
        from: {
            opacity: 0,
            xPercent: 100,
        },
        enter: {
            opacity: 100,
            xPercent: 0,
        },
        leave: {
            opacity: 0,
            xPercent: 100,
        },
        config: {
            tension: 500,
            friction: 30,
        },
    });

    useLayoutEffect(() => {
        setOpen(propsOpen);
    }, [propsOpen]);

    return transition(
        (transitionStyle, open) =>
            open && (
                <RUIToast.Root
                    open={open}
                    forceMount
                    onOpenChange={setOpen}
                    asChild
                >
                    <animated.div
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-gray-900 p-3"
                        style={{
                            opacity: transitionStyle.opacity,
                            transform: transitionStyle.xPercent.to(
                                (x) => `translateX(${x}%)`,
                            ),
                        }}
                    >
                        <div className="flex flex-col gap-1">
                            <RUIToast.Title className="text-lg font-semibold">
                                {title}
                            </RUIToast.Title>
                            {description && (
                                <RUIToast.Description>
                                    {description}
                                </RUIToast.Description>
                            )}
                        </div>

                        {actions && (
                            <div className="flex gap-2">
                                {actions.map(
                                    ({
                                        label,
                                        color = "primary",
                                        alt,
                                        onClick,
                                    }) => (
                                        <RUIToast.Action
                                            key={label}
                                            altText={alt ?? label}
                                            asChild
                                        >
                                            <Button size="md" color={color}>
                                                {label}
                                            </Button>
                                        </RUIToast.Action>
                                    ),
                                )}
                            </div>
                        )}

                        {closable && (
                            <RUIToast.Close asChild>
                                <Icon
                                    label="close toast"
                                    icon="mdi:close"
                                    className="h-5 w-5 text-white/50 transition-transform duration-150 hover:scale-110 hover:text-white"
                                />
                            </RUIToast.Close>
                        )}
                    </animated.div>
                </RUIToast.Root>
            ),
    );
}
