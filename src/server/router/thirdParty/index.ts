import { notionRouter } from "@/server/router/thirdParty/notion";
import { router } from "@/server/trpc";

export const thirdPartyRouter = router({
    notion: notionRouter,
});
