import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
export const ManualTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleSettings = () => setDialogOpen(true);
  const nodeStatus = 'loading';
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
