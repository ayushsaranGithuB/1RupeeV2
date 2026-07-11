import * as React from "react";
import { cn } from "@/lib/utils";

function Tooltip({
  content,
  children,
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2",
          "whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg",
          "opacity-0 transition-opacity group-hover:opacity-100",
        )}
      >
        {content}
      </span>
    </span>
  );
}

export { Tooltip };
