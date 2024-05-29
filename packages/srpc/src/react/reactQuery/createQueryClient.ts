import { QueryClient, QueryClientConfig } from "@tanstack/react-query";

import { CreateSRPCClientOptions, SRPCClient } from "@/client";

export function createQueryClient(
    opts: CreateSRPCClientOptions & { queryClientConfig?: QueryClientConfig },
) {
    const { queryClientConfig, ...srpcOpts } = opts;

    const srpc = new SRPCClient(srpcOpts);

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                queryFn: async ({ queryKey }) => {
                    const [path, input] = queryKey as [string, string];

                    return await srpc.query(path, input);
                },

                staleTime: 1000 * 60 * 5,
                refetchOnWindowFocus: false,
                refetchIntervalInBackground: false,
                networkMode: "offlineFirst",

                ...((queryClientConfig?.defaultOptions?.queries ?? {}) as any),
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

    return {
        queryClient,
        srpc,
    };
}
