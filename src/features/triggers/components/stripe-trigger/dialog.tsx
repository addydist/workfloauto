"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
// import { generateGoogleFormScript } from "./utils";

interface GoogleTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({
  open,
  onOpenChange,
}: GoogleTriggerDialogProps) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const webHookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;
  const copytoClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webHookUrl);
      toast("Webhook URL copied to clipboard!");
    } catch (err) {
      toast("Failed to copy webhook URL.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Stripe integration to trigger the
            workflow on payment events.
          </DialogDescription>
        </DialogHeader>
        {/* Add settings form or content here */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="text-sm font-medium">
              Webhook URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webHookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copytoClipboard}
              >
                <CopyIcon />
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="text-sm font-medium">Instructions:</h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside">
              <li>Open the stripe dashboard</li>
              <li>
                Go to Developers &gt; Webhooks and click on "Add endpoint"
              </li>
              <li>Paste the copied webhook URL</li>
              <li>
                Select events to listen for (e.g ., payment_intent.succeded)
              </li>
              <li>Save and copy the signing secret for secure verification</li>
            </ol>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="text-sm font-medium">Available Variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {" "}
                  {"{{stripe.amount}}"}
                </code>
                -Payment amount
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {" "}
                  {"{{stripe.currency}}"}
                </code>
                -Currency code 
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
