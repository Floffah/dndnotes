import { NotionAPI } from "notion-client";
import { z } from "zod";

import { procedure, router } from "@/server/trpc";

const notion = new NotionAPI();

export const notionRouter = router({
    getPage: procedure.input(z.string()).query(async (opts) => {
        return await notion.getPage(opts.input);
    }),
});
