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
    environment: ReturnType<typeof createReactEnvironment>;
}

export function createClientProvider(
    environment: ReturnType<typeof createReactEnvironment<any>>,
) {
    const ClientContext = createContext<ClientContextProvider | undefined>(
        undefined,
    );

    function ClientProvider({ children }: PropsWithChildren) {
        "use client";

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
            <ClientContext.Provider value={{ environment }}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </ClientContext.Provider>
        );
    }

    return { ClientProvider };
}
