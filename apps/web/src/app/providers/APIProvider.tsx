"use client";

import { createClientProvider } from "@dndnotes/backend-framework/client";
import { PropsWithChildren } from "react";

import { api } from "@/app/lib/api";

const { ClientProvider } = createClientProvider(api);

export function APIProvider({ children }: PropsWithChildren) {
    return <ClientProvider>{children}</ClientProvider>;
}
