import { LoginWithDiscordButton } from "@/components/LoginWithDiscordButton";

export default function RootPage() {
    return (
        <div className="absolute inset-0 flex h-screen w-screen flex-col items-center justify-center gap-2">
            <LoginWithDiscordButton />
        </div>
    );
}
