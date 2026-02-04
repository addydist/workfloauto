import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";


export const ManualTriggerNode = memo((props: NodeProps) => {
  return (
    <BaseTriggerNode
      {...props}
    //   id={props.id}
      icon={MousePointerIcon}
      name="Manual Trigger"
      description="Triggers the workflow manually"
      onSettings={() => {
        console.log("Open settings for node", props.id);
      }}
      onDoubleClick={() => {
        console.log("Open details for node", props.id);
      }}
    ></BaseTriggerNode>
  );
});