"use client";

import { Link2Icon, Loader2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateInviteLink,
  useInviteMember,
  useRemoveInvite,
  useRemoveMember,
  useRevokeInviteLinks,
  useUpdateMemberRole,
  useWorkflowMembers,
} from "../hooks/use-workflow";

type ShareRole = "EDITOR" | "VIEWER";

interface ShareWorkflowDialogProps {
  workflowId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareWorkflowDialog = ({
  workflowId,
  open,
  onOpenChange,
}: ShareWorkflowDialogProps) => {
  const { data, isLoading } = useWorkflowMembers(workflowId, open);
  const invite = useInviteMember(workflowId);
  const removeMember = useRemoveMember(workflowId);
  const removeInvite = useRemoveInvite(workflowId);
  const updateRole = useUpdateMemberRole(workflowId);
  const createLink = useCreateInviteLink();
  const revokeLinks = useRevokeInviteLinks();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ShareRole>("VIEWER");
  const [linkRole, setLinkRole] = useState<ShareRole>("VIEWER");

  const handleInvite = () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    invite.mutate(
      { workflowId, email: trimmed, role },
      { onSuccess: () => setEmail("") },
    );
  };

  const handleCopyLink = async () => {
    try {
      const res = await createLink.mutateAsync({ workflowId, role: linkRole });
      const url = `${window.location.origin}/invite/${res.token}`;
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied to clipboard");
    } catch {
      // errors surface via the mutation's onError toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Share workflow</DialogTitle>
          <DialogDescription>
            Invite people by email. Editors can build & run it; viewers can only
            look. Only you can delete or manage sharing.
          </DialogDescription>
        </DialogHeader>

        {/* Invite row */}
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="teammate@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInvite();
            }}
          />
          <Select value={role} onValueChange={(v) => setRole(v as ShareRole)}>
            <SelectTrigger className="w-[104px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIEWER">Viewer</SelectItem>
              <SelectItem value="EDITOR">Editor</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleInvite}
            disabled={invite.isPending || !email.trim()}
          >
            {invite.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Invite"
            )}
          </Button>
        </div>

        {/* Invite link */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Or share an invite link
          </p>
          <div className="flex gap-2">
            <Select
              value={linkRole}
              onValueChange={(v) => setLinkRole(v as ShareRole)}
            >
              <SelectTrigger className="w-[104px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">Viewer</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyLink}
              disabled={createLink.isPending}
            >
              {createLink.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <>
                  <Link2Icon className="size-4" />
                  Copy {linkRole === "EDITOR" ? "editor" : "viewer"} link
                </>
              )}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => revokeLinks.mutate({ workflowId })}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Reset all invite links
          </button>
        </div>

        {/* People with access */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            People with access
          </p>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1.5">
              {data?.owner && (
                <PersonRow
                  title={data.owner.name || data.owner.email}
                  subtitle={data.owner.email}
                  trailing={
                    <span className="text-xs text-muted-foreground">Owner</span>
                  }
                />
              )}

              {data?.members.map((m) => (
                <PersonRow
                  key={m.userId}
                  title={m.name || m.email}
                  subtitle={m.email}
                  trailing={
                    <div className="flex items-center gap-1">
                      <RoleSelect
                        value={m.role as ShareRole}
                        disabled={updateRole.isPending}
                        onChange={(r) =>
                          updateRole.mutate({
                            workflowId,
                            userId: m.userId,
                            role: r,
                          })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          removeMember.mutate({ workflowId, userId: m.userId })
                        }
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  }
                />
              ))}

              {data?.invites.map((inv) => (
                <PersonRow
                  key={inv.email}
                  title={inv.email}
                  subtitle="Pending invite"
                  trailing={
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {inv.role === "EDITOR" ? "Editor" : "Viewer"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          removeInvite.mutate({ workflowId, email: inv.email })
                        }
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  }
                />
              ))}

              {data &&
                data.members.length === 0 &&
                data.invites.length === 0 && (
                  <p className="py-1 text-xs text-muted-foreground/70">
                    No one else yet — invite a teammate above.
                  </p>
                )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PersonRow = ({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
    <div className="min-w-0">
      <p className="truncate text-sm font-medium">{title}</p>
      {subtitle && (
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
    {trailing}
  </div>
);

const RoleSelect = ({
  value,
  onChange,
  disabled,
}: {
  value: ShareRole;
  onChange: (role: ShareRole) => void;
  disabled?: boolean;
}) => (
  <Select
    value={value}
    onValueChange={(v) => onChange(v as ShareRole)}
    disabled={disabled}
  >
    <SelectTrigger className="h-8 w-[100px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="VIEWER">Viewer</SelectItem>
      <SelectItem value="EDITOR">Editor</SelectItem>
    </SelectContent>
  </Select>
);
