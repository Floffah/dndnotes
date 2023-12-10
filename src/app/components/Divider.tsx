import * as Separator from "@radix-ui/react-separator";
import clsx from "clsx";
import { ComponentProps, PropsWithChildren, forwardRef } from "react";

export const Divider = forwardRef<
    HTMLDivElement,
    PropsWithChildren<Omit<ComponentProps<(typeof Separator)["Root"]>, "ref">>
>(({ children, className, orientation = "horizontal", ...props }, ref) => {
    return (
        <Separator.Root
            {...props}
            ref={ref}
            orientation={orientation}
            className={clsx(
                className,
                "relative",
                !!children &&
                    clsx(
                        "flex items-center text-sm font-semibold text-white/60 before:flex-1 before:bg-white/20 after:flex-1 after:bg-white/20",
                        {
                            "w-full before:mr-[0.75rem] before:mt-[3px] before:h-[1px] before:w-full after:ml-[0.75rem] after:mt-[3px] after:h-[1px]":
                                orientation === "horizontal",
                            "h-full before:mb-[0.75rem] before:ml-[3px] before:h-full before:w-[1px] after:ml-[3px] after:mt-[0.75rem] after:w-[1px]":
                                orientation === "vertical",
                        },
                    ),
                !children &&
                    orientation === "horizontal" &&
                    "h-[1px] w-full bg-white/20",
                !children &&
                    orientation === "vertical" &&
                    "h-full w-[1px] bg-white/20",
            )}
        >
            {children}
        </Separator.Root>
    );
});
