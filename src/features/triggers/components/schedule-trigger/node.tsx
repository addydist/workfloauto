"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { ClockIcon } from "lucide-react";
import { memo, useState } from "react";

import { BaseTriggerNode } from "../base-trigger-node";
import { useNodeStatus } from "@/features/executions/hooks/usee-node-status";
import { SCHEDULE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/schedule-trigger";
import { getScheduleTriggerRealtimeToken } from "./actions";
import { ScheduleTriggerDialog } from "./dialog";
import { describeSchedule, type ScheduleData } from "./constants";

type ScheduleNodeType = Node<ScheduleData>;

export const ScheduleTriggerNode = memo((props: NodeProps<ScheduleNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const nodeData = props.data;

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SCHEDULE_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: getScheduleTriggerRealtimeToken,
  });

  const handleSubmit = (values: ScheduleData) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  return (
    <>
      <ScheduleTriggerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseTriggerNode
        {...props}
        icon={ClockIcon}
        name="Schedule"
        description={describeSchedule(nodeData)}
        status={nodeStatus}
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
});

ScheduleTriggerNode.displayName = "ScheduleTriggerNode";
