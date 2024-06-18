import clsx from "clsx";
import { forwardRef } from "react";

import { IconProps, LegacyIcon } from "@/client/LegacyIcon";

export const Loader = forwardRef<
    SVGSVGElement,
    Omit<IconProps, "ref" | "label" | "icon">
>(({ className, ...props }, ref) => {
    return (
        <LegacyIcon
            label="loading"
            icon="mdi:loading"
            ref={ref}
            className={clsx("animate-spin", className)}
            {...props}
        />
    );
});
