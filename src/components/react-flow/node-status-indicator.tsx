import { type ReactNode } from "react";
import { Check, LoaderCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type NodeStatus = "loading" | "success" | "error" | "initial";

export type NodeStatusVariant = "overlay" | "border";

export type NodeStatusIndicatorProps = {
  status?: NodeStatus;
  variant?: NodeStatusVariant;
  children: ReactNode;
  className?: string;
};

export const SpinnerLoadingIndicator = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <div className="relative">
      <StatusBorder className="border-blue-700/40">{children}</StatusBorder>

      <div className="bg-background/50 absolute inset-0 z-50 rounded-[9px] backdrop-blur-xs" />
      <div className="absolute inset-0 z-50">
        <span className="absolute top-[calc(50%-1.25rem)] left-[calc(50%-1.25rem)] inline-block h-10 w-10 animate-ping rounded-full bg-blue-700/20" />

        <LoaderCircle className="absolute top-[calc(50%-0.75rem)] left-[calc(50%-0.75rem)] size-6 animate-spin text-blue-700" />
      </div>
    </div>
  );
};

export const BorderLoadingIndicator = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className="relative">
      <div className={cn("absolute -top-px -left-px h-[calc(100%+2px)] w-[calc(100%+2px)] overflow-hidden", className)}>
        <style>
          {`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .spinner {
          animation: spin 2s linear infinite;
          position: absolute;
          left: 61%;
          top: 76%;
          width: 140%;
          aspect-ratio: 1;
          transform-origin: center;
        }
      `}
        </style>
        <div className="absolute inset-0">
          <div className="spinner rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgb(42,67,233)_0deg,rgba(42,138,246,0)_360deg)]" />
        </div>
      </div>
      {children}
    </div>
  );
};

const StatusBorder = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute -top-px -left-px h-[calc(100%+2px)] w-[calc(100%+2px)] border-2",
          className,
        )}
      />
      {children}
    </>
  );
};

export const NodeStatusIndicator = ({
  status,
  variant = "border",
  children,
  className,
}: NodeStatusIndicatorProps) => {
  if (!status || status === "initial") return <>{children}</>;

  return (
    <div className="relative">
      {status === "loading" ? (
        variant === "overlay" ? (
          <SpinnerLoadingIndicator>{children}</SpinnerLoadingIndicator>
        ) : (
          <BorderLoadingIndicator className={className}>
            {children}
          </BorderLoadingIndicator>
        )
      ) : status === "success" ? (
        <>
          <StatusBorder className={cn("border-emerald-500/50", className)}>
            {children}
          </StatusBorder>
          <div className="absolute -right-2 -bottom-2 z-50 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-emerald-500 text-white shadow-sm">
            <Check className="size-3 stroke-[3]" />
          </div>
        </>
      ) : status === "error" ? (
        <>
          <StatusBorder className={cn("border-red-500/50", className)}>
            {children}
          </StatusBorder>
          <div className="absolute -right-2 -bottom-2 z-50 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-red-500 text-white shadow-sm">
            <X className="size-3 stroke-[3]" />
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
};
