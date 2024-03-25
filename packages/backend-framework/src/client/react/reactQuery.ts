import { QueryClient } from "@tanstack/react-query";

export const getQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                staleTime: 1000 * 60 * 30,
            },
        },
    });
