import { PAGINATION } from "@/config/constant";
import { NodeType } from "@/generated/prisma";
import type { Node, Edge } from "@xyflow/react";
import prisma from "@/lib/db";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { sendWorkflowExecutionEvent } from "@/inngest/utils";
import {
  canEdit,
  canExecute,
  canManage,
  canView,
  getWorkflowRole,
  linkPendingInvites,
  requireWorkflowRole,
  type EffectiveRole,
} from "./access";

const shareRole = z.enum(["EDITOR", "VIEWER"]);

export const workflowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await requireWorkflowRole(
        input.id,
        ctx.auth.user.id,
        canExecute,
        "You don't have permission to run this workflow.",
      );
      await sendWorkflowExecutionEvent({ workflowId: input.id });
      return { id: input.id };
    }),

  create: premiumProcedure.mutation(({ ctx }) => {
    return prisma.workflow.create({
      data: {
        name: generateSlug(3),
        userId: ctx.auth.user.id,
        nodes: {
          create: {
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
            name: NodeType.INITIAL,
          },
        },
      },
    });
  }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await requireWorkflowRole(
        input.id,
        ctx.auth.user.id,
        canManage,
        "Only the owner can delete this workflow.",
      );
      return prisma.workflow.delete({ where: { id: input.id } });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        version: z.number().default(0),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional(),
          }),
        ),
        edges: z.array(
          z.object({
            id: z.string(),
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges, version } = input;
      await requireWorkflowRole(
        id,
        ctx.auth.user.id,
        canEdit,
        "You don't have permission to edit this workflow.",
      );

      return await prisma.$transaction(async (tx) => {
        // Optimistic concurrency: only proceed if the version still matches.
        const locked = await tx.workflow.updateMany({
          where: { id, version },
          data: { version: { increment: 1 }, updatedAt: new Date() },
        });
        if (locked.count === 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "This workflow was changed by someone else. Reload to get the latest version before saving.",
          });
        }

        await tx.node.deleteMany({ where: { workflowId: id } });
        await tx.node.createMany({
          data: nodes.map((node) => ({
            id: node.id,
            workflowId: id,
            type: node.type as NodeType,
            position: node.position,
            data: node.data,
            name:
              typeof node.data?.label === "string"
                ? node.data.label
                : node.type || "Unnamed",
          })),
        });
        await tx.connection.createMany({
          data: edges.map((edge) => ({
            workflowId: id,
            fromNodeId: edge.source,
            toNodeId: edge.target,
            fromOutput: edge.sourceHandle || "main",
            toInput: edge.targetHandle || "main",
          })),
        });

        return tx.workflow.findUniqueOrThrow({
          where: { id },
          select: { id: true, version: true },
        });
      });
    }),

  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      await requireWorkflowRole(
        input.id,
        ctx.auth.user.id,
        canEdit,
        "You don't have permission to rename this workflow.",
      );
      return prisma.workflow.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const role = await requireWorkflowRole(
        input.id,
        ctx.auth.user.id,
        canView,
      );
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: input.id },
        include: { nodes: true, connections: true },
      });
      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) || { label: node.name },
      }));
      const edges: Edge[] = workflow.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));
      return {
        id: workflow.id,
        name: workflow.name,
        version: workflow.version,
        role,
        nodes,
        edges,
      };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const me = ctx.auth.user.id;
      // Turn any pending invites for this account into memberships.
      await linkPendingInvites(me, ctx.auth.user.email);

      const { page, pageSize, search } = input;
      const where = {
        OR: [{ userId: me }, { members: { some: { userId: me } } }],
        name: { contains: search, mode: "insensitive" as const },
      };

      const [rawItems, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where,
          orderBy: { updatedAt: "desc" },
          include: { members: { where: { userId: me }, select: { role: true } } },
        }),
        prisma.workflow.count({ where }),
      ]);

      const items = rawItems.map((w) => ({
        id: w.id,
        name: w.name,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        userId: w.userId,
        role: (w.userId === me
          ? "OWNER"
          : (w.members[0]?.role ?? "VIEWER")) as EffectiveRole,
      }));

      const totalPages = Math.ceil(totalCount / pageSize);
      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPages: page < totalPages,
        hasPrevPages: page > 1,
      };
    }),

  // --- Sharing / members --------------------------------------------------

  members: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ ctx, input }) => {
      const myRole = await requireWorkflowRole(
        input.workflowId,
        ctx.auth.user.id,
        canView,
      );
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: input.workflowId },
        select: {
          user: { select: { id: true, name: true, email: true, image: true } },
          members: {
            orderBy: { createdAt: "asc" },
            select: {
              userId: true,
              role: true,
              user: { select: { name: true, email: true, image: true } },
            },
          },
          invites: {
            orderBy: { createdAt: "asc" },
            select: { email: true, role: true },
          },
        },
      });
      return {
        myRole,
        owner: workflow.user,
        members: workflow.members.map((m) => ({
          userId: m.userId,
          role: m.role,
          name: m.user.name,
          email: m.user.email,
          image: m.user.image,
        })),
        invites: workflow.invites,
      };
    }),

  invite: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        email: z.string().email(),
        role: shareRole,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireWorkflowRole(
        input.workflowId,
        ctx.auth.user.id,
        canManage,
        "Only the owner can share this workflow.",
      );
      const email = input.email.trim().toLowerCase();

      const owner = await prisma.workflow.findUniqueOrThrow({
        where: { id: input.workflowId },
        select: { user: { select: { email: true } } },
      });
      if (owner.user.email.toLowerCase() === email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already own this workflow.",
        });
      }

      const existingUser = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { id: true },
      });

      if (existingUser) {
        await prisma.workflowMember.upsert({
          where: {
            workflowId_userId: {
              workflowId: input.workflowId,
              userId: existingUser.id,
            },
          },
          create: {
            workflowId: input.workflowId,
            userId: existingUser.id,
            role: input.role,
          },
          update: { role: input.role },
        });
        return { status: "added" as const };
      }

      await prisma.workflowInvite.upsert({
        where: {
          workflowId_email: { workflowId: input.workflowId, email },
        },
        create: {
          workflowId: input.workflowId,
          email,
          role: input.role,
          invitedById: ctx.auth.user.id,
        },
        update: { role: input.role, invitedById: ctx.auth.user.id },
      });
      return { status: "invited" as const };
    }),

  updateMemberRole: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        userId: z.string(),
        role: shareRole,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireWorkflowRole(
        input.workflowId,
        ctx.auth.user.id,
        canManage,
        "Only the owner can manage members.",
      );
      await prisma.workflowMember.updateMany({
        where: { workflowId: input.workflowId, userId: input.userId },
        data: { role: input.role },
      });
      return { success: true };
    }),

  removeMember: protectedProcedure
    .input(z.object({ workflowId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await requireWorkflowRole(
        input.workflowId,
        ctx.auth.user.id,
        canManage,
        "Only the owner can manage members.",
      );
      await prisma.workflowMember.deleteMany({
        where: { workflowId: input.workflowId, userId: input.userId },
      });
      return { success: true };
    }),

  removeInvite: protectedProcedure
    .input(z.object({ workflowId: z.string(), email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      await requireWorkflowRole(
        input.workflowId,
        ctx.auth.user.id,
        canManage,
        "Only the owner can manage members.",
      );
      await prisma.workflowInvite.deleteMany({
        where: {
          workflowId: input.workflowId,
          email: input.email.trim().toLowerCase(),
        },
      });
      return { success: true };
    }),

  // Create (or fetch the existing) shareable link for a role. Stable token so
  // copying again yields the same link.
  createInviteLink: protectedProcedure
    .input(z.object({ workflowId: z.string(), role: shareRole }))
    .mutation(async ({ ctx, input }) => {
      await requireWorkflowRole(
        input.workflowId,
        ctx.auth.user.id,
        canManage,
        "Only the owner can create invite links.",
      );
      const link = await prisma.workflowInviteLink.upsert({
        where: {
          workflowId_role: { workflowId: input.workflowId, role: input.role },
        },
        create: { workflowId: input.workflowId, role: input.role },
        update: {},
        select: { token: true, role: true },
      });
      return link;
    }),

  revokeInviteLinks: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await requireWorkflowRole(
        input.workflowId,
        ctx.auth.user.id,
        canManage,
        "Only the owner can manage invite links.",
      );
      await prisma.workflowInviteLink.deleteMany({
        where: { workflowId: input.workflowId },
      });
      return { success: true };
    }),
});
