import clsx from "clsx";
import { forwardRef } from "react";

import { Icon, IconProps } from "@/app/components/Icon";

export const Loader = forwardRef<
    SVGSVGElement,
    Omit<IconProps, "ref" | "label" | "icon">
>(({ className, ...props }, ref) => {
    return (
        <Icon
            label="loading"
            icon="mdi:loading"
            ref={ref}
            className={clsx("animate-spin", className)}
            {...props}
        />
    );
});
