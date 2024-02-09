import dynamic from "next/dynamic";

import { RichTextEditor } from "@/app/components/RichTextEditor";
import { useCampaignSession } from "@/app/providers/CampaignSessionProvider";

const NotionPage = dynamic(
    () => import("@/app/components/NotionPage").then((mod) => mod.NotionPage),
    {
        ssr: false,
    },
);

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

    if (session.summary.richText) {
        return (
            <RichTextEditor
                content={session.summary.richText}
                className="h-full w-full rounded-lg border border-white/10 bg-white/5 p-3"
            />
        );
    }

    return null;
}
