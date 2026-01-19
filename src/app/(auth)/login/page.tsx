import { LoginForm } from "@/features/auth/component/login-form";
import { requireUnAuth } from "@/lib/auth-utils";

const Page = async() => {
  await requireUnAuth();
  return <div><LoginForm/></div>;
}
export default Page;