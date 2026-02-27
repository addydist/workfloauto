import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCredentialParams } from "./use-credential-params";
import { CredentialType } from "@/generated/prisma";

export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params]=useCredentialParams();
  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};
export const useCreateCredentials = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credentials ${data.name} created`);
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({})
        );
      },
      onError: (error) => {
        toast.error(`Error creating credential: ${error.message}`);
      }
    })
  );
};
export const useRemoveCredentials = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential ${data.name} deleted`);
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.credentials.getOne.queryFilter({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Error deleting credential: ${error.message}`);
      }
    })
  );
}


export const useSuspenseCredential=(id:string)=>{
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({id}));
}


export const useUpdateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential ${data.name} saved`);
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.credentials.getOne.queryOptions({id: data.id})
        );
      },
      onError: (error) => {
        toast.error(`Error saving credential: ${error.message}`);
      }
    })
  );
};
export const useCredentialsByType=(type:CredentialType)=>{
  const trpc=useTRPC();
  return useQuery(trpc.credentials.getByType.queryOptions({type}));
}
// export const useExecuteWorkflow = () => {
//   const trpc = useTRPC();
//   const queryClient = useQueryClient();

//   return useMutation(
//     trpc.workflows.execute.mutationOptions({
//       onSuccess: (data) => {
//         toast.success(`Workflow ${data.name} saved`);
//         queryClient.invalidateQueries(
//           trpc.workflows.getMany.queryOptions({})
//         );
//         queryClient.invalidateQueries(
//           trpc.workflows.getOne.queryOptions({id: data.id})
//         );
//       },
//       onError: (error) => {
//         toast.error(`Error executing credential: ${error.message}`);
//       }
//     })
//   );
// };