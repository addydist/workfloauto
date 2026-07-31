"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { authClient } from "@/lib/auth-client";

/** Auth controls for the landing nav: login/signup when logged out, dashboard + logout when logged in. */
export function LandingActions({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
        },
        onError: () => {
          toast.error("Could not sign out. Try again.");
          setSigningOut(false);
        },
      },
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <ModeToggle />
      {loggedIn ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "Logging out…" : "Log out"}
          </Button>
          <Button asChild size="sm">
            <Link href="/workflows">Dashboard</Link>
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Sign up</Link>
          </Button>
        </>
      )}
    </div>
  );
}
