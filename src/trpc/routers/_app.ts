import { inngest } from "@/inngest/client";
import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { TRPCError } from "@trpc/server";

export const appRouter = createTRPCRouter({
  testAi: protectedProcedure.mutation(async ({}) => {
    await inngest.send({
      name: "execute/ai",
    });
    return { success: true, message: "AI Test triggered" };
  }),

  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany();
  }),

  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "newemial@emial.com",
      },
    });
    return { success: true, message: "Workflow creation triggered" };
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
