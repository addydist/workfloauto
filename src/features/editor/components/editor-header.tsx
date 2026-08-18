"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SaveIcon, Share2Icon, UsersIcon } from "lucide-react";
import { ShareWorkflowDialog } from "@/features/workflows/components/share-dialog";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {
  useSuspenseWorkflow,
  useUpdateWorkflow,
  useUpdateWorkflowName,
} from "@/features/workflows/hooks/use-workflow";
import { use, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAtomValue } from "jotai";
import { editorAtom } from "../store/atom";
export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  const editor = useAtomValue(editorAtom);
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const saveWorkflow = useUpdateWorkflow();
  const handleSave = () => {
    if (!editor) return;
    const nodes = editor.getNodes();
    const edges = editor.getEdges();
    saveWorkflow.mutate({
      id: workflowId,
      version: workflow.version,
      nodes,
      edges,
    });
  };
  return (
    <Button size="sm" onClick={handleSave} disabled={saveWorkflow.isPending}>
      <SaveIcon />
      Save
    </Button>
  );
};
export const EditorBreadcrumbs = ({ workflowId }: { workflowId: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link prefetch href="/workflows">
              <BreadcrumbPage>Workflows</BreadcrumbPage>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  );
};
export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const [shareOpen, setShareOpen] = useState(false);
  const isOwner = workflow.role === "OWNER";
  const canEdit = isOwner || workflow.role === "EDITOR";
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <div className="flex flex-row items-center justify-between gap-x-4 w-full">
        <EditorBreadcrumbs workflowId={workflowId} />
        <div className="flex items-center gap-2">
          {!isOwner && (
            <Badge variant="secondary" className="gap-1">
              <UsersIcon className="size-3" />
              {workflow.role === "EDITOR" ? "Editor" : "Viewer"}
            </Badge>
          )}
          {isOwner && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareOpen(true)}
              >
                <Share2Icon className="size-4" />
                Share
              </Button>
              <ShareWorkflowDialog
                workflowId={workflowId}
                open={shareOpen}
                onOpenChange={setShareOpen}
              />
            </>
          )}
          {canEdit && <EditorSaveButton workflowId={workflowId} />}
        </div>
      </div>
    </header>
  );
};

export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const canEdit = workflow.role === "OWNER" || workflow.role === "EDITOR";
  const updateName = useUpdateWorkflowName();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow.name);
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (workflow.name) {
      setName(workflow.name);
    }
  }, [workflow.name]);
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  const handleSave = async () => {
    if (name === workflow.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateName.mutateAsync({ id: workflowId, name });
    } catch (error) {
      setName(workflow.name);
    } finally {
      setIsEditing(false);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setName(workflow.name);
      setIsEditing(false);
    }
  };
  if (isEditing) {
    return (
      <Input
        disabled={updateName.isPending}
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 w-auto min-w-[100px] px-2"
      />
    );
  }
  return (
    <BreadcrumbItem
      onClick={() => canEdit && setIsEditing(true)}
      className={
        canEdit ? "cursor-pointer hover:text-foreground transition-colors" : ""
      }
    >
      {workflow.name}
    </BreadcrumbItem>
  );
};
