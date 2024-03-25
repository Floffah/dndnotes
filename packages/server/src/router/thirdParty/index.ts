import { router } from "@/router/context";
import { notionRouter } from "@/router/thirdParty/notion";

export const thirdPartyRouter = router({
    notion: notionRouter,
});
