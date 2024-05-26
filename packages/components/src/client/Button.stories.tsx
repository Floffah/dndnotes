import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { Button } from "@/client/Button";

const meta: Meta<typeof Button> = {
    title: "Client/Button",
    parameters: {
        docs: {
            description: {
                component: "A button component.",
            },
        },
    },
    component: Button,
    argTypes: {
        onClick: { type: "function", action: "clicked" },
        asChild: { type: "boolean", control: "boolean" },
        size: {
            type: "string",
            control: { type: "select", options: ["sm", "md"] },
        },
        color: {
            type: "string",
            control: {
                type: "select",
                options: ["primary", "secondary", "danger"],
            },
        },
        loading: { type: "boolean", control: "boolean" },
        icon: {
            type: "string",
            control: "text",
            description: "Iconify icon name",
        },
        iconLabel: {
            type: "string",
            control: "text",
            description: "Screen reader label",
            if: { arg: "icon", exists: true },
        },
        link: { type: "string", control: "text" },
    },
    args: {
        asChild: false,
        size: "md",
        loading: false,
    },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
    args: {
        children: "Primary",
        color: "primary",
    },
};

export const Secondary: Story = {
    args: {
        children: "Secondary",
        color: "secondary",
    },
};

export const Danger: Story = {
    args: {
        children: "Danger",
        color: "danger",
    },
};

export const Loading: Story = {
    args: {
        children: "Loading",
        color: "primary",
        loading: true,
    },
};

export const Icon: Story = {
    args: {
        children: "Icon",
        color: "primary",
        icon: "mdi:account",
        iconLabel: "Account",
    },
};
