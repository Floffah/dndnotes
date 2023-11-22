import "../globals.css";
import { Nunito } from "next/font/google";
import { PropsWithChildren, forwardRef } from "react";

import { HydrationProvider } from "@/app/providers/HydrationProvider";
import { UserProvider } from "@/app/providers/UserProvider";

const nunito = Nunito({ subsets: ["latin"] });

const BaseLayout = forwardRef<HTMLHtmlElement, PropsWithChildren>(
    ({ children }, ref) => {
        return (
            <html lang="en" ref={ref}>
                <body className={nunito.className}>
                    <HydrationProvider>
                        <UserProvider>{children}</UserProvider>
                    </HydrationProvider>
                </body>
            </html>
        );
    },
);

export default BaseLayout;
