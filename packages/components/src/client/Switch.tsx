"use client";

import * as RUISwitch from "@radix-ui/react-switch";
import clsx from "clsx";
import { forwardRef } from "react";

export const Switch = forwardRef<HTMLButtonElement, RUISwitch.SwitchProps>(
    ({ className, disabled, ...props }, ref) => {
        return (
            <RUISwitch.Root
                {...props}
                ref={ref}
                className={clsx(
                    className,
                    "relative h-5 w-9 rounded-full px-0.5 outline-none transition-colors duration-150",
                    {
                        "bg-white/20 data-[state=checked]:bg-blue-700":
                            !disabled,
                        "cursor-not-allowed select-none bg-gray-700/60 data-[state=checked]:bg-blue-700/40":
                            disabled,
                    },
                )}
                disabled={disabled}
            >
                <RUISwitch.Thumb className="block h-4 w-4 translate-x-0 rounded-full bg-white transition-transform duration-150 will-change-transform data-[state=checked]:translate-x-4" />
            </RUISwitch.Root>
        );
    },
);
