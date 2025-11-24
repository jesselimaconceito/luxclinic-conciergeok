import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "day" | "week" | "month";

export default function Agenda() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-2">
            Agenda
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your schedule with precision
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:shadow-[0_0_40px_hsl(var(--accent)/0.4)] hover-scale">
          <Calendar className="h-4 w-4" />
          New Commitment
        </button>
      </div>

      {/* View Controls */}
      <div className="flex items-center justify-between card-luxury p-4 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-foreground min-w-[200px] text-center">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex gap-2 rounded-lg bg-secondary p-1">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium capitalize transition-all duration-200",
                viewMode === mode
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card-luxury p-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="grid grid-cols-7 gap-4">
          {/* Day Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center">
              <span className="text-caption">{day}</span>
            </div>
          ))}

          {/* Calendar Days */}
          {Array.from({ length: 35 }, (_, i) => {
            const dayNumber = i - 2;
            const isToday = dayNumber === 15;
            const hasAppointment = [15, 16, 18, 22].includes(dayNumber);

            return (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-lg border border-border/50 p-2 transition-all duration-200 hover:border-accent/50 hover:shadow-lg",
                  isToday && "border-accent bg-accent/5",
                  dayNumber < 1 || dayNumber > 31 ? "opacity-30" : "cursor-pointer"
                )}
              >
                {dayNumber > 0 && dayNumber <= 31 && (
                  <>
                    <div className="text-sm font-medium text-foreground mb-2">{dayNumber}</div>
                    {hasAppointment && (
                      <div className="space-y-1">
                        <div className="h-1.5 rounded-full bg-accent/60" />
                        <div className="h-1.5 rounded-full bg-success/60" />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="card-luxury p-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <h3 className="font-display text-xl font-semibold text-foreground mb-4">
          Upcoming This Week
        </h3>
        <div className="space-y-3">
          {[
            { date: "Today, 14:00", patient: "Ana Costa", type: "Treatment" },
            { date: "Tomorrow, 09:00", patient: "Carlos Lima", type: "Consultation" },
            { date: "Wed, 11:30", patient: "Rita Mendes", type: "Follow-up" },
          ].map((appointment, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-4 transition-all hover:border-accent/50"
            >
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
                <div>
                  <p className="font-medium text-foreground">{appointment.patient}</p>
                  <p className="text-sm text-muted-foreground">{appointment.type}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{appointment.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
