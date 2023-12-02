import { PropsWithChildren } from "react";

import "@/app/globals.css";
import BaseLayout from "@/app/layouts/BaseLayout";
import { populateMetadata } from "@/app/lib/populateMetadata";

export const metadata = populateMetadata({
    title: "Floffah's DND Notes",
    description: "Advanced DND note taking app for both sides of the equation",
});

export default function RootLayout({ children }: PropsWithChildren) {
    return <BaseLayout>{children}</BaseLayout>;
}
