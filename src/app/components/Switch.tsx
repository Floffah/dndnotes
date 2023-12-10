import * as RUISwitch from "@radix-ui/react-switch";
import clsx from "clsx";
import { forwardRef } from "react";

export const Switch = forwardRef<HTMLButtonElement, RUISwitch.SwitchProps>(
    ({ className, disabled, ...props }, ref) => {
        return (
            <RUISwitch.Root
                ref={ref}
                className={clsx(
                    className,
                    "relative h-5 w-9 rounded-full bg-blue-700/60 px-0.5 outline-none transition-colors duration-150 data-[state=checked]:bg-blue-700",
                    {
                        "cursor-not-allowed select-none bg-gray-700/60":
                            disabled,
                    },
                )}
                disabled={disabled}
                {...props}
            >
                <RUISwitch.Thumb className="block h-4 w-4 translate-x-0 rounded-full bg-white transition-transform duration-150 will-change-transform data-[state=checked]:translate-x-4" />
            </RUISwitch.Root>
        );
    },
);
