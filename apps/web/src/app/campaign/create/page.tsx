import { CreateCampaignForm } from "@/app/campaign/create/CreateCampaignForm";
import { LoginBoundary } from "@/components/LoginBoundary";
import { NavBar } from "@/components/NavBar";

export default function CreateCampaignPage() {
    return (
        <main className="mx-auto flex flex-col gap-3 p-3 lg:max-w-5xl">
            <NavBar className="mb-6" />

            <LoginBoundary>
                <CreateCampaignForm />
            </LoginBoundary>
        </main>
    );
}
