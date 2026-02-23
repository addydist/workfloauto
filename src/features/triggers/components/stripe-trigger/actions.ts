"use server";
import { getSubscriptionToken,type Realtime } from "@inngest/realtime";
import {inngest} from "@/inngest/client";
import { stripeTriggerChannel } from "@/inngest/channels/stipe-request";

export type StripeTriggerToken=Realtime.Token<typeof stripeTriggerChannel,["status"]>;


export async function getStripeTriggerRealtimeToken():Promise<StripeTriggerToken>{
    const token = await getSubscriptionToken(inngest, {
        channel: stripeTriggerChannel(),
        topics: ["status"]
    });
    return token;
}