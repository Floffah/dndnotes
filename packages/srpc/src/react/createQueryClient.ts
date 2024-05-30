import { QueryClient, QueryClientConfig } from "@tanstack/react-query";

import { SRPCClient } from "@/client";

export function createQueryClient(
    srpc: SRPCClient<any>,
    queryClientConfig: QueryClientConfig,
) {
    return new QueryClient({
        defaultOptions: {
            queries: {
                queryFn: async ({ queryKey }) => {
                    const [path, input] = queryKey as [string, string];

                    return await srpc.query(path, input);
                },

                ...(queryClientConfig?.defaultOptions?.queries ?? {
                    staleTime: 1000 * 60 * 5,
                    refetchOnWindowFocus: false,
                    refetchIntervalInBackground: false,
                    networkMode: "offlineFirst",
                }),
            },
            mutations: {
                mutationFn: async ({ path, variables }: any) => {
                    return await srpc.mutation(path, variables);
                },

                ...((queryClientConfig?.defaultOptions?.mutations ??
                    {}) as any),
            },
            ...(queryClientConfig?.defaultOptions ?? {}),
        },

        ...(queryClientConfig ?? {}),
    });
}
