import { createSuccessResponse } from "@/app/api/lib/server/apiResponse";
import { SESSION_TOKEN } from "@/app/api/lib/storage";

export const GET = () => {
    const response = createSuccessResponse({
        success: true,
    });

    response.cookies.delete(SESSION_TOKEN);

    return response;
};
