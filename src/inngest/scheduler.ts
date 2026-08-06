import { NodeType } from "@/generated/prisma";
import prisma from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";
import { inngest } from "./client";
import {
  isScheduleDue,
  type ScheduleData,
} from "@/features/triggers/components/schedule-trigger/constants";

/**
 * Runs every minute. Finds workflows whose SCHEDULE_TRIGGER is due right now
 * (timezone-aware), dedupes against `lastScheduledRunAt`, and fires an
 * execution event for each. This is how dynamic per-workflow schedules work on
 * Inngest — one shared cron scans, rather than a cron per workflow.
 */
export const runScheduledWorkflows = inngest.createFunction(
  { id: "run-scheduled-workflows" },
  { cron: "* * * * *" },
  async ({ step }) => {
    const dueIds = await step.run("find-due-workflows", async () => {
      const workflows = await prisma.workflow.findMany({
        where: { nodes: { some: { type: NodeType.SCHEDULE_TRIGGER } } },
        select: {
          id: true,
          lastScheduledRunAt: true,
          nodes: {
            where: { type: NodeType.SCHEDULE_TRIGGER },
            select: { data: true },
          },
        },
      });

      const now = Date.now();
      const due: string[] = [];
      for (const wf of workflows) {
        const data = wf.nodes[0]?.data as ScheduleData | undefined;
        if (!data?.frequency) continue;
        if (!isScheduleDue(data)) continue;
        // Guard against firing twice within the same minute.
        if (
          wf.lastScheduledRunAt &&
          now - new Date(wf.lastScheduledRunAt).getTime() < 55_000
        ) {
          continue;
        }
        due.push(wf.id);
      }

      if (due.length) {
        await prisma.workflow.updateMany({
          where: { id: { in: due } },
          data: { lastScheduledRunAt: new Date() },
        });
      }
      return due;
    });

    if (dueIds.length) {
      await step.sendEvent(
        "trigger-scheduled",
        dueIds.map((workflowId) => ({
          name: "workflow/execute.workflow",
          data: { workflowId },
          id: createId(),
        })),
      );
    }

    return { triggered: dueIds.length };
  },
);
