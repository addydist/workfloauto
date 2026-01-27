"use client";
import { useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/use-workflow";
import {
  EmptyView,
  EntityContaniner,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowParams } from "../hooks/use-workflow-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import Error from "next/error";
import { Workflow } from "@/generated/prisma";
import { WorkflowIcon } from "lucide-react";
import {formatDistanceToNow} from "date-fns"

export const WorkFlowSearch = () => {
  const [params, setParams] = useWorkflowParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search workflows..."
    />
  );
};
export const WorkflowsLoading = () => {
  return <LoadingView entity="workflows" message="Loading workflows" />;
};

export const WorkflowsError = () => {
  return <ErrorView message="Error loading workflows" />;
};
export const WorkflowsEmpty = () => {
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();
  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: (error) => {
        handleError(error);
      },
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
    });
  };
  return (
    <>
      {modal}
      <EmptyView
        onNew={handleCreate}
        message="You haven't created any workflows yet.Get started by creating your first workflow"
      />
    </>
  );
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();
  // if(workflows?.data?.items?.length===0){
  //   return <WorkflowsEmpty />;
  // }
  return (
    <EntityList
      items={workflows?.data?.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      emptyView={<WorkflowsEmpty />}
    />
  );
};

export const WorkflowsPagination = () => {
  const workflows = useSuspenseWorkflows();
  console.log("workflows", workflows);
  const [params, setParams] = useWorkflowParams();
  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows?.data?.totalPages}
      page={workflows?.data?.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorkflow = useCreateWorkflow();
  const router = useRouter();
  const { handleError, modal } = useUpgradeModal();
  const handlecreateWorkflow = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };
  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage workflows"
        onNew={handlecreateWorkflow}
        newButtonLabel="New Workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContaniner
      header={<WorkflowsHeader />}
      search={<WorkFlowSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContaniner>
  );
};

export const WorkflowItem = ({ data }: { data: Workflow }) => {
  const removeWorkflow=useRemoveWorkflow();
  const handleRemove=()=>{
    removeWorkflow.mutate({id:data.id});
  }
  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={<>Updated {formatDistanceToNow(data.updatedAt,{addSuffix:true})} &bull; Created {formatDistanceToNow(data.createdAt,{addSuffix:true})} </>}
      image={
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeWorkflow.isPending}
    />
  );
};
