import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-foreground shadow-inner transition-colors duration-200 placeholder:text-muted-foreground/70 hover:border-white/20 focus-visible:border-blue-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
