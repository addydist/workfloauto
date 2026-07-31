import { cn } from "@/lib/utils";

/**
 * Decorative, non-interactive miniature of a Nodeflo workflow:
 *   Trigger → AI → Condition ─┬─ True  → HTTP
 *                             └─ False → Slack
 * Pure SVG on a fixed viewBox so it scales crisply. Theme-aware: node fills,
 * strokes and text follow the app tokens, while branch accents stay branded.
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
        className="stroke-foreground/20"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M150 88 C 178 88, 182 88, 205 88" />
        <path d="M315 88 C 342 88, 346 88, 368 88" />
      </g>
      {/* Branch connectors keep their accent colors */}
      <g strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M478 76 C 512 76, 512 128, 500 150" className="brand-dash" stroke="rgba(52,211,153,0.6)" />
        <path d="M478 104 C 512 104, 512 214, 470 238" className="brand-dash" stroke="rgba(248,113,113,0.55)" />
      </g>

      <Node x={40} y={64} label="Trigger" accent="#FF7A00" />
      <Node x={205} y={64} label="Gemini" accent="#FF9736" />
      <Node x={368} y={64} label="Condition" accent="#a78bfa" branch />
      <Node x={452} y={126} label="HTTP" accent="#34d399" small />
      <Node x={400} y={214} label="Slack" accent="#f87171" small />
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
        rx={12}
        className="fill-card stroke-border"
      />
      <circle cx={18} cy={h / 2} r={5} fill={accent} />
      <text
        x={34}
        y={h / 2 + 4}
        className="fill-foreground"
        fontSize="12"
        fontFamily="var(--font-display), sans-serif"
        fontWeight="600"
      >
        {label}
      </text>
      {branch && (
        <>
          <circle cx={w} cy={h / 2 - 12} r={4} fill="#34d399" />
          <circle cx={w} cy={h / 2 + 12} r={4} fill="#f87171" />
        </>
      )}
    </g>
  );
};
