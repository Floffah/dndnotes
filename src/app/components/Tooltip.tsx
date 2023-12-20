import * as RUITooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { forwardRef } from "react";

interface TooltipProps
    extends Omit<RUITooltip.TooltipContentProps, "title" | "ref"> {
    title: string;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
    ({ title, children, className, ...props }, ref) => (
        <RUITooltip.Provider delayDuration={0} skipDelayDuration={0}>
            <RUITooltip.Root>
                <RUITooltip.Trigger asChild>
                    {typeof children === "string" ? (
                        <span>{children}</span>
                    ) : (
                        children
                    )}
                </RUITooltip.Trigger>
                <RUITooltip.Portal>
                    <RUITooltip.Content
                        ref={ref}
                        sideOffset={1.5}
                        className={clsx(
                            className,
                            "select-none rounded bg-gray-900 px-2 py-1 text-white/80 shadow-lg transition-opacity duration-150 will-change-[transform,opacity] data-[state=delayed-open]:animate-fadeIn",
                        )}
                        {...props}
                    >
                        {title}
                        <RUITooltip.Arrow className="fill-gray-900" />
                    </RUITooltip.Content>
                </RUITooltip.Portal>
            </RUITooltip.Root>
        </RUITooltip.Provider>
    ),
);
