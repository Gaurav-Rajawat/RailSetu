import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-xs font-semibold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-40 rounded select-none cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 border border-slate-800 dark:border-slate-700 shadow-sm",
        primary:
          "bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 shadow-sm shadow-blue-500/20 active:bg-blue-700",
        destructive:
          "bg-red-600 text-white border border-red-500 hover:bg-red-500 shadow-sm shadow-red-500/20",
        success:
          "bg-emerald-600 text-white border border-emerald-500 hover:bg-emerald-500 shadow-sm shadow-emerald-500/20",
        warning:
          "bg-amber-600 text-white border border-amber-500 hover:bg-amber-500 shadow-sm shadow-amber-500/20",
        outline:
          "border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100",
        secondary:
          "bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700",
        ghost:
          "border border-transparent bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200",
        link:
          "border-transparent text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 px-2.5 text-[11px]",
        lg: "h-9 px-4 text-xs",
        icon: "h-8 w-8 p-0",
        xs: "h-6 px-2 text-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
