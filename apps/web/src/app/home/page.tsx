import { CampaignList } from "@/app/home/CampaignList";
import { NavBar } from "@/components/NavBar";

export default function Home() {
    return (
        <div className="mx-auto flex flex-col gap-3 p-3 lg:max-w-5xl">
            <NavBar className="mb-6" />

            <div className="px-1">
                <CampaignList />
            </div>
        </div>
    );
}
