import { cn } from "@/lib/utils";

/**
 * Decorative, non-interactive miniature of a Nodeflo workflow:
 *   Trigger → AI → Condition ─┬─ True  → HTTP
 *                             └─ False → Slack
 * Pure SVG on a fixed viewBox so it scales crisply. Everything — fills,
 * strokes, text and the per-node accents — is driven by theme tokens, so it
 * repaints with the palette instead of carrying its own hex codes.
 */
export const FlowGraphic = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 560 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A visual workflow: a trigger runs an AI step, then a condition branches to two actions."
      className={cn("h-auto w-full", className)}
    >
      {/* Neutral connectors */}
      <g
        className="stroke-foreground"
        strokeWidth="3"
        fill="none"
        strokeLinecap="square"
      >
        <path d="M150 88 C 178 88, 182 88, 205 88" />
        <path d="M315 88 C 342 88, 346 88, 368 88" />
      </g>
      {/* Branch connectors keep their accent colors */}
      <g strokeWidth="3" fill="none" strokeLinecap="square">
        <path d="M478 76 C 512 76, 512 128, 500 150" className="brand-dash" stroke="var(--chart-4)" />
        <path d="M478 104 C 512 104, 512 214, 470 238" className="brand-dash" stroke="var(--chart-1)" />
      </g>

      <Node x={40} y={64} label="Trigger" accent="var(--chart-2)" />
      <Node x={205} y={64} label="Gemini" accent="var(--chart-3)" />
      <Node x={368} y={64} label="Condition" accent="var(--chart-5)" branch />
      <Node x={452} y={126} label="HTTP" accent="var(--chart-4)" small />
      <Node x={400} y={214} label="Slack" accent="var(--chart-1)" small />
    </svg>
  );
};

const Node = ({
  x,
  y,
  label,
  accent,
  small,
  branch,
}: {
  x: number;
  y: number;
  label: string;
  accent: string;
  small?: boolean;
  branch?: boolean;
}) => {
  const w = small ? 92 : 110;
  const h = small ? 40 : 48;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={w}
        height={h}
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <rect x={11} y={h / 2 - 7} width={14} height={14} fill={accent} />
      <text
        x={34}
        y={h / 2 + 4}
        className="fill-foreground"
        fontSize="12"
        fontFamily="var(--font-display), sans-serif"
        fontWeight="700"
      >
        {label}
      </text>
      {branch && (
        <>
          <rect x={w - 5} y={h / 2 - 17} width={10} height={10} fill="var(--chart-4)" />
          <rect x={w - 5} y={h / 2 + 7} width={10} height={10} fill="var(--chart-1)" />
        </>
      )}
    </g>
  );
};
