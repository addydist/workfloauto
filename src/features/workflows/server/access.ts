import { TRPCError } from "@trpc/server";
import prisma from "@/lib/db";

export type EffectiveRole = "OWNER" | "EDITOR" | "VIEWER";

/** The current user's effective role on a workflow, or null if no access. */
export async function getWorkflowRole(
  workflowId: string,
  userId: string,
): Promise<EffectiveRole | null> {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: { userId: true },
  });
  if (!workflow) return null;
  if (workflow.userId === userId) return "OWNER";

  const member = await prisma.workflowMember.findUnique({
    where: { workflowId_userId: { workflowId, userId } },
    select: { role: true },
  });
  return (member?.role as EffectiveRole) ?? null;
}

// Capability checks (the roles matrix).
export const canView = (r: EffectiveRole | null) => r !== null;
export const canExecute = (r: EffectiveRole | null) =>
  r === "OWNER" || r === "EDITOR";
export const canEdit = (r: EffectiveRole | null) =>
  r === "OWNER" || r === "EDITOR";
export const canManage = (r: EffectiveRole | null) => r === "OWNER"; // share + delete

/** Assert access, throwing NOT_FOUND (no access at all) or FORBIDDEN. */
export async function requireWorkflowRole(
  workflowId: string,
  userId: string,
  check: (r: EffectiveRole | null) => boolean,
  message = "You don't have access to this workflow",
): Promise<EffectiveRole> {
  const role = await getWorkflowRole(workflowId, userId);
  if (!check(role)) {
    throw new TRPCError({
      code: role ? "FORBIDDEN" : "NOT_FOUND",
      message: role ? message : "Workflow not found",
    });
  }
  return role as EffectiveRole;
}

/**
 * Convert any pending invites for this email into memberships. Called when the
 * user loads their workflow list, so shares appear right after they sign up.
 */
export async function linkPendingInvites(userId: string, email: string) {
  const normalized = email.toLowerCase();
  const invites = await prisma.workflowInvite.findMany({
    where: { email: normalized },
    select: { workflowId: true, role: true },
  });
  if (invites.length === 0) return;

  await prisma.$transaction([
    ...invites.map((invite) =>
      prisma.workflowMember.upsert({
        where: {
          workflowId_userId: { workflowId: invite.workflowId, userId },
        },
        create: { workflowId: invite.workflowId, userId, role: invite.role },
        update: { role: invite.role },
      }),
    ),
    prisma.workflowInvite.deleteMany({ where: { email: normalized } }),
  ]);
}
