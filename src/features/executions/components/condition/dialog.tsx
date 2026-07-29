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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  CONDITION_OPERATORS,
  isUnaryOperator,
  type ConditionOperator,
} from "./constants";

const operatorValues = CONDITION_OPERATORS.map((op) => op.value) as [
  ConditionOperator,
  ...ConditionOperator[],
];

const formSchema = z.object({
  leftValue: z.string().min(1, { message: "First value is required" }),
  operator: z.enum(operatorValues),
  rightValue: z.string().optional(),
});
export type ConditionFormValues = z.infer<typeof formSchema>;

interface ConditionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: ConditionFormValues) => void;
  defaultValues: Partial<ConditionFormValues>;
}

export const ConditionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: ConditionDialogProps) => {
  const form = useForm<ConditionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leftValue: defaultValues.leftValue || "",
      operator: defaultValues.operator || "equals",
      rightValue: defaultValues.rightValue || "",
    },
  });
  useEffect(() => {
    form.reset({
      leftValue: defaultValues.leftValue || "",
      operator: defaultValues.operator || "equals",
      rightValue: defaultValues.rightValue || "",
    });
  }, [open, defaultValues, form]);

  const watchOperator = form.watch("operator");
  const showRightValue = !isUnaryOperator(watchOperator);

  const handleSubmit = (values: ConditionFormValues) => {
    onSubmit?.(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Condition</DialogTitle>
          <DialogDescription>
            Compare two values and branch the workflow. Nodes on the{" "}
            <b>True</b> path run when the condition passes; the <b>False</b>{" "}
            path runs otherwise.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="leftValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First value</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="{{myapicall.httpResponse.status}}"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A static value or {"{{variable}}"} from a previous node.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operator</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showRightValue && (
              <FormField
                control={form.control}
                name="rightValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second value</FormLabel>
                    <FormControl>
                      <Input placeholder="200" {...field} />
                    </FormControl>
                    <FormDescription>
                      Numeric operators compare as numbers when both sides are
                      numbers, otherwise as text.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
