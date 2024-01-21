import { AddScheduleDialog } from "@/app/campaign/[campaignId]/settings/CampaignSettingsForm/AddScheduleDialog";
import { Icon } from "@/app/components/Icon";

export function CampaignSchedules() {
    return (
        <>
            <h2 className="mb-3 mt-5 border-b-2 border-b-white/20 text-2xl font-semibold">
                Schedules
            </h2>

            <AddScheduleDialog>
                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/10 p-2 text-lg font-semibold text-white/70"
                >
                    <Icon label="add" icon="mdi:plus" className="h-5 w-5" />
                    Add Schedule
                </button>
            </AddScheduleDialog>
        </>
    );
}
