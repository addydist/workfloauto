"use client";

import { Button } from "@/components/ui/button";
import { useReactFlow } from "@xyflow/react";
import { GlobeIcon, MousePointer2Icon, WebhookIcon } from "lucide-react";
import { createId } from "@paralleldrive/cuid2";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NodeType } from "@/generated/prisma";
import { Separator } from "./ui/separator";
import { useCallback } from "react";
import { toast } from "sonner";
import { se } from "date-fns/locale";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
};
const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Manual Trigger",
    description: "Start the workflow manually.",
    icon: MousePointer2Icon,
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form",
    description: "Start the workflow when a Google Form is submitted.",
    icon: "/logos/googleform.svg",
  },
];

const excecutorNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Make an HTTP request to an external API.",
    icon: GlobeIcon,
  },
];
interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}
export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      if (selection.type === NodeType.MANUAL_TRIGGER) {
        const nodes = getNodes();
        const hasMannualTrigger = nodes.some(
          (node) => node.type === NodeType.MANUAL_TRIGGER
        );
        if (hasMannualTrigger) {
          toast.error("Only one manual trigger is allowed per workflow.");
          return;
        }
      }
      setNodes((nodes) => {
        const hasIntialTrigger = nodes.some(
          (node) => node.type === NodeType.INITIAL
        );
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const flowpostion = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });
        const newNode = {
          id: createId(),
          data: {},
          position: flowpostion,
          type: selection.type,
        };

        if (hasIntialTrigger) {
          return [newNode];
        }
        return [...nodes, newNode];
      });
      onOpenChange(false);
    },
    [setNodes, getNodes, screenToFlowPosition, onOpenChange]
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>What triggers this workflow?</SheetTitle>
          <SheetDescription>
            A trigger is a step that starts your workflow
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          {triggerNodes.map((nodeType) => {
            const Icon = nodeType.icon;

            return (
              <div
                key={nodeType.type}
                className="flex items-start gap-4 px-4 py-3 cursor-pointer border-l-2 border-transparent hover:bg-accent/50 hover:border-primary transition"
                onClick={() => handleNodeSelect(nodeType)}
              >
                <div className="shrink-0 mt-0.5">
                  {typeof Icon === "string" ? (
                    <img
                      src={Icon}
                      alt={nodeType.label}
                      className="w-5 h-5 object-contain rounded-sm"
                    />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">{nodeType.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {nodeType.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          {excecutorNodes.map((nodeType) => {
            const Icon = nodeType.icon;

            return (
              <div
                key={nodeType.type}
                className="flex items-start gap-4 px-4 py-3 cursor-pointer border-l-2 border-transparent hover:bg-accent/50 hover:border-primary transition"
                onClick={() => handleNodeSelect(nodeType)}
              >
                <div className="shrink-0 mt-0.5">
                  {typeof Icon === "string" ? (
                    <img
                      src={Icon}
                      alt={nodeType.label}
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">{nodeType.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {nodeType.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
