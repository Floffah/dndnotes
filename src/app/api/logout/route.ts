import { cookies } from "next/headers";

import { createSuccessResponse } from "@/app/api/apiResponse";
import { SESSION_TOKEN } from "@/app/lib/api/storageKeys";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = async () => {
    cookies().delete(SESSION_TOKEN);

    return createSuccessResponse({});
};
