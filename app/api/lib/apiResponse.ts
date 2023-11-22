import { NextResponse } from "next/server";

const createBaseResponse = (body: any, status: number) =>
    new NextResponse(JSON.stringify(body), {
        status,
    });

export const createErrorResponse = (error: string, status = 400) =>
    createBaseResponse({ ok: false, error }, status);

export const createSuccessResponse = (data: any, status = 200) =>
    createBaseResponse({ ok: true, data }, status);
