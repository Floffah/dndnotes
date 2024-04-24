import { z } from "zod";

import { socketPayloadTypeInfo } from "@/shared";

export function extractTypeInfo(
    data: any,
): z.infer<typeof socketPayloadTypeInfo> {
    return {};
}
