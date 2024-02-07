import dynamic from "next/dynamic";
import { ComponentProps } from "react";
import { NotionRenderer } from "react-notion-x";
import "react-notion-x/src/styles.css";

import { trpc } from "@/app/api/lib/client/trpc";
import { Loader } from "@/app/components/Loader";

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
    fullPage = true,
    darkMode = true,
    ...props
}: { notionId: string } & Omit<
    ComponentProps<typeof NotionRenderer>,
    "recordMap" | "components"
>) {
    const notionPageQuery = trpc.thirdParty.notion.getPage.useQuery(notionId);

    if (notionPageQuery.isLoading) {
        return (
            <div className="flex flex-auto flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-lg font-semibold text-white/75">
                    Fetching page
                </p>
                <Loader className="h-8 w-8 text-white/75" />
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
            {...props}
        />
    );
}
