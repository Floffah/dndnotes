import { cookies } from "next/headers";

import { SESSION_TOKEN } from "@dndnotes/lib";

import { createSuccessResponse } from "@/app/api/apiResponse";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = async () => {
    cookies().delete(SESSION_TOKEN);

    return createSuccessResponse({});
};
