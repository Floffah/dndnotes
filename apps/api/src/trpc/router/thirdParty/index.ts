import { notionRouter } from "@/trpc/router/thirdParty/notion";
import { router } from "@/trpc/trpc";

export const thirdPartyRouter = router({
    notion: notionRouter,
});
