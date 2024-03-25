import { ServerError } from "@dndnotes/backend-framework";
import { TRPCError } from "@trpc/server";
import { NotionAPI } from "notion-client";
import { z } from "zod";

import { NotionError } from "@/errors";
import { procedure, router } from "@/router/context";

const notion = new NotionAPI();

export const notionRouter = router({
    getPage: procedure(z.string()).query(async (opts) => {
        try {
            return await notion.getPage(opts.input);
        } catch (e: any) {
            if (e.message.includes("Notion page not found")) {
                throw new ServerError({
                    code: "NOT_FOUND",
                    message: NotionError.NOT_FOUND,
                });
            }

            throw e;
        }
    }),
});
