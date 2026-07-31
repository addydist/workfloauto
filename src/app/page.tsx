import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowRightIcon,
  GitBranchIcon,
  PlayIcon,
  SparklesIcon,
  WorkflowIcon,
  ZapIcon,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { FlowGraphic } from "@/components/brand/flow-graphic";
import { Grain } from "@/components/brand/grain";
import { LandingActions } from "@/components/landing-actions";

const YOUTUBE_DEMO = "https://www.youtube.com/watch?v=o4csOLXTzwk";

const integrations = [
  { src: "/logos/openai.svg", alt: "OpenAI" },
  { src: "/logos/anthropic.svg", alt: "Anthropic" },
  { src: "/logos/gemini.svg", alt: "Gemini" },
  { src: "/logos/slack.svg", alt: "Slack" },
  { src: "/logos/discord.svg", alt: "Discord" },
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/google.svg", alt: "Google" },
  { src: "/logos/googleform.svg", alt: "Google Forms" },
];

const features = [
  {
    icon: WorkflowIcon,
    title: "Visual editor",
    body: "Drag, drop, and connect nodes on an infinite canvas. No code required.",
  },
  {
    icon: SparklesIcon,
    title: "AI built in",
    body: "Call Gemini, OpenAI, or Anthropic as a step and chain results between nodes.",
  },
  {
    icon: GitBranchIcon,
    title: "Branching logic",
    body: "Route flows with condition nodes — true / false paths, evaluated at runtime.",
  },
  {
    icon: ZapIcon,
    title: "Durable runs",
    body: "Every step runs on Inngest with retries, live status, and full run history.",
  },
];

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const loggedIn = !!session;
  const primaryHref = loggedIn ? "/workflows" : "/signup";
  const primaryLabel = loggedIn ? "Go to dashboard" : "Get started — it's free";

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div className="brand-mesh pointer-events-none absolute inset-0" />
      <Grain />

      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col px-6">
        {/* Nav */}
        <header className="flex items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logos/logo.svg" alt="Nodeflo" width={28} height={28} />
            <span className="font-display text-lg font-semibold">Nodeflo</span>
          </Link>
          <LandingActions loggedIn={loggedIn} />
        </header>

        {/* Hero */}
        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Visual workflow automation
            </span>
            <h1 className="font-display mt-5 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Automate anything.{" "}
              <span className="bg-gradient-to-r from-[#FF7A00] to-[#FFBC7D] bg-clip-text text-transparent">
                Visually.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Nodeflo is a drag-and-drop automation platform. Wire triggers, AI,
              HTTP calls, and messaging apps into workflows — with branching
              logic and live execution — no code needed.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={YOUTUBE_DEMO} target="_blank" rel="noopener noreferrer">
                  <PlayIcon className="size-4" />
                  Watch demo
                </a>
              </Button>
            </div>
          </div>

          {/* Product visual */}
          <div className="brand-float rounded-2xl border bg-card/60 p-6 shadow-xl backdrop-blur-sm sm:p-8">
            <FlowGraphic />
          </div>
        </section>

        {/* Integrations */}
        <section className="border-t py-10">
          <p className="text-center text-xs uppercase tracking-wider text-muted-foreground/70">
            Connect the tools you already use
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {integrations.map((logo) => (
              <Image
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                width={26}
                height={26}
                className="opacity-50 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border bg-card p-6 transition hover:border-primary/40"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display mt-4 text-lg font-semibold">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section className="pb-16">
          <div className="relative overflow-hidden rounded-3xl border bg-card px-8 py-14 text-center">
            <div className="brand-mesh pointer-events-none absolute inset-0" />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to automate?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Build your first workflow in minutes. No credit card required.
              </p>
              <Button asChild size="lg" className="mt-7">
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-4 border-t py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logos/logo.svg" alt="Nodeflo" width={20} height={20} />
            <span className="font-display font-medium text-foreground/80">
              Nodeflo
            </span>
          </div>
          <p>
            Built by{" "}
            <a
              href="https://github.com/addydist"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 transition hover:text-primary"
            >
              addydist
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
