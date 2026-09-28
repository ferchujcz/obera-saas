"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "glass";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-400/30",
  secondary:
    "bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/80 backdrop-blur-md shadow-md",
  outline:
    "border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400",
  ghost:
    "text-slate-300 hover:text-white hover:bg-slate-800/60",
  glass:
    "bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md shadow-lg shadow-black/20",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs font-medium rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm font-semibold rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base font-semibold rounded-2xl gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
