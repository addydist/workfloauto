import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime/middleware";

const isInngestEnabled = !!process.env.INNGEST_EVENT_KEY;

export const inngest = isInngestEnabled
    ? new Inngest({
        id: "nodefloo",
        eventKey: process.env.INNGEST_EVENT_KEY,
        middleware: [realtimeMiddleware()],
    })
    : {
        send: async (...args: any[]) => {
            console.warn("⚠️ Inngest disabled. Skipping event:", args[0]?.name);
            return;
        },
    } as unknown as Inngest;