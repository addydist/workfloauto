import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkflowParams } from "./use-workflow-params";

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowParams();
  return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));
};
export const useCreateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} created`);
        queryClient.invalidateQueries(
          trpc.workflows.getMany.queryOptions({})
        );
      },
      onError: (error) => {
        toast.error(`Error creating workflow: ${error.message}`);
      }
    })
  );
};
export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} deleted`);
        queryClient.invalidateQueries(
          trpc.workflows.getMany.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryFilter({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Error deleting workflow: ${error.message}`);
      }
    })
  );
}


export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflows.getOne.queryOptions({ id }));
}

export const useUpdateWorkflowName = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} updated`);
        queryClient.invalidateQueries(
          trpc.workflows.getMany.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Error updating workflow: ${error.message}`);
      }
    })
  );
};
export const useUpdateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow saved`);
        queryClient.invalidateQueries(
          trpc.workflows.getMany.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(error.message);
      }
    })
  );
};
export const useWorkflowMembers = (workflowId: string, enabled = true) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.workflows.members.queryOptions({ workflowId }, { enabled })
  );
};

export const useInviteMember = (workflowId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.workflows.invite.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          data.status === "added"
            ? "Member added"
            : "Invite sent — they'll get access when they sign up"
        );
        queryClient.invalidateQueries(
          trpc.workflows.members.queryOptions({ workflowId })
        );
      },
      onError: (error) => toast.error(error.message),
    })
  );
};

export const useRemoveMember = (workflowId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.workflows.removeMember.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.workflows.members.queryOptions({ workflowId })
        );
      },
      onError: (error) => toast.error(error.message),
    })
  );
};

export const useRemoveInvite = (workflowId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.workflows.removeInvite.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.workflows.members.queryOptions({ workflowId })
        );
      },
      onError: (error) => toast.error(error.message),
    })
  );
};

export const useUpdateMemberRole = (workflowId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.workflows.updateMemberRole.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.workflows.members.queryOptions({ workflowId })
        );
      },
      onError: (error) => toast.error(error.message),
    })
  );
};

export const useCreateInviteLink = () => {
  const trpc = useTRPC();
  return useMutation(
    trpc.workflows.createInviteLink.mutationOptions({
      onError: (error) => toast.error(error.message),
    })
  );
};

export const useRevokeInviteLinks = () => {
  const trpc = useTRPC();
  return useMutation(
    trpc.workflows.revokeInviteLinks.mutationOptions({
      onSuccess: () => toast.success("Invite links reset"),
      onError: (error) => toast.error(error.message),
    })
  );
};

export const useExecuteWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.execute.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow execution started`);
        queryClient.invalidateQueries(
          trpc.workflows.getMany.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(error.message);
      }
    })
  );
};