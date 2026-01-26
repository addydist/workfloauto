import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
    params: {
      workflowId: string;
    };
  }
  const Page = async ({ params }: PageProps) => {
    const { workflowId } = await params;
    await requireAuth();
    return (
      <div>
        <h1>{workflowId}</h1>
      </div>
    );
  };
  
  export default Page;
  