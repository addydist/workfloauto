import { RegisterForm } from "@/features/auth/component/register-form";
import { requireUnAuth } from "@/lib/auth-utils";

const Page = async() => {
  await requireUnAuth();
  return <RegisterForm/>;
}
export default Page;