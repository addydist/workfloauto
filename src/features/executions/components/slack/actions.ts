"use server";
import { getSubscriptionToken,type Realtime } from "@inngest/realtime";
import {inngest} from "@/inngest/client";
import { slackChannel } from "@/inngest/channels/slack";

export type slackToken=Realtime.Token<typeof slackChannel,["status"]>;


export async function getSlacktimeToken():Promise<slackToken>{
    const token = await getSubscriptionToken(inngest, {
        channel: slackChannel(),
        topics: ["status"]
    });
    return token;
}