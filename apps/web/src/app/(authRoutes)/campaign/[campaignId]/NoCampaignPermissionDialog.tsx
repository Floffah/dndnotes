import { forwardRef } from "react";

import { Dialog, DialogRef } from "@dndnotes/components";

export const NoCampaignPermissionDialog = forwardRef<
    DialogRef,
    { open?: boolean }
>(({ open }, ref) => {
    return (
        <Dialog ref={ref} open={open} closable={false}>
            <Dialog.Content className="max-w-md">
                <Dialog.Content.Title>No Permission</Dialog.Content.Title>
                <Dialog.Content.Body>
                    You do not have permission to view this campaign. Create
                    your own instead?
                </Dialog.Content.Body>
                <Dialog.Content.Footer>
                    <Dialog.Content.Footer.Button size="md" color="primary">
                        Create Campaign
                    </Dialog.Content.Footer.Button>
                </Dialog.Content.Footer>
            </Dialog.Content>
        </Dialog>
    );
});
