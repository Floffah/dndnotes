import { CampaignNavBar } from "@/app/(authRoutes)/campaign/[campaignId]/CampaignNavBar";
import { CampaignSettingsForm } from "@/app/(authRoutes)/campaign/[campaignId]/settings/CampaignSettingsForm";

export default function CampaignSettingsPage() {
    return (
        <div className="relative flex h-screen w-screen flex-col gap-3 p-3">
            <CampaignNavBar />
            <CampaignSettingsForm />
        </div>
    );
}
