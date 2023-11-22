import { PropsWithChildren } from "react";

import "@/app/globals.css";
import BaseLayout from "@/app/layouts/BaseLayout";
import { TRPCProvider } from "@/app/providers/TRPCProvider";

export const metadata = {
    title: "Next.js",
    description: "Generated by Next.js",
};

export default function RootLayout({ children }: PropsWithChildren) {
    return <BaseLayout>{children}</BaseLayout>;
}
