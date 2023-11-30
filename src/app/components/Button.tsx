"use client";

import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import {
    ComponentProps,
    ReactNode,
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
    icon?: string | ReactNode;
    iconLabel?: string;
    link?: string;
}

const ButtonContext = createContext<ButtonProps>(null!);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (baseProps, ref) => {
        const {
            asChild,
            className,
            size = "md",
            color,
            link,
            icon,
            iconLabel,
            loading: propsLoading,
            children: propsChildren,
            onClick,
            ...props
        } = baseProps;

        const router = useRouter();

        const [loading, setLoading] = useState(false);

        const Component =
            asChild && typeof propsChildren !== "string" ? Slot : "button";
        const disabled = loading || props.disabled;

        useEffect(() => {
            setLoading(!!propsLoading);
        }, [propsLoading]);

        useEffect(() => {
            if (link) {
                router.prefetch(link);
            }
        }, [link, router]);

        const children = (
            <>
                {loading && (
                    <Icon
                        className={clsx("animate-spin", {
                            "opacity-60": disabled,

                            "h-4 w-4": size === "sm",
                            "h-5 w-5": size === "md",
                        })}
                        label="loading"
                        icon="mdi:loading"
                    />
                )}

                {icon &&
                    !loading &&
                    (typeof icon === "string" ? (
                        <Icon
                            className={clsx({
                                "opacity-60": disabled,

                                "h-4 w-4": size === "sm",
                                "h-5 w-5": size === "md",
                            })}
                            label={iconLabel ?? "button icon"}
                            icon={icon}
                        />
                    ) : (
                        icon
                    ))}

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
                            "flex h-fit items-center justify-center space-x-1":
                                !asChild,

                            "pointer-events-none cursor-not-allowed opacity-60":
                                disabled,

                            "rounded-lg px-2 py-1 text-sm": size === "sm",
                            "rounded-xl px-3 py-1.5": size === "md",

                            "bg-blue-700 text-white": color === "primary",
                        },
                    )}
                    onClick={async (e) => {
                        setLoading(true);
                        await onClick?.(e as any);

                        if (link) {
                            router.push(link);
                        } else {
                            setLoading(false);
                        }
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
