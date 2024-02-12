import { cookies } from "next/headers";

import { createSuccessResponse } from "@/app/api/lib/server/apiResponse";
import { SESSION_TOKEN } from "@/app/api/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = async () => {
    cookies().delete(SESSION_TOKEN);

    return createSuccessResponse({});
};
