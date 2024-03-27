"use client";

import { addAPIProvider } from "@iconify/react";
import { PropsWithChildren } from "react";

import { createClientProvider } from "@dndnotes/backend-framework/client";

import { api } from "@/lib/api";

const { ClientProvider } = createClientProvider(api);

addAPIProvider("proxied", {
    resources: ["/icons"],
});

export function APIProvider({ children }: PropsWithChildren) {
    return <ClientProvider>{children}</ClientProvider>;
}
