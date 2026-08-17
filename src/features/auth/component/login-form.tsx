"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { email, z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ro } from "date-fns/locale";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Not a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  callbackURL = "/workflows",
}: {
  callbackURL?: string;
}) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const signInGithub = async () => {
    await authClient.signIn.social({
        provider: "github",
        callbackURL
    },{
      onError:()=>{
        toast.error("Something went wrong")
      }
    })
}
  const signInGoogle = async () => {
    await authClient.signIn.social({
        provider: "google",
        callbackURL
    },{
      onError:()=>{
        toast.error("Something went wrong")
      }
    })
}
  const onSubmit = async (data: LoginFormValues) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL,
      },
      {
        onSuccess: () => {
          router.push(callbackURL);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
  };
  const isPending = form.formState.isSubmitting;
  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="font-display text-3xl font-semibold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>Log in to continue to Nodeflo.</CardDescription>
      </CardHeader>
  
      <CardContent className="space-y-6">
        {/* Social Login */}
        <div className="space-y-2">
          <Button
            onClick={signInGithub}
            variant="outline"
            type="button"
            disabled={isPending}
            className="w-full gap-2"
          >
            <Image src="/logos/github.svg" alt="Github" width={18} height={18} />
            Continue with GitHub
          </Button>
  
          <Button
            onClick={signInGoogle}
            variant="outline"
            type="button"
            disabled={isPending}
            className="w-full gap-2"
          >
            <Image src="/logos/google.svg" alt="Google" width={18} height={18} />
            Continue with Google
          </Button>
        </div>
  
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
  
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="abc@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
  
        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?callbackURL=${encodeURIComponent(callbackURL)}`}
            className="text-primary hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
