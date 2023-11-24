import { NavBar } from "@/app/home/NavBar";

export default function HomePage() {
    return (
        <>
            <div className="flex h-full w-full flex-col gap-3 p-3">
                <NavBar />

                <div className="flex h-full flex-1 gap-3">
                    <div className="h-full w-full max-w-[17rem] rounded-lg border border-white/10 bg-white/5"></div>
                </div>
            </div>
        </>
    );
}
