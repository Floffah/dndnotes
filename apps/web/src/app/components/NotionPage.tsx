import { NotionError } from "@dndnotes/server";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { ComponentProps } from "react";
import { NotionRenderer } from "react-notion-x";
import "react-notion-x/src/styles.css";

import { LinkToNotionDialog } from "@/app/(authRoutes)/campaign/[campaignId]/session/[sessionId]/LinkToNotionDialog";
import { Button } from "@/app/components/Button";
import { Loader } from "@/app/components/Loader";
import { api } from "@/app/lib/api";
import { useCampaignSession } from "@/app/providers/CampaignSessionProvider";

const Code = dynamic(() =>
    import("react-notion-x/build/third-party/code").then((m) => m.Code),
);
const Collection = dynamic(() =>
    import("react-notion-x/build/third-party/collection").then(
        (m) => m.Collection,
    ),
);
const Equation = dynamic(() =>
    import("react-notion-x/build/third-party/equation").then((m) => m.Equation),
);
const Modal = dynamic(
    () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
    {
        ssr: false,
    },
);

export function NotionPage({
    notionId,
    fullPage = false,
    darkMode = true,
    className,
    ...props
}: { notionId: string } & Omit<
    ComponentProps<typeof NotionRenderer>,
    "recordMap" | "components"
>) {
    const session = useCampaignSession();

    const notionPageQuery = api.thirdParty.notion.getPage.useQuery(notionId, {
        retry: (failureCount, error) => {
            return failureCount > 3 || error.message !== NotionError.NOT_FOUND;
        },
    });

    if (notionPageQuery.isPending) {
        return (
            <div
                className={clsx(
                    className,
                    "flex h-full flex-col items-center justify-center gap-3",
                )}
            >
                <p className="text-lg font-semibold text-white/75">
                    Fetching page
                </p>
                <Loader className="h-8 w-8 text-white/75" />
            </div>
        );
    }

    if (
        notionPageQuery.error &&
        notionPageQuery.error.message === NotionError.NOT_FOUND
    ) {
        return (
            <div
                className={clsx(
                    className,
                    "flex h-full flex-col items-center justify-center gap-3",
                )}
            >
                <p className="text-lg font-semibold text-white/75">
                    Notion document not found. Is it definitely public?
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        size="md"
                        color="primary"
                        onClick={() => session.initEmptySummary()}
                    >
                        Create Rich Text Summary
                    </Button>
                    <LinkToNotionDialog>
                        <Button size="md" color="secondary">
                            Edit Notion Link
                        </Button>
                    </LinkToNotionDialog>
                </div>
            </div>
        );
    }

    return (
        <NotionRenderer
            fullPage={fullPage}
            darkMode={darkMode}
            recordMap={notionPageQuery.data!}
            components={{
                Code,
                Collection,
                Equation,
                Modal,
            }}
            className={className}
            {...props}
        />
    );
}
