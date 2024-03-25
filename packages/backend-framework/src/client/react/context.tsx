"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    PropsWithChildren,
    createContext,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { createReactEnvironment } from "@/client/react";
import { getQueryClient } from "@/client/react/reactQuery";

interface ClientContextProvider {
    queryClient: QueryClient;
    environment: ReturnType<typeof createReactEnvironment>;
}

const ClientContext = createContext<ClientContextProvider | undefined>(
    undefined,
);

export function ClientProvider({
    children,
    environment,
}: PropsWithChildren<{
    environment: ReturnType<typeof createReactEnvironment<any>>;
}>) {
    const [queryClient] = useState(() => getQueryClient());

    useLayoutEffect(() => {
        const interval = setInterval(() => {
            environment._internals.batcher.execute();
        }, 10);

        return () => {
            clearInterval(interval);
        };
    }, [queryClient, queryClient.isMutating(), queryClient.isFetching()]);

    return (
        <ClientContext.Provider value={{ queryClient, environment }}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </ClientContext.Provider>
    );
}
