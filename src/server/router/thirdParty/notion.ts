import { TRPCError } from "@trpc/server";
import { NotionAPI } from "notion-client";
import { z } from "zod";

import { NotionError } from "@/server/errors/NotionError";
import { procedure, router } from "@/server/trpc";

const notion = new NotionAPI();

export const notionRouter = router({
    getPage: procedure.input(z.string()).query(async (opts) => {
        try {
            return await notion.getPage(opts.input);
        } catch (e: any) {
            if (e.message.includes("Notion page not found")) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: NotionError.NOT_FOUND,
                });
            }

            throw e;
        }
    }),
});
