"use client";

import { type Edge, type Node, useReactFlow } from "@xyflow/react";
import { Loader2Icon, SparklesIcon, WandSparklesIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { generateWorkflow } from "../ai/generate-workflow";
import type { GenerateResult } from "../ai/types";

const EXAMPLES = [
  "Ask Gemini for a motivational quote and send it to Discord",
  "Call an API, and if the response status is over 400, alert Slack",
  "Ask AI how many states India has; if it's more than 20, post to Slack",
];

export const AiWorkflowGenerator = () => {
  const { getNodes, setNodes, setEdges, fitView } = useReactFlow();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const reset = () => {
    setPrompt("");
    setResult(null);
    setLoading(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await generateWorkflow(prompt);
      setResult(res);
      if (!res.ok) toast.error(res.error);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (!result || !result.ok) return;
    const existing = getNodes();
    const meaningful = existing.filter((n) => n.type !== "INITIAL");

    if (meaningful.length === 0) {
      setNodes(result.nodes as Node[]);
      setEdges(result.edges as Edge[]);
    } else {
      const maxY = Math.max(0, ...existing.map((n) => n.position?.y ?? 0));
      const offsetY = maxY + 240;
      setNodes((nds) => [
        ...nds,
        ...result.nodes.map((n) => ({
          ...n,
          position: { x: n.position.x, y: n.position.y + offsetY },
        })),
      ] as Node[]);
      setEdges((eds) => [...eds, ...(result.edges as Edge[])]);
    }

    toast.success("Workflow added. Fill in credentials / webhook URLs, then Save.");
    setOpen(false);
    reset();
    setTimeout(() => fitView({ duration: 400 }), 50);
  };

  return (
    <>
      <Button
        variant="outline"
        className="gap-2 bg-background"
        onClick={() => setOpen(true)}
      >
        <SparklesIcon className="size-4 text-primary" />
        Generate with AI
      </Button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <WandSparklesIcon className="size-5 text-primary" />
              Generate workflow
            </DialogTitle>
            <DialogDescription>
              Describe what you want to automate. Nodeflo will build the nodes and
              wire them together — you just fill in credentials.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. When triggered, ask AI to summarize a URL and post the result to Slack"
            className="min-h-[110px]"
            disabled={loading}
          />

          {!result?.ok && (
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  disabled={loading}
                  className="rounded-full border bg-muted/50 px-3 py-1 text-left text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          {/* Preview */}
          {result?.ok && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-display text-sm font-semibold">{result.title}</p>
              <ol className="mt-3 space-y-1.5">
                {result.summary.map((step, i) => (
                  <li
                    key={`${step}-${i}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-muted-foreground/80">
                {result.nodes.length} nodes · {result.edges.length} connections.
                Credentials and webhook URLs are left blank for you to fill in.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {result?.ok ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : null}
                  Regenerate
                </Button>
                <Button onClick={handleInsert}>Insert into canvas</Button>
              </>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={loading || prompt.trim().length < 3}
              >
                {loading ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <SparklesIcon className="size-4" />
                    Generate
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
