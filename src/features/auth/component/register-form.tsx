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

const registerSchema = z.object({
  email: z.string().min(1, "Email is required").email("Not a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
   const signInGithub = async () => {
      await authClient.signIn.social({
          provider: "github",
          callbackURL: "/workflows"
      },{
        onError:()=>{
          toast.error("Something went wrong")
        }
      })
  }
    const signInGoogle = async () => {
      await authClient.signIn.social({
          provider: "google",
          callbackURL: "/workflows"
      },{
        onError:()=>{
          toast.error("Something went wrong")
        }
      })
  }
  const onSubmit = async (values: RegisterFormValues) => {
   await authClient.signUp.email({
    name:values.email,
    email: values.email,
    password: values.password,
    callbackURL:'/workflows'
   },
  { onSuccess: () => {
    router.push('/workflows');
  },
  onError: (ctx) => {
    toast.error(ctx.error.message);
  }});
  };
  const isPending = form.formState.isSubmitting;
  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="font-display text-3xl font-semibold tracking-tight">
          Create your account
        </CardTitle>
        <CardDescription>Start automating in minutes.</CardDescription>
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
            <Image src="/logos/github.svg" alt="GitHub" width={18} height={18} />
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
  
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Form>
  
        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login here
          </Link>
        </p>
      </CardContent>
    </Card>
  ); 
}

