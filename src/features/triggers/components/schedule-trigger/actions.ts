"use server";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { scheduleTriggerChannel } from "@/inngest/channels/schedule-trigger";

export type ScheduleTriggerToken = Realtime.Token<
  typeof scheduleTriggerChannel,
  ["status"]
>;

export async function getScheduleTriggerRealtimeToken(): Promise<ScheduleTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: scheduleTriggerChannel(),
    topics: ["status"],
  });
  return token;
}
