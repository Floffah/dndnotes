import { createSuccessResponse } from "@/app/api/lib/server/apiResponse";
import { SESSION_TOKEN } from "@/app/api/lib/storage";

export const GET = async () => {
    const response = createSuccessResponse({ success: true });

    response.cookies.set({
        name: SESSION_TOKEN,
        value: "",
        maxAge: 0,
        expires: new Date(0),
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
            process.env.NODE_ENV === "production"
                ? ".dndnotes.floffah.dev"
                : "localhost",
        sameSite: "lax",
    });

    return response;
};
