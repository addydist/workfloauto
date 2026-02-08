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

const formSchema = z.object({
  endpoint: z.string().url({ message: "Invalid URL" }),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  body: z.string().optional(),
});
export type FormType = z.infer<typeof formSchema>;
interface ManualTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  defaultEndpoint?: string;
  defaultMethod?: "GET" | "POST" | "PUT" | "DELETE";
  defaultBody?: string;
}

export const HttpRequestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultEndpoint = "",
  defaultMethod = "GET",
  defaultBody = "",
}: ManualTriggerDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: defaultEndpoint,
      method: defaultMethod,
      body: defaultBody,
    },
  });
  useEffect(() => {
    form.reset({
      endpoint: defaultEndpoint,
      method: defaultMethod,
      body: defaultBody,
    });
  }, [open,defaultEndpoint, defaultMethod, defaultBody, form]);
  const watchMethod = form.watch("method");
  const showBodyField = ["POST", "PUT", "PATCH"].includes(watchMethod);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit?.(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>HTTP Trigger</DialogTitle>
          <DialogDescription>
            This is an HTTP trigger. You can configure the HTTP request details
            from here.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.example.com/endpoint" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the complete URL for the HTTP request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTTP Method</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select HTTP Method" />
                      </SelectTrigger>
                      <SelectContent>
                        {["GET", "POST", "PUT", "DELETE"].map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Select the HTTP method for the request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showBodyField && (
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Body</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='{"key": "value"}' 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Static URL OR use {"{{variabbles}}"} to use dynamic values from previous nodes or {"{{json variables}}"} to stringify JSON objects from previous nodes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full">
              Send Request
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};