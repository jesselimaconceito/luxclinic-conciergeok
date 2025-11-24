import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
}

export default function KPICard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
}: KPICardProps) {
  return (
    <div className="card-luxury group p-6 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-caption mb-3">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-display text-3xl font-bold text-foreground animate-counter-up">
              {value}
            </h3>
            {change && (
              <span
                className={cn(
                  "text-sm font-medium",
                  changeType === "positive" && "text-success",
                  changeType === "negative" && "text-destructive",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="rounded-lg bg-accent/10 p-3 transition-all duration-300 group-hover:bg-accent/20">
          <Icon className="h-6 w-6 text-accent" />
        </div>
      </div>
    </div>
  );
}
