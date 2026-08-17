import { RegisterForm } from "@/features/auth/component/register-form";
import { requireUnAuth } from "@/lib/auth-utils";

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
  return <RegisterForm callbackURL={safeCallback(callbackURL)} />;
};
export default Page;
