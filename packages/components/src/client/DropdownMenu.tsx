"use client";

import * as RUIDropdownMenu from "@radix-ui/react-dropdown-menu";
import { animated, useTransition } from "@react-spring/web";
import clsx from "clsx";
import {
    ComponentProps,
    createContext,
    forwardRef,
    useContext,
    useEffect,
    useState,
} from "react";

export interface DropdownMenuContextValue {
    open: boolean;
}

export const DropdownMenuContext = createContext<DropdownMenuContextValue>(
    null!,
);

export const DropdownMenuItem = forwardRef<
    HTMLDivElement,
    ComponentProps<(typeof RUIDropdownMenu)["Item"]>
>(({ children, className, ...props }, ref) => {
    return (
        <RUIDropdownMenu.Item
            ref={ref}
            className={clsx(
                className,
                "flex items-center justify-between rounded-md px-4 py-1 text-sm outline-none ring-0 transition-colors duration-150 hover:bg-white/10",
            )}
            {...props}
        >
            {children}
        </RUIDropdownMenu.Item>
    );
});

const AnimatedRUIDropdownMenu = animated(RUIDropdownMenu.Content);
export const DropdownMenuContent = forwardRef<
    HTMLDivElement,
    ComponentProps<(typeof RUIDropdownMenu)["Content"]>
>(({ children, className, style: propsStyle, ...props }, ref) => {
    const { open } = useContext(DropdownMenuContext);

    const transition = useTransition(open, {
        from: { opacity: 0, scale: 0.9 },
        enter: { opacity: 1, scale: 1 },
        leave: { opacity: 0, scale: 0.9 },
        config: { tension: 500, friction: 30 },
    });

    return transition(
        (style, open) =>
            open && (
                <AnimatedRUIDropdownMenu
                    ref={ref as any}
                    className={clsx(
                        className,
                        "min-w-44 overflow-y-auto overflow-x-hidden rounded-lg border border-white/10 bg-gray-900 p-1 shadow-xl",
                    )}
                    style={{
                        ...(propsStyle ?? {}),
                        ...style,
                    }}
                    sideOffset={8}
                    forceMount
                    {...props}
                >
                    {children}
                </AnimatedRUIDropdownMenu>
            ),
    );
});

export const DropdownMenu = Object.assign(
    ({
        children,
        open: propsOpen,
        onOpenChange,
        ...props
    }: ComponentProps<(typeof RUIDropdownMenu)["Root"]>) => {
        const [open, setOpen] = useState(propsOpen ?? false);

        useEffect(() => {
            if (typeof propsOpen === "boolean") {
                setOpen(propsOpen);
            }
        }, [propsOpen]);

        return (
            <RUIDropdownMenu.Root
                open={open}
                onOpenChange={(open) => {
                    onOpenChange?.(open);
                    setOpen(open);
                }}
                {...props}
            >
                <DropdownMenuContext.Provider
                    value={{
                        open,
                    }}
                >
                    {children}
                </DropdownMenuContext.Provider>
            </RUIDropdownMenu.Root>
        );
    },
    {
        Trigger: RUIDropdownMenu.Trigger,
        Portal: RUIDropdownMenu.Portal,
        Content: DropdownMenuContent,
        Item: DropdownMenuItem,
    },
);
