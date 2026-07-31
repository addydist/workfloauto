import Image from "next/image";
import Link from "next/link";
import { BrandPanel } from "@/components/brand/brand-panel";
import { ModeToggle } from "@/components/mode-toggle";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left: brand panel (desktop only) */}
      <BrandPanel />

      {/* Right: form */}
      <div className="relative flex flex-col justify-center px-6 py-10 md:px-10">
        <div className="absolute right-4 top-4">
          <ModeToggle />
        </div>
        <div className="mx-auto w-full max-w-sm">
          {/* Compact wordmark — visible when the brand panel is hidden */}
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2 font-display text-base font-semibold lg:hidden"
          >
            <Image src="/logos/logo.svg" alt="Nodeflo" width={26} height={26} />
            Nodeflo
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
