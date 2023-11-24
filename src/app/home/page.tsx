import Link from "next/link";

import { NavBar } from "@/app/home/NavBar";

export default function HomePage() {
    return (
        <>
            <div className="flex h-full w-full flex-col gap-3 p-3">
                <NavBar />

                <div className="flex h-full flex-1 gap-3">
                    <div className="flex h-full w-full max-w-[17rem] items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <p className="text-center">
                            Your friends list & parties list will be here! See{" "}
                            <Link
                                href="/docs/roadmap"
                                className="text-blue-400 hover:underline hover:decoration-blue-400/75 hover:underline-offset-2"
                            >
                                the roadmap
                            </Link>{" "}
                            for details
                        </p>
                    </div>

                    <div className="flex h-full w-full items-center justify-center">
                        <p className="text-center">
                            Your campaigns, documents, and characters list will
                            be here! See{" "}
                            <Link
                                href="/docs/roadmap"
                                className="text-blue-400 hover:underline hover:decoration-blue-400/75 hover:underline-offset-2"
                            >
                                the roadmap
                            </Link>{" "}
                            for details
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
