"use client";

import { CredentialType } from "@/generated/prisma";
import { useParams, useRouter } from "next/navigation";
import {
  useCreateCredentials,
  useUpdateCredential,
  useSuspenseCredential,
} from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(CredentialType),
  value: z.string().min(1, "API KEY is required"),
});
type FormValues = z.infer<typeof formSchema>;
const createCredentialTypeOptions = [
  { value: CredentialType.OPENAI, label: "OpenAI", logo: "/logos/openai.svg" },
  { value: CredentialType.GEMINI, label: "Gemini", logo: "/logos/gemini.svg" },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/logos/anthropic.svg",
  },
];

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const createCredential = useCreateCredentials();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();
  const isEdit = !!initialData?.id;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      type: CredentialType.OPENAI,
      value: "",
    },
  });
  const submit = async (values: FormValues) => {
    if (isEdit && initialData?.id) {
      await updateCredential.mutateAsync({
        id: initialData.id,
        ...values,
      });
    } else {
      await createCredential.mutateAsync(values, {
        onSuccess:(data)=>{
            router.push(`/credentials/${data.id}`)
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  };
  return (
    <>
      {modal}
      <Card className="w-full max-w-lg border border-border bg-card shadow-sm">
  <CardHeader className="space-y-2">
    <CardTitle className="text-xl font-semibold">
      {isEdit ? "Edit Credentials" : "Create Credential"}
    </CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      {isEdit
        ? "Update your API key or credentials details"
        : "Add a new API key or credentials to your account"}
    </CardDescription>
  </CardHeader>

  <CardContent>
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="space-y-6"
      >
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="My API Key"
                  className="h-10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type Field */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {createCredentialTypeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={option.logo}
                          alt={option.label}
                          width={18}
                          height={18}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* API Key Field */}
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="sk-***************"
                  className="h-10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/credentials")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              createCredential.isPending ||
              updateCredential.isPending
            }
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  </CardContent>
</Card>
    </>
  );
};

export const CredentialView=({
  credentialId
}:{credentialId:string})=>{
  const { data:credential}=useSuspenseCredential(credentialId);
  return <CredentialForm initialData={credential}/>
}
