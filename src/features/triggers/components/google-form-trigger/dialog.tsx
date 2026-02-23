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
import { generateGoogleFormScript } from "./utils";

interface GoogleTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogelFormTriggerDialog = ({
  open,
  onOpenChange,
}: GoogleTriggerDialogProps) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const webHookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;
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
          <DialogTitle>Googel Form Trigger</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Google Form integration to trigger the
            workflow when a form is submitted.
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
              <li>Copy the webhook URL provided above.</li>
              <li>
                Go to your Google Form and navigate to the settings for form
                submission.
              </li>
              <li>
                Look for an option to add a webhook or integration (this may be
                under "Add-ons" or "Integrations").
              </li>
              <li>
                Paste the copied webhook URL into the appropriate field in the
                Google Form settings.
              </li>
              <li>Save your settings in Google Forms.</li>
              <li>
                Now, whenever a form is submitted, it will trigger the workflow
                associated with this webhook URL.
              </li>
            </ol>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h4 className="text-sm font-medium">Google Apps Script:</h4>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={async () => {
                const scriptContent = generateGoogleFormScript(webHookUrl);
                try {
                  await navigator.clipboard.writeText(scriptContent);
                  toast.success("Google Apps Script copied to clipboard!");
                } catch (err) {
                  toast.error("Failed to copy Google Apps Script.");
                }
              }}
            >
              <CopyIcon />
              Copy Google Apps Script
            </Button>
            <p className="text-xs text-muted-foreground">
              This script includes your webhook url and handles form submission
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="text-sm font-medium">Available Variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                {" "}
                <code className="bg-background px-1 py-0.5 rounded ">
                  {"{{googleForm.respondentEmail}}"}
                </code>
                -Respondent's email
              </li>
              <li>
                {" "}
                <code className="bg-background px-1 py-0.5 rounded ">
                  {"{{googleForm.responses['Question Name']}}"}
                </code>
                -Specific Answer
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
