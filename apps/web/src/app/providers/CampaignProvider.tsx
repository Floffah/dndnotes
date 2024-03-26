"use client";

import { addMilliseconds } from "date-fns";
import { PropsWithChildren, createContext, useContext } from "react";

import { InputTypes } from "@dndnotes/backend-framework";
import {
    Campaign,
    CampaignMember,
    CampaignSession,
    CampaignSessionSchedule,
} from "@dndnotes/models";
import { AppRouter } from "@dndnotes/server";

import { api } from "@/app/lib/api";
import { serializableClone } from "@/app/lib/serializableClone";
import { useUser } from "@/app/providers/UserProvider";

export interface CampaignContextValue extends Campaign {
    loading: boolean;
    members: CampaignMember[];
    currentMember: CampaignMember;
    sessions: CampaignSession[];
    schedules: CampaignSessionSchedule[];

    startSession: (
        data: InputTypes<AppRouter>["campaign"]["session"]["start"],
    ) => Promise<void>;
    update: (id: string, data: Partial<Campaign>) => Promise<void>;
    createSchedule: (
        data: InputTypes<AppRouter>["campaign"]["session"]["createSchedule"],
    ) => Promise<void>;
    deleteSchedule: (
        data: InputTypes<AppRouter>["campaign"]["session"]["deleteSchedule"],
    ) => Promise<void>;
}

export const CampaignContext = createContext<CampaignContextValue>(null!);

export const useCampaign = () => useContext(CampaignContext);

export function CampaignProvider({
    campaignId,
    children,
}: PropsWithChildren<{ campaignId: string }>) {
    const cache = api.useCache();
    const user = useUser();

    const campaign = api.campaign.get.useQuery(campaignId);
    const campaignMembers = api.campaign.member.list.useQuery({
        campaignId,
    });

    const currentMember = campaignMembers.data?.find(
        (member) => member.user?.id === user.id,
    );

    const sessions = api.campaign.session.list.useQuery({
        campaignId,
    });

    const schedulesQuery = api.campaign.session.getSchedules.useQuery({
        campaignId,
    });
    const schedules =
        schedulesQuery.data?.filter(
            (schedule) =>
                addMilliseconds(schedule.nextSessionAt, schedule.length) >
                new Date(),
        ) ?? [];

    const updateCampaign = api.campaign.update.useMutation();
    const createSession = api.campaign.session.start.useMutation();
    const createScheduleMutation =
        api.campaign.session.createSchedule.useMutation();
    const deleteScheduleMutation =
        api.campaign.session.deleteSchedule.useMutation();

    const update: CampaignContextValue["update"] = async (id, data) => {
        const updatedCampaign = await updateCampaign.mutateAsync({
            id,
            ...data,
        });

        const campaignsCachedData = cache.campaign.get.getData(id);

        if (!campaignsCachedData) {
            cache.campaign.get.setData(id, updatedCampaign);
            return;
        }

        const clonedData = serializableClone(data);

        if (campaignsCachedData.createdBy && !data.createdBy) {
            clonedData.createdBy = serializableClone(
                campaignsCachedData.createdBy,
            );
        }

        cache.campaign.get.setData(id, clonedData);
    };

    const startSession: CampaignContextValue["startSession"] = async (data) => {
        const session = await createSession.mutateAsync(data);

        const sessionsCachedData = cache.campaign.session.list.getData({
            campaignId: data.campaignId,
        });

        if (!sessionsCachedData) {
            cache.campaign.session.list.setData(
                {
                    campaignId: data.campaignId,
                },
                [session],
            );
        } else {
            cache.campaign.session.list.setData(
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

        const schedulesCachedData = cache.campaign.session.getSchedules.getData(
            {
                campaignId: data.campaignId,
            },
        );

        if (!schedulesCachedData) {
            cache.campaign.session.getSchedules.setData(
                {
                    campaignId: data.campaignId,
                },
                [schedule],
            );
            return;
        }

        cache.campaign.session.getSchedules.setData(
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

        const schedulesCachedData = cache.campaign.session.getSchedules.getData(
            {
                campaignId: input.campaignId,
            },
        );

        if (!schedulesCachedData) {
            return;
        }

        cache.campaign.session.getSchedules.setData(
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
                        campaign.isPending ||
                        campaignMembers.isPending ||
                        schedulesQuery.isPending ||
                        sessions.isPending,
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
