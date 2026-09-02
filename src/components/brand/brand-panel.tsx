import Image from "next/image";
import { FlowGraphic } from "./flow-graphic";
import { Grain } from "./grain";

const integrations = [
  { src: "/logos/openai.svg", alt: "OpenAI" },
  { src: "/logos/anthropic.svg", alt: "Anthropic" },
  { src: "/logos/gemini.svg", alt: "Gemini" },
  { src: "/logos/slack.svg", alt: "Slack" },
  { src: "/logos/discord.svg", alt: "Discord" },
  { src: "/logos/stripe.svg", alt: "Stripe" },
];

/** The branded visual half of the split-screen auth layout. Theme-aware. */
export const BrandPanel = () => {
  return (
    <div className="relative hidden overflow-hidden border-r-2 bg-secondary text-secondary-foreground lg:flex lg:flex-col lg:p-12">
      <div className="brand-mesh pointer-events-none absolute inset-0" />
      <Grain />

      {/* Wordmark */}
      <div className="relative flex items-center gap-2.5">
        <Image src="/logos/logo.svg" alt="Nodeflo" width={30} height={30} />
        <span className="font-display text-lg font-bold uppercase">Nodeflo</span>
      </div>

      {/* Statement + product visual */}
      <div className="relative mt-5 xl:mt-10">
        <div className="brand-float mb-10 border-2 bg-card p-6 shadow-lg">
          <FlowGraphic />
        </div>
        <h2 className="font-display max-w-md text-4xl font-bold uppercase leading-tight tracking-tight">
          Automate anything.{" "}
          <span className="bg-primary px-2 text-primary-foreground">
            Visually.
          </span>
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed">
          Drag nodes onto a canvas, wire them together, and let AI, HTTP calls,
          and messaging apps do the work — with branching logic and live runs.
        </p>
      </div>

      {/* Integrations */}
      <div className="relative flex items-center gap-5">
        <span className="text-xs font-bold uppercase tracking-wider">
          Connects    
        </span>
        <div className="flex items-center gap-3.5">
          {integrations.map((logo) => (
            <Image
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              width={20}
              height={20}
              className="opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
