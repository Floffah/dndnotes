"use client";

import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";
import {
    ComponentProps,
    cloneElement,
    createContext,
    forwardRef,
    useEffect,
    useState,
} from "react";

import { Icon } from "@/app/components/Icon";

interface ButtonProps extends ComponentProps<"button"> {
    asChild?: boolean;
    size: "sm" | "md";
    color: "primary";
    loading?: boolean;
}

const ButtonContext = createContext<ButtonProps>(null!);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (baseProps, ref) => {
        const {
            asChild,
            className,
            size = "md",
            color,
            loading: propsLoading,
            children: propsChildren,
            onClick,
            ...props
        } = baseProps;

        const [loading, setLoading] = useState(false);

        const Component =
            asChild && typeof propsChildren !== "string" ? Slot : "button";
        const disabled = loading || props.disabled;

        useEffect(() => {
            setLoading(!!propsLoading);
        }, [propsLoading]);

        const children = (
            <>
                {loading && (
                    <Icon
                        label="loading"
                        icon="mdi:loading"
                        className="animate-spin"
                    />
                )}

                <span>
                    {propsChildren &&
                    typeof propsChildren === "object" &&
                    "props" in propsChildren &&
                    "children" in propsChildren.props
                        ? propsChildren.props.children
                        : propsChildren}
                </span>
            </>
        );

        return (
            <ButtonContext.Provider value={baseProps}>
                <Component
                    ref={ref as any}
                    className={clsx(
                        className,
                        "transition-opacity duration-150",
                        {
                            "flex h-fit items-center justify-center space-x-2":
                                !asChild,

                            "pointer-events-none cursor-not-allowed opacity-60":
                                disabled,

                            "rounded-lg px-2 py-1 text-sm": size === "sm",
                            "rounded-xl px-3 py-2": size === "md",

                            "bg-blue-700 text-white": color === "primary",
                        },
                    )}
                    onClick={async (e) => {
                        setLoading(true);
                        await onClick?.(e as any);
                        setLoading(false);
                    }}
                    {...props}
                >
                    {asChild && typeof propsChildren !== "string"
                        ? cloneElement(propsChildren as any, {}, children)
                        : children}
                </Component>
            </ButtonContext.Provider>
        );
    },
);
