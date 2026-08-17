import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    // Send them to sign in, then back here to accept.
    redirect(`/login?callbackURL=/invite/${token}`);
  }

  const link = await prisma.workflowInviteLink.findUnique({
    where: { token },
    select: { workflowId: true, role: true },
  });

  if (!link) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-semibold">
          This invite link is invalid
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The link may have been reset by the owner, or it was mistyped.
        </p>
        <Button asChild>
          <Link href="/workflows">Go to your workflows</Link>
        </Button>
      </div>
    );
  }

  const userId = session.user.id;
  const workflow = await prisma.workflow.findUnique({
    where: { id: link.workflowId },
    select: { userId: true },
  });

  // Grant access unless they already own it (don't downgrade an existing role).
  if (workflow && workflow.userId !== userId) {
    await prisma.workflowMember.upsert({
      where: { workflowId_userId: { workflowId: link.workflowId, userId } },
      create: { workflowId: link.workflowId, userId, role: link.role },
      update: {},
    });
  }

  redirect(`/workflows/${link.workflowId}`);
}
