import { LoginForm } from "@/features/auth/component/login-form";
import { requireUnAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireUnAuth();
  return <LoginForm />;
};
export default Page;
