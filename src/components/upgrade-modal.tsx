"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  import { Button } from "@/components/ui/button";
  import { authClient } from "@/lib/auth-client";
  
  interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  export const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
    
  
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade to pro</AlertDialogTitle>
            <AlertDialogDescription>
              To access this feature, please upgrade your account to a pro plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={()=>authClient.checkout({slug:"Nodeflo-pro"})}>Upgrade Now</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  