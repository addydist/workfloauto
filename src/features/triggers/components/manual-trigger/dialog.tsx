"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";

  interface ManualTriggerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };

  export const ManualTriggerDialog = ({ open, onOpenChange }: ManualTriggerDialogProps) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Trigger</DialogTitle>
            <DialogDescription>
              This is a manual trigger. You can trigger the workflow manually from here.
            </DialogDescription>
          </DialogHeader>
          {/* Add settings form or content here */}
          <div className="py-4">
            <p className="text-sx  text-muted-foreground">Manual Trigger</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }