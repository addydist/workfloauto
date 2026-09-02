"use client";
import { ExecutionStatus } from "@/generated/prisma";
import { useState } from "react";
import {
  CheckCircle2Icon,
  Clock1Icon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSuspenseExecution } from "../hooks/use-executions";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-chart-4" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 animate-spin text-chart-3" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-chart-1" />;
    default:
      return <Clock1Icon className="size-5 text-muted-foreground" />;
  }
};
const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLocaleLowerCase();
};

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);
  const [showStackTrace, setShowStackTrace] = useState(false);

  const duration = execution.completedAt
    ? Math.round(
        (new Date(execution.completedAt).getTime() -
          new Date(execution.startedAt).getTime()) /
          1000,
      )
    : null;

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(execution.status)}
          <CardTitle>{formatStatus(execution.status)}</CardTitle>
        </div>
        <div>
          <CardDescription>
            Execution for {execution.workflow.name}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            {" "}
            <p className="text-sm font-medium text-muted-foreground">
              Workflow
            </p>
            <Link
              prefetch
              className="text-sm hover:underline text-primary"
              href={`/workflows/${execution.workflowId}`}
            >
              {execution.workflow.name}
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground"> Status</p>
            <p className="text-sm"> {formatStatus(execution.status)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground"> Status</p>
            <p className="text-sm">
              {" "}
              {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
            </p>
          </div>
          {execution.completedAt ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {" "}
                Completed
              </p>
              <p className="text-sm">
                {" "}
                {formatDistanceToNow(execution.completedAt, {
                  addSuffix: true,
                })}
              </p>
            </div>
          ) : null}
          {duration !== null ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {" "}
                Duration
              </p>
              <p className="text-sm"> {duration}s</p>
            </div>
          ) : null}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {" "}
              Event Id
            </p>
            <p className="text-sm">{execution.inngestEventId}</p>
          </div>
        </div>
        {execution.error ? (
          <div className="mt-6 space-y-3 border-2 border-chart-1 bg-chart-1/10 p-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide">Error</p>
              <p className="font-mono text-sm">
                {execution.error}
              </p>
            </div>
            
          </div>
        ) : null}
        {execution.errorStack && (
              <Collapsible
                open={showStackTrace}
                onOpenChange={setShowStackTrace}
              >
                <CollapsibleTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-chart-1 hover:bg-chart-1/10"
                  >
                    {showStackTrace ? "Hide Stack trace" : "Show stack trace"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="mt-2 overflow-auto border-2 bg-muted p-2 font-mono text-xs">
                    {execution.errorStack}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
            {execution.output && (
                <div className="mt-6 p-4 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-2">Output</p>
                    <pre className="text-xs font-mono overflow-auto"> 
                        {JSON.stringify(execution.output,null,2)}
                    </pre>
                </div>
            )}
      </CardContent>
    </Card>
  );
};
