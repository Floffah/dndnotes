import { api } from "@/lib/api";

export function useUser() {
    const userQuery = api.user.me.useQuery();

    return {
        ...(userQuery.data ?? {}),
        isLoading: userQuery.isLoading,
        isAuthenticated: !!userQuery.data,
    };
}
