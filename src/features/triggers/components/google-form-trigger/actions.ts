"use server";
import { getSubscriptionToken,type Realtime } from "@inngest/realtime";
import {inngest} from "@/inngest/client";
import { googleFromTriggerChannel } from "@/inngest/channels/google-form-trigger";

export type GoogelFoemTriggerToken=Realtime.Token<typeof googleFromTriggerChannel,["status"]>;


export async function getGoogleFormTriggerRealtimeToken():Promise<GoogelFoemTriggerToken>{
    const token = await getSubscriptionToken(inngest, {
        channel: googleFromTriggerChannel(),
        topics: ["status"]
    });
    return token;
}