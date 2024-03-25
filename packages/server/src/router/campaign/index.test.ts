import { SESSION_TOKEN } from "@dndnotes/lib";
import { Campaign, User } from "@dndnotes/models";
import { ObjectId } from "mongodb";

import { ServerCaller, createBackendCaller } from "@/lib/createBackendCaller";
import { CampaignMemberModel } from "@/models/CampaignMemberModel";
import { CampaignModel } from "@/models/CampaignModel";
import { resetDatabase } from "@/tests/utils/mongo";
import { createUser } from "@/tests/utils/user";

let authUser: User;
let api: ServerCaller;

beforeAll(async () => {
    await resetDatabase();

    const { user, session } = await createUser(true);
    authUser = user;

    api = await createBackendCaller({
        headers: new Headers({
            cookie: `${SESSION_TOKEN}=${session.token}`,
        }),
    });
});

test("Create", async () => {
    const campaign = await api.campaign.create({
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
        createdBy: new ObjectId(authUser.id),
    });

    const campaignResponse = await api.campaign.get(campaign.id);

    expect(campaignResponse?.id).toEqual(campaign.id);
});

describe("Update", () => {
    let campaign: Campaign;

    beforeAll(async () => {
        campaign = await api.campaign.create({
            name: "Test Campaign",
        });
    });

    test("Name", async () => {
        const campaignResponse = await api.campaign.update({
            id: campaign.id,
            name: "Updated Campaign",
        });

        expect(campaignResponse?.name).toEqual("Updated Campaign");

        const updatedCampaign = await CampaignModel.findById(campaign.id);

        expect(updatedCampaign?.name).toEqual("Updated Campaign");
    });
});

test("Delete", async () => {
    const campaign = await api.campaign.create({
        name: "Test Campaign",
    });

    const campaignResponse = await api.campaign.delete(campaign.id);

    expect(campaignResponse).toEqual(true);

    const deletedCampaign = await CampaignModel.findById(campaign.id);

    expect(deletedCampaign).toBeNull();

    const campaignMembers = await CampaignMemberModel.find({
        campaign: new ObjectId(campaign.id),
    });

    expect(campaignMembers.length).toEqual(0);
});
