import { StartSessionDialog } from "@/app/(authRoutes)/campaign/[campaignId]/StartSessionDialog";
import { Button } from "@/app/components/Button";

export function SessionList() {
    return (
        <div className="w-full flex-col">
            <div className="flex items-center">
                <p className="flex-1 text-lg font-semibold">Sessions</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 py-10">
                <p className="font-semibold">
                    This campaign has held no sessions yet!
                </p>

                <StartSessionDialog>
                    <Button size="sm" color="primary" icon="mdi:plus">
                        Start Session
                    </Button>
                </StartSessionDialog>
            </div>
        </div>
    );
}
