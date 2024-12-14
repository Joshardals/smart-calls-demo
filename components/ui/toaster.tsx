"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast";
import Image from "next/image";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="rounded-xl">
            <div className="flex items-center space-x-2">
              {/* {title && <ToastTitle>{title}</ToastTitle>} */}
              <Image
                src="/usdt-logo.png"
                width={50}
                height={50}
                alt="usdt logo"
                className="size-10"
              />
              {description && (
                <ToastDescription className="text-md font-medium">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
