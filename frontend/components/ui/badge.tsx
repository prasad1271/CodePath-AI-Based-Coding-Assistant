import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-blue-600 text-white shadow hover:bg-blue-700",
    secondary: "border-transparent bg-slate-800 text-slate-200 hover:bg-slate-700",
    destructive: "border-transparent bg-red-600/20 text-red-400 border border-red-500/30",
    outline: "text-slate-300 border border-slate-700",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 border",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400 border",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
