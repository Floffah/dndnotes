import { useMemo } from "react";

import { NotionPage } from "@/app/components/NotionPage";
import { useCampaignSession } from "@/app/providers/CampaignSessionProvider";

export function CampaignSessionSummary() {
    const session = useCampaignSession();

    if (session.summary.notionId) {
        return (
            <NotionPage
                notionId={session.summary.notionId}
                className="w-full overflow-auto"
            />
        );
    }

    return null;
}
