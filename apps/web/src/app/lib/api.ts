import { createReactEnvironment } from "@dndnotes/backend-framework/client";
import { registerTransformerTypes } from "@dndnotes/models";
import { AppRouter } from "@dndnotes/server";
import superjson from "superjson";

registerTransformerTypes();

export const api = createReactEnvironment<AppRouter>({
    url: process.env.NEXT_PUBLIC_BASE_URL + "/api",
    transformer: superjson,
});
