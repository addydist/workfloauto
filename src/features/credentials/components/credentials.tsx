"use client";
import {
  useRemoveCredentials,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import {
  EmptyView,
  EntityContaniner,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { useRouter } from "next/navigation";
import { useCredentialParams } from "../hooks/use-credential-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { Credential, CredentialType } from "@/generated/prisma";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
const credentialLogo: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: "/logos/openai.svg",
  [CredentialType.GEMINI]: "/logos/gemini.svg",
  [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",
};

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Credentials..."
    />
  );
};
export const CredentialsLoading = () => {
  return <LoadingView entity="workflows" message="Loading Credential" />;
};

export const CredentialsError = () => {
  return <ErrorView message="Error loading Credentials" />;
};
export const CredentialsEmpty = () => {
  const router = useRouter();
  const handleCreate = () => {
    router.push(`/credentials/new`);
  };
  return (
    <>
      <EmptyView
        onNew={handleCreate}
        message="You haven't created any credentials yet.Get started by creating your first credential"
      />
    </>
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();
  // if(workflows?.data?.items?.length===0){
  //   return <WorkflowsEmpty />;
  // }
  return (
    <EntityList
      items={credentials?.data?.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialsItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  console.log("workflows", credentials);
  const [params, setParams] = useCredentialParams();
  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials?.data?.totalPages}
      page={credentials?.data?.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <>
      <EntityHeader
        title="Credentials"
        description="Create and manage credentials"
        newButtonHref="/credentials/new"
        newButtonLabel="New Credential"
        disabled={disabled}
      />
    </>
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContaniner
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContaniner>
  );
};

export const CredentialsItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredentials();
  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  };
  const logo=credentialLogo[data.type] || "/logos.openai.svg";
  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}{" "}
        </>
      }
      image={
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
          <Image src={logo} alt={data.type} width={20} height={20}/>
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};
