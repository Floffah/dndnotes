import type { Preview } from "@storybook/react";
import clsx from "clsx";
import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-sans" });

const preview: Preview = {
    parameters: {
        nextjs: {
            appDirectory: true,
        },
    },
    tags: ["autodocs"],

    decorators: [
        (Story) => (
            <main className={clsx(nunito.className, nunito.variable)}>
                <Story />
            </main>
        ),
    ],
};
export default preview;
