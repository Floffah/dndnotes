import { resetDatabase } from "./utils/mongo";
import { TRPCTestClient, initTRPCForTesting } from "./utils/trpc";
import { createUser } from "./utils/user";
import { inferProcedureOutput } from "@trpc/server";
import { ObjectId } from "mongodb";

import { SESSION_TOKEN } from "@/app/api/lib/storage";
import { Campaign } from "@/db/models/Campaign";
import { CampaignModel } from "@/db/models/Campaign/model";
import { CampaignMemberModel } from "@/db/models/CampaignMember/model";
import { User } from "@/db/models/User";
import { AppRouter } from "@/server/router";

describe("Campaign", () => {
    let authUser: User;
    let trpc: TRPCTestClient;

    beforeAll(async () => {
        await resetDatabase();

        const { user, session } = await createUser(true);
        authUser = user;

        trpc = await initTRPCForTesting({
            headers: new Headers({
                cookie: `${SESSION_TOKEN}=${session.token}`,
            }),
        });
    });

    test("Create", async () => {
        const campaign = await trpc.campaign.create({
            name: "Test Campaign",
        });

        expect(campaign?.id).toBeTruthy();

        const campaignMember = await CampaignMemberModel.findOne({
            user: new ObjectId(authUser.id),
            campaign: new ObjectId(campaign.id),
        });

        expect(campaign?.name).toEqual("Test Campaign");
        expect(campaignMember?.type).toEqual("DM");
    });

    test("Read", async () => {
        const campaign = await CampaignModel.create({
            name: "Test Campaign",
            description: "Test Description",
        });

        const campaignResponse = await trpc.campaign.get(campaign.id);

        expect(campaignResponse?.id).toEqual(campaign.id);
    });

    describe("Update", () => {
        let campaign: inferProcedureOutput<AppRouter["campaign"]["update"]>;

        beforeAll(async () => {
            campaign = await trpc.campaign.create({
                name: "Test Campaign",
            });
        });

        test("Name", async () => {
            const campaignResponse = await trpc.campaign.update({
                id: campaign.id,
                name: "Updated Campaign",
            });

            expect(campaignResponse?.name).toEqual("Updated Campaign");

            const updatedCampaign = await CampaignModel.findById(campaign.id);

            expect(updatedCampaign?.name).toEqual("Updated Campaign");
        });
    });

    test("Delete", async () => {
        const campaign = await trpc.campaign.create({
            name: "Test Campaign",
        });

        const campaignResponse = await trpc.campaign.delete(campaign.id);

        expect(campaignResponse).toEqual(true);

        const deletedCampaign = await CampaignModel.findById(campaign.id);

        expect(deletedCampaign).toBeNull();

        const campaignMembers = await CampaignMemberModel.find({
            campaign: new ObjectId(campaign.id),
        });

        expect(campaignMembers.length).toEqual(0);
    });
});
