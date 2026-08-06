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
import { useEffect, useMemo } from "react";
import {
  EVERY_MINUTES_OPTIONS,
  WEEKDAYS,
  type ScheduleData,
} from "./constants";

const formSchema = z.object({
  frequency: z.enum(["minutes", "daily", "weekly"]),
  everyMinutes: z.number().optional(),
  time: z.string().optional(),
  weekday: z.number().optional(),
});
type FormValues = z.infer<typeof formSchema>;

const pad = (n: number) => String(n).padStart(2, "0");

interface ScheduleTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: ScheduleData) => void;
  defaultValues: Partial<ScheduleData>;
}

export const ScheduleTriggerDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: ScheduleTriggerDialogProps) => {
  const timezone = useMemo(
    () =>
      defaultValues.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC",
    [defaultValues.timezone],
  );

  const initialTime = `${pad(defaultValues.hour ?? 9)}:${pad(defaultValues.minute ?? 0)}`;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      frequency: defaultValues.frequency ?? "daily",
      everyMinutes: defaultValues.everyMinutes ?? 15,
      time: initialTime,
      weekday: defaultValues.weekday ?? 1,
    },
  });

  useEffect(() => {
    form.reset({
      frequency: defaultValues.frequency ?? "daily",
      everyMinutes: defaultValues.everyMinutes ?? 15,
      time: `${pad(defaultValues.hour ?? 9)}:${pad(defaultValues.minute ?? 0)}`,
      weekday: defaultValues.weekday ?? 1,
    });
  }, [open, defaultValues, form]);

  const frequency = form.watch("frequency");

  const handleSubmit = (values: FormValues) => {
    const [h, m] = (values.time || "09:00").split(":").map((x) => parseInt(x, 10));
    const data: ScheduleData = {
      frequency: values.frequency,
      everyMinutes:
        values.frequency === "minutes" ? (values.everyMinutes ?? 15) : undefined,
      hour: values.frequency !== "minutes" ? h : undefined,
      minute: values.frequency !== "minutes" ? m : undefined,
      weekday: values.frequency === "weekly" ? (values.weekday ?? 1) : undefined,
      timezone,
    };
    onSubmit?.(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule</DialogTitle>
          <DialogDescription>
            Run this workflow automatically on a schedule. Times use your
            timezone ({timezone}).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="How often?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Every N minutes</SelectItem>
                        <SelectItem value="daily">Every day</SelectItem>
                        <SelectItem value="weekly">Every week</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {frequency === "minutes" && (
              <FormField
                control={form.control}
                name="everyMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={String(field.value ?? 15)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVERY_MINUTES_OPTIONS.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              Every {n} minutes
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {frequency === "weekly" && (
              <FormField
                control={form.control}
                name="weekday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of week</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={String(field.value ?? 1)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WEEKDAYS.map((day, i) => (
                            <SelectItem key={day} value={String(i)}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {frequency !== "minutes" && (
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      In {timezone}. e.g. 09:00 for every morning.
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
