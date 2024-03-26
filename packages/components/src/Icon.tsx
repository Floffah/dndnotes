"use client";

import * as AccessibleIcon from "@radix-ui/react-accessible-icon";
import {
    Icon as IconifyIcon,
    IconProps as IconifyIconProps,
    _api,
} from "@iconify/react";
import { forwardRef, useMemo } from "react";

_api.setFetch(fetch);

export interface IconProps extends IconifyIconProps {
    label: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
    ({ label: propsLabel, ...props }, ref) => {
        const label = useMemo(() => {
            if (propsLabel.includes("icon")) {
                return propsLabel;
            }

            return propsLabel + " (icon)";
        }, [propsLabel]);

        return (
            <AccessibleIcon.Root label={label}>
                <IconifyIcon ref={ref as any} {...props} />
            </AccessibleIcon.Root>
        );
    },
);
