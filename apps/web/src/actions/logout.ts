"use server";

import { cookies } from "next/headers";

import { SESSION_TOKEN } from "@dndnotes/lib";

export async function logout() {
    cookies().delete(SESSION_TOKEN);
}
