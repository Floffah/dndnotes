"use client";

import * as AccessibleIcon from "@radix-ui/react-accessible-icon";
import {
    Icon as IconifyIcon,
    IconProps as IconifyIconProps,
} from "@iconify/react";
import { forwardRef } from "react";

export interface IconProps extends IconifyIconProps {
    label: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
    ({ label, ...props }, ref) => {
        return (
            <AccessibleIcon.Root label={label}>
                <IconifyIcon ref={ref as any} {...props} />
            </AccessibleIcon.Root>
        );
    },
);
