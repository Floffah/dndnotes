"use client";

import { useEffect, useMemo } from "react";

import { api } from "@/lib/api";
import { useDiscord } from "@/providers/DiscordProvider";

export default function Dashboard() {
    const discord = useDiscord();

    const me = api.user.me.useQuery();

    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    );
}
