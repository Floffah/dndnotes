"use client";

import { ClientProvider } from "@dndnotes/backend-framework/client";
import { PropsWithChildren } from "react";

import { api } from "@/app/lib/api";

export function APIProvider({ children }: PropsWithChildren) {
    return <ClientProvider environment={api}>{children}</ClientProvider>;
}
