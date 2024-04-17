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
    ({ icon: propsIcon, label: propsLabel, ...props }, ref) => {
        const label = useMemo(() => {
            if (propsLabel.includes("icon")) {
                return propsLabel;
            }

            return propsLabel + " (icon)";
        }, [propsLabel]);

        let icon = propsIcon;

        if (
            process.env.NEXT_PUBLIC_FORCE_PROXIED_ICONS &&
            process.env.NEXT_PUBLIC_FORCE_PROXIED_ICONS === "true"
        ) {
            icon = "@proxied:" + icon;
        }

        return (
            <AccessibleIcon.Root label={label}>
                <IconifyIcon ref={ref as any} icon={icon} {...props} />
            </AccessibleIcon.Root>
        );
    },
);
