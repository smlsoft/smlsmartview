import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-semibold transition-[background,color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:shadow-focus",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-text-on-accent shadow-[0_4px_16px_rgba(139,94,60,0.28)] hover:bg-accent-strong hover:shadow-[0_6px_22px_rgba(139,94,60,0.35)] active:translate-y-px",
        secondary:
          "bg-surface-muted text-accent hover:bg-surface-sunken active:translate-y-px",
        ghost:
          "bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary",
        outline:
          "border border-border bg-surface text-text-primary hover:bg-surface-muted"
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-11 px-6",
        icon: "h-10 w-10 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
