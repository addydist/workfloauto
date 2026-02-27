"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel, 
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma";
export const AVAILABLE_MODELS=[
  "gemini-2.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-pro-100k",
  "gemini-1.5-pro-xlarge",
  "gemini-2.0-pro",
  "gemini-2.0-pro-100k",
  "gemini-pro"
] as const;

import Image from "next/image";
const formSchema = z.object({
  variableName: z.string()
  .min(1,{message:"Variable name is required"})
  .regex(/^[A-Za-z_][A-Za-z0-9_$]*$/, { message: "Invalid variable name. It should start with letter or underscore" }),
  // model: z.string().min(1,{message:"Model is required"}),
  credentialId:z.string().min(1,"CredentialID is require"),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1,{message:"User prompt is required"})
});
export type GeminiFormValues = z.infer<typeof formSchema>;
interface GeminiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
 defaultValues: Partial<GeminiFormValues>;
}

export const GeminiDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues={}
}: GeminiDialogProps) => {
  const {
    data:credentials,
    isLoading:isLoadingCred
  } =useCredentialsByType(CredentialType.GEMINI)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      credentialId:defaultValues.credentialId  || "",
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    },
  });
  useEffect(() => {
    form.reset({
      variableName: defaultValues.variableName || "",
      credentialId:defaultValues.credentialId  || "",
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    });
  }, [open,defaultValues, form]);
  
  const watchMethod = form.watch("variableName");
 
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit?.(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gemini</DialogTitle>
          <DialogDescription>
            Configure the Gemini node to generate content, answer questions, and more using Google Gemini AI.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
             <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="mygemini" {...field} />
                  </FormControl>
                  <FormDescription> Use this name to reference the result in othre:nodes:{" "} {`{{${watchMethod}.aiResponse}}`}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField
          control={form.control}
          name="credentialId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gemini Credential</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoadingCred || !credentials?.length}
              >
                <FormControl>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select a credential" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {credentials?.map((cred) => (
                    <SelectItem
                      key={cred.id}
                      value={cred.id}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src="/logos/gemini.svg"
                          alt="Gemini"
                          width={18}
                          height={18}
                        />
                        {cred.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
    


              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => ( 
                  <FormItem>
                    <FormLabel>System prompt(optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='Your are a helpful assistant that helps users to answer questions'
                        className="min-h-[80px] font-mono text-sm" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Sets the behavior of the AI, providing context and instructions to guide its responses. 
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System prompt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='Summarize the following article: {{jsonhttpResponse.data}}'
                        className="min-h-[120px] font-mono text-sm" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                     The prompt to send to Gemini. You can use {"{{variables}}"} to reference the output of this node in later nodes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <Button type="submit" className="w-full">
             Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};