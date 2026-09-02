"use client";
import {
  EmptyView,
  EntityContaniner,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { Execution, ExecutionStatus } from "@/generated/prisma";
import { formatDistanceToNow } from "date-fns";
import {
  useSuspenseExecutions,
} from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import { CheckCircle2Icon, Clock1Icon, Loader2Icon, XCircleIcon } from "lucide-react";
const getStatusIcon=(status:ExecutionStatus)=>{
  switch(status){
    case ExecutionStatus.SUCCESS :
      return <CheckCircle2Icon className="size-5 text-chart-4"/>
    case ExecutionStatus.RUNNING:
        return <Loader2Icon className="size-5 animate-spin text-chart-3"/>
    case ExecutionStatus.FAILED:
        return <XCircleIcon className="size-5 text-chart-1"/>
    default:
        return <Clock1Icon className="size-5 text-muted-foreground"/>
  }

}
export const ExecutionsLoading = () => {
  return <LoadingView entity="executions" message="Loading Executions" />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error loading Executions" />;
};
export const ExecutionsEmpty = () => {
  return (
    <>
      <EmptyView message="You haven't created any executions yet.Get started by by running your first workflow" />
    </>
  );
};

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();
  return (
    <EntityList
      items={executions?.data?.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionsItem data={execution} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();
  return (
    <EntityPagination
      disabled={executions.isFetching}
      totalPages={executions?.data?.totalPages}
      page={executions?.data?.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <>
      <EntityHeader
        title="Executions"
        description="View your workflow execution history"
      />
    </>
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContaniner
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContaniner>
  );
};
const formatStatus =(status:ExecutionStatus)=>{
  return status.charAt(0) +status.slice(1).toLocaleLowerCase(); 
}
export const ExecutionsItem = ({
  data,
}: {
  data: Execution & {
    workflow: {
      id: string;
      name: string;
    };
  };
}) => {
  const duration = data.completedAt
    ? Math.round(
        (new Date(data.completedAt).getTime() -
          new Date(data.startedAt).getTime()) /
          1000,
      )
    : null;
  const subTitle = (
    <>
      {data.workflow?.name} &bull; Started{" "}
      {formatDistanceToNow(data.startedAt , { addSuffix: true })}{" "}
      {duration !== null && <>&bull; Took {duration}s</>}
    </>
  );
  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={formatStatus(data.status)}
      subtitle={subTitle}
      image={
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }
    />
  );
};
