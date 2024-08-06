import clsx from "clsx";
import { ComponentProps, forwardRef } from "react";

export interface InputProps extends ComponentProps<"input"> {
    error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, disabled, ...props }, ref) => {
        return (
            <input
                {...props}
                ref={ref}
                disabled={disabled}
                className={clsx(
                    className,
                    "rounded-lg border border-gray-700 bg-transparent px-2 py-1 placeholder-white/40 outline-none ring-0 transition-colors duration-150 focus:ring-1 focus:ring-offset-0",
                    {
                        "focus:border-blue-600 focus:ring-blue-600":
                            !error && !disabled,
                        "border-red-500 focus:border-red-500 focus:ring-red-500":
                            error && !disabled,
                        "border-red-500/60": error && disabled,

                        "pointer-events-none select-none border-gray-700/60 bg-gray-800/60 text-white/60":
                            disabled,
                    },
                )}
            ></input>
        );
    },
);
