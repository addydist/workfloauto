import { LoginForm } from "@/features/auth/component/login-form";
import { requireUnAuth } from "@/lib/auth-utils";

// Only allow relative in-app paths as the post-login redirect (no open redirects).
const safeCallback = (value?: string) =>
  value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/workflows";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string }>;
}) => {
  await requireUnAuth();
  const { callbackURL } = await searchParams;
  return <LoginForm callbackURL={safeCallback(callbackURL)} />;
};
export default Page;
