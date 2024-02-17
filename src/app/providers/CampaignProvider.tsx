"use client";

import { inferProcedureInput } from "@trpc/server";
import { addMilliseconds } from "date-fns";
import { PropsWithChildren, createContext, useContext } from "react";

import { trpc } from "@/app/api/lib/client/trpc";
import { serializableClone } from "@/app/lib/serializableClone";
import { useUser } from "@/app/providers/UserProvider";
import { Campaign } from "@/db/models/Campaign";
import { CampaignMember } from "@/db/models/CampaignMember";
import { CampaignSession } from "@/db/models/CampaignSession";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule";
import { AppRouter } from "@/server/router";

export interface CampaignContextValue extends Campaign {
    loading: boolean;
    members: CampaignMember[];
    currentMember: CampaignMember;
    sessions: CampaignSession[];
    schedules: CampaignSessionSchedule[];

    startSession: (
        data: inferProcedureInput<AppRouter["campaign"]["session"]["start"]>,
    ) => Promise<void>;
    update: (id: string, data: Partial<Campaign>) => Promise<void>;
    createSchedule: (
        data: inferProcedureInput<
            AppRouter["campaign"]["session"]["createSchedule"]
        >,
    ) => Promise<void>;
    deleteSchedule: (
        data: inferProcedureInput<
            AppRouter["campaign"]["session"]["deleteSchedule"]
        >,
    ) => Promise<void>;
}

export const CampaignContext = createContext<CampaignContextValue>(null!);

export const useCampaign = () => useContext(CampaignContext);

export function CampaignProvider({
    campaignId,
    children,
}: PropsWithChildren<{ campaignId: string }>) {
    const utils = trpc.useUtils();
    const user = useUser();

    const campaign = trpc.campaign.get.useQuery(campaignId);
    const campaignMembers = trpc.campaign.member.list.useQuery({
        campaignId,
    });

    const currentMember = campaignMembers.data?.find(
        (member) => member.user?.id === user.id,
    );

    const sessions = trpc.campaign.session.list.useQuery({
        campaignId,
    });

    const schedulesQuery = trpc.campaign.session.getSchedules.useQuery({
        campaignId,
    });
    const schedules =
        schedulesQuery.data?.filter(
            (schedule) =>
                addMilliseconds(schedule.nextSessionAt, schedule.length) >
                new Date(),
        ) ?? [];

    const updateCampaign = trpc.campaign.update.useMutation();
    const createSession = trpc.campaign.session.start.useMutation();
    const createScheduleMutation =
        trpc.campaign.session.createSchedule.useMutation();
    const deleteScheduleMutation =
        trpc.campaign.session.deleteSchedule.useMutation();

    const update: CampaignContextValue["update"] = async (id, data) => {
        const updatedCampaign = await updateCampaign.mutateAsync({
            id,
            ...data,
        });

        const campaignsCachedData = utils.campaign.get.getData(id);

        if (!campaignsCachedData) {
            utils.campaign.get.setData(id, updatedCampaign);
            return;
        }

        const clonedData = serializableClone(data);

        if (campaignsCachedData.createdBy && !data.createdBy) {
            clonedData.createdBy = serializableClone(
                campaignsCachedData.createdBy,
            );
        }

        utils.campaign.get.setData(id, clonedData);
    };

    const startSession: CampaignContextValue["startSession"] = async (data) => {
        const session = await createSession.mutateAsync(data);

        const sessionsCachedData = utils.campaign.session.list.getData({
            campaignId: data.campaignId,
        });

        if (!sessionsCachedData) {
            utils.campaign.session.list.setData(
                {
                    campaignId: data.campaignId,
                },
                [session],
            );
        } else {
            utils.campaign.session.list.setData(
                {
                    campaignId: data.campaignId,
                },
                [...sessionsCachedData, session],
            );
        }
    };

    const createSchedule: CampaignContextValue["createSchedule"] = async (
        data,
    ) => {
        const schedule = await createScheduleMutation.mutateAsync(data);

        const schedulesCachedData = utils.campaign.session.getSchedules.getData(
            {
                campaignId: data.campaignId,
            },
        );

        if (!schedulesCachedData) {
            utils.campaign.session.getSchedules.setData(
                {
                    campaignId: data.campaignId,
                },
                [schedule],
            );
            return;
        }

        utils.campaign.session.getSchedules.setData(
            {
                campaignId: data.campaignId,
            },
            [...schedulesCachedData, schedule],
        );
    };

    const deleteSchedule: CampaignContextValue["deleteSchedule"] = async (
        input,
    ) => {
        await deleteScheduleMutation.mutateAsync(input);

        const schedulesCachedData = utils.campaign.session.getSchedules.getData(
            {
                campaignId: input.campaignId,
            },
        );

        if (!schedulesCachedData) {
            return;
        }

        utils.campaign.session.getSchedules.setData(
            {
                campaignId,
            },
            schedulesCachedData.filter(
                (schedule) => schedule.id !== input.scheduleId,
            ),
        );
    };

    return (
        <CampaignContext.Provider
            value={
                {
                    loading:
                        campaign.isLoading ||
                        campaignMembers.isLoading ||
                        schedulesQuery.isLoading ||
                        sessions.isLoading,
                    ...(campaign.data ?? {}),
                    members: campaignMembers.data ?? [],
                    currentMember: currentMember ?? {},
                    schedules,
                    sessions: sessions.data ?? [],

                    update,
                    startSession,
                    createSchedule,
                    deleteSchedule,
                } as CampaignContextValue
            }
        >
            {children}
        </CampaignContext.Provider>
    );
}
