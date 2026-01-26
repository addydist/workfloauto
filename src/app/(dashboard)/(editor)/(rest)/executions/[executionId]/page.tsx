interface PageProps {
  params: {
    executionId: string;
  };
}
const Page = async ({ params }: PageProps) => {
  const { executionId } = await params;
  return (
    <div>
      <h1>{executionId}</h1>
    </div>
  );
};

export default Page;
