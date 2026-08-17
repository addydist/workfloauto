-- CreateEnum
CREATE TYPE "WorkflowRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "WorkflowMember" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkflowRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowInvite" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "WorkflowRole" NOT NULL DEFAULT 'VIEWER',
    "invitedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkflowMember_userId_idx" ON "WorkflowMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowMember_workflowId_userId_key" ON "WorkflowMember"("workflowId", "userId");

-- CreateIndex
CREATE INDEX "WorkflowInvite_email_idx" ON "WorkflowInvite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowInvite_workflowId_email_key" ON "WorkflowInvite"("workflowId", "email");

-- AddForeignKey
ALTER TABLE "WorkflowMember" ADD CONSTRAINT "WorkflowMember_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowMember" ADD CONSTRAINT "WorkflowMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowInvite" ADD CONSTRAINT "WorkflowInvite_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
