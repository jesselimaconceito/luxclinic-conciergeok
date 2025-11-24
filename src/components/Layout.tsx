import { Outlet, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CreditCard, 
  Plug, 
  TrendingUp,
  BarChart3 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "Subscription", href: "/subscription", icon: CreditCard },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Token Usage", href: "/tokens", icon: TrendingUp },
  { name: "KPIs", href: "/kpis", icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/50 bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-border/50 px-8">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Lux<span className="text-accent">Clinic</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isActive ? "text-accent" : "text-foreground/50 group-hover:text-foreground"
                    )}
                  />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-border/50 p-4">
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                <span className="font-display text-sm font-semibold text-accent">DS</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Dr. Silva</p>
                <p className="text-xs text-muted-foreground">Premium Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
