import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/usee-node-status";
import { getManuALTriggerRealtimeToken } from "./actions";
import { MANUAL_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/manual-request";
export const ManualTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleSettings = () => setDialogOpen(true);
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: MANUAL_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken:getManuALTriggerRealtimeToken,
});
  return (
    <>
      <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        //   id={props.id}
        icon={MousePointerIcon}
        name="Manual Trigger"
        description="Triggers the workflow manually"
        status={nodeStatus}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      ></BaseTriggerNode>
    </>
  );
});
