-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'SCHEDULE_TRIGGER';

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "lastScheduledRunAt" TIMESTAMP(3);
