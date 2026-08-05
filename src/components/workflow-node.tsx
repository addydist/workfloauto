"use client";
import { NodeToolbar, Position } from "@xyflow/react";
import { SettingsIcon, Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./ui/button";

interface WorkflowNodeProps {
  children?: ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
  name?: string;
  description?: string;
}
export function WorkflowNode({
  children,
  showToolbar = true,
  onDelete,
  onSettings,
  name,
  description,
}: WorkflowNodeProps) {
  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <Button size="sm" variant="ghost" onClick={onSettings}>
            <SettingsIcon className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2Icon className="size-4" />
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar position={Position.Bottom} isVisible className="w-[180px] text-center">
            <p className="truncate font-medium">
                {name}
            </p>
            {description && (<p className="text-muted-foreground truncate text-sm">
                {description}
            </p>)}
        </NodeToolbar>
      )}
    </>
  );
}
