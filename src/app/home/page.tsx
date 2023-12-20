import { CampaignsList } from "@/app/home/CampaignsList";
import { FriendsList } from "@/app/home/FriendsList";
import { NavBar } from "@/app/home/NavBar";

export default function HomePage() {
    return (
        <>
            <div className="flex h-full w-full flex-col gap-3 p-3">
                <NavBar />

                <div className="flex h-full flex-1 gap-3">
                    <FriendsList />

                    <div className="flex w-full flex-col gap-3">
                        <CampaignsList />
                    </div>
                </div>
            </div>
        </>
    );
}
