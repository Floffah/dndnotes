"use client";

import * as AccessibleIcon from "@radix-ui/react-accessible-icon";
import { SVGProps, createElement, forwardRef } from "react";

import type UnpluginIcon from "~icons/*";

export interface IconProps extends SVGProps<SVGSVGElement> {
    label: string;
    icon: typeof UnpluginIcon;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
    ({ label, icon, ...props }, ref) => {
        return (
            <AccessibleIcon.Root label={label}>
                {createElement(icon, {
                    ref: ref as any,
                    ...props,
                })}
            </AccessibleIcon.Root>
        );
    },
);
