import { Button } from "@/app/components/Button";

export function CampaignsList() {
    return (
        <div className="flex w-full flex-col rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex w-full">
                <p className="flex-auto text-xl font-semibold">My Campaigns</p>

                <Button
                    size="md"
                    color="primary"
                    icon="mdi:plus"
                    link="/campaign/create"
                    className="!py-1"
                >
                    Create Campaign
                </Button>
            </div>

            <div className="flex w-full justify-center py-10">
                <p className="text-sm text-white/80">
                    You are part of no campaigns - create one!
                </p>
            </div>
        </div>
    );
}
