"use client";

import "../globals.css";
import { Nunito } from "next/font/google";
import { PropsWithChildren, forwardRef } from "react";

import { TRPCProvider } from "@/app/providers/TRPCProvider";
import { UserProvider } from "@/app/providers/UserProvider";

const nunito = Nunito({ subsets: ["latin"] });

const BaseLayout = forwardRef<HTMLHtmlElement, PropsWithChildren>(
    ({ children }, ref) => {
        return (
            <html lang="en" ref={ref}>
                <body className={nunito.className}>
                    <TRPCProvider>
                        <UserProvider>{children}</UserProvider>
                    </TRPCProvider>
                </body>
            </html>
        );
    },
);

export default BaseLayout;
