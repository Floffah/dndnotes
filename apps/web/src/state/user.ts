import { api } from "@/lib/api";

export function useUser() {
    const userQuery = api.user.me.useQuery();

    return {
        ...userQuery,
        isLoading: userQuery.isLoading,
        authenticated: !!userQuery.data,
    };
}
