-- CreateTable
CREATE TABLE "WorkflowInviteLink" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "WorkflowRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowInviteLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowInviteLink_token_key" ON "WorkflowInviteLink"("token");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowInviteLink_workflowId_role_key" ON "WorkflowInviteLink"("workflowId", "role");

-- AddForeignKey
ALTER TABLE "WorkflowInviteLink" ADD CONSTRAINT "WorkflowInviteLink_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
