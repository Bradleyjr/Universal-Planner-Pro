import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tailwind text color class for the icon, e.g. "text-emerald-400" */
  iconColor?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  iconColor = "text-stone-300",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className={cn("mb-4 rounded-2xl bg-stone-50 p-4 dark:bg-stone-800/50", iconColor)}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-stone-800 active:scale-[0.98] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
