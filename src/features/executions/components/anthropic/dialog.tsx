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
export const AVAILABLE_MODELS=[
  "gemini-2.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-pro-100k",
  "gemini-1.5-pro-xlarge",
  "gemini-2.0-pro",
  "gemini-2.0-pro-100k",
  "gemini-pro"
] as const;
const formSchema = z.object({
  variableName: z.string()
  .min(1,{message:"Variable name is required"})
  .regex(/^[A-Za-z_][A-Za-z0-9_$]*$/, { message: "Invalid variable name. It should start with letter or underscore" }),
  model: z.string().min(1,{message:"Model is required"}),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1,{message:"User prompt is required"})
});
export type AnthropicFormValues = z.infer<typeof formSchema>;
interface AnthropicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
 defaultValues: Partial<AnthropicFormValues>;
}

export const AnthropicDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues={}
}:  AnthropicDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      model: defaultValues.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    },
  });
  useEffect(() => {
    form.reset({
      variableName: defaultValues.variableName || "",
      model: defaultValues.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    });
  }, [open,defaultValues, form]);
  
  const watchMethod = form.watch("variableName") || "myAnthropic";
 
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit?.(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContent>
        <DialogHeader>
          <DialogTitle> Anthropic Configuration</DialogTitle>
          <DialogDescription>
            Configure the  Anthropic node to generate content, answer questions.
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
                    <Input placeholder="myAnthropic" {...field} />
                  </FormControl>
                  <FormDescription> Use this name to reference the result in othre:nodes:{" "} {`{{${watchMethod}.text}}`}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          
          {/* <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                       <FormDescription>
                        Choose the Gemini model to use for this node. Different models may have different capabilities and costs.
                       </FormDescription>
                  </Select>
                </FormItem>
              )}
            /> */}


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
                     The prompt to send to Anthropic. You can use {"{{variables}}"} to reference the output of this node in later nodes.
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