import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "neu-inset flex h-12 w-full rounded-md px-3 text-sm text-text-primary transition-[background,box-shadow,border-color] duration-200 placeholder:text-text-tertiary focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
