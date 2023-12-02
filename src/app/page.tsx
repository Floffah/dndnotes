import { redirect } from "next/navigation";

export default async function RootPage() {
    redirect("/login");

    return null;
}
