import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800",
        destructive:
          "bg-danger text-white shadow-sm hover:bg-red-600 active:bg-red-700",
        outline:
          "border border-surface-300 bg-white text-surface-700 shadow-sm hover:bg-surface-50 hover:text-surface-900",
        secondary:
          "bg-surface-100 text-surface-700 hover:bg-surface-200 active:bg-surface-300",
        ghost:
          "text-surface-600 hover:bg-surface-100 hover:text-surface-900",
        link: "text-primary-600 underline-offset-4 hover:underline",
        success:
          "bg-success text-white shadow-sm hover:bg-emerald-600 active:bg-emerald-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        xl: "h-14 rounded-xl px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = forwardRef(({ className, variant, size, ...props }, ref) => (
  <button
    className={cn(buttonVariants({ variant, size, className }))}
    ref={ref}
    {...props}
  />
));

Button.displayName = "Button";

export { Button, buttonVariants };
